import pkg from "../../package.json"

declare global {
  const OPENCODE_VERSION: string
  const OPENCODE_CHANNEL: string
}

export const InstallationVersion = typeof OPENCODE_VERSION === "string" ? OPENCODE_VERSION : pkg.version
export const InstallationChannel = typeof OPENCODE_CHANNEL === "string" ? OPENCODE_CHANNEL : "local"

// Preview builds use 0.0.0-<channel>-<timestamp>, which the OpenCode API rejects
// as older than the minimum supported release. Advertise the package release
// version for API requests while keeping the build version for CLI/update use.
export const InstallationAPIVersion = InstallationVersion.startsWith("0.0.0-") ? pkg.version : InstallationVersion
export const InstallationLocal = InstallationChannel === "local"
