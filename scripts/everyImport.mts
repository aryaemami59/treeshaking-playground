#!/usr/bin/env -vS node --import=tsx/esm

import * as childProcess from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import * as path from 'node:path'
import { promisify } from 'node:util'

const execFile = promisify(childProcess.execFile)

const packageName = process.argv[2] ?? 'reselect'

const manuallyExternalize = process.argv.slice(3)

const packageJson = (
  await import(`${packageName}/package.json`, {
    with: { type: 'json' },
  })
).default satisfies Record<string, any>

const dependencies = Object.keys(packageJson?.dependencies ?? {})

const peerDependencies = Object.keys(
  packageJson?.peerDependencies ?? {},
).concat(Object.keys(packageJson?.peerDependenciesMeta ?? {}))

const external = Array.from(
  new Set(dependencies.concat(peerDependencies).concat(manuallyExternalize)),
)

const inputDirectory = path.join(
  import.meta.dirname,
  '..',
  'src',
  packageJson.name,
)

const outputDirectory = path.join(import.meta.dirname, '..', 'dist')

const allNamedImports = Object.keys(await import(packageJson.name)).filter(
  (namedImport) => namedImport !== 'default',
)

const cleanInputDirectory = async () => {
  await rm(inputDirectory, { force: false, recursive: true })
}

const createInputDirectory = async () => {
  await mkdir(inputDirectory, { recursive: true })
}

const cleanOutputDirectory = async () => {
  await rm(outputDirectory, { force: true, recursive: true })
}

const createInputFiles = async () =>
  await Promise.all(
    allNamedImports.map(
      async (namedImport) =>
        await writeFile(
          path.join(inputDirectory, `${namedImport}.mjs`),
          `export { ${namedImport} } from '${packageJson.name}';\n`,
          { encoding: 'utf-8' },
        ),
    ),
  )

/**
 * @example
 * <caption>Run in Bash</caption>
 *
 * ```bash
 * yarn start '@reduxjs/vitest-config' 'vitest/config'
 * ```
 */
const createOutputFiles = async () =>
  await Promise.all(
    allNamedImports.map((namedImport) =>
      execFile(
        'yarn',
        // `yarn build:rollup --input ${inputDir}/${namedImport}.cts -d dist/@reduxjs/vitest-config --external ${Object.keys(
        [
          'build:rollup',
          '--input',
          `${inputDirectory}/${namedImport}.mjs`,
          '-o',
          `dist/${packageJson.name}/${namedImport}.js`,
          '-f',
          'esm',
          '--external',
          `'${external.join(',')}'`,
        ],
        { encoding: 'utf-8', shell: true },
      ),
    ),
    // .concat(
    //   exec(
    //     `yarn build:rollup --input ${inputDir}/all.ts -o dist/${name}/all.js --external ${Object.keys(dependencies).concat(Object.keys(peerDependencies)).join(',')}`,
    //   ),
    // ),
  )

await cleanOutputDirectory()

await createInputDirectory()

await createInputFiles()
;(await createOutputFiles()).forEach(({ stdout, stderr }) => {
  console.log(stdout, stderr)
})

await cleanInputDirectory()
