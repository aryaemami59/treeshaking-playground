#!/usr/bin/env -vS node --import=tsx

import { exec as _exec } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(_exec)

const packageName = process.argv[2] ?? 'reselect'

const manuallyExternalize = process.argv.slice(3)

const packageJson = (await import(`${packageName}/package.json`, {
  with: { type: 'json' },
})) satisfies Record<string, any>

const dependencies = Object.keys(packageJson?.dependencies ?? {})

const peerDependencies = Object.keys(
  packageJson?.peerDependencies ?? {},
).concat(Object.keys(packageJson?.peerDependenciesMeta ?? {}))

const external = Array.from(
  new Set(dependencies.concat(peerDependencies).concat(manuallyExternalize)),
)

const inputDirectory = path.join('src', packageJson.name)

const allNamedImports = Object.keys(await import(packageJson.name))

const createInputDirectory = async () => {
  await mkdir(inputDirectory, { recursive: true })
}

const cleanOutputDirectory = async () => {
  await rm('dist', { force: true, recursive: true })
}

const cleanInputDirectory = async () => {
  await rm(inputDirectory, { force: false, recursive: true })
}

const createInputFiles = async () =>
  await Promise.all(
    allNamedImports.map(
      async (namedImport) =>
        await writeFile(
          path.join(inputDirectory, `${namedImport}.mjs`),
          `export { ${namedImport} } from '${packageJson.name}';\n`,
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
      exec(
        // `yarn build:rollup --input ${inputDir}/${namedImport}.cts -d dist/@reduxjs/vitest-config --external ${Object.keys(
        `yarn build:rollup --input ${inputDirectory}/${namedImport}.mjs -o dist/${packageJson.name}/${namedImport}.js -f esm --external ${external.join(
          ',',
        )}`,
      ),
    ),
    // .concat(
    //   exec(
    //     `yarn build:rollup --input ${inputDir}/all.ts -o dist/${name}/all.js --external ${Object.keys(dependencies).concat(Object.keys(peerDependencies)).join(',')}`,
    //   ),
    // ),
  )

await createInputDirectory()

await cleanOutputDirectory()

await createInputFiles()
;(await createOutputFiles()).forEach(({ stdout, stderr }) => {
  console.log(stdout, stderr)
})

await cleanInputDirectory()
