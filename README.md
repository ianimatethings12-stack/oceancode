# 🌊 Ocean Code

> An autonomous agentic AI coding companion for your terminal, inspired by Claude Code and OpenCode.

```
 ██████╗  ██████╗███████╗ █████╗ ███╗   ██╗     ██████╗ ██████╗ ██████╗ ███████╗
██╔═══██╗██╔════╝██╔════╝██╔══██╗████╗  ██║    ██╔════╝██╔═══██╗██╔══██╗██╔════╝
██║   ██║██║     █████╗  ███████║██╔██╗ ██║    ██║     ██║   ██║██║  ██║█████╗  
██║   ██║██║     ██╔══╝  ██╔══██║██║╚██╗██║    ██║     ██║   ██║██║  ██║██╔══╝  
╚██████╔╝╚██████╗███████╗██║  ██║██║ ╚████║    ╚██████╗╚██████╔╝██████╔╝███████╗
 ╚═════╝  ╚═════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝     ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝
```

---

## ⚡ Quick Start

Just run:
```bash
ocean
```
Or in PowerShell / Command Prompt:
```powershell
ocean
```

---

## 🎨 Aesthetic Features

- **Oceanic Gradient Branding**: Vibrant deep ocean gradient banner (`ANSI Shadow` typography).
- **Session Environment Card**: Real-time tracking of current directory, git branch, active model, and token context window.
- **Thinking / Reasoning Pill**: Displays collapsible or framed `<think>` reasoning stages for deep architectural decisions.
- **Syntax-Highlighted Code Cards**: Fenced code blocks rendered in stylish rounded boxes with language badges and line numbers.
- **Tool Execution Badges**: Real-time badges for file reading (`📁`), file writing (`✍️`), and command execution (`⚡`).
- **Interactive Multi-Line Input**: Support for multiline code snippets using `\` at end-of-line.

---

## ⌨️ Command Palette

| Command | Description |
|---|---|
| `/help` | Open the interactive help and keyboard shortcuts palette |
| `/clear` | Clear screen and redisplay the fresh Ocean Code banner |
| `/model` | Switch between AI models (Ocean 3.5 Deep, Claude 3.7 Sonnet, Abyss R1, etc.) |
| `/status` | View deep environment metrics, file counts, memory, and tokens |
| `/compact` | Compress token context window to extend session length |
| `/theme` | Change color theme (`ocean`, `bioluminescence`, `coralReef`) |
| `/exit` | Exit the CLI gracefully |

---

## 📁 Project Architecture

```
D:\Omnicode\CLI\
├── bin/
│   └── ocean.js         # Executable entrypoint
├── src/
│   ├── config.js        # Global configuration, live metrics & models
│   ├── index.js         # CLI lifecycle & bootstrap
│   ├── chat/
│   │   └── engine.js    # Interactive chat loop, user cards & streaming
│   ├── commands/
│   │   └── handlers.js  # Slash commands (/help, /model, /clear, etc.)
│   └── ui/
│       ├── banner.js    # ASCII art banner & status dashboard
│       ├── colors.js    # Ocean color palettes & gradients
│       ├── markdown.js  # Terminal markdown parser & syntax highlighter
│       └── spinner.js   # Wave animation spinners
├── ocean.cmd            # Windows CMD launcher
├── ocean.ps1            # Windows PowerShell launcher
└── package.json
```
