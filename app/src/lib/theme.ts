import { ref } from 'vue'
import themesData from '@/random-ui/config/themes.json'

// 主题结构（与 random-ui/config/themes.json 一致）
export interface Theme {
  label: string
  label_zh?: string
  styles?: {
    light?: Record<string, string>
    dark?: Record<string, string>
  }
}

// 主题里需要映射成 Tailwind --color-* 变量的颜色 token
const COLOR_KEYS = [
  'background', 'foreground',
  'card', 'card-foreground',
  'popover', 'popover-foreground',
  'primary', 'primary-foreground',
  'secondary', 'secondary-foreground',
  'muted', 'muted-foreground',
  'accent', 'accent-foreground',
  'destructive', 'destructive-foreground',
  'border', 'input', 'ring',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'sidebar', 'sidebar-foreground',
  'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground',
  'sidebar-border', 'sidebar-ring',
]

export const THEMES = themesData as unknown as Theme[]

const STORAGE_KEY = 'app-global-theme-index'
const STYLE_ID = 'app-global-theme'

const index = ref(Number(localStorage.getItem(STORAGE_KEY)) || 0)

/** 把主题的 light / dark 色板转成一段 CSS：:root 放 light，.dark 放 dark */
function buildCss(theme: Theme): string {
  const light = theme.styles?.light ?? {}
  const dark = theme.styles?.dark ?? {}
  let root = ':root{'
  for (const k of COLOR_KEYS) if (light[k]) root += `--color-${k}:${light[k]};`
  root += '}'
  let darkBlock = '.dark{'
  for (const k of COLOR_KEYS) if (dark[k]) darkBlock += `--color-${k}:${dark[k]};`
  darkBlock += '}'
  return root + darkBlock
}

/** 把当前主题写入一个动态 <style>，全局生效 */
function apply() {
  const theme = THEMES[index.value] ?? THEMES[0]
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    document.head.appendChild(el)
  }
  el.textContent = buildCss(theme)
}

/** 全局主题状态 */
export function useGlobalTheme() {
  const setIndex = (i: number) => {
    index.value = i
    localStorage.setItem(STORAGE_KEY, String(i))
    apply()
  }
  return { themes: THEMES, index, setIndex }
}

// 初始应用（module 加载时，DOM 已就绪）
apply()
