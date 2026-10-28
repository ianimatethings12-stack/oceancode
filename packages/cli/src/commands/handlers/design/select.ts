import path from "path"
import { intro, isCancel, log, outro, select, text } from "@clack/prompts"
import { Effect, Option } from "effect"
import { Commands } from "../../commands"
import { Runtime } from "../../../framework/runtime"
import { getArchetype, resolveDesignPreset, writeProjectDesign } from "@opencode/core/design"
import type { DesignArchetype } from "@opencode/core/design"

export default Runtime.handler(Commands.commands.design.commands.select, (input) =>
  Effect.gen(function* () {
    const cwd = process.cwd()
    const designFile = Bun.file(path.join(cwd, "DESIGN.md"))
    const exists = yield* Effect.promise(() => designFile.exists())

    if (exists && !input.force) {
      log.info(`DESIGN.md already exists in ${cwd}. Use --force to overwrite.`)
      return
    }

    const explicitBrand = Option.getOrUndefined(input.brand)
    const promptText = Option.getOrUndefined(input.prompt) ?? ""
    const isInteractive = Boolean(process.stdin.isTTY && !input.auto)

    let chosenArchetype: DesignArchetype | undefined

    if (explicitBrand) {
      chosenArchetype = getArchetype(explicitBrand)
      if (!chosenArchetype) {
        log.warn(`Brand "${explicitBrand}" not found in local catalog; fetching dynamically...`)
      }
    } else if (!isInteractive) {
      const resolution = resolveDesignPreset(promptText)
      chosenArchetype = resolution.primary
      log.info(`[auto] Selected #${chosenArchetype.name} (${chosenArchetype.vibe}) for prompt "${promptText}"`)
    } else {
      intro("Autonomous Design System Engine (awesome-design-md)")
      const resolution = resolveDesignPreset(promptText)
      const recommendations = resolution.recommendations

      const choices = [
        ...recommendations.map((rec, index) => ({
          value: rec.id,
          label: `${index + 1}. ${rec.name} [${rec.palette.primary}]`,
          hint: `${rec.vibe} (${rec.category})`,
        })),
        {
          value: "__custom__",
          label: "Custom: Enter any brand name from the 85+ archetypes catalog",
          hint: "e.g. spacex, wise, notion, figma, vercel, apple...",
        },
      ]

      const picked = yield* Effect.promise(() =>
        select({
          message: "Select a design archetype for your frontend UI:",
          options: choices,
          initialValue: resolution.primary.id,
        }),
      )

      if (isCancel(picked)) {
        outro("Design selection cancelled")
        return
      }

      let selectedId = picked as string
      if (selectedId === "__custom__") {
        const customInput = yield* Effect.promise(() =>
          text({
            message: "Enter brand archetype name:",
            placeholder: "e.g. stripe, linear.app, tesla, vercel",
            validate: (value) => {
              if (!value || value.trim().length === 0) return "Brand name cannot be empty"
              return undefined
            },
          }),
        )

        if (isCancel(customInput)) {
          outro("Design selection cancelled")
          return
        }
        selectedId = customInput.trim()
      }

      chosenArchetype = getArchetype(selectedId)
      if (!chosenArchetype) {
        log.warn(`Brand "${selectedId}" not in offline index; will fetch dynamically from awesome-design-md.`)
      }
    }

    const targetBrand = chosenArchetype ?? (explicitBrand || "linear.app")
    const writtenPath = yield* writeProjectDesign(cwd, targetBrand)

    const archetypeLabel = typeof targetBrand === "string" ? targetBrand : `${targetBrand.name} (${targetBrand.vibe})`
    if (isInteractive) {
      outro(`✓ Successfully generated ${writtenPath} using ${archetypeLabel}`)
    } else {
      log.success(`Generated ${writtenPath} using ${archetypeLabel}`)
    }
  }),
)
