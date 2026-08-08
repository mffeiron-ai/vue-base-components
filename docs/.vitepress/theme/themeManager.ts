import { ref, computed, onMounted } from 'vue'
import themesData from './themes.json'
import { webStorage } from '@/lib/storage'

// 主题样式接口
export interface ThemeStyles {
  background: string
  foreground: string
  card: string
  'card-foreground': string
  popover: string
  'popover-foreground': string
  primary: string
  'primary-foreground': string
  secondary: string
  'secondary-foreground': string
  muted: string
  'muted-foreground': string
  accent: string
  'accent-foreground': string
  destructive: string
  'destructive-foreground': string
  border: string
  input: string
  ring: string
  'chart-1': string
  'chart-2': string
  'chart-3': string
  'chart-4': string
  'chart-5': string
  radius: string
  sidebar: string
  'sidebar-foreground': string
  'sidebar-primary': string
  'sidebar-primary-foreground': string
  'sidebar-accent': string
  'sidebar-accent-foreground': string
  'sidebar-border': string
  'sidebar-ring': string
  'font-sans'?: string
  'font-serif'?: string
  'font-mono'?: string
  'shadow-color'?: string
  'shadow-opacity'?: string
  'shadow-blur'?: string
  'shadow-spread'?: string
  'shadow-offset-x'?: string
  'shadow-offset-y'?: string
  'letter-spacing'?: string
  spacing?: string
  'tracking-normal'?: string
  [key: string]: string | undefined
}

// 主题配置接口
export interface ThemeConfig {
  label: string
  label_zh?: string
  createdAt?: string
  styles: {
    light: ThemeStyles
    dark: ThemeStyles
  }
}

// 预设字体配置接口
export type ThemeFontToken = 'font-sans' | 'font-serif' | 'font-mono'

// 组件和模块缓存
export type ThemeFontValues = {
  fontSans: string
  fontSerif: string
  fontMono: string
}

// 收集所有主题中指定字体类型的唯一值，并排序
export function collectUniqueThemeFontValues(themes: ThemeConfig[], token: ThemeFontToken) {
  const values = new Set<string>()

  themes.forEach((theme) => {
    if (!theme?.styles) return
    const lightValue = theme.styles.light?.[token]
    const darkValue = theme.styles.dark?.[token]
    if (lightValue) values.add(lightValue)
    if (darkValue) values.add(darkValue)
  })

  return Array.from(values).sort((first, second) => first.localeCompare(second))
}

// 获取指定主题和模式下的字体配置，若未定义则返回预设默认值
export function getThemeFonts(
  themes: ThemeConfig[],
  themeIndex: number,
  mode: 'light' | 'dark',
  fallbackFonts?: Partial<ThemeFontValues>,
): ThemeFontValues {
  const theme = themes[themeIndex] ?? themes[0]
  const styles = theme?.styles?.[mode] ?? ({} as ThemeStyles)

  return {
    fontSans: styles['font-sans'] ?? fallbackFonts?.fontSans ?? 'Inter, sans-serif',
    fontSerif: styles['font-serif'] ?? fallbackFonts?.fontSerif ?? 'Georgia, serif',
    fontMono: styles['font-mono'] ?? fallbackFonts?.fontMono ?? 'JetBrains Mono, monospace',
  }
}

// 主题管理器
export class ThemeManager {
  private themes: ThemeConfig[] = themesData as unknown as ThemeConfig[]
  private currentThemeIndex = ref(0)
  private isDark = ref(false)
  private storageKey = 'DefineTheme-theme-config'

  constructor() {
    this.loadFromStorage()
    this.watchSystemTheme()
  }

  // 获取所有主题
  getThemes() {
    return this.themes
  }

  // 获取当前主题
  getCurrentTheme() {
    return computed(() => this.themes[this.currentThemeIndex.value] || this.themes[0])
  }

  // 获取当前主题索引
  getCurrentThemeIndex() {
    return computed(() => this.currentThemeIndex.value)
  }

  // 获取暗色模式状态
  getIsDark() {
    return computed(() => this.isDark.value)
  }

  // 设置主题
  setTheme(index: number) {
    if (index >= 0 && index < this.themes.length) {
      this.currentThemeIndex.value = index
      this.applyTheme()
      this.saveToStorage()
    }
  }

  // 切换暗色模式
  toggleDark() {
    this.isDark.value = !this.isDark.value
    this.applyTheme()
    this.saveToStorage()
  }

  // 设置暗色模式
  setDark(dark: boolean) {
    this.isDark.value = dark
    this.applyTheme()
    this.saveToStorage()
  }

  // 应用主题到DOM - 只作用于 SideBar07 组件
  private applyTheme() {
    const theme = this.getCurrentTheme().value
    if (!theme?.styles) return
    const mode = this.isDark.value ? 'dark' : 'light'
    const styles = theme.styles[mode]
    if (!styles) return

    // 调试日志
    console.log('Applying SideBar07 theme:', theme.label, 'mode:', mode)
    console.log('Font styles:', {
      'font-sans': styles['font-sans'],
      'font-serif': styles['font-serif'],
      'font-mono': styles['font-mono']
    })

    // 只获取 SideBar07 作用域的元素
    const scopeElements = document.querySelectorAll('.backend-sidebar-theme-scope')
    
    // 应用到 SideBar07 作用域元素
    scopeElements.forEach(element => {
      // 设置暗色模式类
      if (this.isDark.value) {
        element.classList.add('dark')
      } else {
        element.classList.remove('dark')
      }

      // 应用CSS变量
      Object.entries(styles).forEach(([key, value]) => {
        // 跳过undefined值
        if (value === undefined) return
        
        if (key.startsWith('font-') || key === 'radius' || key.includes('shadow') || key.includes('spacing') || key.includes('tracking')) {
          // 处理特殊属性
          ;(element as HTMLElement).style.setProperty(`--${key}`, value)
          console.log(`Set SideBar07 ${key} to ${value}`)
        } else {
          // 处理颜色变量
          ;(element as HTMLElement).style.setProperty(`--${key}`, this.convertToHsl(value))
        }
      })
    })
  }

  // 转换颜色格式为HSL（如果需要）
  private convertToHsl(color: string): string {
    // 如果已经是HSL格式，直接返回
    if (color.includes('hsl') || color.includes('oklch')) {
      return color
    }

    // 如果是十六进制颜色，转换为HSL
    if (color.startsWith('#')) {
      return this.hexToHsl(color)
    }

    // 其他格式直接返回
    return color
  }

  // 十六进制转HSL
  private hexToHsl(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`
  }

  // 监听系统主题变化
  private watchSystemTheme() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        // 只有在用户没有手动设置时才跟随系统
        const stored = webStorage.getItem(this.storageKey)
        if (!stored) {
          this.setDark(e.matches)
        }
      }

      mediaQuery.addEventListener('change', handleChange)
      
      // 初始检查
      const stored = webStorage.getItem(this.storageKey)
      if (!stored) {
        this.setDark(mediaQuery.matches)
      }
    }
  }

  // 从本地存储加载配置
  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const config = webStorage.getJSON<{ themeIndex?: number; isDark?: boolean } | null>(this.storageKey, null)
        if (config) {
          this.currentThemeIndex.value = config.themeIndex || 0
          this.isDark.value = config.isDark || false
        }
      } catch (error) {
        console.warn('Failed to load theme config from storage:', error)
      }
    }
  }

  // 保存配置到本地存储
  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        const config = {
          themeIndex: this.currentThemeIndex.value,
          isDark: this.isDark.value
        }
        webStorage.setJSON(this.storageKey, config)
      } catch (error) {
        console.warn('Failed to save theme config to storage:', error)
      }
    }
  }

  // 重新应用主题（公共方法）
  reapplyTheme() {
    this.applyTheme()
  }

  // 初始化主题
  init() {
    this.applyTheme()
  }
}

// 创建全局主题管理器实例
export const themeManager = new ThemeManager()

// 初始化主题管理器并提供组合式函数供组件使用
export function useDefineThemeTheme() {
  onMounted(() => {
    themeManager.init()
  })

  return {
    // 获取当前可选主题
    themes: themeManager.getThemes(),
    // 获取当前主题、索引和暗色模式状态
    currentTheme: themeManager.getCurrentTheme(),
    currentThemeIndex: themeManager.getCurrentThemeIndex(),
    isDark: themeManager.getIsDark(),
    // 设置主题、切换暗色模式、设置暗色模式状态和重新应用主题的方法
    setTheme: (index: number) => themeManager.setTheme(index),
    toggleDark: () => themeManager.toggleDark(),
    setDark: (dark: boolean) => themeManager.setDark(dark),
    reapplyTheme: () => themeManager.reapplyTheme()
  }
}