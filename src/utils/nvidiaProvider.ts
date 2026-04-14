/**
 * NVIDIA AI provider for Claudex.
 *
 * Routes requests to NVIDIA's OpenAI-compatible inference API at
 * https://integrate.api.nvidia.com/v1
 *
 * Uses the existing OpenAI shim — NVIDIA's endpoint is fully
 * OpenAI-compatible, so no translation layer is needed.
 *
 * Environment variables:
 *   CLAUDE_CODE_USE_NVIDIA=1          — enable this provider
 *   NVIDIA_API_KEY=nvapi-...          — your NVIDIA API key
 *   NVIDIA_MODEL=moonshotai/kimi-k2-instruct  — model override
 *   NVIDIA_BASE_URL=https://...       — endpoint override (optional)
 */

export const DEFAULT_NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
export const DEFAULT_NVIDIA_MODEL = 'moonshotai/kimi-k2-instruct'

/** Well-known NVIDIA NIM models with their capabilities */
export const NVIDIA_MODELS = {
  // MoonshotAI
  'moonshotai/kimi-k2-instruct': { tier: 'large', description: 'Kimi K2 — strong reasoning & coding' },
  'moonshotai/kimi-k2-thinking': { tier: 'large', description: 'Kimi K2 — extended thinking' },
  'moonshotai/kimi-k2.5': { tier: 'large', description: 'Kimi K2.5 — latest model' },
  // DeepSeek
  'deepseek-ai/deepseek-r1': { tier: 'large', description: 'DeepSeek R1 — reasoning' },
  'deepseek-ai/deepseek-v3.1': { tier: 'large', description: 'DeepSeek V3.1' },
  'deepseek-ai/deepseek-v3.1-terminus': { tier: 'large', description: 'DeepSeek V3.1 Terminus' },
  'deepseek-ai/deepseek-v3.2': { tier: 'large', description: 'DeepSeek V3.2' },
  // Qwen
  'qwen/qwen3-235b-a22b': { tier: 'large', description: 'Qwen3 235B MoE' },
  'qwen/qwen3-coder-480b-a35b-instruct': { tier: 'large', description: 'Qwen3 Coder 480B' },
  // Meta
  'meta/llama-3.1-405b-instruct': { tier: 'large', description: 'Llama 3.1 405B' },
  'meta/llama-3.3-70b-instruct': { tier: 'medium', description: 'Llama 3.3 70B' },
  'meta/llama-3.1-8b-instruct': { tier: 'small', description: 'Llama 3.1 8B — fast' },
  'meta/llama-3.2-90b-vision-instruct': { tier: 'medium', description: 'Llama 3.2 90B Vision' },
  // NVIDIA
  'nvidia/llama-3.1-nemotron-ultra-253b-v1': { tier: 'large', description: 'Nemotron Ultra 253B' },
  'nvidia/llama-3.3-nemotron-super-49b-v1': { tier: 'large', description: 'Nemotron Super 49B' },
  'nvidia/nemotron-3-super-120b-a12b': { tier: 'large', description: 'Nemotron 3 Super 120B' },
  // Mistral
  'mistralai/mistral-large-2-instruct': { tier: 'large', description: 'Mistral Large 2' },
  'mistralai/mixtral-8x22b-instruct-v0.1': { tier: 'large', description: 'Mixtral 8x22B' },
  'mistralai/mistral-large-3-675b-instruct-2512': { tier: 'large', description: 'Mistral Large 3 675B' },
  // MiniMax
  'minimaxai/minimax-m2.5': { tier: 'large', description: 'MiniMax M2.5' },
  // Google
  'google/gemma-3-27b-it': { tier: 'medium', description: 'Gemma 3 27B' },
  // Zhipu AI
  'z-ai/glm4.7': { tier: 'large', description: 'GLM 4.7' },
  'z-ai/glm5': { tier: 'large', description: 'GLM 5' },
  // OpenAI
  'openai/gpt-oss-120b': { tier: 'large', description: 'GPT-OSS 120B' },
  // Microsoft
  'microsoft/phi-4-reasoning-plus': { tier: 'small', description: 'Phi-4 Reasoning+' },
  // StepFun
  'stepfun-ai/step-3.5-flash': { tier: 'small', description: 'Step-3.5 Flash' },
} as const

export type NvidiaModelId = keyof typeof NVIDIA_MODELS

export function getNvidiaApiBaseUrl(baseUrl?: string): string {
  return (baseUrl || process.env.NVIDIA_BASE_URL || DEFAULT_NVIDIA_BASE_URL).replace(/\/+$/, '')
}

export function getNvidiaModel(): string {
  return process.env.NVIDIA_MODEL || DEFAULT_NVIDIA_MODEL
}

export function getNvidiaApiKey(): string | undefined {
  return process.env.NVIDIA_API_KEY
}

/** Check if the NVIDIA endpoint is reachable */
export async function hasNvidiaAccess(baseUrl?: string): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const apiKey = getNvidiaApiKey()
    const headers: Record<string, string> = {}
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

    const response = await fetch(`${getNvidiaApiBaseUrl(baseUrl)}/models`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    })
    // 200 = ok, 401 = reachable but bad key — both mean the endpoint is up
    return response.status === 200 || response.status === 401
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

/** List available NVIDIA NIM models from the API */
export async function listNvidiaModels(baseUrl?: string): Promise<string[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const apiKey = getNvidiaApiKey()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

    const response = await fetch(`${getNvidiaApiBaseUrl(baseUrl)}/models`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    })
    if (!response.ok) return []

    const data = (await response.json()) as { data?: Array<{ id?: string }> }
    return (data.data ?? []).filter(m => Boolean(m.id)).map(m => m.id!)
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

/** Build the env block for a NVIDIA profile */
export function buildNvidiaProfileEnv(options: {
  model?: string | null
  baseUrl?: string | null
  apiKey?: string | null
  processEnv?: Record<string, string | undefined>
}): { CLAUDE_CODE_USE_NVIDIA: string; NVIDIA_BASE_URL: string; NVIDIA_MODEL: string; NVIDIA_API_KEY?: string } | null {
  const processEnv = options.processEnv ?? (typeof process !== 'undefined' ? process.env : {})
  const key = options.apiKey ?? processEnv['NVIDIA_API_KEY'] ?? processEnv['OPENAI_API_KEY']
  if (!key) return null

  return {
    CLAUDE_CODE_USE_NVIDIA: '1',
    NVIDIA_BASE_URL: options.baseUrl ?? processEnv['NVIDIA_BASE_URL'] ?? DEFAULT_NVIDIA_BASE_URL,
    NVIDIA_MODEL: options.model ?? processEnv['NVIDIA_MODEL'] ?? DEFAULT_NVIDIA_MODEL,
    NVIDIA_API_KEY: key,
  }
}
