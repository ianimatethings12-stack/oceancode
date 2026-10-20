<p align="center">
  <a href="https://github.com/ianimatethings12-stack/oceancode">
    <picture>
      <source srcset="packages/web/src/assets/oceancode-logo-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/web/src/assets/oceancode-logo-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/web/src/assets/oceancode-logo-light.svg" alt="Logo OceanCode">
    </picture>
  </a>
</p>
<p align="center">L'agent de codage IA open source.</p>
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

### Installation

```bash
# YOLO
curl -fsSL https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install | bash

# Gestionnaires de paquets
npm install -g oceancode@latest
bun add -g oceancode@latest
pnpm add -g oceancode@latest
yarn global add oceancode@latest
```

> [!TIP]
> Supprimez les versions antérieures à 0.1.x avant d'installer.

### Application de bureau (BETA)

OceanCode est aussi disponible en application de bureau. Téléchargez-la directement depuis la [page des releases](https://github.com/ianimatethings12-stack/oceancode/releases) ou [GitHub Releases](https://github.com/ianimatethings12-stack/oceancode/releases).

| Plateforme            | Téléchargement                     |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `oceancode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `oceancode-desktop-mac-x64.dmg`     |
| Windows               | `oceancode-desktop-windows-x64.exe` |
| Linux                 | `.deb`, `.rpm`, ou AppImage        |


#### Répertoire d'installation

Le script d'installation respecte l'ordre de priorité suivant pour le chemin d'installation :

1. `$OCEANCODE_INSTALL_DIR` - Répertoire d'installation personnalisé
2. `$XDG_BIN_DIR` - Chemin conforme à la spécification XDG Base Directory
3. `$HOME/bin` - Répertoire binaire utilisateur standard (s'il existe ou peut être créé)
4. `$HOME/.oceancode/bin` - Repli par défaut

```bash
# Exemples
OCEANCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install | bash
```

### Agents

OceanCode inclut deux agents intégrés que vous pouvez basculer avec la touche `Tab`.

- **build** - Par défaut, agent avec accès complet pour le travail de développement
- **plan** - Agent en lecture seule pour l'analyse et l'exploration du code
  - Refuse les modifications de fichiers par défaut
  - Demande l'autorisation avant d'exécuter des commandes bash
  - Idéal pour explorer une base de code inconnue ou planifier des changements

Un sous-agent **general** est aussi inclus pour les recherches complexes et les tâches en plusieurs étapes.
Il est utilisé en interne et peut être invoqué via `@general` dans les messages.

En savoir plus sur les [agents](https://github.com/ianimatethings12-stack/oceancode/tree/dev/packages/web/src/content/docs/agents).

### Documentation

Pour plus d'informations sur la configuration d'OceanCode, [**consultez notre documentation**](https://github.com/ianimatethings12-stack/oceancode/tree/dev/packages/web/src/content/docs).

### Contribuer

Si vous souhaitez contribuer à OceanCode, lisez nos [docs de contribution](./CONTRIBUTING.md) avant de soumettre une pull request.

### Construire avec OceanCode

Si vous travaillez sur un projet lié à OceanCode et que vous utilisez "oceancode" dans le nom du projet (par exemple, "opencode-dashboard" ou "opencode-mobile"), ajoutez une note dans votre README pour préciser qu'il n'est pas construit par l'équipe OceanCode et qu'il n'est pas affilié à nous.

---

**Rejoignez notre communauté** [Discord](https://github.com/ianimatethings12-stack/oceancode/discussions) | [X.com](https://github.com/ianimatethings12-stack/oceancode)
