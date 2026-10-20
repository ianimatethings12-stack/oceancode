import pkg from "../../package.json"

declare global {
  const OPENCODE_VERSION: string
  const OPENCODE_CHANNEL: string
}

export const InstallationVersion = typeof OPENCODE_VERSION === "string" ? OPENCODE_VERSION : pkg.version
export const InstallationChannel = typeof OPENCODE_CHANNEL === "string" ? OPENCODE_CHANNEL : "local"

// The free-tier catalog and inference gate require an OpenCode API version of
// 1.18.0 or newer. OceanCode ships with its own 0.1.x product version, so keep
// the API identity pinned independently of the package version.
export const InstallationAPIVersion = "1.18.34"
export const InstallationLocal = InstallationChannel === "local"
