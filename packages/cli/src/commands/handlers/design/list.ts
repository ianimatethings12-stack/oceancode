import { log } from "@clack/prompts"
import { Effect, Option } from "effect"
import { Commands } from "../../commands"
import { Runtime } from "../../../framework/runtime"
import { CATEGORIES, listArchetypes } from "@opencode/core/design"

export default Runtime.handler(Commands.commands.design.commands.list, (input) =>
  Effect.sync(() => {
    const filterCat = Option.getOrUndefined(input.category)?.toLowerCase().trim()
    const all = listArchetypes()

    console.log(`\n=== Autonomous Design System Engine Catalog (Total: ${all.length} archetypes) ===\n`)

    for (const cat of CATEGORIES) {
      if (filterCat && !cat.toLowerCase().includes(filterCat)) continue

      const inCat = all.filter((a) => a.category === cat)
      console.log(`[${cat}] (${inCat.length} archetypes)`)
      for (const a of inCat) {
        console.log(`  • ${a.id.padEnd(16)} | ${a.name.padEnd(14)} | ${a.palette.primary.padEnd(9)} | ${a.vibe}`)
      }
      console.log("")
    }

    log.info(`Use "oceancode design select [prompt]" to interactively select or write DESIGN.md`)
  }),
)
