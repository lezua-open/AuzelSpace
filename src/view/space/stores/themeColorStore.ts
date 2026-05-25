import { ref } from 'vue'
import { defineStore } from 'pinia'
import { generatePalette } from '../utils/colors'

const STORAGE_KEY = 'auzel-theme-config'
const DEFAULT_HUE = 220
const DEFAULT_FROST = 0
const LIGHT_STYLE_ID = 'theme-light-injected'
const DARK_STYLE_ID = 'theme-dark-injected'
const GRAIN_OVERLAY_ID = 'theme-grain-overlay'

interface ThemeConfig {
  hue: number
  frost: number
}

function injectStyle(id: string, selector: string, tokens: Record<string, string>) {
  let el = document.getElementById(id) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = id
    document.head.appendChild(el)
  }
  const rules = Object.entries(tokens)
    .map(([key, val]) => `    ${key}: ${val};`)
    .join('\n')
  el.textContent = `${selector} {\n${rules}\n}`
}

function removeStyle(id: string) {
  const el = document.getElementById(id)
  if (el) el.remove()
}

/** SVG feTurbulence 噪点纹理 — 灰度转换保留全部变化，200x200 无缝 tile */
const NOISE_SVG_DATA = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="
        0.33 0.33 0.33 0 0
        0.33 0.33 0.33 0 0
        0.33 0.33 0.33 0 0
        0    0    0    1 0
      "/>
    </filter>
    <rect width="100%" height="100%" filter="url(#n)"/>
  </svg>`,
)}`

function applyGrain(frost: number) {
  let el = document.getElementById(GRAIN_OVERLAY_ID)
  if (frost <= 0) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('div')
    el.id = GRAIN_OVERLAY_ID
    el.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:9999;' +
      'background-repeat:repeat;' +
      `background-image:url(${NOISE_SVG_DATA});`
    document.body.appendChild(el)
  }
  // frost 0–100 → opacity 0–0.65
  el.style.opacity = String(frost / 150)
}

export const useThemeColorStore = defineStore('themeColorStore', () => {
  const hue = ref(DEFAULT_HUE)
  const frost = ref(DEFAULT_FROST)

  function readConfig(): ThemeConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { hue: DEFAULT_HUE, frost: DEFAULT_FROST }
      const data = JSON.parse(raw)
      return {
        hue: typeof data.hue === 'number' ? data.hue : DEFAULT_HUE,
        frost: typeof data.frost === 'number' ? data.frost : DEFAULT_FROST,
      }
    } catch {
      return { hue: DEFAULT_HUE, frost: DEFAULT_FROST }
    }
  }

  function writeConfig(c: ThemeConfig) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c))
  }

  function loadFromStorage() {
    const c = readConfig()
    hue.value = c.hue
    frost.value = c.frost
  }

  function applyToDOM() {
    const { light, dark } = generatePalette(hue.value)
    injectStyle(LIGHT_STYLE_ID, ':root', light)
    injectStyle(DARK_STYLE_ID, '.dark', dark)
    applyGrain(frost.value)
  }

  function setHue(h: number) {
    hue.value = h
    writeConfig({ hue: hue.value, frost: frost.value })
    applyToDOM()
  }

  function setFrost(f: number) {
    frost.value = f
    writeConfig({ hue: hue.value, frost: frost.value })
    applyGrain(f)
  }

  function reset() {
    hue.value = DEFAULT_HUE
    frost.value = DEFAULT_FROST
    localStorage.removeItem(STORAGE_KEY)

    removeStyle(LIGHT_STYLE_ID)
    removeStyle(DARK_STYLE_ID)
    // grain overlay 会在 applyGrain(0) 时被移除
    applyGrain(0)
  }

  /** 获取当前完整配置 */
  function getConfig(): ThemeConfig {
    return { hue: hue.value, frost: frost.value }
  }

  return { hue, frost, setHue, setFrost, reset, applyToDOM, loadFromStorage, getConfig }
})
