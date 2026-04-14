/**
 * cluadex startup screen — banner, themes, provider info box.
 * Called once at CLI startup before the Ink UI renders.
 *
 * Theme selection (unified with /theme command):
 *   CLAUDEX_THEME=dark      — default dark mode
 *   CLAUDEX_THEME=light     — light mode
 *   CLAUDEX_THEME=sunset    — warm orange-to-rust
 *   CLAUDEX_THEME=ocean     — deep teal to cyan
 *   CLAUDEX_THEME=aurora    — green to violet northern lights
 *   CLAUDEX_THEME=neon      — hot pink to electric blue
 *   CLAUDEX_THEME=mono      — clean white-to-grey monochrome
 *   CLAUDEX_THEME=matrix    — green terminal hacker style
 */

declare const MACRO: { VERSION: string; DISPLAY_VERSION?: string }

const ESC = '\x1b['
const RESET = `${ESC}0m`
const DIM = `${ESC}2m`
const BOLD = `${ESC}1m`

type RGB = [number, number, number]
const rgb = (r: number, g: number, b: number) => `${ESC}38;2;${r};${g};${b}m`

function lerp(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function gradAt(stops: RGB[], t: number): RGB {
  const c = Math.max(0, Math.min(1, t))
  const s = c * (stops.length - 1)
  const i = Math.floor(s)
  if (i >= stops.length - 1) return stops[stops.length - 1]
  return lerp(stops[i], stops[i + 1], s - i)
}

function paintLine(text: string, stops: RGB[], lineT: number): string {
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const t = text.length > 1 ? lineT * 0.5 + (i / (text.length - 1)) * 0.5 : lineT
    const [r, g, b] = gradAt(stops, t)
    out += `${rgb(r, g, b)}${text[i]}`
  }
  return out + RESET
}

// ─── Themes ───────────────────────────────────────────────────────────────────

type Theme = {
  grad: RGB[]       // banner gradient (top → bottom)
  accent: RGB       // highlights, stars, version
  cream: RGB        // label values
  dim: RGB          // label keys, dim text
  border: RGB       // box drawing
  tagline: string   // tagline text
}

const THEMES: Record<string, Theme> = {
  // Warm orange-to-rust — the original
  sunset: {
    grad:    [[255,180,100],[240,140,80],[217,119,87],[193,95,60],[160,75,55],[130,60,50]],
    accent:  [240, 148, 100],
    cream:   [220, 195, 170],
    dim:     [120, 100,  82],
    border:  [100,  80,  65],
    tagline: 'Any model. Every tool. Zero limits.',
  },
  // Deep teal to electric cyan
  ocean: {
    grad:    [[0,180,200],[0,160,190],[0,140,175],[0,120,160],[0,100,145],[0,80,130]],
    accent:  [ 0, 210, 220],
    cream:   [160, 230, 235],
    dim:     [ 60, 130, 145],
    border:  [ 30,  90, 110],
    tagline: 'Any model. Every tool. Zero limits.',
  },
  // Green to violet — northern lights
  aurora: {
    grad:    [[80,220,120],[100,200,140],[120,170,160],[140,130,190],[160,100,210],[170,80,220]],
    accent:  [120, 240, 160],
    cream:   [190, 240, 200],
    dim:     [ 80, 140,  90],
    border:  [ 50,  90,  70],
    tagline: 'Any model. Every tool. Zero limits.',
  },
  // Hot pink to electric blue
  neon: {
    grad:    [[255,50,180],[230,40,200],[190,40,220],[140,50,240],[90,80,255],[50,120,255]],
    accent:  [255,  80, 200],
    cream:   [230, 180, 255],
    dim:     [130,  80, 160],
    border:  [ 80,  40, 110],
    tagline: 'Any model. Every tool. Zero limits.',
  },
  // Clean white-to-grey monochrome
  mono: {
    grad:    [[220,220,220],[200,200,200],[180,180,180],[155,155,155],[130,130,130],[105,105,105]],
    accent:  [230, 230, 230],
    cream:   [200, 200, 200],
    dim:     [130, 130, 130],
    border:  [ 90,  90,  90],
    tagline: 'Any model. Every tool. Zero limits.',
  },
  // Matrix — digital rain green
  matrix: {
    grad:    [[0,255,70],[0,230,60],[0,200,50],[0,170,40],[0,140,35],[0,110,30]],
    accent:  [0, 255, 70],
    cream:   [140, 255, 160],
    dim:     [0, 100, 30],
    border:  [0, 80, 25],
    tagline: 'Wake up, Neo. The Matrix has you.',
  },
  // Dracula — purple vampire
  dracula: {
    grad:    [[189,147,249],[180,130,240],[170,110,230],[160,90,220],[150,70,210],[140,50,200]],
    accent:  [189, 147, 249],
    cream:   [230, 210, 255],
    dim:     [98, 114, 164],
    border:  [68, 71, 90],
    tagline: 'Any model. Every tool. Zero limits.',
  },
  // Nord — arctic blue
  nord: {
    grad:    [[136,192,208],[129,175,195],[120,158,182],[110,140,168],[100,122,155],[90,105,142]],
    accent:  [136, 192, 208],
    cream:   [216, 222, 233],
    dim:     [76, 86, 106],
    border:  [59, 66, 82],
    tagline: 'Any model. Every tool. Zero limits.',
  },
  // Tokyo Night — neon city
  'tokyo-night': {
    grad:    [[187,154,247],[170,140,240],[150,125,235],[130,110,230],[110,95,225],[90,80,220]],
    accent:  [122, 162, 247],
    cream:   [192, 202, 245],
    dim:     [65, 72, 104],
    border:  [36, 40, 59],
    tagline: 'Any model. Every tool. Zero limits.',
  },
  // Catppuccin Mocha — pastel dark
  'catppuccin-mocha': {
    grad:    [[203,166,247],[190,155,240],[177,144,233],[164,133,226],[151,122,219],[138,111,212]],
    accent:  [137, 180, 250],
    cream:   [205, 214, 244],
    dim:     [88, 91, 112],
    border:  [49, 50, 68],
    tagline: 'Any model. Every tool. Zero limits.',
  },
  // Cyberpunk — neon on black
  cyberpunk: {
    grad:    [[255,0,255],[230,0,230],[200,0,200],[170,0,170],[140,0,140],[110,0,110]],
    accent:  [0, 255, 255],
    cream:   [230, 230, 255],
    dim:     [100, 0, 130],
    border:  [50, 0, 80],
    tagline: 'Jack in. The future is now.',
  },
}

function resolveTheme(): Theme {
  const name = (process.env.CLAUDEX_THEME || 'sunset').toLowerCase()
  return THEMES[name] ?? THEMES.sunset
}

// ─── Claudex ASCII Banner ─────────────────────────────────────────────────────

const BANNER = [
  ` \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557      \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557   \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557  \u2588\u2588\u2557`,
  `\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u255a\u2588\u2588\u2557\u2588\u2588\u2554\u255d`,
  `\u2588\u2588\u2551     \u2588\u2588\u2551     \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557   \u255a\u2588\u2588\u2588\u2554\u255d `,
  `\u2588\u2588\u2551     \u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255d   \u2588\u2588\u2554\u2588\u2588\u2557 `,
  `\u255a\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u255a\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551 \u255a\u2588\u2588\u2557`,
  ` \u255a\u2550\u2550\u2550\u2550\u2550\u255d\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d\u255a\u2550\u255d  \u255a\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d\u255a\u2550\u255d  \u255a\u2550\u255d`,
]

// ─── Provider detection ───────────────────────────────────────────────────────

function detectProvider(): { name: string; model: string; baseUrl: string; isLocal: boolean } {
  const useNvidia = process.env.CLAUDE_CODE_USE_NVIDIA === '1' || process.env.CLAUDE_CODE_USE_NVIDIA === 'true'
  const useGemini = process.env.CLAUDE_CODE_USE_GEMINI === '1' || process.env.CLAUDE_CODE_USE_GEMINI === 'true'
  const useGithub = process.env.CLAUDE_CODE_USE_GITHUB === '1' || process.env.CLAUDE_CODE_USE_GITHUB === 'true'
  const useOpenAI = process.env.CLAUDE_CODE_USE_OPENAI === '1' || process.env.CLAUDE_CODE_USE_OPENAI === 'true'

  if (useNvidia) {
    const model = process.env.NVIDIA_MODEL || process.env.OPENAI_MODEL || 'moonshotai/kimi-k2-instruct'
    const baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1'
    return { name: 'NVIDIA AI', model, baseUrl, isLocal: false }
  }

  if (useGemini) {
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
    const baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai'
    return { name: 'Google Gemini', model, baseUrl, isLocal: false }
  }

  if (useGithub) {
    const model = process.env.OPENAI_MODEL || 'github:copilot'
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://models.github.ai/inference'
    return { name: 'GitHub Models', model, baseUrl, isLocal: false }
  }

  if (useOpenAI) {
    const rawModel = process.env.OPENAI_MODEL || 'gpt-4o'
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const isLocal = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(baseUrl)
    let name = 'OpenAI'
    if (/deepseek/i.test(baseUrl) || /deepseek/i.test(rawModel))     name = 'DeepSeek'
    else if (/openrouter/i.test(baseUrl))                            name = 'OpenRouter'
    else if (/together/i.test(baseUrl))                              name = 'Together AI'
    else if (/groq/i.test(baseUrl))                                  name = 'Groq'
    else if (/mistral/i.test(baseUrl) || /mistral/i.test(rawModel))  name = 'Mistral'
    else if (/azure/i.test(baseUrl))                                 name = 'Azure OpenAI'
    else if (/localhost:11434/i.test(baseUrl))                       name = 'Ollama'
    else if (/localhost:1234/i.test(baseUrl))                        name = 'LM Studio'
    else if (/llama/i.test(rawModel))                                name = 'Meta Llama'
    else if (isLocal)                                                name = 'Local'

    let displayModel = rawModel
    const codexAliases: Record<string, { model: string; reasoningEffort?: string }> = {
      codexplan:           { model: 'gpt-5.4',            reasoningEffort: 'high'   },
      'gpt-5.4':           { model: 'gpt-5.4',            reasoningEffort: 'high'   },
      'gpt-5.3-codex':     { model: 'gpt-5.3-codex',      reasoningEffort: 'high'   },
      'gpt-5.3-codex-spark': { model: 'gpt-5.3-codex-spark' },
      codexspark:          { model: 'gpt-5.3-codex-spark'                           },
      'gpt-5.2-codex':     { model: 'gpt-5.2-codex',      reasoningEffort: 'high'   },
      'gpt-5.1-codex-max': { model: 'gpt-5.1-codex-max',  reasoningEffort: 'high'   },
      'gpt-5.1-codex-mini':{ model: 'gpt-5.1-codex-mini'                            },
      'gpt-5.4-mini':      { model: 'gpt-5.4-mini',       reasoningEffort: 'medium' },
      'gpt-5.2':           { model: 'gpt-5.2',            reasoningEffort: 'medium' },
    }
    const alias = rawModel.toLowerCase()
    if (alias in codexAliases) {
      const resolved = codexAliases[alias]
      displayModel = resolved.model
      if (resolved.reasoningEffort) displayModel = `${displayModel} (${resolved.reasoningEffort})`
    }

    return { name, model: displayModel, baseUrl, isLocal }
  }

  const model = process.env.ANTHROPIC_MODEL || process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'
  return { name: 'Anthropic', model, baseUrl: 'https://api.anthropic.com', isLocal: false }
}

// ─── Box helpers ──────────────────────────────────────────────────────────────

function boxRow(content: string, width: number, rawLen: number, borderColor: RGB): string {
  const pad = Math.max(0, width - 2 - rawLen)
  return `${rgb(...borderColor)}\u2502${RESET}${content}${' '.repeat(pad)}${rgb(...borderColor)}\u2502${RESET}`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function printStartupScreen(): void {
  if (process.env.CI || !process.stdout.isTTY) return

  const theme = resolveTheme()
  const p = detectProvider()
  const W = 62
  const out: string[] = []

  out.push('')

  // ── Banner with theme gradient ──
  const total = BANNER.length
  for (let i = 0; i < total; i++) {
    const t = total > 1 ? i / (total - 1) : 0
    out.push(paintLine(BANNER[i], theme.grad, t))
  }

  // ── Dev credit line ──
  out.push('')
  out.push(
    `  ${DIM}${rgb(...theme.dim)}// devs: ${RESET}` +
    `${rgb(...theme.cream)}karen john${RESET}`,
  )
  out.push('')

  // ── Provider info box ──
  out.push(`${rgb(...theme.border)}╔${'═'.repeat(W - 2)}╗${RESET}`)

  const lbl = (k: string, v: string, c: RGB = theme.cream): [string, number] => {
    const padK = k.padEnd(9)
    return [
      ` ${DIM}${rgb(...theme.dim)}${padK}${RESET} ${rgb(...c)}${v}${RESET}`,
      ` ${padK} ${v}`.length,
    ]
  }

  const provC: RGB = p.isLocal ? [130, 175, 130] : theme.accent
  let [r, l] = lbl('Provider', p.name, provC)
  out.push(boxRow(r, W, l, theme.border))
  ;[r, l] = lbl('Model', p.model)
  out.push(boxRow(r, W, l, theme.border))
  const ep = p.baseUrl.length > 38 ? p.baseUrl.slice(0, 35) + '...' : p.baseUrl
  ;[r, l] = lbl('Endpoint', ep)
  out.push(boxRow(r, W, l, theme.border))

  out.push(`${rgb(...theme.border)}\u2560${'\u2550'.repeat(W - 2)}\u2563${RESET}`)

  const sC: RGB = p.isLocal ? [130, 175, 130] : theme.accent
  const sL = p.isLocal ? 'local' : 'cloud'
  const sRow =
    ` ${rgb(...sC)}\u25cf${RESET} ` +
    `${DIM}${rgb(...theme.dim)}${sL}${RESET}    ` +
    `${DIM}${rgb(...theme.dim)}Ready \u2014 type ${RESET}` +
    `${rgb(...theme.accent)}/help${RESET}` +
    `${DIM}${rgb(...theme.dim)} to begin${RESET}`
  const sLen = ` \u25cf ${sL}    Ready \u2014 type /help to begin`.length
  out.push(boxRow(sRow, W, sLen, theme.border))

  out.push(`${rgb(...theme.border)}\u255a${'\u2550'.repeat(W - 2)}\u255d${RESET}`)

  // ── Footer: version ──
  out.push(
    `  ${DIM}${rgb(...theme.dim)}Claudex ${RESET}` +
    `${rgb(...theme.accent)}v${MACRO.DISPLAY_VERSION ?? MACRO.VERSION}${RESET}`,
  )
  out.push('')

  process.stdout.write(out.join('\n') + '\n')
}
