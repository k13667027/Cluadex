# Cluadex Quick Start — macOS / Linux

Uses bash or zsh (Terminal, iTerm2, or any standard shell).

---

## 1. Install Node.js

```bash
# macOS (Homebrew)
brew install node

# Ubuntu / Debian
sudo apt install nodejs npm

# Or download from nodejs.org
```

Verify:

```bash
node --version   # should be v20+
npm --version
```

---

## 2. Install Cluadex

```bash
npm install -g @john2026/cluadex
```

Verify:

```bash
cluadex --version
```

If `cluadex` is not found, close the terminal and open a new one.

---

## 3. Pick a Provider

### NVIDIA AI (free key — recommended)

```bash
export CLAUDE_CODE_USE_NVIDIA=1
export NVIDIA_API_KEY=nvapi-your-key-here
export NVIDIA_MODEL=moonshotai/kimi-k2-instruct
cluadex
```

Get a free key at [build.nvidia.com](https://build.nvidia.com/).

Other NVIDIA models: `meta/llama-3.3-70b-instruct`, `deepseek-ai/deepseek-r1`, `meta/llama-3.1-8b-instruct`

---

### Google Gemini (free key)

```bash
export CLAUDE_CODE_USE_GEMINI=1
export GEMINI_API_KEY=your-key-here
export GEMINI_MODEL=gemini-2.0-flash
cluadex
```

Free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

---

### OpenAI

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_MODEL=gpt-4o
cluadex
```

---

### DeepSeek

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key-here
export OPENAI_BASE_URL=https://api.deepseek.com/v1
export OPENAI_MODEL=deepseek-chat
cluadex
```

---

### Groq

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=gsk_your-key-here
export OPENAI_BASE_URL=https://api.groq.com/openai/v1
export OPENAI_MODEL=llama-3.3-70b-versatile
cluadex
```

---

### Ollama (local, no key needed)

Install Ollama from [ollama.com/download](https://ollama.com/download), then:

```bash
ollama pull llama3.1:8b

export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=llama3.1:8b
cluadex
```

---

### Atomic Chat (Apple Silicon, local)

Download from [atomic.chat](https://atomic.chat/), launch the app and load a model, then:

```bash
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://127.0.0.1:1337/v1
export OPENAI_MODEL=your-loaded-model-name
cluadex
```

---

## 4. Make Env Vars Permanent

Add to `~/.zshrc` or `~/.bashrc`:

```bash
# NVIDIA (example)
export CLAUDE_CODE_USE_NVIDIA=1
export NVIDIA_API_KEY=nvapi-your-key-here
export NVIDIA_MODEL=moonshotai/kimi-k2-instruct
```

Then reload:

```bash
source ~/.zshrc
```

Or use the profile launcher (see [Advanced Setup](advanced-setup.md)).

---

## 5. Troubleshooting

### `cluadex` not found

Close the terminal, open a new one, try again.

### Login screen appears asking for Anthropic

Set a provider flag before running:

```bash
export CLAUDE_CODE_USE_NVIDIA=1
export NVIDIA_API_KEY=nvapi-your-key
cluadex
```

Or run `/provider` inside the CLI to configure interactively.

### Invalid API key

Copy the key fresh from your provider's dashboard.

### Ollama not connecting

```bash
ollama serve
```

---

## 6. Update Cluadex

```bash
npm install -g @john2026/cluadex@latest
```

## 7. Uninstall

```bash
npm uninstall -g @john2026/cluadex
```

---

## Next Steps

- Save a provider profile: [Advanced Setup](advanced-setup.md)
- Use Cluadex via Telegram: [Telegram Gateway](../telegram-gateway/README.md)
- Daily Ollama workflow: [Playbook](../PLAYBOOK.md)
