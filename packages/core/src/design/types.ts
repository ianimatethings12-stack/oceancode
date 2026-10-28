export type DesignCategory =
  | "Developer & AI"
  | "Frontier Labs"
  | "Fintech & Crypto"
  | "Consumer & Media"
  | "SaaS & Workspace"
  | "Enterprise & Cloud"
  | "Auto & Aerospace"

export interface DesignPalette {
  readonly primary: string
  readonly secondary: string
  readonly accent: string
  readonly background: string
  readonly surface: string
  readonly text: string
  readonly textMuted: string
  readonly border: string
}

export interface DesignTypography {
  readonly fontSans: string
  readonly fontMono: string
  readonly headingStyle: string
}

export interface DesignComponentPatterns {
  readonly button: string
  readonly card: string
  readonly input: string
  readonly navigation: string
}

export interface DesignArchetype {
  readonly id: string
  readonly name: string
  readonly category: DesignCategory
  readonly vibe: string
  readonly palette: DesignPalette
  readonly typography: DesignTypography
  readonly keywords: readonly string[]
  readonly cssVariables: Readonly<Record<string, string>>
  readonly componentPatterns: DesignComponentPatterns
}

export interface ResolutionResult {
  readonly primary: DesignArchetype
  readonly recommendations: readonly DesignArchetype[]
}
