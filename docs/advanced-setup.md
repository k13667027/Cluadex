# Claudex Advanced Setup

Source builds, provider profiles, diagnostics, smart routing, Telegram gateway, and full provider reference.

---

## Install Options

### npm (recommended)

```bash
npm install -g @letchu_pkt/claudex
```

### From source with Bun

Requires Bun 1.3.11 or newer.

```bash
git clone https://github.com/l3tchupkt/claudex.git
cd claudex
bun install
bun run build
npm link
```

### Run directly with Bun (no install)

```bash
git clone https://github.com/l3tchupkt/claudex.git
cd claudex
bun install
bun run dev
```

---

## All Providers

### NVIDIA AI (NIM)

```bash
export CLAUDE_CODE_USE_NVIDIA=1
export NVIDIA_API_KEY=nvapi-...
export NVIDIA_MODEL=moonshotai/kimi-k2-instruct
```

Available models at `https://integrate.api.nvidia.com/v1`:

| Model | Tier |
|---|---|
| `moonshotai/kimi-k2-instruct` | Flagship reasoning (default) |
| `nvidia/llama-3.1-nemotron-ultra-253b-v1` | Flagship quality |
| `nvidia/llama-3.3-nemotron-super-49b-v1` | Balanced |
| `meta/llama-3.3-70b-instruct` | Balanced |
| `meta/llama-3.1-8b-instruct` | Fast |
| `deepseek-ai/deepseek-r1` | Deep reasoning |
| `qwen/qwen3-235b-a22b` | Large MoE |
| `mistralai/mistral-large-2-instruct` | Instruction |

Free key at [build.nvidia.com](https://build.nvidia.com/).

### OpenAI

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o
```

### Google Gemini

```bash
export CLAUDE_CODE_USE_GEMINI=1
export GEMINI_API_KEY=your-key
export GEMINI_MODEL=gemini-2.0-flash
```

Free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### GitHub Models

```bash
export CLAUDE_CODE_USE_GITHUB=1
export GITHUB_TOKEN=ghp_your-token
export OPENAI_MODEL=openai/gpt-4.1
```

### DeepSeek

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-...
export OPENAI_BASE_URL=https://api.deepseek.com/v1
export OPENAI_MODEL=deepseek-chat
```

### Groq

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=gsk_...
export OPENAI_BASE_URL=https://api.groq.com/openai/v1
export OPENAI_MODEL=llama-3.3-70b-versatile
```

### Mistral

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=...
export OPENAI_BASE_URL=https://api.mistral.ai/v1
export OPENAI_MODEL=mistral-large-latest
```

### OpenRouter

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-or-...
export OPENAI_BASE_URL=https://openrouter.ai/api/v1
export OPENAI_MODEL=google/gemini-2.0-flash-001
```

### Together AI

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=...
export OPENAI_BASE_URL=https://api.together.xyz/v1
export OPENAI_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
```

### Azure OpenAI

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=your-azure-key
export OPENAI_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment/v1
export OPENAI_MODEL=gpt-4o
```

### Ollama (local)

```bash
ollama pull llama3.3:70b
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=llama3.3:70b
```

### Atomic Chat (local, Apple Silicon)

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://127.0.0.1:1337/v1
export OPENAI_MODEL=your-model-name
```

Download from [atomic.chat](https://atomic.chat/). App must be running with a model loaded.

### LM Studio

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:1234/v1
export OPENAI_MODEL=your-model-name
```

### Codex (ChatGPT backend)

`codexplan` = GPT-5.4 with high reasoning. `codexspark` = GPT-5.3 Codex Spark (faster).

Claudex reads `~/.codex/auth.json` automatically if you already use the Codex CLI.

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_MODEL=codexplan
export CODEX_API_KEY=...   # optional if auth.json exists
claudex
```

### Amazon Bedrock

```bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1
export AWS_DEFAULT_REGION=us-east-1
```

### Google Vertex AI

```bash
export CLAUDE_CODE_USE_VERTEX=1
export ANTHROPIC_VERTEX_PROJECT_ID=your-gcp-project
export CLOUD_ML_REGION=us-east5
```

### Microsoft Foundry

```bash
export CLAUDE_CODE_USE_FOUNDRY=1
export ANTHROPIC_FOUNDRY_RESOURCE=your-resource-name
export ANTHROPIC_FOUNDRY_API_KEY=your-key
```

---

## Environment Variable Reference

| Variable | Provider | Description |
|---|---|---|
| `CLAUDE_CODE_USE_NVIDIA` | NVIDIA AI | Set to `1` to enable |
| `CLAUDE_CODE_USE_OPENAI` | OpenAI-compat | Set to `1` to enable |
| `CLAUDE_CODE_USE_GEMINI` | Gemini | Set to `1` to enable |
| `CLAUDE_CODE_USE_GITHUB` | GitHub Models | Set to `1` to enable |
| `CLAUDE_CODE_USE_BEDROCK` | Bedrock | Set to `1` to enable |
| `CLAUDE_CODE_USE_VERTEX` | Vertex AI | Set to `1` to enable |
| `CLAUDE_CODE_USE_FOUNDRY` | Foundry | Set to `1` to enable |
| `NVIDIA_API_KEY` | NVIDIA | API key |
| `NVIDIA_MODEL` | NVIDIA | Model name (default: moonshotai/kimi-k2-instruct) |
| `NVIDIA_BASE_URL` | NVIDIA | Endpoint override |
| `OPENAI_API_KEY` | OpenAI-compat | API key |
| `OPENAI_MODEL` | OpenAI-compat | Model name |
| `OPENAI_BASE_URL` | OpenAI-compat | Endpoint (default: api.openai.com/v1) |
| `GEMINI_API_KEY` | Gemini | API key |
| `GEMINI_MODEL` | Gemini | Model name |
| `GEMINI_BASE_URL` | Gemini | Endpoint override |
| `CODEX_API_KEY` | Codex | Token override |
| `CODEX_AUTH_JSON_PATH` | Codex | Path to auth.json |
| `FIRECRAWL_API_KEY` | All | Enables WebSearch + JS-rendered WebFetch |
| `CLAUDEX_THEME` | All | Startup theme: `sunset` `ocean` `aurora` `neon` `mono` |
| `CLAUDEX_DISABLE_CO_AUTHORED_BY` | All | Suppress Co-Authored-By in git commits |
| `CLAUDEX_ENABLE_EXTENDED_KEYS` | All | Enable Kitty keyboard protocol |
| `ROUTER_MODE` | SmartRouter | Set to `smart` to enable multi-provider routing |
| `ROUTER_STRATEGY` | SmartRouter | `latency`, `cost`, or `balanced` |
| `ROUTER_FALLBACK` | SmartRouter | `true` to auto-retry on failure |

---

## Provider Launch Profiles

Save a profile once, launch with one command. Profiles are stored in `.claudex-profile.json`.

Once a profile is saved, Claudex skips the Anthropic login screen automatically on first run.

```bash
# initialize a profile
bun run profile:init -- --provider nvidia --api-key nvapi-...
bun run profile:init -- --provider openai --api-key sk-... --model gpt-4o
bun run profile:init -- --provider ollama --model llama3.1:8b
bun run profile:init -- --provider ollama --goal coding   # auto-selects best model
bun run profile:init -- --provider gemini --api-key your-key
bun run profile:init -- --provider codex --model codexplan
bun run profile:init -- --provider atomic-chat

# launch from saved profile
bun run dev:profile

# provider-specific launchers (run doctor:runtime first)
bun run dev:nvidia
bun run dev:openai
bun run dev:ollama
bun run dev:gemini
bun run dev:codex
bun run dev:atomic-chat

# preset shortcuts
bun run profile:fast    # ollama llama3.2:3b
bun run profile:code    # ollama qwen2.5-coder:7b
bun run profile:nvidia  # nvidia moonshotai/kimi-k2-instruct

# goal-based auto-selection
bun run profile:recommend -- --goal coding --benchmark
bun run profile:auto -- --goal latency
```

You can also configure a profile from inside the CLI with `/provider`.

---

## Startup Themes

```bash
export CLAUDEX_THEME=ocean   # sunset | ocean | aurora | neon | mono
claudex
```

---

## Smart Router

Route requests automatically to the best available provider:

```bash
export ROUTER_MODE=smart
export ROUTER_STRATEGY=balanced   # latency | cost | balanced
export ROUTER_FALLBACK=true
claudex
```

The router benchmarks all configured providers on startup, tracks latency and error rates, and re-checks unhealthy providers after 60 seconds.

---

## Telegram Gateway

Run Claudex as a Telegram bot. Each user gets an isolated session.

```bash
# one-time setup
claudex telegram setup --token 123456:ABC --provider nvidia

# allow a user (find your ID via @userinfobot on Telegram)
claudex telegram permit 987654321

# start the gateway
claudex telegram start
```

Or manage from inside the CLI:

```
/telegram setup --token 123456:ABC --provider nvidia
/telegram permit 987654321
/telegram status
```

Config is stored at `~/.claudex/telegram.json`. Full guide: [telegram-gateway/README.md](../telegram-gateway/README.md)

---

## Runtime Diagnostics

```bash
# quick build + startup check
bun run smoke

# validate provider env + reachability
bun run doctor:runtime

# machine-readable JSON output
bun run doctor:runtime:json

# save report to reports/doctor-runtime.json
bun run doctor:report

# smoke + runtime doctor
bun run hardening:check

# typecheck + hardening
bun run hardening:strict
```

`doctor:runtime` fails fast on placeholder API keys, missing keys for non-local providers, and unreachable endpoints.

---

## Web Search

`WebSearch` is disabled by default for non-Anthropic providers. Set a Firecrawl key to enable it:

```bash
export FIRECRAWL_API_KEY=your-key
```

Free tier at [firecrawl.dev](https://firecrawl.dev) includes 500 credits. Without this key, `WebFetch` uses basic HTTP (fails on JS-rendered pages) and `WebSearch` is unavailable.
