/**
 * Claudex Telegram Gateway — config manager
 *
 * Config is stored at ~/.claudex/telegram.json
 * Managed via: claudex telegram <command>
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export interface TelegramConfig {
  botToken: string
  allowedIds: number[]
  provider: string
  idleTimeoutMs: number
  maxSessions: number
  createdAt: string
  updatedAt: string
}

const CONFIG_DIR = join(homedir(), '.claudex')
const CONFIG_PATH = join(CONFIG_DIR, 'telegram.json')

export function configExists(): boolean {
  return existsSync(CONFIG_PATH)
}

export function loadConfig(): TelegramConfig | null {
  if (!existsSync(CONFIG_PATH)) return null
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as TelegramConfig
  } catch {
    return null
  }
}

export function saveConfig(config: TelegramConfig): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { encoding: 'utf8', mode: 0o600 })
}

export function permitUser(userId: number): { added: boolean; config: TelegramConfig } {
  const config = loadConfig()
  if (!config) throw new Error('No Telegram config found. Run: claudex telegram setup')
  if (config.allowedIds.includes(userId)) return { added: false, config }
  config.allowedIds.push(userId)
  config.updatedAt = new Date().toISOString()
  saveConfig(config)
  return { added: true, config }
}

export function revokeUser(userId: number): { removed: boolean; config: TelegramConfig } {
  const config = loadConfig()
  if (!config) throw new Error('No Telegram config found. Run: claudex telegram setup')
  const before = config.allowedIds.length
  config.allowedIds = config.allowedIds.filter(id => id !== userId)
  const removed = config.allowedIds.length < before
  if (removed) {
    config.updatedAt = new Date().toISOString()
    saveConfig(config)
  }
  return { removed, config }
}

export function getConfigPath(): string {
  return CONFIG_PATH
}
