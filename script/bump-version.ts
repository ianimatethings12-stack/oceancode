#!/usr/bin/env bun
import path from "path"
import { $ } from "bun"

const ROOT = path.resolve(import.meta.dir, "..")
const rootPkgPath = path.join(ROOT, "package.json")
const rootPkg = await Bun.file(rootPkgPath).json()

const currentVersion: string = rootPkg.version ?? "0.1.4"
const match = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)/)

if (!match) {
  throw new Error(`Invalid SemVer in root package.json: ${currentVersion}`)
}

let major = parseInt(match[1], 10)
let minor = parseInt(match[2], 10)
let patch = parseInt(match[3], 10)

// Increment logic:
// Increases by 0.0.1 (patch + 1) until it reaches .30, then rolls over to next minor (e.g. 0.1.30 -> 0.2.0)
if (patch >= 30) {
  minor += 1
  patch = 0
} else {
  patch += 1
}

const nextVersion = `${major}.${minor}.${patch}`
console.error(`Bumping OceanCode version: ${currentVersion} -> ${nextVersion}`)

const pkgjsons = await Array.fromAsync(
  new Bun.Glob("**/package.json").scan({
    cwd: ROOT,
    absolute: true,
  })
).then((arr) => arr.filter((x) => !x.includes("node_modules") && !x.includes("dist")))

for (const file of pkgjsons) {
  const content = await Bun.file(file).text()
  if (content.includes('"version":')) {
    const updated = content.replace(/"version":\s*"[^"]+"/, `"version": "${nextVersion}"`)
    await Bun.file(file).write(updated)
  }
}

// Refresh bun.lock with the new version
await $`bun install`.cwd(ROOT).quiet()

if (process.env.GITHUB_OUTPUT) {
  const outPath = process.env.GITHUB_OUTPUT
  const line = `new_version=${nextVersion}\nprevious_version=${currentVersion}\n`
  await Bun.file(outPath).write((await Bun.file(outPath).text().catch(() => "")) + line)
}

// Output next version to stdout
console.log(nextVersion)
