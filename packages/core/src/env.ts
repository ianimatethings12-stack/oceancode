const PREFIX = "OCEANCODE_"
const LEGACY = "OPENCODE_"

/**
 * Make OCEANCODE_* the documented environment prefix while keeping the
 * OPENCODE_* names working for one release. Internal code still reads the
 * legacy names, so a single alias at process start covers every consumer.
 */
export function aliasLegacyEnv() {
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith(PREFIX) || value === undefined) continue
    const legacy = LEGACY + key.slice(PREFIX.length)
    if (process.env[legacy] === undefined) process.env[legacy] = value
  }
}

aliasLegacyEnv()

export * as Env from "./env"
