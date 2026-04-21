/**
 * Cluadex Telegram Gateway
 *
 * Bridges Telegram messages to the Cluadex CLI using headless (--print) mode.
 * Each user gets an isolated Cluadex session, kept alive between messages
 * and killed after idle timeout.
 *
 * Config is managed via the CLI:
 *   cluadex telegram setup          — interactive setup wizard
 *   cluadex telegram start          — start the gateway
 *   cluadex telegram permit <id>    — allow a Telegram user ID
 *   cluadex telegram revoke <id>    — remove a Telegram user ID
 *   cluadex telegram status         — show config and active sessions
 *   cluadex telegram stop           — stop the running gateway
 *
 * Or run directly:
 *   bun run telegram-gateway/bot.ts
 */

import { spawn, type ChildProcess } from 'node:child_process'
import { resolve } from 'node:path'
import { loadConfig, type TelegramConfig } from './config.js'

const TELEGRAM_MESSAGE_MAX_LENGTH = 4000
const STREAM_FLUSH_DELAY_MS = 1500
const POLL_TIMEOUT_SECONDS = 30
const POLL_ABORT_TIMEOUT_MS = 90_000

// ── Load config ───────────────────────────────────────────────────────────────

const cfg: TelegramConfig | null = loadConfig()

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? cfg?.botToken
if (!BOT_TOKEN) {
  console.error('    No bot token found.')
  console.error('    Run: cluadex telegram setup')
  console.error('    Or:  export TELEGRAM_BOT_TOKEN=your-token')
  process.exit(1)
}

// Allowed IDs: config file + env var override (comma-separated)
function parseAllowedIds(input: string): number[] {
  if (!input.trim()) return []
  return input.split(',').map(s => {
    const trimmed = s.trim()
    const parsed = parseInt(trimmed, 10)
    if (isNaN(parsed) || String(parsed) !== trimmed) {
      console.warn(`[config] Invalid Telegram ID skipped: "${trimmed}"`)
      return NaN
    }
    return parsed
  }).filter(n => !isNaN(n))
}
const allowedFromEnv = parseAllowedIds(process.env.TELEGRAM_ALLOWED_IDS || '')
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

function splitMsg(text: string, max = TELEGRAM_MESSAGE_MAX_LENGTH): string[] {
  if (text.length <= max) return [text]
  const out: string[] = []
  for (let i = 0; i < text.length; i += max) out.push(text.slice(i, i + max))
  return out
}

// ── Provider env ──────────────────────────────────────────────────────────────

const SAFE_ENV_VARS = new Set([
  'CI', 'TERM', 'HOME', 'USER', 'PATH', 'LD_LIBRARY_PATH',
  'SHELL', 'PAGER', 'EDITOR', 'VISUAL', 'LS_COLORS',
  'LANG', 'LC_ALL', 'XDG_CONFIG_HOME', 'XDG_DATA_HOME',
])

function buildEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { CI: '1', TERM: 'dumb' }
  for (const key of SAFE_ENV_VARS) {
    if (process.env[key]) env[key] = process.env[key]
  }
  env.CLAUDE_CODE_USE_OPENAI = '1'
  if (PROVIDER === 'nvidia') {
    env.CLAUDE_CODE_USE_NVIDIA = '1'
    env.NVIDIA_API_KEY = process.env.NVIDIA_API_KEY ?? ''
    env.NVIDIA_MODEL = process.env.NVIDIA_MODEL ?? 'moonshotai/kimi-k2-instruct'
  } else if (PROVIDER === 'gemini' && process.env.GEMINI_API_KEY) {
    env.CLAUDE_CODE_USE_GEMINI = '1'
    env.GEMINI_API_KEY = process.env.GEMINI_API_KEY
  } else if (PROVIDER === 'ollama') {
    env.CLAUDE_CODE_USE_OPENAI = '1'
    env.OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? 'http://localhost:11434/v1'
    env.OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'llama3.1:8b'
  } else if (PROVIDER === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  } else if (PROVIDER === 'bedrock') {
    env.CLAUDE_CODE_USE_BEDROCK = '1'
    env.AWS_REGION = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1'
    if (process.env.AWS_ACCESS_KEY_ID) env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
    if (process.env.AWS_SECRET_ACCESS_KEY) env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
    if (process.env.AWS_SESSION_TOKEN) env.AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN
  } else if (PROVIDER === 'vertex' && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    env.CLAUDE_CODE_USE_VERTEX = '1'
    env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS
env.GCP_PROJECT = process.env.GCP_PROJECT ?? process.env.ANTHROPIC_VERTEX_PROJECT_ID ?? ''
  } else {
    env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? ''
  }
  if (process.env.CLAUDE_CODE_CONTAINER_ID) env.CLAUDE_CODE_CONTAINER_ID = process.env.CLAUDE_CODE_CONTAINER_ID
  if (process.env.CLAUDE_CODE_REMOTE_SESSION_ID) env.CLAUDE_CODE_REMOTE_SESSION_ID = process.env.CLAUDE_CODE_REMOTE_SESSION_ID
  return env
}

// ── Session management ────────────────────────────────────────────────────────

const sessions = new Map<number, Session>()
let sessionCreationLock = false

async function waitForSessionSlot(): Promise<void> {
  while (sessionCreationLock) {
    await new Promise(r => setTimeout(r, 50))
  }
}

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

async function createSession(userId: number, chatId: number): Promise<Session> {
  await waitForSessionSlot()
  if (sessions.size >= MAX_SESSIONS) {
    const sessionsCopy = [...sessions.values()]
    const oldest = sessionsCopy.sort((a, b) => a.lastActivity - b.lastActivity)[0]
    if (oldest) {
      kill(oldest.userId, 'max-sessions')
    }
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
    if (s.buffer.length > 1_000_000) {
      s.buffer = s.buffer.slice(-500_000)
      console.warn(`[session] buffer truncated for user=${userId}`)
    }
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
    try {
      handleLine(s, JSON.parse(line) as Record<string, unknown>)
    } catch (err) {
      console.error(`[session] JSON parse error for user=${s.userId}:`, err instanceof Error ? err.message : String(err))
    }
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
    }, STREAM_FLUSH_DELAY_MS)
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
      `Ask the admin to run:\n\`cluadex telegram permit ${userId}\``,
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
    s = await createSession(userId, chatId)
    await send(chatId, '🚀 Starting Claudex…')
    await new Promise(r => setTimeout(r, 1500))
    s = sessions.get(userId) ?? s
  }

  if (!s) {
    await send(chatId, '⚠️ Failed to create session — please try again.')
    return
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
      `${TELEGRAM_API}/getUpdates?timeout=${POLL_TIMEOUT_SECONDS}&offset=${offset}&allowed_updates=["message"]`,
      { signal: AbortSignal.timeout(POLL_ABORT_TIMEOUT_MS) }
    )
    const data = (await res.json()) as { ok: boolean; result: TelegramUpdate[] }
    if (!data.ok || !data.result) return
    for (const update of data.result) {
      offset = update.update_id + 1
      if (update.message) handleMessage(update.message).catch(console.error)
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      console.warn('[poll] timeout, retrying...')
    } else {
      console.error('[poll]', err)
    }
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
  console.log(`   Config:   ${loadConfig() ? '~/.cluadex/telegram.json' : 'env vars only'}`)

  process.on('SIGINT', () => {
    console.log('\nShutting down…')
    for (const s of sessions.values()) kill(s.userId, 'shutdown')
    process.exit(0)
  })

  while (true) await poll()
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
