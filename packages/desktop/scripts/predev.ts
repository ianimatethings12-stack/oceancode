import { $ } from "bun"

await $`bun run install-electron`
await $`bun ./scripts/prebuild.ts`
