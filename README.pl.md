<p align="center">
  <a href="https://github.com/ianimatethings12-stack/oceancode">
    <picture>
      <source srcset="packages/web/src/assets/oceancode-logo-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/web/src/assets/oceancode-logo-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/web/src/assets/oceancode-logo-light.svg" alt="OceanCode logo">
    </picture>
  </a>
</p>
<p align="center">Otwartoźródłowy agent kodujący AI.</p>
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

### Instalacja

```bash
# YOLO
curl -fsSL https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install | bash

# Menedżery pakietów
npm install -g oceancode@latest
bun add -g oceancode@latest
pnpm add -g oceancode@latest
yarn global add oceancode@latest
```

> [!TIP]
> Przed instalacją usuń wersje starsze niż 0.1.x.

### Aplikacja desktopowa (BETA)

OceanCode jest także dostępny jako aplikacja desktopowa. Pobierz ją bezpośrednio ze strony [releases](https://github.com/ianimatethings12-stack/oceancode/releases) lub z [GitHub Releases](https://github.com/ianimatethings12-stack/oceancode/releases).

| Platforma             | Pobieranie                         |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `oceancode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `oceancode-desktop-mac-x64.dmg`     |
| Windows               | `oceancode-desktop-windows-x64.exe` |
| Linux                 | `.deb`, `.rpm` lub AppImage        |


#### Katalog instalacji

Skrypt instalacyjny stosuje następujący priorytet wyboru ścieżki instalacji:

1. `$OCEANCODE_INSTALL_DIR` - Własny katalog instalacji
2. `$XDG_BIN_DIR` - Ścieżka zgodna ze specyfikacją XDG Base Directory
3. `$HOME/bin` - Standardowy katalog binarny użytkownika (jeśli istnieje lub można go utworzyć)
4. `$HOME/.oceancode/bin` - Domyślny fallback

```bash
# Przykłady
OCEANCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install | bash
```

### Agents

OceanCode zawiera dwóch wbudowanych agentów, między którymi możesz przełączać się klawiszem `Tab`.

- **build** - Domyślny agent z pełnym dostępem do pracy developerskiej
- **plan** - Agent tylko do odczytu do analizy i eksploracji kodu
  - Domyślnie odmawia edycji plików
  - Pyta o zgodę przed uruchomieniem komend bash
  - Idealny do poznawania nieznanych baz kodu lub planowania zmian

Dodatkowo jest subagent **general** do złożonych wyszukiwań i wieloetapowych zadań.
Jest używany wewnętrznie i można go wywołać w wiadomościach przez `@general`.

Dowiedz się więcej o [agents](https://github.com/ianimatethings12-stack/oceancode/tree/dev/packages/web/src/content/docs/agents).

### Dokumentacja

Więcej informacji o konfiguracji OceanCode znajdziesz w [**dokumentacji**](https://github.com/ianimatethings12-stack/oceancode/tree/dev/packages/web/src/content/docs).

### Współtworzenie

Jeśli chcesz współtworzyć OceanCode, przeczytaj [contributing docs](./CONTRIBUTING.md) przed wysłaniem pull requesta.

### Budowanie na OceanCode

Jeśli pracujesz nad projektem związanym z OceanCode i używasz "oceancode" jako części nazwy (na przykład "opencode-dashboard" lub "opencode-mobile"), dodaj proszę notatkę do swojego README, aby wyjaśnić, że projekt nie jest tworzony przez zespół OceanCode i nie jest z nami w żaden sposób powiązany.

---

**Dołącz do naszej społeczności** [Discord](https://github.com/ianimatethings12-stack/oceancode/discussions) | [X.com](https://github.com/ianimatethings12-stack/oceancode)
