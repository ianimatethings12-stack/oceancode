export * as ConfigPaths from "./paths"

import path from "path"
import { Flag } from "@opencode-ai/core/flag/flag"
import { Global } from "@opencode-ai/core/global"
import { unique } from "remeda"
import * as Effect from "effect/Effect"
import { FSUtil } from "@opencode-ai/core/fs-util"

export const files = Effect.fn("ConfigPaths.projectFiles")(function* (
  name: string,
  directory: string,
  worktree?: string,
) {
  const afs = yield* FSUtil.Service
  const next = yield* afs.up({
    targets: [`${name}.jsonc`, `${name}.json`],
    start: directory,
    stop: worktree,
  })
  // One-release compatibility: if a project has no OceanCode config yet, keep
  // reading its OpenCode config instead of silently starting from defaults.
  if (next.length || name !== "oceancode") return next.toReversed()
  const legacy = yield* afs.up({
    targets: ["opencode.jsonc", "opencode.json"],
    start: directory,
    stop: worktree,
  })
  return legacy.toReversed()
})

export const directories = Effect.fn("ConfigPaths.directories")(function* (directory: string, worktree?: string) {
  const afs = yield* FSUtil.Service
  return unique([
    Global.Path.config,
    ...(!Flag.OPENCODE_DISABLE_PROJECT_CONFIG
      ? yield* afs.up({
          targets: [".oceancode", ".opencode"],
          start: directory,
          stop: worktree,
        })
      : []),
    ...(yield* afs.up({
      targets: [".oceancode", ".opencode"],
      start: Global.Path.home,
      stop: Global.Path.home,
    })),
    ...(Flag.OPENCODE_CONFIG_DIR ? [Flag.OPENCODE_CONFIG_DIR] : []),
  ])
})

export function fileInDirectory(dir: string, name: string) {
  return [path.join(dir, `${name}.json`), path.join(dir, `${name}.jsonc`)]
}
