#!/usr/bin/env -vS node --import=tsx

import packageJson from '@reduxjs/toolkit/package.json' with { type: 'json' }
// import packageJson from '@reduxjs/toolkit/package.json' with { type: 'json' }
// import packageJsonr from '@reduxjs/toolkit/react/package.json' with { type: 'json' }
// import packageJsons from '@reduxjs/toolkit/query/package.json' with { type: 'json' }
// import packageJsonx from '@reduxjs/toolkit/query/react/package.json' with { type: 'json' }
import * as Pkg from '@reduxjs/toolkit/query'
// import * as Pkg from '@reduxjs/toolkit/query/react'
// import * as Pkgr from '@reduxjs/toolkit/react'
// import * as Pkgs from '@reduxjs/toolkit/query'
// import * as Pkgx from '@reduxjs/toolkit/query/react'
import { exec as _exec } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const exec = promisify(_exec)

const inputDir = path.join('src', packageJson.name)

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const allNamedImports = Object.keys(Pkg)
// const allNamedImports = Object.keys(Pkg).filter((namedImport) => namedImport !== 'default')
// console.log(allNamedImports)

const createInputDirectory = async () => {
  await mkdir(inputDir, { recursive: true })
}

const cleanOutputDirectory = async () => {
  await rm('dist', { force: true, recursive: true })
}

const cleanInputDirectory = async () => {
  await rm(inputDir, { force: false, recursive: true })
}

const createInputFiles = async () => {
  return await Promise.all(
    allNamedImports.map(async (namedImport) => {
      return await writeFile(
        path.join(inputDir, `${namedImport}.mjs`),
        // `const { ${namedImport} } = require('${packageJson.name}');\nmodule.exports = { ${namedImport} };\n`,
        // `const { ${namedImport} } = require('${packageJson.name}');\nmodule.exports = ${namedImport};\n`,
        // `exports.${namedImport} = require('${packageJson.name}').${namedImport};\n`,
        // `const { ${namedImport} } = require('${packageJson.name}');\nexports.${namedImport} = ${namedImport};\n`,
        // `import * as pkg from '${packageJson.name}';\nexport const ${namedImport} = pkg.${namedImport};\n`,
        `export { ${namedImport} } from '${packageJson.name}/query';\n`,
      )
    }),
  )
}

const createOutputFiles = async () => {
  return await Promise.all(
    allNamedImports.map((namedImport) =>
      exec(
        // `yarn build:rollup --input ${inputDir}/${namedImport}.cts -d dist/${packageJson.name} --external ${Object.keys(
        `yarn build:rollup --input ${inputDir}/${namedImport}.mjs -o dist/${packageJson.name}/query/${namedImport}.js --external ${Object.keys(
          packageJson?.dependencies ?? {},
        )
          .concat(Object.keys(packageJson?.peerDependencies ?? {}))
          .join(',')}`,
      ),
    ),
    // .concat(
    //   exec(
    //     `yarn build:rollup --input ${inputDir}/all.ts -o dist/${name}/all.js --external ${Object.keys(dependencies).concat(Object.keys(peerDependencies)).join(',')}`,
    //   ),
    // ),
  )
}

await createInputDirectory()

await cleanOutputDirectory()

await createInputFiles()
;(await createOutputFiles()).forEach(({ stdout, stderr }) =>
  console.log(stdout, stderr),
)

await cleanInputDirectory()

// const copyOutputFiles = async () => {
//   await copy
// }
