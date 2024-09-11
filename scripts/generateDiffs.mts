#!/usr/bin/env -vS node --import=tsx

import { spawn } from "node:child_process"
import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const diffsDir = `tmp`

const titleName = `With Rollup`

const allDiffFileName = `All.md`

const files = (
  await readdir("before", {
    withFileTypes: true,
    recursive: true,
    encoding: "utf-8",
  })
).filter(e => e.isFile())

const dirs = await Promise.all(
  files.map(({ name, parentPath }) => {
    return `${path.basename(parentPath)}/${name}`
  })
)

const fixedDirs = await Promise.all(
  dirs.map(dir => ({
    before: `before/${dir}`,
    after: `after/${dir}`,
    dir: path.parse(dir).name,
  }))
)

await Promise.all(
  fixedDirs.map(async ({ before, after, dir }) => {
    const newDiff = `${diffsDir}/${dir}.diff`

    return new Promise((resolve, reject) => {
      const diff = spawn("diff", [
        "-u",
        "-w",
        "-B",
        "-b",
        "-d",
        "-Z",
        "-a",
        before,
        after,
      ])

      let output = ""

      diff.stdout.on("data", data => {
        output += data.toString()
      })

      diff.stderr.on("data", data => {
        console.error(`diff stderr: ${data}`)
      })

      diff.on("close", async code => {
        if (code !== 0 && code !== 1) {
          // diff exits with 1 if files differ, which is expected
          reject(new Error(`diff process exited with code ${code}`))
          return
        }

        await writeFile(
          newDiff,
          `\n<details><summary><b><code>${dir}</code> changes (Click to expand)</b></summary>\n\n**File Content**:\n\n\`\`\`ts\nexport { ${dir} } from 'reselect'\n\`\`\`\n\n<details><summary><b>Before and After</b></summary>\n\n\`\`\`diff\n${output}\`\`\`\n\n</details>\n\n</details>\n\n`,
          "utf-8"
        )
          .then(resolve)
          .catch(reject)
      })
    })
  })
)

const allDiffs = await readdir(diffsDir, {
  withFileTypes: false,
  encoding: "utf-8",
})

const allDiffsContents = (
  await Promise.all(
    allDiffs.map(
      async name => await readFile(path.join(diffsDir, name), "utf-8")
    )
  )
).join("")

await writeFile(
  allDiffFileName,
  `## ${titleName}\n${allDiffsContents}`,
  "utf-8"
)
