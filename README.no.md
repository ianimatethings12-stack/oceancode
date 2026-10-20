<p align="center">
  <a href="https://github.com/ianimatethings12-stack/oceancode">
    <picture>
      <source srcset="packages/web/src/assets/oceancode-logo-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/web/src/assets/oceancode-logo-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/web/src/assets/oceancode-logo-light.svg" alt="OceanCode logo">
    </picture>
  </a>
</p>
<p align="center">AI-kodeagent med åpen kildekode.</p>
<p align="center">
  <a href="https://github.com/ianimatethings12-stack/oceancode/discussions"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/oceancode"><img alt="npm" src="https://img.shields.io/npm/v/oceancode?style=flat-square" /></a>
  <a href="https://github.com/ianimatethings12-stack/oceancode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/ianimatethings12-stack/oceancode/publish.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![OceanCode Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://github.com/ianimatethings12-stack/oceancode)

---

### Installasjon

```bash
# YOLO
curl -fsSL https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install | bash

# Pakkehåndterere
npm install -g oceancode@latest
bun add -g oceancode@latest
pnpm add -g oceancode@latest
yarn global add oceancode@latest
```

> [!TIP]
> Fjern versjoner eldre enn 0.1.x før du installerer.

### Desktop-app (BETA)

OceanCode er også tilgjengelig som en desktop-app. Last ned direkte fra [releases-siden](https://github.com/ianimatethings12-stack/oceancode/releases) eller [GitHub Releases](https://github.com/ianimatethings12-stack/oceancode/releases).

| Plattform             | Nedlasting                         |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `oceancode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `oceancode-desktop-mac-x64.dmg`     |
| Windows               | `oceancode-desktop-windows-x64.exe` |
| Linux                 | `.deb`, `.rpm` eller AppImage      |


#### Installasjonsmappe

Installasjonsskriptet bruker følgende prioritet for installasjonsstien:

1. `$OCEANCODE_INSTALL_DIR` - Egendefinert installasjonsmappe
2. `$XDG_BIN_DIR` - Sti som følger XDG Base Directory Specification
3. `$HOME/bin` - Standard brukerbinar-mappe (hvis den finnes eller kan opprettes)
4. `$HOME/.oceancode/bin` - Standard fallback

```bash
# Eksempler
OCEANCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install | bash
```

### Agents

OceanCode har to innebygde agents du kan bytte mellom med `Tab`-tasten.

- **build** - Standard, agent med full tilgang for utviklingsarbeid
- **plan** - Skrivebeskyttet agent for analyse og kodeutforsking
  - Nekter filendringer som standard
  - Spør om tillatelse før bash-kommandoer
  - Ideell for å utforske ukjente kodebaser eller planlegge endringer

Det finnes også en **general**-subagent for komplekse søk og flertrinnsoppgaver.
Den brukes internt og kan kalles via `@general` i meldinger.

Les mer om [agents](https://github.com/ianimatethings12-stack/oceancode/tree/dev/packages/web/src/content/docs/agents).

### Dokumentasjon

For mer info om hvordan du konfigurerer OceanCode, [**se dokumentasjonen**](https://github.com/ianimatethings12-stack/oceancode/tree/dev/packages/web/src/content/docs).

### Bidra

Hvis du vil bidra til OceanCode, les [contributing docs](./CONTRIBUTING.md) før du sender en pull request.

### Bygge på OceanCode

Hvis du jobber med et prosjekt som er relatert til OceanCode og bruker "oceancode" som en del av navnet; for eksempel "opencode-dashboard" eller "opencode-mobile", legg inn en merknad i README som presiserer at det ikke er bygget av OceanCode-teamet og ikke er tilknyttet oss på noen måte.

---

**Bli med i fellesskapet** [Discord](https://github.com/ianimatethings12-stack/oceancode/discussions) | [X.com](https://github.com/ianimatethings12-stack/oceancode)
