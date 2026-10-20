#!/usr/bin/env bun
import { $ } from "bun"
import { fileURLToPath } from "url"

const dir = fileURLToPath(new URL("..", import.meta.url))
process.chdir(dir)

const pkg = await Bun.file("./package.json").json()
const version = pkg.version

const dryRun = process.argv.includes("--dry-run") || process.argv.includes("--pack-only")
const userconfig = process.env.NPM_CONFIG_USERCONFIG

async function published(name: string, version: string) {
  const flags = userconfig ? ["--userconfig", userconfig] : []
  return (await $`npm view ${name}@${version} version ${flags}`.nothrow()).exitCode === 0
}

async function publish(path: string, name: string, version: string) {
  if (process.platform !== "win32") await $`chmod -R 755 .`.cwd(path)
  await $`rm -f *.tgz`.cwd(path).nothrow()
  await $`bun pm pack`.cwd(path)
  if (dryRun) {
    console.log(`[dry-run] packed ${name}-${version}.tgz in ${path}`)
    return
  }
  if (await published(name, version)) {
    console.log(`already published ${name}@${version}`)
    return
  }
  const flags = userconfig ? ["--userconfig", userconfig] : []
  await $`npm publish ${name}-${version}.tgz --access public --tag latest ${flags}`.cwd(path)
}

const binaries: Record<string, string> = {}
for (const filepath of new Bun.Glob("*/package.json").scanSync({ cwd: "./dist" })) {
  const platform = await Bun.file(`./dist/${filepath}`).json()
  if (platform.name === pkg.name) continue
  binaries[platform.name] = platform.version
}
if (Object.keys(binaries).length === 0) {
  console.error("no platform packages found in ./dist; run script/build.ts first")
  process.exit(1)
}
console.log("binaries", binaries)

const main = `./dist/${pkg.name}`
await $`mkdir -p ${main}/bin`
await $`cp ./bin/ocean ${main}/bin/oceancode`
await $`cp ../../LICENSE ${main}/LICENSE`
await $`cp ../../NOTICE ${main}/NOTICE`
await $`cp ../../README.md ${main}/README.md`
await Bun.file(`${main}/package.json`).write(
  JSON.stringify(
    {
      name: pkg.name,
      version,
      description: "OceanCode - an AI coding agent for the terminal, desktop, and IDE",
      license: pkg.license,
      homepage: "https://github.com/ianimatethings12-stack/oceancode",
      repository: {
        type: "git",
        url: "https://github.com/ianimatethings12-stack/oceancode",
      },
      bin: {
        oceancode: "./bin/oceancode",
        ocean: "./bin/oceancode",
      },
      os: ["darwin", "linux", "win32"],
      cpu: ["arm64", "x64"],
      optionalDependencies: binaries,
    },
    null,
    2,
  ),
)

for (const [name, platformVersion] of Object.entries(binaries)) {
  await publish(`./dist/${name}`, name, platformVersion)
}
await publish(main, pkg.name, version)
