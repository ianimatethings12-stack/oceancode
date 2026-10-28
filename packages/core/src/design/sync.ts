import os from "os"
import path from "path"
import { Effect } from "effect"
import { getArchetype } from "./catalog.js"
import type { DesignArchetype } from "./types.js"

const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md"

export function getDesignCacheDir(): string {
  const home = process.env.OCEANCODE_TEST_HOME ?? process.env.OPENCODE_TEST_HOME ?? os.homedir()
  return path.join(home, ".opencode", "cache", "design-md")
}

export function generateDesignMarkdown(archetype: DesignArchetype): string {
  const cssVars = Object.entries(archetype.cssVariables)
    .map(([key, val]) => `  ${key}: ${val};`)
    .join("\n")

  return `# DESIGN.md — ${archetype.name} Design System Archetype

> **Category**: ${archetype.category}  
> **Aesthetic Vibe**: ${archetype.vibe}  
> **Source**: VoltAgent/awesome-design-md

---

## 1. Design Philosophy & Aesthetic Directives
- **Precision & Intent**: Every pixel, margin, and font size must convey the ${archetype.name} design ethos: *"${archetype.vibe}"*.
- **Strict CSS Custom Properties**: All frontend UI components MUST directly reference and consume the CSS custom properties defined in \`:root\`. Do NOT hardcode arbitrary hex values or unapproved font families.
- **Component Consistency**: Buttons, form controls, cards, and navigation surfaces must strictly adhere to the component specifications outlined below.

---

## 2. Global CSS Custom Properties (\`:root\`)

\`\`\`css
:root {
${cssVars}
}
\`\`\`

---

## 3. Color Palette & Semantic Roles

| Token | Value | Role & Usage |
| :--- | :--- | :--- |
| \`--color-primary\` | \`${archetype.palette.primary}\` | Primary brand accent, CTA buttons, active state highlights |
| \`--color-secondary\` | \`${archetype.palette.secondary}\` | Secondary surfaces, supporting indicators, subtle fills |
| \`--color-accent\` | \`${archetype.palette.accent}\` | Micro-interactions, badges, notifications, focus rings |
| \`--color-bg\` | \`${archetype.palette.background}\` | Root canvas background |
| \`--color-surface\` | \`${archetype.palette.surface}\` | Card containers, modal sheets, elevated panels |
| \`--color-text\` | \`${archetype.palette.text}\` | Primary body typography and headline titles |
| \`--color-text-muted\` | \`${archetype.palette.textMuted}\` | Captions, placeholders, metadata labels |
| \`--color-border\` | \`${archetype.palette.border}\` | Subtle dividers, card perimeters, input borders |

---

## 4. Typography Scale & Hierarchy

- **Sans-Serif Font Stack**: \`${archetype.typography.fontSans}\`
- **Monospace Font Stack**: \`${archetype.typography.fontMono}\`
- **Heading Style**: \`${archetype.typography.headingStyle}\`

### Hierarchy Guidelines:
- **Display / H1**: 2.5rem – 3.25rem (Bold / Black), letter-spacing -0.03em.
- **H2 / Section Title**: 1.75rem – 2.25rem (Semi-bold), letter-spacing -0.02em.
- **H3 / Card Title**: 1.25rem – 1.5rem (Medium / Semi-bold).
- **Body Text**: 0.9375rem – 1rem, line-height 1.6.
- **Code / Metrics**: Monospace stack, font-size 0.875rem, letter-spacing normal.

---

## 5. Component Patterns & Visual Recipes

### Button Pattern
- **Style**: \`${archetype.componentPatterns.button}\`
- **Rule**: Consume \`var(--color-primary)\` for interactive state transitions.

### Card & Surface Pattern
- **Style**: \`${archetype.componentPatterns.card}\`
- **Rule**: Consume \`var(--color-surface)\` and \`var(--color-border)\` for boundaries.

### Input & Form Fields
- **Style**: \`${archetype.componentPatterns.input}\`
- **Rule**: Contrast against \`var(--color-bg)\` with focus indicator using \`var(--color-primary)\`.

### Navigation Header
- **Style**: \`${archetype.componentPatterns.navigation}\`
- **Rule**: Sticky backdrop blur with fine separator \`var(--color-border)\`.

---

## 6. Code Generation Heuristics for Agents
1. **Always verify token presence**: Before generating any component (React, Vue, Svelte, or plain HTML), inspect this \`DESIGN.md\` and bind styling directly to CSS custom properties.
2. **Elevate micro-interactions**: Include subtle hover transitions (150ms-200ms ease), active scale dampening (\`active:scale-[0.98]\`), and accessible focus rings (\`focus-visible:ring-2\`).
3. **Respect dark/light harmony**: Maintain contrast ratios (> 4.5:1 for text) against the assigned canvas background.
`
}

export function fetchDesignPreset(brand: string): Effect.Effect<string> {
  return Effect.gen(function* () {
    const normalized = brand.toLowerCase().trim()
    const archetype = getArchetype(normalized)
    const brandKey = archetype?.id ?? normalized
    const cacheDir = getDesignCacheDir()
    const cacheFile = path.join(cacheDir, `${brandKey}.md`)

    // 1. Check local file cache using Bun.file
    const cached = Bun.file(cacheFile)
    const exists = yield* Effect.promise(() => cached.exists())
    if (exists) {
      return yield* Effect.promise(() => cached.text())
    }

    // 2. Try fetching from remote GitHub
    const url = `${GITHUB_RAW_BASE}/${brandKey}/DESIGN.md`
    const remoteContent = yield* Effect.promise(async () => {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(4000) })
        if (!response.ok) {
          // If brand has .app or .ai, try without extension
          const stripped = brandKey.replace(/\.(app|ai)$/, "")
          if (stripped !== brandKey) {
            const fallbackResponse = await fetch(`${GITHUB_RAW_BASE}/${stripped}/DESIGN.md`, {
              signal: AbortSignal.timeout(4000),
            })
            if (fallbackResponse.ok) return await fallbackResponse.text()
          }
          return undefined
        }
        return await response.text()
      } catch {
        return undefined
      }
    })

    const finalContent =
      remoteContent && remoteContent.length > 50
        ? remoteContent
        : archetype
          ? generateDesignMarkdown(archetype)
          : `# DESIGN.md — ${brandKey}\n\n/* Default Design System */\n`

    // 3. Cache result locally
    yield* Effect.promise(async () => {
      try {
        await Bun.write(cacheFile, finalContent)
      } catch {
        // Cache write errors are non-fatal
      }
    })

    return finalContent
  })
}

export function writeProjectDesign(
  projectDir: string,
  brandOrArchetype: string | DesignArchetype,
  customContent?: string,
): Effect.Effect<string> {
  return Effect.gen(function* () {
    const archetype = typeof brandOrArchetype === "string" ? getArchetype(brandOrArchetype) : brandOrArchetype
    const brandName = typeof brandOrArchetype === "string" ? brandOrArchetype : brandOrArchetype.id
    const content =
      customContent ?? (archetype ? generateDesignMarkdown(archetype) : yield* fetchDesignPreset(brandName))

    const targetPath = path.join(projectDir, "DESIGN.md")
    yield* Effect.promise(() => Bun.write(targetPath, content))
    return targetPath
  })
}
