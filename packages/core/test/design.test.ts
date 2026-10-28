import { describe, expect, it } from "bun:test"
import os from "os"
import path from "path"
import { Effect } from "effect"
import {
  ARCHETYPES,
  CATEGORIES,
  generateDesignMarkdown,
  getArchetype,
  getDesignCacheDir,
  isFrontendPrompt,
  listArchetypes,
  resolveDesignPreset,
  writeProjectDesign,
  fetchDesignPreset,
} from "../src/design/index.js"

describe("Design System Engine - Catalog", () => {
  it("contains 85+ design archetypes", () => {
    const list = listArchetypes()
    expect(list.length).toBeGreaterThanOrEqual(85)
  })

  it("covers all 7 required design categories", () => {
    expect(CATEGORIES).toHaveLength(7)
    for (const cat of CATEGORIES) {
      const inCat = ARCHETYPES.filter((a) => a.category === cat)
      expect(inCat.length).toBeGreaterThanOrEqual(5)
    }
  })

  it("contains key frontier, developer, fintech, automotive, and SaaS brands", () => {
    const requiredBrands = [
      "linear.app",
      "vercel",
      "supabase",
      "warp",
      "cursor",
      "claude",
      "stripe",
      "revolut",
      "mercury",
      "apple",
      "spotify",
      "notion",
      "figma",
      "framer",
      "ibm",
      "tesla",
      "spacex",
      "voltagent",
    ]

    for (const brand of requiredBrands) {
      const archetype = getArchetype(brand)
      expect(archetype).toBeDefined()
      expect(archetype?.id).toBe(brand)
    }
  })

  it("validates that all archetypes contain complete design tokens", () => {
    for (const a of ARCHETYPES) {
      expect(a.id).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(a.vibe).toBeTruthy()
      expect(a.category).toBeTruthy()

      // Palette tokens
      expect(a.palette.primary).toMatch(/^#[0-9a-fA-F]{3,8}$/)
      expect(a.palette.background).toBeTruthy()
      expect(a.palette.surface).toBeTruthy()
      expect(a.palette.text).toBeTruthy()
      expect(a.palette.border).toBeTruthy()

      // Typography
      expect(a.typography.fontSans).toBeTruthy()
      expect(a.typography.headingStyle).toBeTruthy()

      // CSS Variables
      expect(a.cssVariables["--color-primary"]).toBe(a.palette.primary)
      expect(a.cssVariables["--color-bg"]).toBe(a.palette.background)
      expect(a.cssVariables["--color-surface"]).toBe(a.palette.surface)

      // Component Patterns
      expect(a.componentPatterns.button).toBeTruthy()
      expect(a.componentPatterns.card).toBeTruthy()
      expect(a.componentPatterns.input).toBeTruthy()
      expect(a.componentPatterns.navigation).toBeTruthy()
    }
  })

  it("resolves archetypes case-insensitively and handles suffixes", () => {
    expect(getArchetype("LINEAR")).toBeDefined()
    expect(getArchetype("linear")).toBeDefined()
    expect(getArchetype("linear.app")).toBeDefined()
    expect(getArchetype("Tesla")).toBeDefined()
    expect(getArchetype("unknown-brand-xyz")).toBeUndefined()
  })
})

describe("Design System Engine - Domain Resolver", () => {
  it("resolves IoT and fleet queries to Tesla and automotive presets", () => {
    const result = resolveDesignPreset("Build an IoT connected vehicle telemetry and fleet dashboard")
    expect(result.primary.id).toBe("tesla")
    expect(result.recommendations.map((r) => r.id)).toContain("tesla")
    expect(result.recommendations).toHaveLength(4)
  })

  it("resolves financial/fintech queries to Stripe and banking presets", () => {
    const result = resolveDesignPreset("Create a fintech payment checkout flow and invoice billing portal")
    expect(result.primary.id).toBe("stripe")
    expect(result.recommendations.map((r) => r.id)).toContain("revolut")
    expect(result.recommendations).toHaveLength(4)
  })

  it("resolves direct brand mentions with highest priority", () => {
    const result = resolveDesignPreset("We want an Apple style clean portfolio")
    expect(result.primary.id).toBe("apple")

    const result2 = resolveDesignPreset("Make it look like Framer motion")
    expect(result2.primary.id).toBe("framer")
  })

  it("provides sensible defaults for empty prompts", () => {
    const result = resolveDesignPreset("")
    expect(result.primary.id).toBe("linear.app")
    expect(result.recommendations).toHaveLength(4)
  })

  it("accurately classifies frontend prompts", () => {
    expect(isFrontendPrompt("build a React landing page with pricing cards")).toBe(true)
    expect(isFrontendPrompt("design a dark mode dashboard UI with tailwind")).toBe(true)
    expect(isFrontendPrompt("create a web app button component")).toBe(true)
    expect(isFrontendPrompt("write a python script to parse logs")).toBe(false)
    expect(isFrontendPrompt("calculate fibonacci numbers")).toBe(false)
  })
})

describe("Design System Engine - Sync & Markdown Generation", () => {
  it("generates markdown with :root CSS custom properties and component rules", () => {
    const linear = getArchetype("linear.app")!
    const markdown = generateDesignMarkdown(linear)

    expect(markdown).toContain("# DESIGN.md — Linear Design System Archetype")
    expect(markdown).toContain(":root {")
    expect(markdown).toContain("--color-primary: #5e6ad2;")
    expect(markdown).toContain("--color-bg: #0b0c10;")
    expect(markdown).toContain("## 4. Typography Scale & Hierarchy")
    expect(markdown).toContain("## 5. Component Patterns & Visual Recipes")
    expect(markdown).toContain("## 6. Code Generation Heuristics for Agents")
    expect(markdown).toContain("Strict CSS Custom Properties")
  })

  it("writes DESIGN.md to target directory", async () => {
    const tmpDir = path.join(os.tmpdir(), `oceancode-test-${Date.now()}`)
    const stripe = getArchetype("stripe")!

    const filePath = await Effect.runPromise(writeProjectDesign(tmpDir, stripe))
    expect(filePath).toBe(path.join(tmpDir, "DESIGN.md"))

    const file = Bun.file(filePath)
    expect(await file.exists()).toBe(true)
    const content = await file.text()
    expect(content).toContain("Stripe Design System Archetype")
    expect(content).toContain("--color-primary: #635bff;")
  })

  it("fetches or falls back to generated markdown gracefully", async () => {
    const cacheDir = getDesignCacheDir()
    expect(cacheDir).toContain("design-md")

    const content = await Effect.runPromise(fetchDesignPreset("supabase"))
    expect(content).toBeTruthy()
    expect(content.length).toBeGreaterThan(100)
    expect(content.toLowerCase()).toContain("supaba")
  })
})
