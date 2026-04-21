# cluadex

<img width="1700" height="460" alt="github-header-banner (3)" src="https://github.com/user-attachments/assets/33a60056-a756-4030-8737-14076d69c3d4" />


cluadex is a fork of the Claude Code source that adds a full OpenAI-compatible provider shim, NVIDIA AI (NIM) support, a smart multi-provider router, a Telegram gateway, and local inference via Ollama and Atomic Chat. Every Claude Code tool works — bash, file ops, grep, glob, agents, MCP, tasks — powered by whatever model you choose.

**Author:** karen john

---

## Install

```bash
npm install -g @john2026/cluadex
```

```bash
cluadex
```

On first run, if no provider is configured, Cluadex will prompt you to set one up via `/provider`. No Anthropic account required.

---

## Fastest Start

Pick a provider, set three env vars, run.

### NVIDIA AI — free key, best models

```bash
export CLAUDE_CODE_USE_NVIDIA=1
export NVIDIA_API_KEY=nvapi-your-key
export NVIDIA_MODEL=moonshotai/kimi-k2-instruct
cluadex
```

Free key at [build.nvidia.com](https://build.nvidia.com/).

### OpenAI

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key
export OPENAI_MODEL=gpt-4o
cluadex
```

### Google Gemini — free key

```bash
export CLAUDE_CODE_USE_GEMINI=1
export GEMINI_API_KEY=your-key
export GEMINI_MODEL=gemini-2.0-flash
cluadex
```

Free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### Ollama — fully local, no key

```bash
ollama pull llama3.1:8b
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=llama3.1:8b
cluadex
```

---

## Guides

| Audience | Guide |
|---|---|
| New to terminals | [Non-Technical Setup](docs/non-technical-setup.md) |
| Windows | [Windows Quick Start](docs/quick-start-windows.md) |
| macOS / Linux | [macOS / Linux Quick Start](docs/quick-start-mac-linux.md) |
| Android (Termux) | [Android Install](ANDROID_INSTALL.md) |
| Source builds, profiles, diagnostics | [Advanced Setup](docs/advanced-setup.md) |
| Daily Ollama workflow | [Playbook](PLAYBOOK.md) |
| Telegram bot | [Telegram Gateway](telegram-gateway/README.md) |

---

## Supported Providers

| Provider | Env flag | Key var |
|---|---|---|
| NVIDIA AI (NIM) | `CLAUDE_CODE_USE_NVIDIA=1` | `NVIDIA_API_KEY` |
| OpenAI / any OpenAI-compatible | `CLAUDE_CODE_USE_OPENAI=1` | `OPENAI_API_KEY` |
| Google Gemini | `CLAUDE_CODE_USE_GEMINI=1` | `GEMINI_API_KEY` |
| GitHub Models | `CLAUDE_CODE_USE_GITHUB=1` | `GITHUB_TOKEN` |
| Amazon Bedrock | `CLAUDE_CODE_USE_BEDROCK=1` | AWS credentials |
| Google Vertex AI | `CLAUDE_CODE_USE_VERTEX=1` | GCP credentials |
| Microsoft Foundry | `CLAUDE_CODE_USE_FOUNDRY=1` | `ANTHROPIC_FOUNDRY_API_KEY` |
| Ollama (local) | `CLAUDE_CODE_USE_OPENAI=1` + localhost URL | none |
| Atomic Chat (Apple Silicon) | `CLAUDE_CODE_USE_OPENAI=1` + 127.0.0.1:1337 | none |
| Anthropic (default) | none | `ANTHROPIC_API_KEY` |

Any OpenAI-compatible endpoint works: DeepSeek, Groq, Mistral, Together AI, OpenRouter, LM Studio, Azure OpenAI, and more.

---

## NVIDIA AI Models

| Model | Best for |
|---|---|
| `moonshotai/kimi-k2-instruct` | Reasoning, coding (default) |
| `nvidia/llama-3.1-nemotron-ultra-253b-v1` | Flagship quality |
| `meta/llama-3.3-70b-instruct` | Balanced speed/quality |
| `meta/llama-3.1-8b-instruct` | Fast, lightweight |
| `deepseek-ai/deepseek-r1` | Deep reasoning |
| `qwen/qwen3-235b-a22b` | Large MoE |
| `mistralai/mistral-large-2-instruct` | Instruction following |

---

## Startup Themes

Set `CLUADEX_THEME` to change the banner color scheme:

| Theme | Colors |
|---|---|
| `sunset` | warm orange → rust (default) |
| `ocean` | deep teal → electric cyan |
| `aurora` | green → violet |
| `neon` | hot pink → electric blue |
| `mono` | white → grey |

```bash
export CLUADEX_THEME=ocean
cluadex
```

---

## Profile Launcher

Save a provider profile once, launch with one command:

```bash
# save a profile (also works via /provider inside the CLI)
bun run profile:init -- --provider nvidia --api-key nvapi-...
bun run profile:init -- --provider openai --api-key sk-...
bun run profile:init -- --provider ollama --model llama3.1:8b

# launch from saved profile
bun run dev:profile

# provider-specific launchers
bun run dev:nvidia
bun run dev:openai
bun run dev:ollama
bun run dev:gemini
bun run dev:codex
bun run dev:atomic-chat
```

---

## Smart Router

Benchmarks all configured providers on startup and routes each request to the fastest, cheapest, healthiest option:

```bash
export ROUTER_MODE=smart
export ROUTER_STRATEGY=balanced   # latency | cost | balanced
cluadex
```

---

## Telegram Gateway

Use CLUADEX through a Telegram bot. Each user gets an isolated session.

```bash
# configure (one time)
cluadex telegram setup --token 123456:ABC --provider nvidia

# allow yourself
cluadex telegram permit 987654321

# start the gateway
cluadex telegram start
```

Or manage from inside the CLI:

```
/telegram setup --token 123456:ABC --provider nvidia
/telegram permit 987654321
/telegram status
```

Full guide: [telegram-gateway/README.md](telegram-gateway/README.md)

---

## What Works

- All tools: Bash, FileRead, FileWrite, FileEdit, Glob, Grep, WebFetch, WebSearch, Agent, MCP, LSP, NotebookEdit, Tasks
- Real-time token streaming
- Multi-step tool chains
- Base64 and URL image inputs (vision models)
- Slash commands: /commit, /review, /compact, /diff, /doctor, /provider, /telegram, etc.
- Sub-agents via AgentTool
- Persistent memory

## What's Different from Upstream

- No Anthropic extended thinking (OpenAI models use different reasoning)
- No prompt caching (Anthropic-specific)
- No Anthropic beta headers
- Token output defaults to 32K — models that cap lower are handled gracefully
- First-run skips Anthropic login if a provider profile is saved

---

## Web Search

`WebSearch` is disabled by default for non-Anthropic providers. Set a [Firecrawl](https://firecrawl.dev) key to enable it:

```bash
export FIRECRAWL_API_KEY=your-key
```

Free tier includes 500 credits. With this set, `WebSearch` works for all providers and `WebFetch` handles JS-rendered pages.

---

## How the Shim Works

```
Claude Code Tool System
        │
        ▼
  Anthropic SDK interface (duck-typed)
        │
        ▼
  openaiShim.ts  ◄── translates formats
        │
        ▼
  OpenAI Chat Completions API
        │
        ▼
  Any compatible model
```

---

## Model Quality Reference

| Model | Tool Calling | Code | Speed |
|---|---|---|---|
| GPT-4o | Excellent | Excellent | Fast |
| Kimi K2 (NVIDIA) | Excellent | Excellent | Fast |
| DeepSeek-V3 | Great | Great | Fast |
| Gemini 2.0 Flash | Great | Good | Very Fast |
| Llama 3.3 70B | Good | Good | Medium |
| Mistral Large | Good | Good | Fast |
| GPT-4o-mini | Good | Good | Very Fast |
| Qwen 2.5 72B | Good | Good | Medium |
| Models < 7B | Limited | Limited | Very Fast |

---

## VS Code Extension

Install the bundled extension from `vscode-extension/openclaude-vscode` for one-click terminal launch and the `Cluadex Terminal Black` theme.

---

## Origin

Fork of the Claude Code source snapshot that became publicly accessible via an npm source map exposure on March 31, 2026. The original source is the property of Anthropic. This project is not affiliated with or endorsed by Anthropic.

## License

Educational and research use. Original source subject to Anthropic's terms. Shim additions and new provider integrations are public domain.
