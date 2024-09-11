#!/usr/bin/env -vS node --import=tsx

import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { constants, mkdir, open, readdir } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { formatWithOptions } from 'node:util'
import { createGzip } from 'node:zlib'

const mode = process.argv[2]

const pkgName = process.argv[3]

const finalResultsFolder = `final-results`

const titleName = `With Rollup`

const collectBeforeFiles = async () => {
  const files = (
    await readdir(
      `${mode === 'cjs' ? 'cjs/' : ''}before${
        typeof pkgName === 'undefined' ? '' : `/${pkgName}`
      }`,
      {
        withFileTypes: true,
        recursive: !pkgName,
        encoding: 'utf-8',
      },
    )
  ).filter((e) => e.isFile())

  return files
}

const beforeFiles = await collectBeforeFiles()

const packageNames = new Map(
  await Promise.all(
    beforeFiles.map(
      async ({ parentPath }) =>
        [
          path
            .relative(mode === 'cjs' ? 'cjs/before' : 'before', parentPath)
            .replaceAll(path.sep, path.posix.sep),
          (
            await readdir(parentPath, {
              withFileTypes: true,
              recursive: false,
              encoding: 'utf-8',
            })
          )
            .filter((e) => e.isFile())
            .map(({ name }) => `${path.basename(name)}`),
        ] as const,
    ),
  ),
)

const sizes = new Map<string, Map<'before' | 'after', number>>()

const generateAllDiffs = async () => {
  return new Map(
    await Promise.all(
      [...packageNames.entries()].map(async ([packageName, fileNames]) => {
        const element = new Map<string, string>(
          await Promise.all(
            fileNames.map(async (fileName) => {
              return await new Promise<[string, string]>(
                async (resolve, reject) => {
                  const before = `${
                    mode === 'cjs' ? 'cjs/' : ''
                  }before/${packageName}/${fileName}`
                  const after = `${
                    mode === 'cjs' ? 'cjs/' : ''
                  }after/${packageName}/${fileName}`
                  let beforeChunkSize = 0
                  let afterChunkSize = 0

                  await pipeline(
                    createReadStream(before),
                    createGzip({ level: 9 }).on('data', (chunk) => {
                      if (Buffer.isBuffer(chunk)) {
                        beforeChunkSize = chunk.byteLength
                        sizes.set(
                          `${packageName}/${fileName}`,
                          sizes.get(`${packageName}/${fileName}`) ?? new Map(),
                        )
                        sizes
                          .get(`${packageName}/${fileName}`)
                          ?.set('before', beforeChunkSize)
                      }
                    }),
                  )

                  await pipeline(
                    createReadStream(after),
                    createGzip({ level: 9 }).on('data', (chunk) => {
                      if (Buffer.isBuffer(chunk)) {
                        afterChunkSize = chunk.byteLength
                        sizes
                          .get(`${packageName}/${fileName}`)
                          ?.set('after', afterChunkSize)
                      }
                    }),
                  )

                  const diffChildProcess = spawn(
                    'diff',
                    [
                      '-u',
                      '-d',
                      '--suppress-blank-empty',
                      '--suppress-common-lines',
                      '-w',
                      '-B',
                      '-b',
                      '-d',
                      '-Z',
                      '-a',
                      '-E',
                      `--label=${before}`,
                      `--label=${after}`,
                      '--strip-trailing-cr',
                      before,
                      after,
                    ],
                    { stdio: 'pipe' },
                  )

                  let output = ''

                  diffChildProcess.stdout.on('data', (data) => {
                    if (Buffer.isBuffer(data)) {
                      output += data.toString()
                    }
                  })

                  diffChildProcess.stderr.on('data', (data) => {
                    console.error(`diff stderr: ${data}`)
                  })

                  diffChildProcess.on('close', (code) => {
                    if (code !== 0 && code !== 1) {
                      // diff exits with 1 if files differ, which is expected
                      return reject(
                        new Error(`diff process exited with code ${code}`),
                      )
                    }

                    const pathWithoutExtension = path.basename(
                      fileName,
                      path.extname(fileName),
                    )

                    const content = `\n<details><summary><b><code>${pathWithoutExtension}</code> changes (Click to expand)</b></summary>\n\n**File Content**:\n\n\`\`\`ts\nexport { ${pathWithoutExtension} } from '${packageName}'\n\`\`\`\n\n<details open><summary><b>Before and After</b></summary>\n\n\`\`\`diff\n${output}\`\`\`\n\n</details>\n\n</details>\n\n`

                    return resolve([fileName, content] as const)
                  })
                },
              )
            }),
          ),
        )

        return [packageName, element] as const
      }),
    ),
  )
}

const allDiffs = await generateAllDiffs()

const generateFinalResults = async () => {
  await Promise.all(
    [...allDiffs.entries()].map(async ([packageName, importDiffs]) => {
      const finalResultsFile = `${finalResultsFolder}${
        mode === 'cjs' ? '/cjs' : ''
      }/${packageName}.md`

      await mkdir(path.dirname(finalResultsFile), { recursive: true })

      const fileHandle = await open(
        finalResultsFile,
        constants.O_TRUNC | constants.O_RDWR | constants.O_CREAT,
      )

      const writeStream = fileHandle.createWriteStream({
        autoClose: true,
        encoding: 'utf-8',
        emitClose: true,
      })

      const readStream = Readable.from([], {
        objectMode: true,
        encoding: 'utf-8',
        autoDestroy: true,
        emitClose: true,
      })

      writeStream.cork()

      readStream.push(
        `<details><summary>\n\n# \`${packageName}\` Summary\n\n</summary>\n\n## ${titleName}\n`,
      )

      readStream.push([...importDiffs.values()].join(''))

      readStream.push(`</details>\n`)

      process.nextTick(() => {
        writeStream.uncork()
      })

      readStream.pipe(writeStream, { end: true })
    }),
  )
}

Array.from(sizes).forEach(([filePath, beforeAndAfterSizes]) => {
  const beforeSize = beforeAndAfterSizes.get('before') ?? 0
  const afterSize = beforeAndAfterSizes.get('after') ?? 0

  const sizeDifference = beforeSize - afterSize

  console.log(
    sizeDifference > 0
      ? `\u2705 Good!`
      : sizeDifference === 0
        ? `\u2728 No change!`
        : `\u274C Bad!`,
    formatWithOptions(
      { colors: true, numericSeparator: true },
      'Difference: %O bytes, filePath: %s',
      beforeSize - afterSize,
      filePath,
    ),
  )
})

await generateFinalResults()
