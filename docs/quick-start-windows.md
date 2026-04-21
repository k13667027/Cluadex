# Claudex Quick Start — Windows

Uses Windows PowerShell.

---

## 1. Install Node.js

Download Node.js 20 or newer from [nodejs.org](https://nodejs.org/) and install it.

Verify:

```powershell
node --version
npm --version
```

---

## 2. Install Claudex

```powershell
npm install -g @letchu_pkt/claudex
```

Verify:

```powershell
claudex --version
```

If `claudex` is not found, close PowerShell and open a new window.

---

## 3. Pick a Provider

### NVIDIA AI (free key — recommended)

```powershell
$env:CLAUDE_CODE_USE_NVIDIA="1"
$env:NVIDIA_API_KEY="nvapi-your-key-here"
$env:NVIDIA_MODEL="moonshotai/kimi-k2-instruct"
claudex
```

Get a free key at [build.nvidia.com](https://build.nvidia.com/).

Other NVIDIA models: `meta/llama-3.3-70b-instruct`, `deepseek-ai/deepseek-r1`, `meta/llama-3.1-8b-instruct`

---

### Google Gemini (free key)

```powershell
$env:CLAUDE_CODE_USE_GEMINI="1"
$env:GEMINI_API_KEY="your-key-here"
$env:GEMINI_MODEL="gemini-2.0-flash"
claudex
```

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

---

### OpenAI

```powershell
$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_API_KEY="sk-your-key-here"
$env:OPENAI_MODEL="gpt-4o"
claudex
```

---

### DeepSeek

```powershell
$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_API_KEY="sk-your-key-here"
$env:OPENAI_BASE_URL="https://api.deepseek.com/v1"
$env:OPENAI_MODEL="deepseek-chat"
claudex
```

---

### Groq

```powershell
$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_API_KEY="gsk_your-key-here"
$env:OPENAI_BASE_URL="https://api.groq.com/openai/v1"
$env:OPENAI_MODEL="llama-3.3-70b-versatile"
claudex
```

---

### Ollama (local, no key needed)

Install Ollama from [ollama.com/download/windows](https://ollama.com/download/windows), then:

```powershell
ollama pull llama3.1:8b

$env:CLAUDE_CODE_USE_OPENAI="1"
$env:OPENAI_BASE_URL="http://localhost:11434/v1"
$env:OPENAI_MODEL="llama3.1:8b"
claudex
```

---

## 4. Make Env Vars Permanent

To avoid setting them every session, add to your PowerShell profile:

```powershell
notepad $PROFILE
```

Add these lines and save:

```powershell
$env:CLAUDE_CODE_USE_NVIDIA="1"
$env:NVIDIA_API_KEY="nvapi-your-key-here"
$env:NVIDIA_MODEL="moonshotai/kimi-k2-instruct"
```

Or use the profile launcher (see [Advanced Setup](advanced-setup.md)).

---

## 5. Troubleshooting

### `claudex` not found

Close PowerShell, open a new window, try again.

### Login screen appears asking for Anthropic

Set a provider flag before running. Example:

```powershell
$env:CLAUDE_CODE_USE_NVIDIA="1"
$env:NVIDIA_API_KEY="nvapi-your-key"
claudex
```

Or run `/provider` inside the CLI to configure interactively.

### Invalid API key

Copy the key fresh from your provider's dashboard. No extra spaces.

### Ollama not connecting

Open a separate PowerShell window and run:

```powershell
ollama serve
```

---

## 6. Update Claudex

```powershell
npm install -g @letchu_pkt/claudex@latest
```

## 7. Uninstall

```powershell
npm uninstall -g @letchu_pkt/claudex
```

---

## Next Steps

- Save a provider profile: [Advanced Setup](advanced-setup.md)
- Use Claudex via Telegram: [Telegram Gateway](../telegram-gateway/README.md)
- Daily Ollama workflow: [Playbook](../PLAYBOOK.md)
