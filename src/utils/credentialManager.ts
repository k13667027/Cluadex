/**
 * Unified Credential Manager for Claudex
 * 
 * Provides a consistent interface for storing and retrieving API credentials
 * across all providers. Credentials are stored in:
 * 1. Global config (encrypted) for persistence
 * 2. Environment variables for current session
 * 3. Profile file for provider-specific settings
 */

import { getGlobalConfig, saveGlobalConfig } from './config.js'
import { loadProfileFile, saveProfileFile, createProfileFile, type ProviderProfile, type ProfileEnv } from './providerProfile.js'

export type ProviderCredentialType = 
  | 'anthropic_api_key'
  | 'openai_api_key'
  | 'gemini_api_key'
  | 'nvidia_api_key'
  | 'codex_api_key'

export interface ProviderCredentials {
  provider: ProviderProfile | 'anthropic' | 'openrouter'
  apiKey?: string
  baseUrl?: string
  model?: string
}

const CREDENTIAL_KEY_MAP: Record<string, string> = {
  'anthropic': 'ANTHROPIC_API_KEY',
  'openai': 'OPENAI_API_KEY',
  'openrouter': 'OPENAI_API_KEY',
  'gemini': 'GEMINI_API_KEY',
  'nvidia': 'NVIDIA_API_KEY',
  'codex': 'CODEX_API_KEY',
  'ollama': 'OPENAI_API_KEY',
}

const PROVIDER_FLAG_MAP: Record<string, string> = {
  'anthropic': '',
  'openai': 'CLAUDE_CODE_USE_OPENAI',
  'openrouter': 'CLAUDE_CODE_USE_OPENAI',
  'gemini': 'CLAUDE_CODE_USE_GEMINI',
  'nvidia': 'CLAUDE_CODE_USE_NVIDIA',
  'codex': 'CLAUDE_CODE_USE_OPENAI',
  'ollama': 'CLAUDE_CODE_USE_OPENAI',
}

/**
 * Store credentials for a provider
 * This saves to both global config and the profile file
 */
export function storeProviderCredentials(credentials: ProviderCredentials): void {
  const { provider, apiKey, baseUrl, model } = credentials
  
  // Save API key to global config for persistence
  if (apiKey) {
    saveGlobalConfig(current => ({
      ...current,
      providerCredentials: {
        ...current.providerCredentials,
        [provider]: {
          apiKey,
          storedAt: new Date().toISOString(),
        }
      }
    }))
  }
  
  // Build profile environment
  const env: ProfileEnv = {}
  
  // Set provider flag
  const providerFlag = PROVIDER_FLAG_MAP[provider]
  if (providerFlag) {
    env[providerFlag as keyof ProfileEnv] = '1'
  }
  
  // Set API key
  const apiKeyField = CREDENTIAL_KEY_MAP[provider]
  if (apiKey && apiKeyField) {
    ;(env as Record<string, string>)[apiKeyField] = apiKey
  }
  
  // Set base URL
  if (baseUrl) {
    if (provider === 'nvidia') {
      env.NVIDIA_BASE_URL = baseUrl
    } else if (provider === 'gemini') {
      env.GEMINI_BASE_URL = baseUrl
    } else {
      env.OPENAI_BASE_URL = baseUrl
    }
  }
  
  // Set model
  if (model) {
    if (provider === 'nvidia') {
      env.NVIDIA_MODEL = model
    } else if (provider === 'gemini') {
      env.GEMINI_MODEL = model
    } else {
      env.OPENAI_MODEL = model
    }
  }
  
  // Also set in current process environment for immediate use
  Object.entries(env).forEach(([key, value]) => {
    if (value) {
      process.env[key] = value
    }
  })
  
  // Map provider to profile type
  let profileType: ProviderProfile
  switch (provider) {
    case 'anthropic':
    case 'openai':
    case 'openrouter':
      profileType = 'openai'
      break
    case 'gemini':
      profileType = 'gemini'
      break
    case 'nvidia':
      profileType = 'nvidia'
      break
    case 'codex':
      profileType = 'codex'
      break
    case 'ollama':
      profileType = 'ollama'
      break
    default:
      profileType = 'openai'
  }
  
  // Save to profile file
  const profileFile = createProfileFile(profileType, env)
  saveProfileFile(profileFile)
}

/**
 * Retrieve stored credentials for a provider
 */
export function getProviderCredentials(provider: string): { apiKey?: string; baseUrl?: string; model?: string } | null {
  const config = getGlobalConfig()
  const stored = config.providerCredentials?.[provider]
  
  if (!stored?.apiKey) {
    return null
  }
  
  // Also check profile file for baseUrl and model
  const profile = loadProfileFile()
  if (profile) {
    return {
      apiKey: stored.apiKey,
      baseUrl: profile.env.NVIDIA_BASE_URL || profile.env.GEMINI_BASE_URL || profile.env.OPENAI_BASE_URL,
      model: profile.env.NVIDIA_MODEL || profile.env.GEMINI_MODEL || profile.env.OPENAI_MODEL,
    }
  }
  
  return { apiKey: stored.apiKey }
}

/**
 * Check if credentials exist for a provider
 */
export function hasProviderCredentials(provider: string): boolean {
  const config = getGlobalConfig()
  return !!config.providerCredentials?.[provider]?.apiKey
}

/**
 * Clear credentials for a provider
 */
export function clearProviderCredentials(provider: string): void {
  saveGlobalConfig(current => {
    const { [provider]: _, ...rest } = current.providerCredentials || {}
    return {
      ...current,
      providerCredentials: rest
    }
  })
}

/**
 * Apply stored credentials to environment
 * Call this at startup to ensure credentials are loaded
 */
export function applyStoredCredentials(): void {
  const config = getGlobalConfig()
  const credentials = config.providerCredentials
  
  if (!credentials) return
  
  // Apply each provider's credentials to environment
  Object.entries(credentials).forEach(([provider, creds]) => {
    if (creds?.apiKey) {
      const apiKeyField = CREDENTIAL_KEY_MAP[provider]
      if (apiKeyField) {
        process.env[apiKeyField] = creds.apiKey
      }
      
      // Also set provider flag
      const providerFlag = PROVIDER_FLAG_MAP[provider]
      if (providerFlag) {
        process.env[providerFlag] = '1'
      }
    }
  })
  
  // Also load from profile file if exists
  const profile = loadProfileFile()
  if (profile?.env) {
    Object.entries(profile.env).forEach(([key, value]) => {
      if (value) {
        process.env[key] = value
      }
    })
  }
}
