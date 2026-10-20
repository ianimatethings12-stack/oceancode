#!/usr/bin/env bun
import { $ } from "bun"

import { resolveChannel } from "./utils"

const channel = resolveChannel()
await $`bun ./scripts/copy-icons.ts ${channel}`
await $`bun ./scripts/copy-metainfo.ts ${channel}`

await $`cd ../oceancode && bun script/build.ts --single --skip-install`

// Bundle the same CLI build that the desktop app installs at runtime.
const target = process.platform === "win32" ? "windows" : process.platform === "darwin" ? "darwin" : "linux"
const ext = process.platform === "win32" ? ".exe" : ""
await $`cp ../oceancode/dist/oceancode-${target}-${process.arch}/bin/ocean${ext} resources/oceancode-cli${ext}`
