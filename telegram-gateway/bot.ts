/**
 * Claudex Telegram Gateway
 *
 * Bridges Telegram messages to the Claudex CLI using headless (--print) mode.
 * Each user gets an isolated Claudex session, kept alive between messages
 * and killed after idle timeout.
 *
 * Config is managed via the CLI:
 *   claudex telegram setup          — interactive setup wizard
 *   claudex telegram start          — start the gateway
 *   claudex telegram permit <id>    — allow a Telegram user ID
 *   claudex telegram revoke <id>    — remove a Telegram user ID
 *   claudex telegram status         — show config and active sessions
 *   claudex telegram stop           — stop the running gateway
 *
 * Or run directly:
 *   bun run telegram-gateway/bot.ts
 */

import { spawn, type ChildProcess } from 'node:child_process'
import { resolve } from 'node:path'
import { loadConfig, type TelegramConfig } from './config.js'

// ── Load config ───────────────────────────────────────────────────────────────

const cfg: TelegramConfig | null = loadConfig()

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? cfg?.botToken
if (!BOT_TOKEN) {
  console.error('    No bot token found.')
  console.error('    Run: claudex telegram setup')
  console.error('    Or:  export TELEGRAM_BOT_TOKEN=your-token')
  process.exit(1)
}

// Allowed IDs: config file + env var override (comma-separated)
const allowedFromEnv = (process.env.TELEGRAM_ALLOWED_IDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
const ALLOWED_IDS = new Set<number>([...(cfg?.allowedIds ?? []), ...allowedFromEnv])

const IDLE_TIMEOUT_MS = parseInt(process.env.IDLE_TIMEOUT_MS || String(cfg?.idleTimeoutMs ?? 300_000), 10)
const MAX_SESSIONS    = parseInt(process.env.MAX_SESSIONS    || String(cfg?.maxSessions   ?? 10),      10)
const PROVIDER        = process.env.CLAUDEX_PROVIDER ?? cfg?.provider ?? ''

const CLAUDEX_BIN  = process.env.CLAUDEX_BIN || 'node'
const CLAUDEX_ARGS = process.env.CLAUDEX_BIN ? [] : [resolve(process.cwd(), 'dist/cli.mjs')]
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

// ── Types ─────────────────────────────────────────────────────────────────────

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
}

interface TelegramMessage {
  message_id: number
  from?: { id: number; first_name: string; username?: string }
  chat: { id: number }
  text?: string
}

interface Session {
  userId: number
  chatId: number
  process: ChildProcess
  buffer: string
  idleTimer: ReturnType<typeof setTimeout>
  lastActivity: number
  streamBuffer: string
  streamTimer?: ReturnType<typeof setTimeout>
}

// ── Telegram helpers ──────────────────────────────────────────────────────────

async function tg(method: string, body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function send(chatId: number, text: string): Promise<void> {
  for (const chunk of splitMsg(text)) {
    await tg('sendMessage', { chat_id: chatId, text: chunk, parse_mode: 'Markdown' })
      .catch(() => tg('sendMessage', { chat_id: chatId, text: chunk }))
  }
}

async function typing(chatId: number): Promise<void> {
  await tg('sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => {})
}

function splitMsg(text: string, max = 4000): string[] {
  if (text.length <= max) return [text]
  const out: string[] = []
  for (let i = 0; i < text.length; i += max) out.push(text.slice(i, i + max))
  return out
}

// ── Provider env ──────────────────────────────────────────────────────────────

function buildEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, CI: '1', TERM: 'dumb' }
  if (PROVIDER === 'nvidia' && (env.NVIDIA_API_KEY || cfg)) {
    env.CLAUDE_CODE_USE_NVIDIA = '1'
    env.NVIDIA_API_KEY ??= process.env.NVIDIA_API_KEY
    env.NVIDIA_MODEL   ??= process.env.NVIDIA_MODEL ?? 'moonshotai/kimi-k2-instruct'
  } else if (PROVIDER === 'gemini' && env.GEMINI_API_KEY) {
    env.CLAUDE_CODE_USE_GEMINI = '1'
  } else if (PROVIDER === 'ollama') {
    env.CLAUDE_CODE_USE_OPENAI = '1'
    env.OPENAI_BASE_URL ??= 'http://localhost:11434/v1'
    env.OPENAI_MODEL    ??= 'llama3.1:8b'
  }
  // Otherwise inherit whatever CLAUDE_CODE_USE_* is already in env
  return env
}

// ── Session management ────────────────────────────────────────────────────────

const sessions = new Map<number, Session>()

function resetIdle(s: Session): void {
  clearTimeout(s.idleTimer)
  s.idleTimer = setTimeout(() => kill(s.userId, 'idle'), IDLE_TIMEOUT_MS)
}

function kill(userId: number, reason: string): void {
  const s = sessions.get(userId)
  if (!s) return
  clearTimeout(s.idleTimer)
  if (s.streamTimer) clearTimeout(s.streamTimer)
  try { s.process.kill('SIGTERM') } catch {}
  sessions.delete(userId)
  console.log(`[session] killed user=${userId} reason=${reason}`)
}

function createSession(userId: number, chatId: number): Session {
  if (sessions.size >= MAX_SESSIONS) {
    const oldest = [...sessions.values()].sort((a, b) => a.lastActivity - b.lastActivity)[0]
    if (oldest) kill(oldest.userId, 'max-sessions')
  }

  const child = spawn(CLAUDEX_BIN, [...CLAUDEX_ARGS, '--print', '--output-format', 'stream-json', '--verbose'], {
    env: buildEnv(),
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  const s: Session = {
    userId, chatId, process: child,
    buffer: '', streamBuffer: '',
    lastActivity: Date.now(),
    idleTimer: setTimeout(() => {}, 0),
  }

  child.stdout?.on('data', (chunk: Buffer) => {
    s.buffer += chunk.toString()
    drainBuffer(s)
  })

  child.stderr?.on('data', (chunk: Buffer) => {
    const t = chunk.toString().trim()
    if (t) console.log(`[stderr user=${userId}] ${t}`)
  })

  child.on('exit', code => {
    console.log(`[session] exit user=${userId} code=${code}`)
    sessions.delete(userId)
  })

  resetIdle(s)
  sessions.set(userId, s)
  console.log(`[session] created user=${userId}`)
  return s
}

// ── Output parsing ────────────────────────────────────────────────────────────

function drainBuffer(s: Session): void {
  const lines = s.buffer.split('\n')
  s.buffer = lines.pop() ?? ''
  for (const line of lines) {
    if (!line.trim()) continue
    try { handleLine(s, JSON.parse(line) as Record<string, unknown>) } catch {}
  }
}

function handleLine(s: Session, msg: Record<string, unknown>): void {
  if (msg.type === 'assistant') {
    const content = (msg.message as Record<string, unknown>)?.content as Array<Record<string, unknown>> | undefined
    for (const block of content ?? []) {
      if (block.type === 'text' && typeof block.text === 'string') accumulate(s, block.text)
    }
  }
  if (msg.type === 'result') flush(s)
  if (msg.type === 'system' && msg.subtype === 'error') {
    void send(s.chatId, `⚠️ ${msg.error ?? 'Unknown error'}`)
  }
}

function accumulate(s: Session, text: string): void {
  s.streamBuffer += text
  if (!s.streamTimer) {
    s.streamTimer = setTimeout(() => {
      s.streamTimer = undefined
      if (s.streamBuffer.trim()) { void send(s.chatId, s.streamBuffer); s.streamBuffer = '' }
    }, 1500)
  }
}

function flush(s: Session): void {
  if (s.streamTimer) { clearTimeout(s.streamTimer); s.streamTimer = undefined }
  if (s.streamBuffer.trim()) { void send(s.chatId, s.streamBuffer); s.streamBuffer = '' }
}

// ── Message handling ──────────────────────────────────────────────────────────

function isAllowed(userId: number): boolean {
  return ALLOWED_IDS.size === 0 || ALLOWED_IDS.has(userId)
}

async function handleMessage(msg: TelegramMessage): Promise<void> {
  const userId = msg.from?.id
  const chatId = msg.chat.id
  const text = msg.text?.trim()
  if (!userId) return

  if (!isAllowed(userId)) {
    await send(chatId,
      `⛔ Access denied.\n\nYour Telegram ID is \`${userId}\`.\n\n` +
      `Ask the admin to run:\n\`claudex telegram permit ${userId}\``,
    )
    return
  }

  if (text === '/start') {
    await send(chatId,
      `👋 *Claudex* — AI coding assistant\n\n` +
      `Send any message to start. I can read/write files, run commands, explain and refactor code.\n\n` +
      `*Commands:*\n` +
      `/reset — new session\n` +
      `/status — session info\n` +
      `/myid — your Telegram user ID\n` +
      `/help — tips`,
    )
    return
  }

  if (text === '/myid') {
    await send(chatId, `Your Telegram user ID: \`${userId}\``)
    return
  }

  if (text === '/reset') {
    kill(userId, 'user-reset')
    await send(chatId, '🔄 Session reset. Send a message to start a new one.')
    return
  }

  if (text === '/status') {
    const s = sessions.get(userId)
    if (!s) {
      await send(chatId, '💤 No active session.')
    } else {
      const idle = Math.round((Date.now() - s.lastActivity) / 1000)
      await send(chatId, `✅ Active session\nIdle: ${idle}s / ${Math.round(IDLE_TIMEOUT_MS / 1000)}s`)
    }
    return
  }

  if (text === '/help') {
    await send(chatId,
      `*Claudex Telegram Gateway*\n\n` +
      `Send any message — Claudex will respond using your configured AI provider.\n\n` +
      `*Tips:*\n` +
      `• Ask it to read, write, or edit files on the server\n` +
      `• Ask it to run bash commands\n` +
      `• Ask it to explain or refactor code\n` +
      `• Use /reset to start a fresh conversation\n\n` +
      `Session timeout: ${Math.round(IDLE_TIMEOUT_MS / 60000)} min`,
    )
    return
  }

  if (!text) {
    await send(chatId, '⚠️ Only text messages are supported.')
    return
  }

  let s = sessions.get(userId)
  if (!s) {
    s = createSession(userId, chatId)
    await send(chatId, '🚀 Starting Claudex…')
    await new Promise(r => setTimeout(r, 1500))
  }

  s.lastActivity = Date.now()
  resetIdle(s)
  await typing(chatId)

  const payload = JSON.stringify({
    type: 'user',
    session_id: '',
    message: { role: 'user', content: text },
    parent_tool_use_id: null,
  }) + '\n'

  try {
    s.process.stdin?.write(payload)
  } catch {
    kill(userId, 'stdin-error')
    await send(chatId, '⚠️ Session died — please resend your message.')
  }
}

// ── Long polling ──────────────────────────────────────────────────────────────

let offset = 0

async function poll(): Promise<void> {
  try {
    const res = await fetch(
      `${TELEGRAM_API}/getUpdates?timeout=30&offset=${offset}&allowed_updates=["message"]`,
    )
    const data = (await res.json()) as { ok: boolean; result: TelegramUpdate[] }
    if (!data.ok || !data.result) return
    for (const update of data.result) {
      offset = update.update_id + 1
      if (update.message) handleMessage(update.message).catch(console.error)
    }
  } catch (err) {
    console.error('[poll]', err)
    await new Promise(r => setTimeout(r, 5000))
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const me = (await tg('getMe', {})) as { ok: boolean; result?: { username: string } }
  if (!me.ok) { console.error('❌ Invalid bot token'); process.exit(1) }

  console.log(`✅ Claudex Telegram Gateway`)
  console.log(`   Bot:      @${me.result?.username}`)
  console.log(`   Provider: ${PROVIDER || 'from env'}`)
  console.log(`   Sessions: max ${MAX_SESSIONS}, idle ${Math.round(IDLE_TIMEOUT_MS / 60000)}min`)
  console.log(`   Access:   ${ALLOWED_IDS.size > 0 ? `${ALLOWED_IDS.size} user(s) whitelisted` : 'open (no whitelist)'}`)
  console.log(`   Config:   ${loadConfig() ? '~/.claudex/telegram.json' : 'env vars only'}`)

  process.on('SIGINT', () => {
    console.log('\nShutting down…')
    for (const s of sessions.values()) kill(s.userId, 'shutdown')
    process.exit(0)
  })

  while (true) await poll()
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
