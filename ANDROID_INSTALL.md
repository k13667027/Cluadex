# cluadex on Android (Termux)

Run cluadex on Android using Termux + proot Ubuntu.

---

## Prerequisites

- Android phone with ~700MB free storage
- [Termux](https://f-droid.org/en/packages/com.termux/) from **F-Droid** (not Play Store)
- An API key from any supported provider (OpenRouter free tier recommended)

---

## Why proot?

cluadex requires [Bun](https://bun.sh) to build. Bun doesn't support Android natively, but works inside a proot Ubuntu environment running inside Termux.

---

## Installation

### Step 1 — Update Termux

```bash
pkg update && pkg upgrade
```

Press Enter for any config file prompts.

### Step 2 — Install dependencies

```bash
pkg install nodejs-lts git proot-distro
```

Verify Node.js:

```bash
node --version   # should be v20+
```

### Step 3 — Clone cluadex

```bash
git clone https://github.com/john2026/cluadex.git
cd claudex
npm install
npm link
```

### Step 4 — Install Ubuntu via proot

```bash
proot-distro install ubuntu
```

Downloads ~200–400MB.

### Step 5 — Install Bun inside Ubuntu

```bash
proot-distro login ubuntu
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version   # should show 1.3.11+
```

### Step 6 — Build cluadex

```bash
cd /data/data/com.termux/files/home/claudex
bun run build
```

Expected output:

```
✓ Built cluadex v0.1.7 → dist/cli.mjs
```

### Step 7 — Configure a provider

Still inside Ubuntu, add your provider to `~/.bashrc`. Pick one:

**OpenRouter (free, recommended for Android):**

```bash
echo 'export CLAUDE_CODE_USE_OPENAI=1' >> ~/.bashrc
echo 'export OPENAI_API_KEY=your_openrouter_key_here' >> ~/.bashrc
echo 'export OPENAI_BASE_URL=https://openrouter.ai/api/v1' >> ~/.bashrc
echo 'export OPENAI_MODEL=qwen/qwen3.6-plus-preview:free' >> ~/.bashrc
source ~/.bashrc
```

Get a free key at [openrouter.ai/keys](https://openrouter.ai/keys).

**NVIDIA AI (free key):**

```bash
echo 'export CLAUDE_CODE_USE_NVIDIA=1' >> ~/.bashrc
echo 'export NVIDIA_API_KEY=nvapi-your-key-here' >> ~/.bashrc
echo 'export NVIDIA_MODEL=meta/llama-3.3-70b-instruct' >> ~/.bashrc
source ~/.bashrc
```

Get a free key at [build.nvidia.com](https://build.nvidia.com/).

### Step 8 — Run cluadex

```bash
node dist/cli.mjs
```

The cluadex banner and provider info box will appear. If you see a login screen asking for Anthropic, your env vars aren't set — check Step 7 and make sure you ran `source ~/.bashrc`.

---

## Restarting After Closing Termux

```bash
proot-distro login ubuntu
cd /data/data/com.termux/files/home/claudex
node dist/cli.mjs
```

---

## Recommended Free Models (OpenRouter)

| Model ID | Context | Notes |
|---|---|---|
| `qwen/qwen3.6-plus-preview:free` | 1M | Best overall free model (April 2026) |
| `qwen/qwen3-coder:free` | 262K | Best for coding tasks |
| `openai/gpt-oss-120b:free` | 131K | Strong tool calling |
| `nvidia/nemotron-3-super-120b-a12b:free` | 262K | Good general use |
| `meta-llama/llama-3.3-70b-instruct:free` | 66K | Reliable, widely tested |

Switch models anytime:

```bash
export OPENAI_MODEL=qwen/qwen3-coder:free
node dist/cli.mjs
```

---

## Why Not Groq or Cerebras?

Both fail due to cluadex's large system prompt (~50K tokens):

- **Groq free tier**: TPM limits too low (6K–12K tokens/min)
- **Cerebras free tier**: TPM limits exceeded even on small models

OpenRouter free models have no TPM restrictions — only 20 req/min and 200 req/day.

---

## Tips

- Don't swipe Termux away mid-session — use the home button to minimize
- The Ubuntu environment persists between Termux sessions
- Run `bun run build` again only after pulling updates
