import themeRegistryData from './themes.json'
export {
  DEFAULT_RANDOM_UI_PREVIEW_CATEGORY,
  getRandomUiPreviewCategory,
  RANDOM_UI_PREVIEW_CATEGORIES,
  RANDOM_UI_PREVIEW_CATEGORY_OPTIONS,
} from '../preview-categories'
export type {
  RandomUiPreviewCategory,
  RandomUiPreviewCategoryKey,
} from '../preview-categories'

// 暴露变量：主题模式
export type ThemeMode = 'light' | 'dark'

// 暴露变量：设计系统配置项类型
export type StyleKey = 'reka-nova' | 'reka-luma' | 'reka-lyra' | 'reka-maia' | 'reka-mira' | 'reka-vega'

// 暴露变量：布局和阴影预设类型
export type LayoutPresetKey = 'theme' | 'compact' | 'balanced' | 'airy' | 'rounded' | 'editorial'

// 暴露变量：阴影预设类型
export type ShadowPresetKey = 'theme' | 'none' | 'soft' | 'standard' | 'strong' | 'dramatic'

// 暴露变量：布局和阴影预设数据结构
export type LayoutPreset = {
  key: LayoutPresetKey
  label: string
  radius: string
  spacing: string
  letterSpacing: string
}

 // 暴露变量：阴影预设数据结构
export type ShadowPreset = {
  key: ShadowPresetKey
  label: string
  color: string
  opacity: string
  blur: string
  spread: string
  offsetX: string
  offsetY: string
}
// 暴露变量：设计系统配置项类型
export const layoutPresets: LayoutPreset[] = [
  { key: 'theme', label: '跟随主题', radius: '', spacing: '', letterSpacing: '' },
  { key: 'compact', label: '紧凑', radius: '0.35rem', spacing: '0.18rem', letterSpacing: '-0.01em' },
  { key: 'balanced', label: '均衡', radius: '0.55rem', spacing: '0.24rem', letterSpacing: '0em' },
  { key: 'airy', label: '舒展', radius: '0.8rem', spacing: '0.32rem', letterSpacing: '0.005em' },
  { key: 'rounded', label: '柔和圆角', radius: '1.1rem', spacing: '0.28rem', letterSpacing: '0em' },
  { key: 'editorial', label: '编辑风', radius: '0.45rem', spacing: '0.26rem', letterSpacing: '0.012em' },
]

export type IconLibraryOptionValue = 'lucide' | 'tabler' | 'hugeicons' | 'phosphor' | 'remixicon'

export const iconLibraryOptions: Array<{ value: IconLibraryOptionValue, label: string }> = [
  { value: 'lucide', label: 'Lucide' },
  { value: 'tabler', label: 'Tabler Icons' },
  { value: 'hugeicons', label: 'HugeIcons' },
  { value: 'phosphor', label: 'Phosphor Icons' },
  { value: 'remixicon', label: 'Remix Icons' },
]

// 暴露变量：阴影预设数据结构
export const shadowPresets: ShadowPreset[] = [
  { key: 'theme', label: '跟随主题', color: '', opacity: '', blur: '', spread: '', offsetX: '', offsetY: '' },
  { key: 'none', label: '无阴影', color: 'hsl(0 0% 0%)', opacity: '0', blur: '0px', spread: '0px', offsetX: '0px', offsetY: '0px' },
  { key: 'soft', label: '轻柔', color: 'hsl(0 0% 0%)', opacity: '0.12', blur: '8px', spread: '-1px', offsetX: '0px', offsetY: '3px' },
  { key: 'standard', label: '标准', color: 'hsl(0 0% 0%)', opacity: '0.18', blur: '14px', spread: '-2px', offsetX: '0px', offsetY: '6px' },
  { key: 'strong', label: '明显', color: 'hsl(0 0% 0%)', opacity: '0.26', blur: '18px', spread: '-2px', offsetX: '0px', offsetY: '9px' },
  { key: 'dramatic', label: '戏剧化', color: 'hsl(0 0% 0%)', opacity: '0.34', blur: '24px', spread: '-4px', offsetX: '0px', offsetY: '12px' },
]

// 暴露变量：设计系统配置项数据结构
export const styleOptions: Array<{ value: StyleKey, label: string }> = [
  { value: 'reka-nova', label: 'Nova' },
  { value: 'reka-luma', label: 'Luma' },
  { value: 'reka-lyra', label: 'Lyra' },
  { value: 'reka-maia', label: 'Maia' },
  { value: 'reka-mira', label: 'Mira' },
  { value: 'reka-vega', label: 'Vega' },
] 

// 本地定义 icon libraries（替代 shadcn-vue/icons）

type CssVarsByMode = {
  light?: Record<string, string | undefined>
  dark?: Record<string, string | undefined>
}

type ThemeRegistryItem = {
  label?: string
  label_zh?: string
  styles?: CssVarsByMode
}

function toKebabName(input: string, index: number): string {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return normalized || `theme-${index + 1}`
}

const THEME_REGISTRY: ThemeRegistryItem[] = (themeRegistryData as ThemeRegistryItem[])

export type IconLibrary = 'lucide' | 'heroicons' | 'radix-icons' | 'hugeicons'
export type IconLibraryName = IconLibrary

export const iconLibraries: Record<IconLibraryName, { name: string }> = {
  lucide: { name: 'Lucide' },
  heroicons: { name: 'Heroicons' },
  'radix-icons': { name: 'Radix Icons' },
  hugeicons: { name: 'Hugeicons' },
}

// 本地定义数据结构（替代 @/registry/*）
export type Base = { name: string, title: string, meta?: { logo?: string } }
export type Style = { name: string, title: string }
export type Theme = { name: string, title: string, cssVars?: CssVarsByMode }
export type BaseColor = { name: string, title: string, cssVars?: CssVarsByMode }

export const BASES: Base[] = [
  { name: 'reka', title: 'Reka' },
]

export const STYLES: Style[] = [
  { name: 'vega', title: 'Vega' },
  { name: 'nova', title: 'Nova' },
  { name: 'maia', title: 'Maia' },
  { name: 'lyra', title: 'Lyra' },
  { name: 'mira', title: 'Mira' },
  { name: 'luma', title: 'Luma' },
]

export const THEMES: Theme[] = THEME_REGISTRY.map((theme, index) => ({
  name: toKebabName(theme.label ?? theme.label_zh ?? '', index),
  title: theme.label_zh ?? theme.label ?? `主题 ${index + 1}`,
  cssVars: theme.styles,
}))

export const BASE_COLORS: BaseColor[] = THEME_REGISTRY.map((theme, index) => ({
  name: toKebabName(theme.label ?? theme.label_zh ?? '', index),
  title: theme.label_zh ?? theme.label ?? `主题 ${index + 1}`,
  cssVars: theme.styles,
}))

export const fonts: any[] = []

// 类型别名
export type BaseName = Base["name"]
export type StyleName = Style["name"]
export type ThemeName = Theme["name"]
export type BaseColorName = BaseColor["name"]

const SHADCN_VERSION = "latest"

export function getThemesForBaseColor(_baseColorName: string): Theme[] {
  return THEMES
}

// Derive font values from registry fonts (e.g., "font-inter" -> "inter").
const fontValues = fonts.map(f => f.name.replace("font-", "")) as [
  string,
  ...string[],
]

export type FontValue = (typeof fontValues)[number]

export const MENU_ACCENTS = [
  { value: "subtle", label: "柔和" },
  { value: "bold", label: "强调" },
] as const

export type MenuAccent = (typeof MENU_ACCENTS)[number]
export type MenuAccentValue = MenuAccent["value"]

export const MENU_COLORS = [
  { value: "default", label: "默认 / 实色" },
  { value: "default-translucent", label: "默认 / 半透明" },
  { value: "inverted", label: "反转 / 实色" },
  { value: "inverted-translucent", label: "反转 / 半透明" },
] as const

export type MenuColor = (typeof MENU_COLORS)[number]

export type MenuColorValue = MenuColor["value"]

export function isTranslucentMenuColor(menuColor?: MenuColorValue | null): menuColor is "default-translucent" | "inverted-translucent" {
  return menuColor === "default-translucent" || menuColor === "inverted-translucent"
}

export const RADII = [
  { name: "default", label: "默认", value: "" },
  { name: "none", label: "无", value: "0" },
  { name: "small", label: "小", value: "0.45rem" },
  { name: "medium", label: "中", value: "0.625rem" },
  { name: "large", label: "大", value: "0.875rem" },
] as const

export type Radius = (typeof RADII)[number]

export type RadiusValue = Radius["name"]

// 本地定义 schema 类型（替代 zod）
export interface DesignSystemConfig {
  base: BaseName
  style: StyleName
  theme: ThemeName
  baseColor: BaseColorName
  iconLibrary: IconLibraryName
  font: FontValue
  fontHeading: string
  item?: string
  menuAccent: MenuAccentValue
  menuColor: MenuColorValue
  radius: RadiusValue
  template?: "nuxt" | "vite" | "laravel" | "astro"
}

// 验证函数
export function validateDesignSystemConfig(data: any): data is DesignSystemConfig {
  if (!data) return false
  
  const baseNames = BASES.map(b => b.name)
  const styleNames = STYLES.map(s => s.name)
  const baseColorNames = BASE_COLORS.map(c => c.name)
  const themeNames = THEMES.map(t => t.name)
  const menuAccentValues = MENU_ACCENTS.map(m => m.value)
  const menuColorValues = MENU_COLORS.map(m => m.value)
  const radiusValues = RADII.map(r => r.name)
  
  return (
    baseNames.includes(data.base) &&
    styleNames.includes(data.style) &&
    baseColorNames.includes(data.baseColor) &&
    themeNames.includes(data.theme) &&
    Object.keys(iconLibraries).includes(data.iconLibrary) &&
    menuAccentValues.includes(data.menuAccent) &&
    menuColorValues.includes(data.menuColor) &&
    radiusValues.includes(data.radius)
  )
}

const DEFAULT_THEME_NAME = (THEMES[0]?.name ?? "theme-1") as ThemeName
const DEFAULT_BASE_COLOR_NAME = (BASE_COLORS[0]?.name ?? "theme-1") as BaseColorName

export const DEFAULT_CONFIG: DesignSystemConfig = {
  base: "reka",
  style: "nova",
  baseColor: DEFAULT_BASE_COLOR_NAME,
  theme: DEFAULT_THEME_NAME,
  iconLibrary: "lucide",
  font: "inter",
  fontHeading: "inherit",
  item: "preview02",
  menuAccent: "subtle",
  menuColor: "default",
  radius: "default",
  template: "nuxt",
}

export type Preset = {
  name: string
  title: string
  description: string
} & DesignSystemConfig

export const PRESETS: Preset[] = [
  {
    name: "reka-vega",
    title: "Vega",
    description: "Vega / Lucide / Inter",
    base: "reka",
    style: "vega",
    baseColor: DEFAULT_BASE_COLOR_NAME,
    theme: DEFAULT_THEME_NAME,
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "reka-nova",
    title: "Nova",
    description: "Nova / Hugeicons / Inter",
    base: "reka",
    style: "nova",
    baseColor: DEFAULT_BASE_COLOR_NAME,
    theme: DEFAULT_THEME_NAME,
    iconLibrary: "hugeicons",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "reka-maia",
    title: "Maia",
    description: "Maia / Hugeicons / Figtree",
    base: "reka",
    style: "maia",
    baseColor: DEFAULT_BASE_COLOR_NAME,
    theme: DEFAULT_THEME_NAME,
    iconLibrary: "hugeicons",
    font: "figtree",
    fontHeading: "inherit",
    item: "Item",
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "reka-lyra",
    title: "Lyra",
    description: "Lyra / Hugeicons / JetBrains Mono",
    base: "reka",
    style: "lyra",
    baseColor: DEFAULT_BASE_COLOR_NAME,
    theme: DEFAULT_THEME_NAME,
    iconLibrary: "hugeicons",
    font: "jetbrains-mono",
    fontHeading: "inherit",
    item: "Item",
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "reka-mira",
    title: "Mira",
    description: "Mira / Hugeicons / Inter",
    base: "reka",
    style: "mira",
    baseColor: DEFAULT_BASE_COLOR_NAME,
    theme: DEFAULT_THEME_NAME,
    iconLibrary: "hugeicons",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
  {
    name: "reka-luma",
    title: "Luma",
    description: "Luma / Lucide / Inter",
    base: "reka",
    style: "luma",
    baseColor: DEFAULT_BASE_COLOR_NAME,
    theme: DEFAULT_THEME_NAME,
    iconLibrary: "lucide",
    font: "inter",
    fontHeading: "inherit",
    item: "Item",
    menuAccent: "subtle",
    menuColor: "default",
    radius: "default",
  },
]

export function getBase(name: BaseName) {
  return BASES.find(base => base.name === name)
}

export function getStyle(name: StyleName) {
  return STYLES.find(style => style.name === name)
}

export function getTheme(name: ThemeName) {
  return THEMES.find(theme => theme.name === name)
}

export function getBaseColor(name: BaseColorName) {
  return BASE_COLORS.find(color => color.name === name)
}

export function getIconLibrary(name: IconLibraryName) {
  return iconLibraries[name]
}

// Builds a registry:theme item from a design system config.
export function buildRegistryTheme(config: DesignSystemConfig) {
  const baseColor = getBaseColor(config.baseColor)
  const theme = getTheme(config.theme)

  if (!baseColor || !theme) {
    throw new Error(
      `Base color "${config.baseColor}" or theme "${config.theme}" not found`,
    )
  }

  // Merge base color and theme CSS vars.
  const lightVars: Record<string, string> = {
    ...(baseColor.cssVars?.light as Record<string, string>),
    ...(theme.cssVars?.light as Record<string, string>),
  }
  const darkVars: Record<string, string> = {
    ...(baseColor.cssVars?.dark as Record<string, string>),
    ...(theme.cssVars?.dark as Record<string, string>),
  }
  const themeVars: Record<string, string> = {}

  // Apply menu accent transformation.
  if (config.menuAccent === "bold") {
    lightVars.accent = lightVars.primary!
    lightVars["accent-foreground"] = lightVars["primary-foreground"]!
    darkVars.accent = darkVars.primary!
    darkVars["accent-foreground"] = darkVars["primary-foreground"]!
    lightVars["sidebar-accent"] = lightVars.primary!
    lightVars["sidebar-accent-foreground"] = lightVars["primary-foreground"]!
    darkVars["sidebar-accent"] = darkVars.primary!
    darkVars["sidebar-accent-foreground"] = darkVars["primary-foreground"]!
  }

  // Apply radius transformation.
  if (config.radius && config.radius !== "default") {
    const radius = RADII.find(r => r.name === config.radius)
    if (radius && radius.value) {
      lightVars.radius = radius.value
    }
  }

  return {
    name: `${config.baseColor}-${config.theme}`,
    type: "registry:theme" as const,
    cssVars: {
      theme: Object.keys(themeVars).length > 0 ? themeVars : undefined,
      light: lightVars,
      dark: darkVars,
    },
  }
}

// Builds a registry:base item from a design system config.
export function buildRegistryBase(
  config: DesignSystemConfig & { rtl?: boolean },
) {
  const baseItem = getBase(config.base)
  const iconLibraryItem = getIconLibrary(config.iconLibrary)

  // Mirrors shadcn-ui: if a user picked the same font for heading and body,
  // collapse to "inherit" so we don't emit a redundant --font-heading var
  // that's just an alias of --font-sans.
  const normalizedFontHeading
    = config.fontHeading === config.font ? "inherit" : config.fontHeading

  if (!baseItem || !iconLibraryItem) {
    throw new Error(
      `Base "${config.base}" or icon library "${config.iconLibrary}" not found`,
    )
  }

  const registryTheme = buildRegistryTheme(config)

  // Build dependencies.
  const dependencies = [
    `shadcn-vue@${SHADCN_VERSION}`,
    "class-variance-authority",
    "tw-animate-css",
    ...(baseItem && "dependencies" in baseItem && Array.isArray(baseItem.dependencies) ? baseItem.dependencies : []),
    ...(iconLibraryItem && "packages" in iconLibraryItem && Array.isArray(iconLibraryItem.packages) ? iconLibraryItem.packages : []),
  ]

  // Fonts are applied CLI-side via getFontImport(config.font) from the
  // local FONTS constant — shadcn-vue's registry does not publish font-*
  // items, so we intentionally do not add them as registryDependencies.
  const registryDependencies = ["utils"]

  // Resolve font metadata from the web registry so the emitted
  // registry:base item carries both the @theme CSS variable and a body rule
  // that actually applies the font — the CLI's addFontImportPlugin only
  // handles the Google Fonts @import url(...) line.
  const fontItem = fonts.find(f => f.name === `font-${config.font}`)
  const fontHeadingItem
    = normalizedFontHeading !== "inherit"
      ? fonts.find(f => f.name === `font-${normalizedFontHeading}`)
      : undefined

  const themeVars: Record<string, string> = {
    ...(registryTheme.cssVars?.theme as Record<string, string> | undefined),
  }
  const bodyRules: Record<string, Record<string, unknown>> = {
    "@apply bg-background text-foreground": {},
  }
  if (fontItem) {
    themeVars[fontItem.font.variable] = fontItem.font.family
    // Map the font's target variable to a Tailwind utility class.
    // shadcn-vue fonts all target --font-sans today (jetbrains-mono included),
    // but we handle --font-mono / --font-serif for future-proofing.
    const applyClass
      = fontItem.font.variable === "--font-mono"
        ? "font-mono"
        : fontItem.font.variable === "--font-serif"
          ? "font-serif"
          : "font-sans"
    bodyRules[`@apply ${applyClass}`] = {}
  }

  // Emit --font-heading so the Tailwind v4 `font-heading` utility is wired
  // up. When fontHeading is "inherit" (default) we alias it to the body
  // font's CSS variable; otherwise we resolve the heading font's family
  // from the web registry and emit it literally. The heading font's Google
  // Fonts @import is pulled in CLI-side by addFontImportPlugin (see
  // add-components.ts) via `config.fontHeading`.
  if (normalizedFontHeading === "inherit") {
    themeVars["--font-heading"] = `var(${fontItem?.font.variable ?? "--font-sans"})`
  }
  else if (fontHeadingItem) {
    themeVars["--font-heading"] = fontHeadingItem.font.family
  }

  return {
    name: `${config.base}-${config.style}`,
    extends: "none",
    type: "registry:base" as const,
    config: {
      style: `${config.base}-${config.style}`,
      iconLibrary: iconLibraryItem.name,
      font: config.font,
      // Only persist fontHeading when it's a real override, so projects
      // with the default ("inherit") don't gain a new components.json field.
      ...(normalizedFontHeading !== "inherit"
        && { fontHeading: normalizedFontHeading }),
      rtl: config.rtl ?? false,
      menuColor: config.menuColor,
      menuAccent: config.menuAccent,
      tailwind: {
        baseColor: config.baseColor,
      },
    },
    dependencies,
    registryDependencies,
    cssVars: {
      ...registryTheme.cssVars,
      theme: Object.keys(themeVars).length > 0 ? themeVars : undefined,
    },
    css: {
      "@import \"tw-animate-css\"": {},
      "@import \"shadcn-vue/tailwind.css\"": {},
      "@layer base": {
        "*": { "@apply border-border outline-ring/50": {} },
        "body": bodyRules,
      },
    },
  }
}
