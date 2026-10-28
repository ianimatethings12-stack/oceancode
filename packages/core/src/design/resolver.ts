import { ARCHETYPES, getArchetype } from "./catalog.js"
import type { DesignArchetype, ResolutionResult } from "./types.js"

const DOMAIN_MAPPINGS: ReadonlyArray<{
  readonly patterns: readonly RegExp[]
  readonly preferred: readonly string[]
}> = [
  {
    patterns: [/\b(iot|fleet|vehicle|hardware|telemetry|autopilot|sensor|automotive|car|speed|battery)\b/i],
    preferred: ["tesla", "linear.app", "bmw-m", "spacex", "voltagent"],
  },
  {
    patterns: [/\b(fintech|finance|financial|payment|payments|bank|banking|invoice|billing|credit|crypto|wallet|money|checkout)\b/i],
    preferred: ["stripe", "revolut", "mercury", "wise", "coinbase"],
  },
  {
    patterns: [/\b(ai|llm|agent|agents|reasoning|prompt|frontier|intelligence|gpt|claude|chatgpt|assistant)\b/i],
    preferred: ["claude", "cursor", "linear.app", "mistral.ai", "opencode.ai"],
  },
  {
    patterns: [/\b(devtools|devtool|terminal|cli|ide|code|coding|git|developer|database|sql|postgres|backend|api)\b/i],
    preferred: ["linear.app", "vercel", "supabase", "warp", "cursor"],
  },
  {
    patterns: [/\b(saas|workspace|productivity|notes|wiki|docs|spreadsheet|crm|tasks|kanban|management|project)\b/i],
    preferred: ["notion", "linear.app", "figma", "resend", "cal"],
  },
  {
    patterns: [/\b(ecommerce|shop|store|cart|merchandise|retail|checkout|fashion)\b/i],
    preferred: ["shopify", "stripe", "nike", "apple"],
  },
  {
    patterns: [/\b(audio|music|sound|voice|streaming|podcast|video|cinema|media|news)\b/i],
    preferred: ["spotify", "elevenlabs", "apple", "theverge", "runwayml"],
  },
  {
    patterns: [/\b(enterprise|infrastructure|cloud|devops|security|monitoring|observability|metrics)\b/i],
    preferred: ["ibm", "hashicorp", "sentry", "oracle", "sap"],
  },
  {
    patterns: [/\b(design|creative|motion|canvas|portfolio|animation|interactive|landing)\b/i],
    preferred: ["framer", "figma", "apple", "airbnb", "lovable"],
  },
  {
    patterns: [/\b(health|fitness|wellness|biometrics|sleep|sports|athletic)\b/i],
    preferred: ["oura", "nike", "apple", "starbucks"],
  },
]

const DEFAULT_RECOMMENDATIONS = ["linear.app", "vercel", "stripe", "apple"]

export function resolveDesignPreset(promptOrDomain: string): ResolutionResult {
  const query = (promptOrDomain || "").trim().toLowerCase()
  if (!query) {
    const defaultArchetypes = DEFAULT_RECOMMENDATIONS.map((id) => getArchetype(id)).filter(
      (item): item is DesignArchetype => item !== undefined,
    )
    return {
      primary: defaultArchetypes[0]!,
      recommendations: defaultArchetypes,
    }
  }

  // 1. Direct brand mention check (test longer names first e.g. "BMW M" before "BMW")
  const candidatesBySpecificity = [...ARCHETYPES].sort((a, b) => b.name.length - a.name.length)
  for (const archetype of candidatesBySpecificity) {
    const idName = archetype.id.replace(/\.(app|ai)$/, "")
    const regex = new RegExp(`\\b(${archetype.id}|${archetype.name}|${idName})\\b`, "i")
    if (regex.test(query)) {
      const remaining = ARCHETYPES.filter((item) => item.id !== archetype.id).slice(0, 3)
      return {
        primary: archetype,
        recommendations: [archetype, ...remaining],
      }
    }
  }

  // 2. Domain pattern scoring
  const scores = new Map<string, number>()
  for (const item of ARCHETYPES) {
    scores.set(item.id, 0)
  }

  for (const mapping of DOMAIN_MAPPINGS) {
    for (const pattern of mapping.patterns) {
      if (pattern.test(query)) {
        mapping.preferred.forEach((id, index) => {
          const current = scores.get(id) ?? 0
          scores.set(id, current + (100 - index * 15))
        })
      }
    }
  }

  // 3. Keyword / Vibe token matching
  const words = query.split(/[\s,./\-_:]+/).filter((w) => w.length > 2)
  for (const item of ARCHETYPES) {
    let score = scores.get(item.id) ?? 0
    for (const word of words) {
      if (item.name.toLowerCase().includes(word)) score += 30
      if (item.category.toLowerCase().includes(word)) score += 20
      if (item.keywords.some((k) => k.toLowerCase().includes(word))) score += 25
      if (item.vibe.toLowerCase().includes(word)) score += 15
    }
    scores.set(item.id, score)
  }

  // 4. Rank and choose top 4
  const ranked = [...ARCHETYPES].sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0))
  const top4 = ranked.slice(0, 4)

  return {
    primary: top4[0]!,
    recommendations: top4,
  }
}

export function isFrontendPrompt(prompt: string): boolean {
  const p = prompt.toLowerCase()
  return (
    /\b(frontend|ui|gui|component|landing|page|dashboard|website|web app|html|css|tailwind|react|vue|svelte|nextjs|button|modal|navbar|layout|view|screen|client-side)\b/i.test(
      p,
    ) ||
    /\b(design|style|theme|colors|palette|typography|look and feel|hero|cards|pricing)\b/i.test(p)
  )
}
