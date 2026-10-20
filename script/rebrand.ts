#!/usr/bin/env bun
import fs from "fs/promises"
import path from "path"

type Scope = "code" | "docs" | "ui" | "assets"
type Rule = {
  name: string
  scope: Scope[]
  pattern: RegExp
  replacement: string
}

const ROOT = path.resolve(import.meta.dir, "..")
const EXCLUDES = new Set([
  ".git",
  ".turbo",
  ".sst",
  ".next",
  ".oceancode",
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
  "target",
  "vendor",
])
const SKIP_FILES = new Set(["bun.lock", "package-lock.json", "pnpm-lock.yaml", "yarn.lock"])
const SKIP_PATHS = [
  "packages/client/src/generated",
  "packages/client/src/generated-effect",
  "packages/sdk/js/src/gen",
  "packages/sdk/js/src/v2/gen",
  "packages/sdk/openapi.json",
  // Archived for v0.1; keep the source untouched until the cloud split lands.
  "packages/console",
  "packages/stats",
  "packages/enterprise",
  "packages/slack",
  "packages/identity",
  "infra",
]
const MAX_SIZE = 1_000_000
const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".jsonc",
  ".md",
  ".mdx",
  ".txt",
  ".yml",
  ".yaml",
  ".toml",
  ".css",
  ".html",
  ".sh",
  ".ps1",
  ".cmd",
  ".bat",
  ".nix",
  ".rs",
  ".go",
  ".py",
  ".xml",
  ".desktop",
  ".svg",
  ".plist",
  ".service",
])

/**
 * Strings that must survive the rebrand. They are replaced with sentinels
 * before the rewrite rules run and restored afterwards.
 */
const PROTECTED = [
  // Free-tier catalog, inference, and wire protocol.
  "https://models.opencode.ai",
  "https://opencode.ai/inference",
  "https://opencode.ai/zen",
  "https://api.opencode.ai",
  "https://opencode.ai/console",
  "https://opencode.ai/auth",
  "https://opencode.ai/api/",
  "github.com/apps/opencode-agent",
  "x-opencode-",
  "OPENCODE_API_KEY",
  "ProviderV2.ID.opencode",
  "OpenCodeEventEncoded",
  "OpenCodeEvent",
  "OpenCodeClient",
  "OpenCodeHttpApi",
  "OpenCodeAssistantMessage",
  "OpenCodeTheme",
  "OpenCodeWindow",
  "createOpencodeClient",
  "OpencodeClient",
  "createOpencode",
  "tools.opencode",
  // Public package API.
  "@opencode-ai/",
  // Kept external services. These are labelled honestly in the UI.
  "OpenCode Console",
  "OpenCode Zen",
  "OpenCode Go",
  "OpenCode GitHub App",
  "OpenCode's free tier",
  // Third-party packages and community projects whose names contain opencode.
  "opencode-gitlab-auth",
  "opencode-poe-auth",
  "opencode-gemini-auth",
  "opencode-openai-codex-auth",
  "opencode-helicone-session",
  "opencode-wakatime",
  "opencode.nvim",
  "oh-my-opencode",
  "awesome-opencode",
  "opencode.cafe",
  "opencode-daytona",
  "opencode-type-inject",
  "opencode-antigravity-auth",
  "opencode-google-antigravity-auth",
  "opencode-devcontainers",
  "opencode-dashboard",
  "opencode-mobile",
  // Model IDs used by the kept OpenCode Zen provider.
  "opencode/gpt-",
  "opencode/claude-",
  "opencode/kimi-",
  "opencode/glm-",
  "opencode/minimax-",
  "opencode/grok-",
  "opencode/qwen-",
  "opencode/gemini-",
  "opencode/deepseek-",
  "opencode/o3-",
  "opencode/o4-",
  "opencode/sonnet-",
  "opencode/opus-",
  "opencode/haiku-",
] as const

const RULES: Rule[] = [
  // Upstream pull/issue links do not exist in the fork; drop the whole line
  // instead of rewriting them into dead links.
  {
    name: "drop-upstream-issue-links",
    scope: ["docs"],
    pattern: /^.*https?:\/\/github\.com\/(?:anomalyco|sst)\/opencode\/(?:pull|issues)\/\d+.*(?:\r?\n|$)/gm,
    replacement: "",
  },

  // Upstream repository and distribution links.
  {
    name: "github-anomalyco-opencode",
    scope: ["code", "docs", "ui", "assets"],
    pattern: /github\.com\/anomalyco\/opencode/g,
    replacement: "github.com/ianimatethings12-stack/oceancode",
  },
  {
    name: "github-sst-opencode",
    scope: ["code", "docs", "ui", "assets"],
    pattern: /github\.com\/sst\/opencode/g,
    replacement: "github.com/ianimatethings12-stack/oceancode",
  },
  {
    name: "repo-anomalyco-opencode",
    scope: ["code", "docs", "ui", "assets"],
    pattern: /\banomalyco\/opencode\b/g,
    replacement: "ianimatethings12-stack/oceancode",
  },
  {
    name: "repo-sst-opencode",
    scope: ["code", "docs", "ui", "assets"],
    pattern: /\bsst\/opencode\b/g,
    replacement: "ianimatethings12-stack/oceancode",
  },
  {
    name: "ghcr-anomalyco-opencode",
    scope: ["code", "docs", "ui", "assets"],
    pattern: /ghcr\.io\/anomalyco\/opencode/g,
    replacement: "ghcr.io/ianimatethings12-stack/oceancode",
  },
  {
    name: "brew-tap",
    scope: ["code", "docs"],
    pattern: /anomalyco\/tap\/opencode/g,
    replacement: "ianimatethings12-stack/oceancode",
  },

  // npm package names. `@opencode-ai/` is protected above.
  {
    name: "npm-package-scoped",
    scope: ["code", "docs"],
    pattern: /\bopencode-ai@/g,
    replacement: "oceancode@",
  },
  {
    name: "npm-package",
    scope: ["code", "docs"],
    pattern: /\bopencode-ai\b/g,
    replacement: "oceancode",
  },
  {
    name: "npm-shield",
    scope: ["docs"],
    pattern: /img\.shields\.io\/npm\/v\/oceancode/g,
    replacement: "img.shields.io/npm/v/oceancode",
  },

  // Config files and project directories.
  {
    name: "config-jsonc",
    scope: ["code", "docs", "ui"],
    pattern: /opencode\.jsonc/g,
    replacement: "oceancode.jsonc",
  },
  {
    name: "config-json",
    scope: ["code", "docs", "ui"],
    pattern: /opencode\.json/g,
    replacement: "oceancode.json",
  },
  {
    name: "dot-opencode",
    scope: ["code", "docs", "ui", "assets"],
    pattern: /\.oceancode\b/g,
    replacement: ".oceancode",
  },

  // Workspace package path.
  {
    name: "package-path",
    scope: ["code", "docs", "ui"],
    pattern: /\bpackages\/opencode\b/g,
    replacement: "packages/oceancode",
  },

  // Desktop names and identifiers.
  {
    name: "desktop-app-id",
    scope: ["code", "docs", "ui"],
    pattern: /ai\.oceancode\.desktop/g,
    replacement: "ai.oceancode.desktop",
  },
  {
    name: "desktop-artifact",
    scope: ["code", "docs"],
    pattern: /\bopencode-desktop\b/g,
    replacement: "oceancode-desktop",
  },
  {
    name: "desktop-cli",
    scope: ["code"],
    pattern: /\bopencode-cli\b/g,
    replacement: "oceancode-cli",
  },
  {
    name: "desktop-bin",
    scope: ["code"],
    pattern: /\bopencode-bin\b/g,
    replacement: "oceancode-bin",
  },
  {
    name: "protocol",
    scope: ["code", "docs", "ui"],
    pattern: /opencode:\/\//g,
    replacement: "oceancode://",
  },
  {
    name: "electron-store-updater",
    scope: ["code"],
    pattern: /opencode\.updater/g,
    replacement: "oceancode.updater",
  },
  {
    name: "electron-store-global",
    scope: ["code"],
    pattern: /opencode\.global\.dat/g,
    replacement: "oceancode.global.dat",
  },
  {
    name: "electron-store-settings",
    scope: ["code"],
    pattern: /opencode\.settings\.dat/g,
    replacement: "oceancode.settings.dat",
  },
  {
    name: "electron-store-tabs",
    scope: ["code"],
    pattern: /opencode\.window\.browser\.dat/g,
    replacement: "oceancode.window.browser.dat",
  },
  {
    name: "electron-store-workspace",
    scope: ["code"],
    pattern: /opencode\.workspace\./g,
    replacement: "oceancode.workspace.",
  },
  {
    name: "electron-store-default",
    scope: ["code"],
    pattern: /opencode\.default\b/g,
    replacement: "oceancode.default",
  },
  {
    name: "electron-store-local",
    scope: ["code"],
    pattern: /opencode\.local\b/g,
    replacement: "oceancode.local",
  },
  {
    name: "server-close",
    scope: ["code"],
    pattern: /opencode\.server\.close/g,
    replacement: "oceancode.server.close",
  },
  {
    name: "run-label",
    scope: ["code"],
    pattern: /opencode\.run\b/g,
    replacement: "oceancode.run",
  },

  // Product URLs. Protected free-tier/Console/GitHub App URLs are handled above.
  {
    name: "url-install",
    scope: ["code", "docs", "ui"],
    pattern: /https:\/\/opencode\.ai\/install/g,
    replacement: "https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install",
  },
  {
    name: "url-download",
    scope: ["code", "docs", "ui"],
    pattern: /https:\/\/opencode\.ai\/download/g,
    replacement: "https://github.com/ianimatethings12-stack/oceancode/releases",
  },
  {
    name: "url-docs",
    scope: ["code", "docs", "ui"],
    pattern: /https:\/\/opencode\.ai\/docs/g,
    replacement: "https://github.com/ianimatethings12-stack/oceancode/tree/dev/packages/web/src/content/docs",
  },
  {
    name: "url-discord",
    scope: ["code", "docs", "ui"],
    pattern: /https:\/\/discord\.gg\/opencode/g,
    replacement: "https://github.com/ianimatethings12-stack/oceancode/discussions",
  },
  {
    name: "url-discord-short",
    scope: ["code", "docs", "ui"],
    pattern: /https:\/\/opencode\.ai\/discord/g,
    replacement: "https://github.com/ianimatethings12-stack/oceancode/discussions",
  },
  {
    name: "url-x",
    scope: ["code", "docs", "ui"],
    pattern: /https:\/\/x\.com\/opencode/g,
    replacement: "https://github.com/ianimatethings12-stack/oceancode",
  },
  {
    name: "url-config-schema",
    scope: ["code", "docs", "ui"],
    pattern: /https:\/\/opencode\.ai\/config\.json/g,
    replacement: "https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/config.schema.json",
  },
  {
    name: "url-tui-schema",
    scope: ["code", "docs", "ui"],
    pattern: /https:\/\/opencode\.ai\/tui\.json/g,
    replacement: "https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/tui.schema.json",
  },
  {
    name: "url-theme",
    scope: ["code", "docs", "ui"],
    pattern: /https:\/\/opencode\.ai\/(?:desktop-)?theme\.json/g,
    replacement: "https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/theme.json",
  },
  {
    name: "url-bare",
    scope: ["docs"],
    pattern: /https:\/\/opencode\.ai\b/g,
    replacement: "https://github.com/ianimatethings12-stack/oceancode",
  },

  // Documentation env prefix. Code keeps OPENCODE_* internally with an alias.
  {
    name: "docs-env-prefix",
    scope: ["docs"],
    pattern: /\bOPENCODE_/g,
    replacement: "OCEANCODE_",
  },

  // Display name in docs and UI string tables. Protocol identifiers are protected.
  {
    name: "display-name",
    scope: ["docs", "ui"],
    pattern: /\bOpenCode\b/g,
    replacement: "OceanCode",
  },

  // Lowercase word in docs only, after all specific rules have run.
  {
    name: "docs-lowercase",
    scope: ["docs"],
    pattern: /\bopencode\b/g,
    replacement: "oceancode",
  },
]

const FORBIDDEN = [
  /anomalyco\/opencode/,
  /sst\/opencode/,
  /github\.com\/anomalyco/,
  /github\.com\/sst/,
  /https:\/\/opencode\.ai\/install/,
  /https:\/\/opencode\.ai\/docs/,
  /https:\/\/opencode\.ai\/discord/,
  /https:\/\/opencode\.ai\/download/,
  /ai\.oceancode\.desktop/,
  /oceancode-desktop/,
  /oceancode@/,
  /npm install -g oceancode/,
  /bun i -g oceancode/,
]

const REQUIRED = [
  "https://models.opencode.ai",
  "https://opencode.ai/inference",
  "ProviderV2.ID.opencode",
  "OPENCODE_API_KEY",
  "@opencode-ai/",
]

function classify(file: string): Scope {
  const rel = path.relative(ROOT, file).replaceAll("\\", "/")
  if (
    rel.endsWith(".md") ||
    rel.endsWith(".mdx") ||
    rel.startsWith("packages/web/src/content/") ||
    /^README/i.test(path.basename(rel))
  ) {
    return "docs"
  }
  if (rel.includes("/i18n/") || rel.startsWith("packages/tui/src/")) {
    return "ui"
  }
  if (/\.(svg|png|ico|icns|jpg|jpeg|webp|gif)$/i.test(rel)) return "assets"
  return "code"
}

function shouldVisit(file: string) {
  const rel = path.relative(ROOT, file).replaceAll("\\", "/")
  if (SKIP_PATHS.some((prefix) => rel.startsWith(prefix))) return false
  const name = path.basename(file)
  if (SKIP_FILES.has(name)) return false
  if (name.endsWith(".snap") || name.endsWith(".map")) return false
  if (name.startsWith(".") && !file.endsWith(".gitignore") && !file.endsWith(".npmrc")) return false
  const ext = path.extname(name).toLowerCase()
  return TEXT_EXT.has(ext)
}

async function walk(dir: string, out: string[] = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (EXCLUDES.has(entry.name)) continue
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(p, out)
      continue
    }
    if (entry.isSymbolicLink()) continue
    if (!shouldVisit(p)) continue
    if ((await fs.stat(p)).size > MAX_SIZE) continue
    out.push(p)
  }
  return out
}

function protect(text: string) {
  const values: string[] = []
  let next = text
  for (const value of [...PROTECTED].sort((a, b) => b.length - a.length)) {
    const marker = `\u0001OC${values.length}\u0001`
    if (!next.includes(value)) continue
    values.push(value)
    next = next.split(value).join(marker)
  }
  return {
    text: next,
    restore(input: string) {
      return values.reduce((acc, value, index) => acc.split(`\u0001OC${index}\u0001`).join(value), input)
    },
  }
}

function rewrite(text: string, scope: Scope) {
  const guarded = protect(text)
  let next = guarded.text
  for (const rule of RULES) {
    if (!rule.scope.includes(scope)) continue
    next = next.replace(rule.pattern, rule.replacement)
  }
  return guarded.restore(next)
}

function formatMatch(file: string, line: string, index: number) {
  return `${path.relative(ROOT, file)}:${index + 1}: ${line.trim().slice(0, 180)}`
}

async function main() {
  const args = process.argv.slice(2)
  const apply = args.includes("--apply")
  const check = args.includes("--check") || !apply
  const json = args.includes("--json")
  const scopeArg = args.find((arg) => arg.startsWith("--scope="))?.slice("--scope=".length)
  const scopes = scopeArg ? (scopeArg.split(",") as Scope[]) : (["code", "docs", "ui", "assets"] as Scope[])

  const files = await walk(ROOT)
  const changes: Array<{ file: string; before: string; after: string; scope: Scope }> = []
  const forbidden: string[] = []
  const allText: string[] = []

  for (const file of files) {
    const scope = classify(file)
    if (!scopes.includes(scope)) continue
    const before = await fs.readFile(file, "utf8")
    allText.push(before)
    const after = rewrite(before, scope)
    if (after !== before) changes.push({ file, before, after, scope })
    for (const pattern of FORBIDDEN) {
      const match = before.match(pattern)
      if (match) forbidden.push(`${path.relative(ROOT, file)}: ${match[0]}`)
    }
  }

  const report = {
    changes: changes.map((change) => ({
      file: path.relative(ROOT, change.file).replaceAll("\\", "/"),
      scope: change.scope,
      lines: change.before.split(/\r?\n/).flatMap((line, index) =>
        line !== change.after.split(/\r?\n/)[index] ? [{ line: index + 1, before: line, after: change.after.split(/\r?\n/)[index] }] : [],
      ).slice(0, 20),
    })),
    forbidden: [...new Set(forbidden)].slice(0, 200),
    required: scopes.includes("code")
      ? REQUIRED.filter((value) => !allText.some((text) => text.includes(value)))
      : [],
  }

  if (apply) {
    for (const change of changes) await fs.writeFile(change.file, change.after)
  }

  if (json) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log(`scope: ${scopes.join(",")}`)
    console.log(`files needing changes: ${changes.length}`)
    for (const change of report.changes.slice(0, 200)) {
      console.log(`\n${change.file} [${change.scope}]`)
      for (const line of change.lines.slice(0, 5)) {
        console.log(`  ${line.line}: ${line.before.trim().slice(0, 140)}`)
        console.log(`  -> ${line.after?.trim().slice(0, 140) ?? ""}`)
      }
    }
    if (report.changes.length > 200) console.log(`... ${report.changes.length - 200} more files`)
    if (report.forbidden.length) {
      console.log(`\nforbidden upstream references:`)
      for (const item of report.forbidden) console.log(`  ${item}`)
    }
    if (report.required.length) {
      console.log(`\nmissing protected strings:`)
      for (const item of report.required) console.log(`  ${item}`)
    }
  }

  if (check) {
    if (changes.length || report.forbidden.length || report.required.length) process.exit(1)
  }
}

await main()
