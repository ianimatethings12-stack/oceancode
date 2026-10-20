<p align="center">
  <a href="https://github.com/ianimatethings12-stack/oceancode">
    <picture>
      <source srcset="packages/web/src/assets/oceancode-logo-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/web/src/assets/oceancode-logo-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/web/src/assets/oceancode-logo-light.svg" alt="OceanCode logo">
    </picture>
  </a>
</p>
<p align="center">オープンソースのAIコーディングエージェント。</p>
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

### インストール

```bash
# YOLO
curl -fsSL https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install | bash

# パッケージマネージャー
npm install -g oceancode@latest
bun add -g oceancode@latest
pnpm add -g oceancode@latest
yarn global add oceancode@latest
```

> [!TIP]
> インストール前に 0.1.x より古いバージョンを削除してください。

### デスクトップアプリ (BETA)

OceanCode はデスクトップアプリとしても利用できます。[releases page](https://github.com/ianimatethings12-stack/oceancode/releases) から直接ダウンロードするか、[GitHub Releases](https://github.com/ianimatethings12-stack/oceancode/releases) を利用してください。

| プラットフォーム      | ダウンロード                       |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `oceancode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `oceancode-desktop-mac-x64.dmg`     |
| Windows               | `oceancode-desktop-windows-x64.exe` |
| Linux                 | `.deb`、`.rpm`、または AppImage    |


#### インストールディレクトリ

インストールスクリプトは、インストール先パスを次の優先順位で決定します。

1. `$OCEANCODE_INSTALL_DIR` - カスタムのインストールディレクトリ
2. `$XDG_BIN_DIR` - XDG Base Directory Specification に準拠したパス
3. `$HOME/bin` - 標準のユーザー用バイナリディレクトリ（存在する場合、または作成できる場合）
4. `$HOME/.oceancode/bin` - デフォルトのフォールバック

```bash
# 例
OCEANCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://raw.githubusercontent.com/ianimatethings12-stack/oceancode/dev/install | bash
```

### Agents

OceanCode には組み込みの Agent が2つあり、`Tab` キーで切り替えられます。

- **build** - デフォルト。開発向けのフルアクセス Agent
- **plan** - 分析とコード探索向けの読み取り専用 Agent
  - デフォルトでファイル編集を拒否
  - bash コマンド実行前に確認
  - 未知のコードベース探索や変更計画に最適

また、複雑な検索やマルチステップのタスク向けに **general** サブ Agent も含まれています。
内部的に使用されており、メッセージで `@general` と入力して呼び出せます。

[agents](https://github.com/ianimatethings12-stack/oceancode/tree/dev/packages/web/src/content/docs/agents) の詳細はこちら。

### ドキュメント

OceanCode の設定については [**ドキュメント**](https://github.com/ianimatethings12-stack/oceancode/tree/dev/packages/web/src/content/docs) を参照してください。

### コントリビュート

OceanCode に貢献したい場合は、Pull Request を送る前に [contributing docs](./CONTRIBUTING.md) を読んでください。

### OceanCode の上に構築する

OceanCode に関連するプロジェクトで、名前に "oceancode"（例: "opencode-dashboard" や "opencode-mobile"）を含める場合は、そのプロジェクトが OceanCode チームによって作られたものではなく、いかなる形でも関係がないことを README に明記してください。

---

**コミュニティに参加** [Discord](https://github.com/ianimatethings12-stack/oceancode/discussions) | [X.com](https://github.com/ianimatethings12-stack/oceancode)
