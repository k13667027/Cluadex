# cluadex Local Agent Playbook

Practical guide for running cluadex day-to-day — local models, cloud providers, diagnostics, and Telegram.

---

## 1. What You Have

- CLI agent loop: reads/writes files, runs terminal commands, assists with coding
- Provider profile system (`profile:init`, `dev:profile`, `/provider` in CLI)
- Smart multi-provider router (`ROUTER_MODE=smart`)
- Runtime diagnostics (`doctor:runtime`, `doctor:report`)
- Telegram gateway (`cluadex telegram`)
- Startup themes (`CLAUDEX_THEME`)
- Providers: NVIDIA AI, Gemini, OpenAI, Ollama, Atomic Chat, Codex, DeepSeek, Groq, and more

---

## 2. Daily Start

```powershell
bun run dev:profile
```

Quick preset switches:

```powershell
bun run dev:fast    # low latency (llama3.2:3b)
bun run dev:code    # better coding quality (qwen2.5-coder:7b)
bun run dev:nvidia  # NVIDIA Kimi K2
```

---

## 3. One-Time Setup

### Initialize a profile

```powershell
# NVIDIA AI (free key)
bun run profile:init -- --provider nvidia --api-key nvapi-...

# Ollama (local)
bun run profile:init -- --provider ollama --model llama3.1:8b

# OpenAI
bun run profile:init -- --provider openai --api-key sk-... --model gpt-4o

# Gemini (free key)
bun run profile:init -- --provider gemini --api-key your-key

# Auto-select best local model for a goal
bun run profile:init -- --provider ollama --goal coding
```

Or configure interactively from inside the CLI:

```
/provider
```

### Confirm profile

```powershell
Get-Content .\.cluadex-profile.json
```

### Validate environment

```powershell
bun run doctor:runtime
```

---

## 4. Provider Modes

### NVIDIA AI (cloud, free key)

```powershell
bun run profile:init -- --provider nvidia --api-key nvapi-...
bun run dev:nvidia
```

Free key at [build.nvidia.com](https://build.nvidia.com/).

### Local — Ollama

```powershell
bun run profile:init -- --provider ollama --model llama3.1:8b
bun run dev:profile
```

No API key required. `OPENAI_BASE_URL` = `http://localhost:11434/v1`.

### OpenAI

```powershell
bun run profile:init -- --provider openai --api-key sk-... --model gpt-4o
bun run dev:openai
```

### Gemini (free key)

```powershell
bun run profile:init -- --provider gemini --api-key your-key
bun run dev:gemini
```

### Smart Router (auto-select best provider)

```powershell
$env:ROUTER_MODE="smart"
$env:ROUTER_STRATEGY="balanced"
bun run dev:profile
```

---

## 5. Diagnostics

```powershell
bun run doctor:runtime          # human-readable checks
bun run doctor:runtime:json     # JSON output
bun run doctor:report           # save to reports/doctor-runtime.json
bun run hardening:check         # smoke + runtime doctor
bun run hardening:strict        # typecheck + hardening
```

---

## 6. Recommended Local Models

| Goal | Model |
|---|---|
| Fast / general | `llama3.1:8b` |
| Better coding | `qwen2.5-coder:14b` |
| Low resource | `llama3.2:3b` |
| Best coding (if hardware allows) | `qwen2.5-coder:32b` |

Switch quickly:

```powershell
bun run profile:init -- --provider ollama --model qwen2.5-coder:14b
bun run dev:profile
```

Goal-based auto-selection:

```powershell
bun run profile:init -- --provider ollama --goal latency
bun run profile:init -- --provider ollama --goal balanced
bun run profile:init -- --provider ollama --goal coding
```

---

## 7. Telegram Gateway

Run Claudex as a Telegram bot so you can use it from your phone.

```powershell
# one-time setup
cluadex telegram setup --token 123456:ABC --provider nvidia

# allow yourself (find your ID via @userinfobot on Telegram)
cluadex telegram permit 987654321

# start the gateway
cluadex telegram start
```

Or from inside the CLI:

```
/telegram setup --token 123456:ABC --provider nvidia
/telegram permit 987654321
/telegram status
```

Full guide: [telegram-gateway/README.md](telegram-gateway/README.md)

---

## 8. Startup Themes

```powershell
$env:CLAUDEX_THEME="ocean"   # sunset | ocean | aurora | neon | mono
cluadex
```

---

## 9. Troubleshooting

### `Script not found "dev"`

Wrong folder. Navigate to the project root:

```powershell
cd C:\path\to\cluadex
bun run dev:profile
```

### `ollama: term not recognized`

```powershell
winget install Ollama.Ollama
# open a new terminal, then:
ollama --version
```

### `Provider reachability failed` for localhost

```powershell
ollama serve
# in another terminal:
bun run doctor:runtime
```

### Login screen appears asking for Anthropic

No provider configured. Either:

```powershell
bun run dev:profile   # if you have a saved profile
```

Or set env vars manually:

```powershell
$env:CLAUDE_CODE_USE_NVIDIA="1"
$env:NVIDIA_API_KEY="nvapi-your-key"
cluadex
```

---

## 10. Prompt Playbook

### Code understanding

- "Map this repository architecture and explain the execution flow from entrypoint to tool invocation."
- "Find the top 5 risky modules and explain why."

### Refactoring

- "Refactor this module for clarity without behavior change, then run checks and summarize diff impact."
- "Extract shared logic from duplicated functions and add minimal tests."

### Debugging

- "Reproduce the failure, identify root cause, implement fix, and validate with commands."
- "Trace this error path and list likely failure points with confidence levels."

### Reliability

- "Add runtime guardrails and fail-fast messages for invalid provider env vars."
- "Create a diagnostic command that outputs a JSON report for CI artifacts."

### Review

- "Do a code review of unstaged changes, prioritize bugs/regressions, and suggest concrete patches."

---

## 11. Safe Working Rules

- Run `doctor:runtime` before debugging provider issues
- Prefer `dev:profile` over manual env edits
- Keep `.cluadex-profile.json` local (already gitignored)
- Use `doctor:report` before asking for help — gives a reproducible snapshot

---

## 12. Quick Recovery

```powershell
bun run doctor:runtime
bun run doctor:report
bun run smoke
```

If local model is slow:

```powershell
ollama ps   # PROCESSOR=CPU means valid but higher latency
```

---

## 13. Full Command Reference

```powershell
# profiles
bun run profile:init -- --provider nvidia --api-key nvapi-...
bun run profile:init -- --provider ollama --model llama3.1:8b
bun run profile:init -- --provider openai --api-key sk-... --model gpt-4o
bun run profile:init -- --provider gemini --api-key your-key
bun run profile:fast    # preset: llama3.2:3b
bun run profile:code    # preset: qwen2.5-coder:7b
bun run profile:nvidia  # preset: kimi-k2-instruct

# launch
bun run dev:profile
bun run dev:nvidia
bun run dev:ollama
bun run dev:openai
bun run dev:gemini
bun run dev:codex
bun run dev:atomic-chat
bun run dev:fast
bun run dev:code

# diagnostics
bun run doctor:runtime
bun run doctor:runtime:json
bun run doctor:report
bun run smoke
bun run hardening:check
bun run hardening:strict

# telegram
cluadex telegram setup --token <token> --provider <provider>
cluadex telegram permit <user-id>
cluadex telegram revoke <user-id>
cluadex telegram status
cluadex telegram start
```

---

## 14. Success Criteria

Setup is healthy when:

- `bun run doctor:runtime` passes all checks
- `bun run dev:profile` opens the CLI without errors
- Model shown in the startup box matches your selected profile
- No Anthropic login screen appears (profile is saved)
