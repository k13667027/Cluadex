import type { AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS } from '../../services/analytics/index.js'
import { isEnvTruthy } from '../envUtils.js'

export type APIProvider =
  | 'firstParty'
  | 'bedrock'
  | 'vertex'
  | 'foundry'
  | 'openai'
  | 'gemini'
  | 'github'
  | 'codex'
  | 'nvidia'

export function getAPIProvider(): APIProvider {
  // Priority: ENV vars determine provider
  // Default fallback is nvidia (if no env vars set)
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_NVIDIA)) {
    return 'nvidia'
  }
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_GEMINI)) {
    return 'gemini'
  }
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_GITHUB)) {
    return 'github'
  }
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_OPENAI)) {
    return isCodexModel() ? 'codex' : 'openai'
  }
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_BEDROCK)) {
    return 'bedrock'
  }
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_VERTEX)) {
    return 'vertex'
  }
  if (isEnvTruthy(process.env.CLAUDE_CODE_USE_FOUNDRY)) {
    return 'foundry'
  }
  // Default: firstParty (if no 3rd-party provider env vars set)
  return 'firstParty'
}

export function usesAnthropicAccountFlow(): boolean {
  return getAPIProvider() === 'firstParty'
}
function isCodexModel(): boolean {
  const model = (process.env.OPENAI_MODEL || '').toLowerCase()
  return (
    model === 'codexplan' ||
    model === 'codexspark' ||
    model === 'gpt-5.4' ||
    model === 'gpt-5.3-codex' ||
    model === 'gpt-5.3-codex-spark' ||
    model === 'gpt-5.2-codex' ||
    model === 'gpt-5.1-codex-max' ||
    model === 'gpt-5.1-codex-mini'
  )
}

export function getAPIProviderForStatsig(): AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS {
  return getAPIProvider() as AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
}

/**
 * Check if ANTHROPIC_BASE_URL is a first-party Anthropic API URL.
 * Returns true if not set (default API) or points to api.anthropic.com
 * (or api-staging.anthropic.com for ant users).
 */
export function isFirstPartyAnthropicBaseUrl(): boolean {
  const baseUrl = process.env.ANTHROPIC_BASE_URL
  if (!baseUrl) {
    return true
  }
  try {
    const host = new URL(baseUrl).host
    const allowedHosts = ['api.anthropic.com']
    if (process.env.USER_TYPE === 'ant') {
      allowedHosts.push('api-staging.anthropic.com')
    }
    return allowedHosts.includes(host)
  } catch {
    return false
  }
}
