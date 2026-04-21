# Claudex — Non-Technical Setup

No source builds. No Bun. No config files to edit manually.

If you can paste commands into a terminal, you can run Claudex.

---

## What Claudex Does

Claudex is an AI coding assistant you run in your terminal. Give it tasks — explain this code, edit that file, run these tests — and it does them using whatever AI model you choose.

Supported providers (all free options available):

- **NVIDIA AI** — Kimi K2, Llama, DeepSeek R1 — free key at [build.nvidia.com](https://build.nvidia.com/)
- **Google Gemini** — Gemini 2.0 Flash — free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **OpenAI** — GPT-4o, GPT-4o-mini
- **Ollama** — run models locally, no API key needed
- **DeepSeek, Groq, Mistral, OpenRouter** — any OpenAI-compatible endpoint

---

## Before You Start

You need:

1. **Node.js 20 or newer** — download from [nodejs.org](https://nodejs.org/)
2. A terminal window (PowerShell on Windows, Terminal on Mac/Linux)
3. An API key from your chosen provider (not needed for Ollama)

---

## Step 1 — Install Claudex

```bash
npm install -g @letchu_pkt/claudex
```

Verify:

```bash
claudex --version
```

---

## Step 2 — First Run

Run `claudex` with no arguments. If no provider is configured, it will show a setup prompt. You can run `/provider` inside the CLI to configure one interactively, or set env vars manually (see below).

---

## Step 3 — Choose a Provider

### Option A: NVIDIA AI (free key, recommended)

Get a free key at [build.nvidia.com](https://build.nvidia.com/).

**Windows:**
```powershell
$env:CLAUDE_CODE_USE_NVIDIA="1"
$env:NVIDIA_API_KEY="nvapi-your-key-here"
$env:NVIDIA_MODEL="moonshotai/kimi-k2-instruct"
claudex
```

**Mac / Linux:**
```bash
export CLAUDE_CODE_USE_NVIDIA=1
export NVIDIA_API_KEY=nvapi-your-key-here
export NVIDIA_MODEL=moonshotai/kimi-k2-instruct
claudex
```

---

### Option B: Google Gemini (free key)

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

**Windows:**
```powershell
$env:CLAUDE_CODE_USE_GEMINI="1"
$env:GEMINI_API_KEY="your-key-here"
$env:GEMINI_MODEL="gemini-2.0-flash"
claudex
```

**Mac / Linux:**
```bash
export CLAUDE_CODE_USE_GEMINI=1
export GEMINI_API_KEY=your-key-here
export GEMINI_MODEL=gemini-2.0-flash
claudex
```

---

### Option C: OpenAI

Get a key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

**Windows:**
```powershell
$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_API_KEY="sk-your-key-here"
$env:OPENAI_MODEL="gpt-4o"
claudex
```

**Mac / Linux:**
```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o
claudex
```

---

### Option D: Ollama (fully local, no key)

Install Ollama from [ollama.com/download](https://ollama.com/download), then:

```bash
ollama pull llama3.1:8b
```

**Windows:**
```powershell
$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_BASE_URL="http://localhost:11434/v1"
$env:OPENAI_MODEL="llama3.1:8b"
claudex
```

**Mac / Linux:**
```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=llama3.1:8b
claudex
```

---

## What Success Looks Like

After running `claudex`, you'll see the Claudex banner with your provider info, then a prompt. Type your first task and press Enter.

---

## Common Problems

### `claudex` command not found

Your terminal hasn't picked up the new PATH yet. Close it, open a new one, try again.

### Invalid API key

Copy the key fresh from your provider's dashboard. No extra spaces.

### Ollama not working

Ollama isn't running. Open a separate terminal and run `ollama serve`, then try again.

### Login screen appears asking for Anthropic

You haven't set a provider env var. Set `CLAUDE_CODE_USE_NVIDIA=1` (or another `CLAUDE_CODE_USE_*` flag) before running `claudex`. Or run `/provider` inside the CLI to set one up interactively.

---

## Want More Control?

- Save provider profiles so you don't retype env vars: [Advanced Setup](advanced-setup.md)
- Platform-specific steps: [Windows](quick-start-windows.md) · [macOS/Linux](quick-start-mac-linux.md)
- Use Claudex via Telegram: [Telegram Gateway](../telegram-gateway/README.md)
