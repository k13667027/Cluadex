# Claudex Telegram Gateway

Use Claudex through a Telegram bot. Each user gets an isolated session that persists between messages and expires after configurable idle time.

---

## Quick Setup

```bash
# 1. Create a bot via @BotFather on Telegram, copy the token

# 2. Configure (one time)
claudex telegram setup --token 123456:ABC --provider nvidia

# 3. Allow yourself (find your ID via @userinfobot on Telegram)
claudex telegram permit 987654321

# 4. Build Claudex if you haven't already
bun run build

# 5. Start the gateway
claudex telegram start
```

---

## CLI Management

All gateway management is done via the `claudex telegram` command (outside the CLI) or `/telegram` (inside the CLI).

### Outside the CLI

```bash
claudex telegram setup --token <token> --provider <provider>
claudex telegram permit <user-id>
claudex telegram revoke <user-id>
claudex telegram status
claudex telegram start
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

Config is saved to `~/.claudex/telegram.json` (mode 0600).

---

## Provider Examples

### NVIDIA AI (free key)

```bash
claudex telegram setup --token 123456:ABC --provider nvidia
export NVIDIA_API_KEY=nvapi-your-key
claudex telegram start
```

### OpenAI

```bash
claudex telegram setup --token 123456:ABC --provider openai
export OPENAI_API_KEY=sk-your-key
claudex telegram start
```

### Gemini (free key)

```bash
claudex telegram setup --token 123456:ABC --provider gemini
export GEMINI_API_KEY=your-key
claudex telegram start
```

### Ollama (local)

```bash
claudex telegram setup --token 123456:ABC --provider ollama
claudex telegram start
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

Any other message is forwarded to Claudex as a prompt.

---

## Access Control

By default, anyone who messages the bot can use it. To restrict access:

```bash
# allow specific users
claudex telegram permit 123456789
claudex telegram permit 987654321

# remove a user
claudex telegram revoke 123456789

# check current config
claudex telegram status
```

When a non-permitted user messages the bot, they see:

```
⛔ Access denied.
Your Telegram ID is 123456789.
Ask the admin to run: claudex telegram permit 123456789
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
claudex --print --output-format stream-json --verbose
     │
     ▼
AI provider (NVIDIA / OpenAI / Gemini / Ollama / …)
     │
     ▼
Response streamed back → Telegram message
```

Each user gets their own Claudex process. Sessions are fully isolated. Sessions are killed after idle timeout (default 5 minutes) and on `claudex telegram stop` or SIGINT.

---

## Running as a Service

### systemd (Linux)

Create `/etc/systemd/system/claudex-telegram.service`:

```ini
[Unit]
Description=Claudex Telegram Gateway
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/claudex
ExecStart=/usr/local/bin/bun run telegram-gateway/bot.ts
Restart=always
RestartSec=5
EnvironmentFile=/home/youruser/.claudex/telegram.env

[Install]
WantedBy=multi-user.target
```

Create `/home/youruser/.claudex/telegram.env`:

```
NVIDIA_API_KEY=nvapi-your-key
```

```bash
sudo systemctl enable claudex-telegram
sudo systemctl start claudex-telegram
sudo systemctl status claudex-telegram
```

### PM2

```bash
pm2 start telegram-gateway/bot.ts --interpreter bun --name claudex-telegram
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
docker build -t claudex-telegram .
docker run -d \
  -e NVIDIA_API_KEY=nvapi-your-key \
  -v ~/.claudex:/root/.claudex:ro \
  --name claudex-telegram \
  claudex-telegram
```

The config file (`~/.claudex/telegram.json`) is mounted read-only so the container picks up the bot token and allowed user list.
