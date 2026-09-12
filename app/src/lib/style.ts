import { ref, computed, watch } from 'vue'
import {
  collectUniqueThemeFontValues,
  getThemeFonts,
  type ThemeConfig,
} from '@/random-ui/themeManager'
import type {
  StyleKey,
  LayoutPresetKey,
  ShadowPresetKey,
  LayoutPreset,
  ShadowPreset,
} from '@/random-ui/config/config'
import { THEMES, useGlobalTheme } from './theme'

// 复用 random-ui 现成选项（风格 / 圆角排版 / 阴影 / 图标库）
// 注意：从 `@/random-ui/config/config` 运行时 import 会连带整个 random-ui 预览组件树，
// 故此处仅在 app 侧声明常量，内容与 config/config.ts 保持一致。
export type { StyleKey, LayoutPresetKey, ShadowPresetKey }

export const STYLE_OPTIONS: Array<{ value: StyleKey, label: string }> = [
  { value: 'reka-nova', label: 'Nova' },
  { value: 'reka-luma', label: 'Luma' },
  { value: 'reka-lyra', label: 'Lyra' },
  { value: 'reka-maia', label: 'Maia' },
  { value: 'reka-mira', label: 'Mira' },
  { value: 'reka-rhea', label: 'Rhea' },
  { value: 'reka-sera', label: 'Sera' },
  { value: 'reka-vega', label: 'Vega' },
]

/** 默认正文字体（设计系统未定义字体时用） */
export const DEFAULT_STYLE_FONT = 'Inter, sans-serif'

/**
 * 风格（设计系统）自带的字体
 *
 * 与 `@/random-ui/config/config.ts` 的 PRESETS 保持一致：
 * Vega / Nova / Mira / Luma → Inter，Maia → Figtree，Lyra → JetBrains Mono。
 * PRESETS 里没有字体的风格（rhea / sera）沿用默认 Inter。
 * 注：app 侧不运行时 import config.ts（会连带整棵 random-ui 组件树），故在此同步一份。
 */
export const STYLE_FONTS: Record<string, string> = {
  'reka-vega': 'Inter, sans-serif',
  'reka-nova': 'Inter, sans-serif',
  'reka-maia': 'Figtree, sans-serif',
  'reka-lyra': 'JetBrains Mono, monospace',
  'reka-mira': 'Inter, sans-serif',
  'reka-luma': 'Inter, sans-serif',
  'reka-rhea': 'Inter, sans-serif',
  'reka-sera': 'Inter, sans-serif',
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  { key: 'theme', label: '跟随主题', radius: '', spacing: '', letterSpacing: '' },
  { key: 'compact', label: '紧凑', radius: '0.35rem', spacing: '0.18rem', letterSpacing: '-0.01em' },
  { key: 'balanced', label: '均衡', radius: '0.55rem', spacing: '0.24rem', letterSpacing: '0em' },
  { key: 'airy', label: '舒展', radius: '0.8rem', spacing: '0.32rem', letterSpacing: '0.005em' },
  { key: 'rounded', label: '柔和圆角', radius: '1.1rem', spacing: '0.28rem', letterSpacing: '0em' },
  { key: 'editorial', label: '编辑风', radius: '0.45rem', spacing: '0.26rem', letterSpacing: '0.012em' },
]

export const SHADOW_PRESETS: ShadowPreset[] = [
  { key: 'theme', label: '跟随主题', color: '', opacity: '', blur: '', spread: '', offsetX: '', offsetY: '' },
  { key: 'none', label: '无阴影', color: 'hsl(0 0% 0%)', opacity: '0', blur: '0px', spread: '0px', offsetX: '0px', offsetY: '0px' },
  { key: 'soft', label: '轻柔', color: 'hsl(0 0% 0%)', opacity: '0.12', blur: '8px', spread: '-1px', offsetX: '0px', offsetY: '3px' },
  { key: 'standard', label: '标准', color: 'hsl(0 0% 0%)', opacity: '0.18', blur: '14px', spread: '-2px', offsetX: '0px', offsetY: '6px' },
  { key: 'strong', label: '明显', color: 'hsl(0 0% 0%)', opacity: '0.26', blur: '18px', spread: '-2px', offsetX: '0px', offsetY: '9px' },
  { key: 'dramatic', label: '戏剧化', color: 'hsl(0 0% 0%)', opacity: '0.34', blur: '24px', spread: '-4px', offsetX: '0px', offsetY: '12px' },
]

export const ICON_LIBRARY_OPTIONS: Array<{ value: string, label: string }> = [
  { value: 'lucide', label: 'Lucide' },
  { value: 'tabler', label: 'Tabler Icons' },
  { value: 'hugeicons', label: 'HugeIcons' },
  { value: 'phosphor', label: 'Phosphor Icons' },
  { value: 'remixicon', label: 'Remix Icons' },
]

const STYLE_STORAGE_KEY = 'app-global-style'
const LAYOUT_STORAGE_KEY = 'app-global-layout'
const SHADOW_STORAGE_KEY = 'app-global-shadow'
const FONT_STORAGE_KEY = 'app-global-fonts'
const ICON_STORAGE_KEY = 'app-global-icon'

const styleKey = ref<StyleKey>((localStorage.getItem(STYLE_STORAGE_KEY) as StyleKey) || 'reka-vega')
const layoutKey = ref<LayoutPresetKey>((localStorage.getItem(LAYOUT_STORAGE_KEY) as LayoutPresetKey) || 'theme')
const shadowKey = ref<ShadowPresetKey>((localStorage.getItem(SHADOW_STORAGE_KEY) as ShadowPresetKey) || 'theme')
const iconLibrary = ref<string>(localStorage.getItem(ICON_STORAGE_KEY) || 'lucide')

// 与主题抽屉共享的当前主题索引（联动「跟随主题」的 radius / 阴影 / 字体）
const { index: themeIndex } = useGlobalTheme()

const themes = THEMES as unknown as ThemeConfig[]
const DEFAULT_FALLBACK = { fontSans: 'Inter, sans-serif', fontSerif: 'Georgia, serif', fontMono: 'JetBrains Mono, monospace' }

// 字体选项（复用 random-ui 的现成收集逻辑）
const sansFontOptions = computed(() => collectUniqueThemeFontValues(themes, 'font-sans'))
const serifFontOptions = computed(() => collectUniqueThemeFontValues(themes, 'font-serif'))
const monoFontOptions = computed(() => collectUniqueThemeFontValues(themes, 'font-mono'))

function isDarkMode() {
  return document.documentElement.classList.contains('dark')
}

function loadFonts(): { fontSans: string; fontSerif: string; fontMono: string } {
  const stored = localStorage.getItem(FONT_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      /* ignore */
    }
  }
  return getThemeFonts(themes, themeIndex.value, isDarkMode() ? 'dark' : 'light', DEFAULT_FALLBACK)
}

const fontSans = ref(loadFonts().fontSans)
const fontSerif = ref(loadFonts().fontSerif)
const fontMono = ref(loadFonts().fontMono)

/** 当前主题的样式集合（/dark 二选一） */
function themeStyles(): Record<string, string | undefined> {
  const theme = themes[themeIndex.value] as unknown as { styles?: { light?: Record<string, string>; dark?: Record<string, string> } } | undefined
  const block = isDarkMode() ? theme?.styles?.dark : theme?.styles?.light
  return block ?? {}
}

/** 当前生效的圆角与排版（跟随主题时从当前主题色板取值） */
const effectiveLayout = computed(() => {
  const preset = LAYOUT_PRESETS.find(p => p.key === layoutKey.value) ?? LAYOUT_PRESETS[0]
  if (preset.key !== 'theme') return preset
  const t = themeStyles()
  return {
    ...preset,
    radius: t.radius ?? '0.5rem',
    spacing: t.spacing ?? '0.24rem',
    letterSpacing: t['letter-spacing'] ?? t['tracking-normal'] ?? '0em',
  }
})

/** 当前生效的阴影（跟随主题时从当前主题色板取值） */
const effectiveShadow = computed(() => {
  const preset = SHADOW_PRESETS.find(p => p.key === shadowKey.value) ?? SHADOW_PRESETS[0]
  if (preset.key !== 'theme') return preset
  const t = themeStyles()
  return {
    ...preset,
    color: t['shadow-color'] ?? 'hsl(0 0% 0%)',
    opacity: t['shadow-opacity'] ?? '0',
    blur: t['shadow-blur'] ?? '0px',
    spread: t['shadow-spread'] ?? '0px',
    offsetX: t['shadow-offset-x'] ?? '0px',
    offsetY: t['shadow-offset-y'] ?? '0px',
  }
})

/** 把 style-* class 应用到 documentElement（全站切面），幂等避免 MutationObserver 死循环 */
function applyStyle() {
  const el = document.documentElement
  const target = `style-${styleKey.value.replace('reka-', '')}`
  if (el.classList.contains(target)) return
  el.classList.remove(...STYLE_OPTIONS.map(o => `style-${o.value.replace('reka-', '')}`))
  el.classList.add(target)
}

/** 应用字体 / 圆角 / 阴影到 documentElement */
function applyLayout() {
  const el = document.documentElement
  const layout = effectiveLayout.value
  const shadow = effectiveShadow.value

  // 字体
  el.style.setProperty('--font-sans', fontSans.value)
  el.style.setProperty('--font-serif', fontSerif.value)
  el.style.setProperty('--font-mono', fontMono.value)

  // 圆角
  ;[
    '--radius-xs', '--radius-sm', '--radius-md', '--radius-lg',
    '--radius-xl', '--radius-2xl', '--radius-3xl', '--radius',
  ].forEach(k => el.style.removeProperty(k))
  if (layout.radius) {
    const r = (mult: number) => `calc(${layout.radius} * ${mult})`
    el.style.setProperty('--radius-xs', r(0.33))
    el.style.setProperty('--radius-sm', r(0.67))
    el.style.setProperty('--radius-md', r(1))
    el.style.setProperty('--radius-lg', r(1.33))
    el.style.setProperty('--radius-xl', r(2))
    el.style.setProperty('--radius-2xl', r(2.67))
    el.style.setProperty('--radius-3xl', r(4))
    el.style.setProperty('--radius', layout.radius)
  }

  // 阴影
  const opacityPercent = Math.round(Math.max(0, Math.min(1, Number.parseFloat(shadow.opacity) || 0)) * 100)
  const token = `${shadow.offsetX} ${shadow.offsetY} ${shadow.blur} ${shadow.spread} color-mix(in srgb, ${shadow.color} ${opacityPercent}%, transparent)`
  ;[
    '--shadow-2xs', '--shadow-xs', '--shadow-sm', '--shadow',
    '--shadow-md', '--shadow-lg', '--shadow-xl', '--shadow-2xl',
  ].forEach(k => el.style.removeProperty(k))
  if (shadow.key !== 'none') {
    ;['--shadow-2xs', '--shadow-xs', '--shadow-sm', '--shadow', '--shadow-md', '--shadow-lg', '--shadow-xl', '--shadow-2xl'].forEach(k => {
      el.style.setProperty(k, token)
    })
  }
}

function apply() {
  applyStyle()
  applyLayout()
}

function persistFonts() {
  localStorage.setItem(FONT_STORAGE_KEY, JSON.stringify({ fontSans: fontSans.value, fontSerif: fontSerif.value, fontMono: fontMono.value }))
}

/** 当前主题在当前亮/暗模式下的字体 */
function themeFontsNow() {
  return getThemeFonts(themes, themeIndex.value, isDarkMode() ? 'dark' : 'light', DEFAULT_FALLBACK)
}

/** 某套风格（设计系统）的正文字体 */
function styleFontOf(key: string) {
  return STYLE_FONTS[key] ?? DEFAULT_STYLE_FONT
}

/**
 * 字体维度的三个来源（优先级由「谁最后被操作」决定，都是并列的一等选项）：
 * - 切换主题 → 三档字体全部跟随主题（applyThemeFonts）
 * - 切换风格 → 正文字体跟随该设计系统，标题/等宽仍取当前主题（applyStyleFonts）
 * - 手动选字体 → 只改该档（setFonts）
 */
function applyThemeFonts() {
  const t = themeFontsNow()
  fontSans.value = t.fontSans
  fontSerif.value = t.fontSerif
  fontMono.value = t.fontMono
  persistFonts()
  apply()
}

function applyStyleFonts(key: string) {
  const t = themeFontsNow()
  fontSans.value = styleFontOf(key)
  fontSerif.value = t.fontSerif
  fontMono.value = t.fontMono
  persistFonts()
  apply()
}

/** 全局样式定制状态（复用 random-ui 现成面板能力，作用于整站） */
export function useGlobalStyle() {
  const setStyle = (s: string) => {
    styleKey.value = s as StyleKey
    localStorage.setItem(STYLE_STORAGE_KEY, s)
    // 风格自带字体：设计系统只定义正文那一档，故只覆盖 --font-sans
    applyStyleFonts(s)
  }
  const setLayout = (key: string) => {
    layoutKey.value = key as LayoutPresetKey
    localStorage.setItem(LAYOUT_STORAGE_KEY, key)
    apply()
  }
  const setShadow = (key: string) => {
    shadowKey.value = key as ShadowPresetKey
    localStorage.setItem(SHADOW_STORAGE_KEY, key)
    apply()
  }
  const setIconLibrary = (lib: string) => {
    iconLibrary.value = lib
    localStorage.setItem(ICON_STORAGE_KEY, lib)
  }
  const setFonts = (fonts: { fontSans: string; fontSerif: string; fontMono: string }) => {
    fontSans.value = fonts.fontSans
    fontSerif.value = fonts.fontSerif
    fontMono.value = fonts.fontMono
    persistFonts()
    apply()
  }
  const reset = () => {
    setLayout('theme')
    setShadow('theme')
    setIconLibrary('lucide')
    // 字体回到「当前风格 + 当前主题」的默认组合（清掉手动选择的痕迹）
    applyStyleFonts(styleKey.value)
  }
  const randomize = () => {
    // setStyle 内部已把正文字体换成该风格的字体，故后面不再单独设字体
    setStyle(STYLE_OPTIONS[Math.floor(Math.random() * STYLE_OPTIONS.length)].value)
    setLayout(LAYOUT_PRESETS[Math.floor(Math.random() * LAYOUT_PRESETS.length)].key)
    setShadow(SHADOW_PRESETS[Math.floor(Math.random() * SHADOW_PRESETS.length)].key)
    setIconLibrary(ICON_LIBRARY_OPTIONS[Math.floor(Math.random() * ICON_LIBRARY_OPTIONS.length)].value)
  }
  return {
    styleKey, layoutKey, shadowKey, iconLibrary,
    fontSans, fontSerif, fontMono,
    sansFontOptions, serifFontOptions, monoFontOptions,
    effectiveLayout, effectiveShadow,
    setStyle, setLayout, setShadow, setIconLibrary, setFonts,
    reset, randomize,
  }
}

// 模块加载时应用一次
apply()

// 联动 1：主题索引变化时，重算「跟随主题」的圆角 / 阴影，并让三档字体跟随主题
watch(themeIndex, () => {
  applyThemeFonts()
})

const darkObserver = new MutationObserver(() => apply())
darkObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class'],
})
