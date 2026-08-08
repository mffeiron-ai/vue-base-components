<template>
    <div class="mx-auto flex h-[90vh] w-full gap-4 overflow-hidden rounded-2xl bg-background p-5">
      <div class="w-[20%] min-h-0 overflow-hidden">
        <div class="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-card">
          <div class="border-b border-border px-4 py-4">
            <div class="space-y-3 rounded-xl border border-primary/15 bg-gradient-to-br from-primary/8 via-background to-background p-4 shadow-sm">
              <div class="space-y-1">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">预览分类导航</p>
                <h3 class="text-base font-semibold tracking-tight">快速切换右侧预览内容</h3>
                <p class="text-xs leading-5 text-muted-foreground">支持搜索分类，右侧预览区只展示当前选中的一组组件。</p>
              </div>

              <Popover v-model:open="previewCategoryOpen">
                <PopoverTrigger as-child>
                  <Button variant="outline" class="h-auto w-full justify-between border-border/70 bg-background/90 px-4 py-3 text-left hover:bg-accent/40" :style="previewInteractiveStyle">
                    <div class="flex min-w-0 flex-1 flex-col items-start gap-1">
                      <div class="flex w-full items-center justify-between gap-3">
                        <span class="truncate text-sm font-semibold text-foreground">
                          {{ activePreviewCategoryOption?.label ?? '选择分类' }}
                        </span>
                        <span class="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">搜索</span>
                      </div>
                      <span class="line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {{ activePreviewCategoryOption?.description ?? '搜索并切换右侧预览分类' }}
                      </span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="搜索分类..." />
                    <CommandList>
                      <CommandEmpty>没有匹配的分类</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          v-for="option in RANDOM_UI_PREVIEW_CATEGORY_OPTIONS"
                          :key="option.value"
                          :value="`${option.label} ${option.description}`"
                          @select="() => selectPreviewCategory(option.value)"
                        >
                          <div class="flex min-w-0 flex-1 flex-col">
                            <span class="truncate font-medium">{{ option.label }}</span>
                            <span class="truncate text-xs text-muted-foreground">{{ option.description }}</span>
                          </div>
                          <span v-if="option.value === previewCategory" class="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">当前</span>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <div class="flex flex-wrap gap-2">
                <Badge
                  v-for="option in RANDOM_UI_PREVIEW_CATEGORY_OPTIONS"
                  :key="option.value"
                  class="cursor-pointer px-2.5 py-1 text-xs transition-colors"
                  :variant="option.value === previewCategory ? 'default' : 'outline'"
                  @click="selectPreviewCategory(option.value)"
                >
                  {{ option.label }}
                </Badge>
              </div>
            </div>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div class="space-y-4 pb-4">
              <div class="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                <div class="space-y-0.5">
                  <h3 class="text-sm font-semibold tracking-tight">预设主题</h3>
                  <p class="text-xs text-muted-foreground">点击主题名称，快速套用右侧预览的完整视觉方案。</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <Badge
                    v-for="(theme, index) in themeOptions"
                    :key="theme.label + index"
                    class="cursor-pointer px-2.5 py-1 text-xs"
                    @click="applyFullTheme(index)"
                    :variant="String(index) === customizer.themeIndex ? 'default' : 'outline'"
                    :style="previewBadgeStyle"
                  >
                    {{ theme.label_zh || theme.label }}
                  </Badge>
                </div>
                <Button
                  @click="toggleDark"
                  variant="default"
                  class="w-full cursor-pointer text-sm font-medium transition-opacity"
                  :style="previewInteractiveStyle"
                >
                  {{ isDark ? '切换到浅色模式' : '切换到深色模式' }}
                </Button>
              </div>

              <div class="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                <p class="text-sm font-semibold">风格基础</p>

                <div class="grid grid-cols-3 gap-3">
                <div class="space-y-2">
                <label class="text-sm font-medium text-foreground/90 block">Style</label>
                <Select v-model="customizer.style">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="选择风格" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="style in styleOptions" :key="style.value" :value="style.value">
                      {{ style.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground/90 block">主题色</label>
                <Select v-model="customizer.themeIndex">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="选择主题" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="(theme, index) in themeOptions" :key="theme.label + index" :value="String(index)">
                      {{ theme.label_zh || theme.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-foreground/90 block">图标库</label>
                <Select v-model="customizer.iconLibrary">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="选择图标库" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="icon in iconLibraryOptions" :key="icon.value" :value="icon.value">
                      {{ icon.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>
              </div>

              <div class="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                <p class="text-sm font-semibold">字体系统</p>

              <div class="grid grid-cols-1 gap-3">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground/90 block">正文字体</label>
                  <Select v-model="customizer.fontSans">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="正文字体" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="font in sansFontOptions" :key="font" :value="font">{{ font }}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground/90 block">标题字体</label>
                  <Select v-model="customizer.fontSerif">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="标题字体" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="font in serifFontOptions" :key="font" :value="font">{{ font }}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground/90 block">等宽字体</label>
                  <Select v-model="customizer.fontMono">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="等宽字体" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="font in monoFontOptions" :key="font" :value="font">{{ font }}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              </div>

              <div class="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                <p class="text-sm font-semibold">细节调节</p>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground/90 block">圆角与排版</label>
                  <Select v-model="customizer.layoutPreset">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="选择排版档位" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="preset in layoutPresets" :key="preset.key" :value="preset.key">
                        {{ preset.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground/90 block">阴影</label>
                  <Select v-model="customizer.shadowPreset">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="选择阴影档位" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="preset in shadowPresets" :key="preset.key" :value="preset.key">
                        {{ preset.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <Button variant="outline" @click="resetCustomizer" :style="previewInteractiveStyle">重置</Button>
                <Button variant="secondary" @click="randomizeCustomizer" :style="previewInteractiveStyle">随机</Button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="flex-1 overflow-auto">
        <div
          ref="previewScopeRef"
          class="backend-sidebar-theme-scope min-h-full rounded-xl border border-border bg-background text-foreground font-sans overflow-hidden"
          :class="previewStyleClass"
          :style="previewScopeStyle"
        >
          <div class="border-b border-border px-6 py-4 flex items-center justify-between" :style="previewHeaderStyle">
            <div class="flex items-center gap-3" :style="previewRowCompactStyle">
              <div class="size-8 bg-primary flex items-center justify-center" :style="previewIconStyle">
                <svg class="size-4 text-primary-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold">Design System Preview</p>
              </div>
            </div>
          </div>

          <PreviewPage :active-category="previewCategory" />
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">

import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'

// 以下ui
import {Badge} from '@/components/ui/badge'
import { Button} from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import PreviewPage from './page.vue'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select ,
  SelectContent ,
  SelectItem ,
  SelectTrigger ,
  SelectValue ,
} from '@/components/ui/select'

// 以下是主题管理相关的导入
import {setDesignSystemSearchParams,useDesignSystemSearchParams} from '@/components/useDesignSystemSearchParams'
import {collectUniqueThemeFontValues,getThemeFonts, useDefineThemeTheme, type ThemeConfig, type ThemeStyles,} from './themeManager'
import {
  DEFAULT_RANDOM_UI_PREVIEW_CATEGORY,
  RANDOM_UI_PREVIEW_CATEGORY_OPTIONS,
  layoutPresets,
  shadowPresets,
  styleOptions,
  iconLibraryOptions,
  type LayoutPresetKey,
  type RandomUiPreviewCategoryKey,
  type ShadowPresetKey,
  type StyleKey,
  type ThemeMode,
} from './config/config'

// 初始化主题管理器并提供组合式函数供组件使用
const {currentThemeIndex, isDark, themes, setTheme, toggleDark, reapplyTheme } = useDefineThemeTheme()

// 获取图标库和风格的 URL 搜索参数，并提供更新函数
const { iconLibrary: urlIconLibrary, style: urlStyle } = useDesignSystemSearchParams()

// 预览区域的 ref 和相关计算属性
const previewScopeRef = ref<HTMLElement | null>(null)
const previewCategoryOpen = ref(false)
const previewCategory = ref<RandomUiPreviewCategoryKey>(DEFAULT_RANDOM_UI_PREVIEW_CATEGORY)

  // 处理主题数据，兼容直接数组或响应式对象两种情况
const rawThemes = themes as unknown as ThemeConfig[] | { value: ThemeConfig[] }

// 计算可用的主题选项列表
const themeOptions = computed(() => Array.isArray(rawThemes) ? rawThemes : rawThemes.value)

// 计算当前主题的标签和样式
const currentMode = computed<ThemeMode>(() => (isDark.value ? 'dark' : 'light'))

// 获取指定主题和模式下的样式配置
function getThemeModeStyles(themeIndex = currentThemeIndex.value, mode = currentMode.value): ThemeStyles {
  const theme = themeOptions.value[themeIndex] ?? themeOptions.value[0]
  return theme?.styles?.[mode] ?? ({} as ThemeStyles)}

// 收集主题中所有唯一的字体选项
const sansFontOptions = computed(() => collectUniqueThemeFontValues(themeOptions.value, 'font-sans'))

// 计算衬线字体和等宽字体的选项列表
const serifFontOptions = computed(() => collectUniqueThemeFontValues(themeOptions.value, 'font-serif'))

// 计算等宽字体的选项列表
const monoFontOptions = computed(() => collectUniqueThemeFontValues(themeOptions.value, 'font-mono'))

// 计算字体的回退值，优先使用主题中的字体选项，如果没有则使用默认的系统字体
const fallbackFonts = computed(() => ({
  fontSans: sansFontOptions.value[0] ?? 'Inter, sans-serif',
  fontSerif: serifFontOptions.value[0] ?? 'Georgia, serif',
  fontMono: monoFontOptions.value[0] ?? 'JetBrains Mono, monospace',
}))

// 定义自定义设置的响应式对象，初始值来自 URL 搜索参数和当前主题的字体配置
const initialFonts = getThemeFonts(themeOptions.value, currentThemeIndex.value, currentMode.value, fallbackFonts.value)

// 定义自定义设置的响应式对象，初始值来自 URL 搜索参数和当前主题的字体配置
const customizer = reactive({
  style: (urlStyle.value ?? styleOptions[0].value) as StyleKey,
  themeIndex: String(currentThemeIndex.value),
  iconLibrary: urlIconLibrary.value ?? iconLibraryOptions[0].value,
  fontSans: initialFonts.fontSans,
  fontSerif: initialFonts.fontSerif,
  fontMono: initialFonts.fontMono,
  layoutPreset: 'theme' as LayoutPresetKey,
  shadowPreset: 'theme' as ShadowPresetKey,
})

// 计算当前选中的布局预设和阴影预设，如果没有匹配项则回退到默认值
const activeLayoutPreset = computed(() => {
  return layoutPresets.find(preset => preset.key === customizer.layoutPreset) ?? layoutPresets[0]
})

// 计算当前选中的阴影预设，如果没有匹配项则回退到默认值
const activeShadowPreset = computed(() => {
  return shadowPresets.find(preset => preset.key === customizer.shadowPreset) ?? shadowPresets[0]
})

const activePreviewCategoryOption = computed(() => {
  return RANDOM_UI_PREVIEW_CATEGORY_OPTIONS.find(option => option.value === previewCategory.value)
    ?? RANDOM_UI_PREVIEW_CATEGORY_OPTIONS[0]
})

function selectPreviewCategory(categoryKey: RandomUiPreviewCategoryKey) {
  previewCategory.value = categoryKey
  previewCategoryOpen.value = false
}

// 计算最终生效的布局预设和阴影预设，如果选择了「跟随主题」，则从当前主题的样式中提取对应的值
const effectiveLayoutPreset = computed(() => {
  const themeStyles = getThemeModeStyles(Number(customizer.themeIndex), currentMode.value)
  const activePreset = activeLayoutPreset.value
  if (activePreset.key !== 'theme') {
    return activePreset
  }
  return {
    key: 'theme' as LayoutPresetKey,
    label: '跟随主题',
    radius: themeStyles.radius ?? '0.5rem',
    spacing: themeStyles.spacing ?? '0.24rem',
    letterSpacing: themeStyles['letter-spacing'] ?? themeStyles['tracking-normal'] ?? '0em',
  }
})

// 计算最终生效的布局预设和阴影预设，如果选择了「跟随主题」，则从当前主题的样式中提取对应的值
const effectiveShadowPreset = computed(() => {
  const themeStyles = getThemeModeStyles(Number(customizer.themeIndex), currentMode.value)
  const activePreset = activeShadowPreset.value
  if (activePreset.key !== 'theme') {
    return activePreset
  }
  return {
    key: 'theme' as ShadowPresetKey,
    label: '跟随主题',
    color: themeStyles['shadow-color'] ?? 'hsl(0 0% 0%)',
    opacity: themeStyles['shadow-opacity'] ?? '0',
    blur: themeStyles['shadow-blur'] ?? '0px',
    spread: themeStyles['shadow-spread'] ?? '0px',
    offsetX: themeStyles['shadow-offset-x'] ?? '0px',
    offsetY: themeStyles['shadow-offset-y'] ?? '0px',
  }
})

// 计算预览区域的样式类，根据当前选择的风格生成对应的类名
const previewStyleClass = computed(() => `style-${customizer.style.replace('reka-', '')}`)

// 获取预览区域的作用域元素（优先使用 ref，回退到全局选择器）
function getPreviewScopeElement() {
  return previewScopeRef.value ?? document.querySelector<HTMLElement>('.backend-sidebar-theme-scope')
}

// 同步预览区域的暗色模式类
function syncPreviewDarkClass(dark: boolean) {
  const scope = getPreviewScopeElement()
  if (!scope) return
  if (dark) scope.classList.add('dark')
  else scope.classList.remove('dark')
}

// 应用布局和阴影预设的 CSS 变量覆盖
function applyPresetOverrides() {
  const scope = getPreviewScopeElement()
  if (!scope) return

  const layout = effectiveLayoutPreset.value
  const shadow = effectiveShadowPreset.value

  scope.style.setProperty('--font-sans', customizer.fontSans)
  scope.style.setProperty('--font-serif', customizer.fontSerif)
  scope.style.setProperty('--font-mono', customizer.fontMono)

  scope.style.setProperty('--radius', layout.radius)
  scope.style.setProperty('--spacing', layout.spacing)
  scope.style.setProperty('--letter-spacing', layout.letterSpacing)
  scope.style.setProperty('--tracking-normal', layout.letterSpacing)

  scope.style.setProperty('--shadow-color', shadow.color)
  scope.style.setProperty('--shadow-opacity', shadow.opacity)
  scope.style.setProperty('--shadow-blur', shadow.blur)
  scope.style.setProperty('--shadow-spread', shadow.spread)
  scope.style.setProperty('--shadow-offset-x', shadow.offsetX)
  scope.style.setProperty('--shadow-offset-y', shadow.offsetY)

  // 同步 Tailwind 阴影令牌，确保 preview 中使用 shadow-* 的组件可实时响应
  const shadowToken = previewShadowValue.value
  scope.style.setProperty('--shadow-x', shadow.offsetX)
  scope.style.setProperty('--shadow-y', shadow.offsetY)
  scope.style.setProperty('--shadow-2xs', shadowToken)
  scope.style.setProperty('--shadow-xs', shadowToken)
  scope.style.setProperty('--shadow-sm', shadowToken)
  scope.style.setProperty('--shadow', shadowToken)
  scope.style.setProperty('--shadow-md', shadowToken)
  scope.style.setProperty('--shadow-lg', shadowToken)
  scope.style.setProperty('--shadow-xl', shadowToken)
  scope.style.setProperty('--shadow-2xl', shadowToken)
}

// 清除预设覆盖的 CSS 变量
function clearPresetOverrides() {
  const scope = getPreviewScopeElement()
  if (!scope) return
  ;[
    '--font-sans',
    '--font-serif',
    '--font-mono',
    '--radius',
    '--spacing',
    '--letter-spacing',
    '--tracking-normal',
    '--shadow-color',
    '--shadow-opacity',
    '--shadow-blur',
    '--shadow-spread',
    '--shadow-offset-x',
    '--shadow-offset-y',
    '--shadow-x',
    '--shadow-y',
    '--shadow-2xs',
    '--shadow-xs',
    '--shadow-sm',
    '--shadow',
    '--shadow-md',
    '--shadow-lg',
    '--shadow-xl',
    '--shadow-2xl',
  ].forEach(cssVar => scope.style.removeProperty(cssVar))
}

// 标志位：区分「快捷主题完整切换」与「仅换主题色」
let pendingFullThemeSwitch = false

// 快捷主题点击：完整覆盖（颜色 + 字体 + 圆角/阴影回跟随主题）
function applyFullTheme(index: number) {
  pendingFullThemeSwitch = true
  customizer.themeIndex = String(index)
}

// 重置自定义设置为当前主题的默认值
function resetCustomizer() {
  const fonts = getThemeFonts(themeOptions.value, Number(customizer.themeIndex), currentMode.value, fallbackFonts.value)
  customizer.fontSans = fonts.fontSans
  customizer.fontSerif = fonts.fontSerif
  customizer.fontMono = fonts.fontMono
  customizer.layoutPreset = 'theme'
  customizer.shadowPreset = 'theme'
}

// 随机化自定义设置
function randomizeCustomizer() {
  customizer.style = styleOptions[Math.floor(Math.random() * styleOptions.length)].value
  const nextThemeIndex = Math.floor(Math.random() * themeOptions.value.length)
  customizer.themeIndex = String(nextThemeIndex)

  const fonts = getThemeFonts(themeOptions.value, nextThemeIndex, currentMode.value, fallbackFonts.value)
  customizer.fontSans = fonts.fontSans
  customizer.fontSerif = fonts.fontSerif
  customizer.fontMono = fonts.fontMono

  customizer.layoutPreset = layoutPresets[Math.floor(Math.random() * layoutPresets.length)].key
  customizer.shadowPreset = shadowPresets[Math.floor(Math.random() * shadowPresets.length)].key
  customizer.iconLibrary = iconLibraryOptions[Math.floor(Math.random() * iconLibraryOptions.length)].value
}

// 计算预览区域的阴影值，使用 CSS 的 color-mix 函数将阴影颜色与透明度混合
const previewShadowValue = computed(() => {
  const shadow = effectiveShadowPreset.value
  const opacityPercent = Math.round(Math.max(0, Math.min(1, Number.parseFloat(shadow.opacity))) * 100)
  return `${shadow.offsetX} ${shadow.offsetY} ${shadow.blur} ${shadow.spread} color-mix(in srgb, ${shadow.color} ${opacityPercent}%, transparent)`
})

// 计算预览区域的样式，使用 CSS 变量来动态调整圆角、阴影和字距
const previewScopeStyle = computed(() => ({
  '--preview-gap': `calc(${effectiveLayoutPreset.value.spacing} * 4)`,
  '--preview-gap-lg': `calc(${effectiveLayoutPreset.value.spacing} * 8)`,
  '--preview-radius': effectiveLayoutPreset.value.radius,
  '--preview-shadow': previewShadowValue.value,
  '--preview-letter-spacing': effectiveLayoutPreset.value.letterSpacing,
  letterSpacing: 'var(--preview-letter-spacing)',
}))

 // 计算预览区域的交互元素样式，基于当前选择的布局预设调整圆角、阴影和字距
const previewInteractiveStyle = computed(() => ({
  borderRadius: 'var(--preview-radius)',
  boxShadow: 'var(--preview-shadow)',
  letterSpacing: 'var(--preview-letter-spacing)',
}))

// 计算预览区域的徽章样式，基于当前选择的布局预设调整圆角、阴影和字距
const previewBadgeStyle = computed(() => ({
  borderRadius: 'calc(var(--preview-radius) * 999)',
  boxShadow: 'var(--preview-shadow)',
  letterSpacing: 'var(--preview-letter-spacing)',
}))

// 计算预览区域的标题样式，基于当前选择的布局预设调整字距
const previewHeaderStyle = computed(() => ({
  gap: 'var(--preview-gap)',
  letterSpacing: 'var(--preview-letter-spacing)',
}))

// 计算预览区域的图标样式，基于当前选择的布局预设调整圆角和阴影
const previewIconStyle = computed(() => ({
  borderRadius: 'calc(var(--preview-radius) * 0.9)',
  boxShadow: 'var(--preview-shadow)',
}))

// 计算预览区域的行间距样式，基于当前选择的布局预设调整行间距
const previewRowCompactStyle = computed(() => ({
  gap: 'calc(var(--preview-gap) * 0.75)',
}))

// 监听暗色模式变化，实时同步预览区域的暗色类、重新应用主题和预设覆盖
watch(isDark, (dark) => {
  syncPreviewDarkClass(dark)
  reapplyTheme()
  applyPresetOverrides()
}, { immediate: true })

// 监听主题切换，应用新主题并在快捷主题切换时同步字体和预设
watch(
  () => customizer.themeIndex,
  (themeIndex) => {
    const index = Number(themeIndex)
    if (Number.isNaN(index) || index < 0 || index >= themeOptions.value.length) return

    setTheme(index)

    // 仅在快捷主题完整切换时，才同步字体与预设
    if (pendingFullThemeSwitch) {
      pendingFullThemeSwitch = false
      const fonts = getThemeFonts(themeOptions.value, index, currentMode.value, fallbackFonts.value)
      customizer.fontSans = fonts.fontSans
      customizer.fontSerif = fonts.fontSerif
      customizer.fontMono = fonts.fontMono
      customizer.layoutPreset = 'theme'
      customizer.shadowPreset = 'theme'
    }

    applyPresetOverrides()
  },
)

// 监听风格和图标库的 URL 搜索参数变化，实时更新自定义设置并应用对应的搜索参数
watch(
  () => [customizer.style, customizer.iconLibrary] as const,
  ([style, iconLibrary]) => {
    setDesignSystemSearchParams({ style, iconLibrary })
  },
  { immediate: true },
)

// 监听字体和预设的变化，实时应用 CSS 变量覆盖
watch(
  () => [customizer.fontSans, customizer.fontSerif, customizer.fontMono, customizer.layoutPreset, customizer.shadowPreset],
  () => {
    applyPresetOverrides()
  },
)

// 组件挂载时，初始化预览区域的暗色类、应用当前主题和预设覆盖；组件卸载时，清除预设覆盖
onMounted(() => {
  syncPreviewDarkClass(isDark.value)
  reapplyTheme()
  applyPresetOverrides()
})

// 组件卸载时，清除预设覆盖
onUnmounted(() => {
  clearPresetOverrides()
})
</script>
