# Cluadex Telegram Gateway

Use Cluadex through a Telegram bot. Each user gets an isolated session that persists between messages and expires after configurable idle time.

---

## Quick Setup

```bash
# 1. Create a bot via @BotFather on Telegram, copy the token

# 2. Configure (one time)
cluadex telegram setup --token 123456:ABC --provider nvidia

# 3. Allow yourself (find your ID via @userinfobot on Telegram)
cluadex telegram permit 987654321

# 4. Build Cluadex if you haven't already
bun run build

# 5. Start the gateway
cluadex telegram start
```

---

## CLI Management

All gateway management is done via the `cluadex telegram` command (outside the CLI) or `/telegram` (inside the CLI).

### Outside the CLI

```bash
cluadex telegram setup --token <token> --provider <provider>
cluadex telegram permit <user-id>
cluadex telegram revoke <user-id>
cluadex telegram status
cluadex telegram start
```

### Inside the CLI (slash command)

```
/telegram setup --token <token> --provider <provider>
/telegram permit <user-id>
/telegram revoke <user-id>
/telegram status
/telegram start
/telegram help
```

### Options for `setup`

| Flag | Description | Default |
|---|---|---|
| `--token` | Bot token from @BotFather | required |
| `--provider` | `openai` `nvidia` `gemini` `ollama` `codex` | `openai` |
| `--timeout` | Session idle timeout in ms | `300000` (5 min) |
| `--max-sessions` | Max concurrent users | `10` |

Config is saved to `~/.cluadex/telegram.json` (mode 0600).

---

## Provider Examples

### NVIDIA AI (free key)

```bash
cluadex telegram setup --token 123456:ABC --provider nvidia
export NVIDIA_API_KEY=nvapi-your-key
cluadex telegram start
```

### OpenAI

```bash
cluadex telegram setup --token 123456:ABC --provider openai
export OPENAI_API_KEY=sk-your-key
cluadex telegram start
```

### Gemini (free key)

```bash
cluadex telegram setup --token 123456:ABC --provider gemini
export GEMINI_API_KEY=your-key
cluadex telegram start
```

### Ollama (local)

```bash
cluadex telegram setup --token 123456:ABC --provider ollama
cluadex telegram start
```

---

## Bot Commands

| Command | Description |
|---|---|
| `/start` | Welcome message |
| `/reset` | Kill current session and start fresh |
| `/status` | Show session info and idle time |
| `/myid` | Show your Telegram user ID |
| `/help` | Usage tips |

Any other message is forwarded to Cluadex as a prompt.

---

## Access Control

By default, anyone who messages the bot can use it. To restrict access:

```bash
# allow specific users
cluadex telegram permit 123456789
cluadex telegram permit 987654321

# remove a user
cluadex telegram revoke 123456789

# check current config
cluadex telegram status
```

When a non-permitted user messages the bot, they see:

```
⛔ Access denied.
Your Telegram ID is 123456789.
Ask the admin to run: cluadex telegram permit 123456789
```

Find your Telegram user ID by messaging [@userinfobot](https://t.me/userinfobot).

---

## How It Works

```
Telegram user
     │
     ▼
Telegram Bot API (long polling)
     │
     ▼
telegram-gateway/bot.ts
     │  spawns per-user process
     ▼
cluadex --print --output-format stream-json --verbose
     │
     ▼
AI provider (NVIDIA / OpenAI / Gemini / Ollama / …)
     │
     ▼
Response streamed back → Telegram message
```

Each user gets their own Cluadex process. Sessions are fully isolated. Sessions are killed after idle timeout (default 5 minutes) and on `cluadex telegram stop` or SIGINT.

---

## Running as a Service

### systemd (Linux)

Create `/etc/systemd/system/cluadex-telegram.service`:

```ini
[Unit]
Description=Cluadex Telegram Gateway
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/cluadex
ExecStart=/usr/local/bin/bun run telegram-gateway/bot.ts
Restart=always
RestartSec=5
EnvironmentFile=/home/youruser/.cluadex/telegram.env

[Install]
WantedBy=multi-user.target
```

Create `/home/youruser/.cluadex/telegram.env`:

```
NVIDIA_API_KEY=nvapi-your-key
```

```bash
sudo systemctl enable cluadex-telegram
sudo systemctl start cluadex-telegram
sudo systemctl status cluadex-telegram
```

### PM2

```bash
pm2 start telegram-gateway/bot.ts --interpreter bun --name cluadex-telegram
pm2 save
pm2 startup
```

### Docker

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install
RUN bun run build
CMD ["bun", "run", "telegram-gateway/bot.ts"]
```

```bash
docker build -t cluadex-telegram .
docker run -d \
  -e NVIDIA_API_KEY=nvapi-your-key \
  -v ~/.cluadex:/root/.cluadex:ro \
  --name cluadex-telegram \
  cluadex-telegram
```

The config file (`~/.cluadex/telegram.json`) is mounted read-only so the container picks up the bot token and allowed user list.
