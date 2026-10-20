#!/usr/bin/env bun
import { $ } from "bun"

import { resolveChannel } from "./utils"

const channel = resolveChannel()
const version = process.env.OCEANCODE_VERSION ?? (await Bun.file("../oceancode/package.json").json()).version
process.env.OCEANCODE_CHANNEL = channel
process.env.OCEANCODE_VERSION = version

await $`bun ./scripts/copy-icons.ts ${channel}`
await $`bun ./scripts/copy-metainfo.ts ${channel}`

await $`cd ../oceancode && OCEANCODE_CHANNEL=${channel} OCEANCODE_VERSION=${version} bun script/build.ts --single --skip-install`
await $`cd ../oceancode && bun script/build-node.ts`

// Bundle the same CLI build that the desktop app installs at runtime.
const target = process.platform === "win32" ? "windows" : process.platform === "darwin" ? "darwin" : "linux"
const ext = process.platform === "win32" ? ".exe" : ""
await $`cp ../oceancode/dist/oceancode-${target}-${process.arch}/bin/ocean${ext} resources/oceancode-cli${ext}`
