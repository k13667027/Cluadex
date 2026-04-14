# Claudex for VS Code

[![Version](https://img.shields.io/visual-studio-marketplace/v/letchu_pkt.claudex-vscode)](https://marketplace.visualstudio.com/items?itemName=letchu_pkt.claudex-vscode)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/letchu_pkt.claudex-vscode)](https://marketplace.visualstudio.com/items?itemName=letchu_pkt.claudex-vscode)

A sleek VS Code companion for [Claudex](https://github.com/l3tchupkt/claudex) with a visual **Control Center** and terminal-first workflows.

![Claudex Control Center](media/image.png)

## Features

- **Control Center sidebar UI** — Launch Claudex, open docs, and access commands from the Activity Bar
- **Terminal launch** — One-click launch in integrated terminal
- **Built-in dark theme** — `Claudex Terminal Black` with neon accents and low-glare design

## Requirements

- VS Code `1.95+`
- `claudex` CLI in your PATH: `npm install -g @letchu_pkt/claudex`

## Commands

| Command| Description|
|---------|-------------|
| `Claudex: Open Control Center`| Open the sidebar panel|
| `Claudex: Launch in Terminal`| Launch claudex in integrated terminal|
| `Claudex: Open Repository`| Open the claudex GitHub repo|

## Settings

| Setting| Default| Description|
|---------|---------|-------------|
| `claudex.launchCommand`| `claudex`| Command to run in terminal|
| `claudex.terminalName`| `Claudex`| Terminal tab name|
| `claudex.useOpenAIShim`| `false`| Enable CLAUDE_CODE_USE_OPENAI|

## Development

```bash
npm install
npm run lint
npm run package
```

## Publishing

To publish a new version:

1. Update version in `package.json`
2. Commit and push: `git commit -am "vX.Y.Z"`
3. Create a tag: `git tag vX.Y.Z`
4. Push tag: `git push origin vX.Y.Z`

The GitHub Action will automatically publish to the VS Code Marketplace.

## License

MIT © [Lakshmikanthan K](https://github.com/l3tchupkt)

