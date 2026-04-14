import React, { useEffect, useState } from 'react'
import { Box, Text } from '../../ink.js'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { LocalJSXCommandCall, LocalJSXCommandOnDone } from '../../types/command.js'

// ── Config helpers (inline to avoid cross-package import issues) ──────────────

const CONFIG_PATH = join(homedir(), '.claudex', 'telegram.json')

interface TelegramConfig {
  botToken: string
  allowedIds: number[]
  provider: string
  idleTimeoutMs: number
  maxSessions: number
  createdAt: string
  updatedAt: string
}

function loadCfg(): TelegramConfig | null {
  if (!existsSync(CONFIG_PATH)) return null
  try {
    const { readFileSync } = require('node:fs') as typeof import('node:fs')
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as TelegramConfig
  } catch { return null }
}

function saveCfg(cfg: TelegramConfig): void {
  const { mkdirSync, writeFileSync } = require('node:fs') as typeof import('node:fs')
  const dir = join(homedir(), '.claudex')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), { encoding: 'utf8', mode: 0o600 })
}

// ── Component ─────────────────────────────────────────────────────────────────

type Props = { call: LocalJSXCommandCall; onDone: LocalJSXCommandOnDone }

export function TelegramCommand({ call, onDone }: Props): React.ReactNode {
  const [output, setOutput] = useState<string[]>([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    const args = (call.userArgs ?? []).map(a => a.trim().toLowerCase())
    const subcommand = args[0] ?? 'help'
    const lines: string[] = []

    const finish = (msgs: string[]) => {
      setOutput(msgs)
      setDone(true)
    }

    switch (subcommand) {
      case 'setup': {
        lines.push('📋 Telegram Gateway Setup')
        lines.push('')
        lines.push('To configure the gateway, set these values in ~/.claudex/telegram.json')
        lines.push('or run the setup interactively:')
        lines.push('')
        lines.push('  1. Get a bot token from @BotFather on Telegram')
        lines.push('  2. Run: claudex telegram setup --token <your-token> --provider nvidia')
        lines.push('')

        const token = call.userArgs?.find(a => a.startsWith('--token='))?.split('=')[1]
          ?? call.userArgs?.[call.userArgs.indexOf('--token') + 1]
        const provider = call.userArgs?.find(a => a.startsWith('--provider='))?.split('=')[1]
          ?? call.userArgs?.[call.userArgs.indexOf('--provider') + 1]
          ?? 'openai'

        if (token) {
          const cfg: TelegramConfig = {
            botToken: token,
            allowedIds: [],
            provider,
            idleTimeoutMs: 300_000,
            maxSessions: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          saveCfg(cfg)
          lines.push(`✅ Config saved to ${CONFIG_PATH}`)
          lines.push(`   Provider: ${provider}`)
          lines.push(`   Token:    ${token.slice(0, 8)}…`)
          lines.push('')
          lines.push('Next steps:')
          lines.push('  claudex telegram permit <your-telegram-id>  — whitelist yourself')
          lines.push('  claudex telegram start                       — start the gateway')
          lines.push('')
          lines.push('Find your Telegram ID by messaging @userinfobot')
        } else {
          lines.push('Usage:')
          lines.push('  /telegram setup --token <bot-token> --provider <openai|nvidia|gemini|ollama>')
          lines.push('')
          lines.push('Example:')
          lines.push('  /telegram setup --token 123456:ABC-DEF --provider nvidia')
        }
        finish(lines)
        break
      }

      case 'permit': {
        const idStr = args[1] ?? call.userArgs?.[1]
        const id = parseInt(String(idStr), 10)
        if (!idStr || isNaN(id)) {
          finish(['Usage: /telegram permit <telegram-user-id>', '', 'Find your ID by messaging @userinfobot on Telegram'])
          break
        }
        const cfg = loadCfg()
        if (!cfg) {
          finish(['❌ No config found. Run: /telegram setup --token <token> first'])
          break
        }
        if (cfg.allowedIds.includes(id)) {
          finish([`ℹ️  User ${id} is already permitted.`])
        } else {
          cfg.allowedIds.push(id)
          cfg.updatedAt = new Date().toISOString()
          saveCfg(cfg)
          finish([`✅ Permitted user ${id}`, `   Total allowed: ${cfg.allowedIds.length}`])
        }
        break
      }

      case 'revoke': {
        const idStr = args[1] ?? call.userArgs?.[1]
        const id = parseInt(String(idStr), 10)
        if (!idStr || isNaN(id)) {
          finish(['Usage: /telegram revoke <telegram-user-id>'])
          break
        }
        const cfg = loadCfg()
        if (!cfg) {
          finish(['❌ No config found.'])
          break
        }
        const before = cfg.allowedIds.length
        cfg.allowedIds = cfg.allowedIds.filter(x => x !== id)
        if (cfg.allowedIds.length < before) {
          cfg.updatedAt = new Date().toISOString()
          saveCfg(cfg)
          finish([`✅ Revoked user ${id}`, `   Remaining: ${cfg.allowedIds.length}`])
        } else {
          finish([`ℹ️  User ${id} was not in the allowed list.`])
        }
        break
      }

      case 'status': {
        const cfg = loadCfg()
        if (!cfg) {
          lines.push('❌ No Telegram gateway configured.')
          lines.push('')
          lines.push('Run: /telegram setup --token <token> --provider <provider>')
        } else {
          lines.push('📡 Telegram Gateway Config')
          lines.push(`   Config:   ${CONFIG_PATH}`)
          lines.push(`   Token:    ${cfg.botToken.slice(0, 8)}…`)
          lines.push(`   Provider: ${cfg.provider}`)
          lines.push(`   Allowed:  ${cfg.allowedIds.length === 0 ? 'open (no whitelist)' : cfg.allowedIds.join(', ')}`)
          lines.push(`   Timeout:  ${Math.round(cfg.idleTimeoutMs / 60000)} min`)
          lines.push(`   Sessions: max ${cfg.maxSessions}`)
          lines.push(`   Updated:  ${cfg.updatedAt}`)
          lines.push('')
          lines.push('To start the gateway:')
          lines.push('  bun run telegram')
        }
        finish(lines)
        break
      }

      case 'start': {
        finish([
          '🚀 To start the Telegram gateway, run in your terminal:',
          '',
          '  bun run telegram',
          '',
          'Or as a background service:',
          '  pm2 start telegram-gateway/bot.ts --interpreter bun --name claudex-telegram',
          '',
          'The gateway runs as a separate process and cannot be started from inside the CLI.',
        ])
        break
      }

      case 'help':
      default: {
        finish([
          '📡 Claudex Telegram Gateway',
          '',
          'Commands:',
          '  /telegram setup --token <token> --provider <provider>',
          '                          — configure the gateway',
          '  /telegram permit <id>   — allow a Telegram user ID',
          '  /telegram revoke <id>   — remove a Telegram user ID',
          '  /telegram status        — show current config',
          '  /telegram start         — show how to start the gateway',
          '',
          'Providers: openai, nvidia, gemini, ollama, codex',
          '',
          'Example workflow:',
          '  /telegram setup --token 123456:ABC --provider nvidia',
          '  /telegram permit 987654321',
          '  bun run telegram',
        ])
        break
      }
    }
  }, [])

  useEffect(() => {
    if (done) onDone()
  }, [done])

  return (
    <Box flexDirection="column" paddingLeft={1}>
      {output.map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
    </Box>
  )
}

export default function TelegramCommandWrapper(props: Props): React.ReactNode {
  return <TelegramCommand {...props} />
}
