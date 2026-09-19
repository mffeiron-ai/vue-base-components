<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Github, Menu, Moon, Palette, Sparkles, Sun, SlidersHorizontal, Type, X } from 'lucide-vue-next'
import { useDark, useMediaQuery, useToggle } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { componentDocs } from '../docs/registry'
import { useGlobalTheme } from '../lib/theme'
import {
  useGlobalAnim,
  ANIM_OPTIONS,
  ANIM_SPEED_OPTIONS,
  ANIM_MS_MIN,
  ANIM_MS_MAX,
  ANIM_MS_STEP,
} from '../lib/animation'
import { useGlobalStyle, STYLE_OPTIONS, LAYOUT_PRESETS, SHADOW_PRESETS, ICON_LIBRARY_OPTIONS } from '../lib/style'

const route = useRoute()
const menuState = ref(false)
const isScrolled = ref(false)

// 导航栏收窄/展开的宽度过渡时长（与模板里的 duration-300 保持一致）
const PILL_TRANSITION_MS = 300
/**
 * 是否使用「宽布局」文案：长菜单标签、风格的长标签（如「经典 · 跟随主题」）、主题预览按钮。
 *
 * 为何需要单独一个标志：滚动回到顶部时，宽度过渡（300ms）还没跑完，容器只有 ~930px，
 * 而宽布局需要 ~1014px——若同一帧就把长文案换回去，会被挤成两行、闪烁一下。
 * 因此展开时延迟到过渡结束再换回长文案；收窄时则立即用短文案（短文案在窄容器里也放得下）。
 */
const wideLabels = ref(!isScrolled.value)
let wideLabelTimer: ReturnType<typeof setTimeout> | undefined
watch(isScrolled, (scrolled) => {
  clearTimeout(wideLabelTimer)
  if (scrolled) {
    wideLabels.value = false
  }
  else {
    wideLabelTimer = setTimeout(() => { wideLabels.value = true }, PILL_TRANSITION_MS + 40)
  }
})

/**
 * 两条导航栏在 lg 以上的外观（把「外观设置」与「菜单」拆成了同一行里的两条）：
 *  - 未滚动：透明无边框，观感仍是原来的一整条（只减内边距，给两条留空间）
 *  - 滚动后：各自变成毛玻璃胶囊、中间隔开 gap，成为「两座岛」
 * **只产出 lg:* 类**：<lg 时第二条整条折到第二行当移动端面板，用自己那套样式。
 */
const barLgClass = computed(() => isScrolled.value
  ? 'lg:rounded-2xl lg:border lg:border-border lg:bg-background/50 lg:shadow-lg lg:shadow-black/5 lg:backdrop-blur-lg lg:px-5'
  : 'lg:border-transparent lg:bg-transparent lg:shadow-none lg:px-5 xl:px-8')

/**
 * 两条栏所在行的宽度上限与间距。拆成两条后各自都带内边距（+ 中间 gap），总宽比原来的一整条大约 100px，
 * 所以上限要相应放宽，否则「同一行」会折行：滚动 5xl(1024) → 6xl(1152)、未滚动 7xl(1280) → 84rem(1344)。
 * 实测（2277 视口）：滚动后行宽 1024 时两条相加 1033px —— 正是原来折行的原因。
 * lg 上用更小的 gap（lg:gap-2）：1024 视口是 lg 段里最紧的（未滚动时刚好差 3px），
 * 收掉内边距 + 间距后余量约 9px；再宽一档回到 12px，让滚动后的「两座岛」间隔好看些。
 */
const navRowClass = computed(() => isScrolled.value
  ? 'max-w-6xl min-[1800px]:max-w-none lg:gap-3'
  : 'max-w-7xl min-[1800px]:max-w-none lg:gap-2')

const isDark = useDark()
const toggleDark = useToggle(isDark)

/**
 * 窄屏（<1440）：未滚动时也用**短标签**。
 * 原因：导航栏拆成「菜单 + 外观」两条、操作按钮也并进菜单栏后总宽变大，
 * lg（1024）/ xl 段用长标签会把外观栏挤到第二行（实测 1024 未滚动需 1032px > 993）。
 * 只用于**标签**；主题预览/开始使用 那对 CTA 的切换仍看 wideLabels（滚动状态）。
 */
const isNarrow = useMediaQuery('(max-width: 1439px)')
const compactLabels = computed(() => wideLabels.value && !isNarrow.value)

// 全局主题（41 套色板，作用到整站）
const { themes, index: themeIndex, setIndex } = useGlobalTheme()
const currentThemeLabel = computed(() => {
  const t = themes[themeIndex.value]
  return t?.label_zh || t?.label || '主题'
})

// 主题抽屉
const themeDrawerOpen = ref(false)
function selectTheme(i: number) {
  setIndex(i)
  themeDrawerOpen.value = false
}

// 全局样式定制（复用 random-ui 现成面板：风格/主题/图标库/字体/圆角/阴影 + 重置/随机）
const {
  styleKey, layoutKey, shadowKey, iconLibrary,
  fontSans, fontSerif, fontMono,
  sansFontOptions, serifFontOptions, monoFontOptions,
  effectiveLayout, effectiveShadow,
  setStyle, setLayout, setShadow, setIconLibrary, setFonts,
  reset, randomize,
} = useGlobalStyle()
const styleSheetOpen = ref(false)
const fontSheetOpen = ref(false)

// 全局动效（动画形式 + 时长）：与「风格」「主题」「字体」并列的第四个维度
const {
  animKey, animSpeed, animMs,
  setAnim, setAnimSpeed, setAnimMs,
  currentMs, currentSpeedLabel,
} = useGlobalAnim()
const animSheetOpen = ref(false)
const currentAnimLabel = computed(
  () => ANIM_OPTIONS.find(o => o.value === animKey.value)?.label ?? '淡入',
)
/** 导航栏收窄后用的短名（4 字长名会把整行挤到换行） */
const currentAnimShort = computed(
  () => ANIM_OPTIONS.find(o => o.value === animKey.value)?.short ?? '淡入',
)
/** 「淡入 · 240ms」：面板预览区显示的当前设置 */
const animSummary = computed(() => `${currentAnimLabel.value} · ${currentMs.value}ms`)
/** 预览方块的 key：形式或时长一变就换元素 → 重播一次动画 */
const animPreviewKey = computed(() => `${animKey.value}-${animSpeed.value}-${animMs.value}`)
function onAnimMs(value: number[] | undefined) {
  const ms = value?.[0]
  if (typeof ms === 'number')
    setAnimMs(ms)
}
const currentStyleLabel = computed(
  () => STYLE_OPTIONS.find(o => o.value === styleKey.value)?.label ?? '风格',
)
const currentLayoutLabel = computed(
  () => LAYOUT_PRESETS.find(p => p.key === layoutKey.value)?.label ?? '跟随主题',
)

// 字体更新辅助：整份字体对象（模板用于 ...fonts 展开）
const fonts = computed(() => ({ fontSans: fontSans.value, fontSerif: fontSerif.value, fontMono: fontMono.value }))

// 导航栏「字体」入口的标签：取字体栈第一项并去掉引号，如 `"JetBrains Mono", monospace` → JetBrains Mono
const currentFontLabel = computed(() => {
  const first = fontSans.value.split(',')[0]?.trim() ?? ''
  return first.replace(/^["']|["']$/g, '') || '字体'
})

// Select 的 update:model-value 是 AcceptableValue（可能为 null），统一归一化为 string
function toStr(v: unknown) {
  return v == null ? '' : String(v)
}

// 第一个组件文档（用于「UI 组件 / 开始使用」这类入口链接）
const firstComponentLink = `/components/${componentDocs[0]?.name ?? 'accordion'}`

// 全站统一导航项（short：导航收窄时显示的短标签）
const menuItems = [
  { name: '首页', short: '首页', href: '/' },
  { name: 'UI 组件', short: '组件', href: firstComponentLink },
  { name: '业务组件', short: '业务', href: '/business/basetable' },
  { name: '主题预览', short: '主题', href: '/playground' },
]

function isActive(href: string) {
  if (href === '/') return route.path === '/'
  if (href.startsWith('/components')) return route.path.startsWith('/components')
  if (href.startsWith('/business')) return route.path.startsWith('/business')
  if (href === '/playground') return route.path === '/playground'
  return false
}

function handleScroll() {
  isScrolled.value = window.scrollY > 30
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  clearTimeout(wideLabelTimer)
})
</script>

<template>
  <div class="fixed z-50 w-full px-2">
    <!--
      同一行里的两条独立导航栏，分工（2026-09 定稿）：
        ① 菜单栏：品牌 + 主导航 + 操作（深色 / GitHub / 主题预览·开始使用）
        ② 外观栏：风格 / 主题 / 字体 / 动效
      几何：
        · ≥1700px：行放开到整宽 + 左侧一块等宽**留白** → 菜单栏精确居中于整页；
          外观栏在「右侧区域」（菜单栏右边界 → 行右边界）里居中。
          1700 这个阈值是算出来的：要同时满足「菜单居中 + 外观在右区居中」需 rowW ≥
          菜单栏 + 2×外观栏 + 2×gap（实测 xl 下 ≈ 766 + 2×462 + 16 = 1706）。
        · <1700px：行回到 max-w-7xl/6xl，菜单栏靠左、外观栏在剩余空间里居中。
        · <lg：两条各自折到第二行、由汉堡控制：菜单栏变成卡片（内部是链接 + 操作），
          外观栏是下面第二张卡片。
      滚动收窄后两条各自成为毛玻璃胶囊（中间留 gap），未滚动时都是透明的。
    -->
    <div
      :class="[
        'mx-auto flex flex-wrap items-stretch gap-2 duration-300 lg:gap-3',
        'transition-[max-width]',
        navRowClass,
      ]"
    >
      <!-- 左侧留白：只在「居中模式」出现，把菜单栏顶到整页正中 -->
      <div class="hidden min-[1800px]:block min-[1800px]:flex-1" aria-hidden="true" />

      <!-- ① 菜单栏 -->
      <nav
        :data-state="menuState ? 'active' : ''"
        aria-label="主导航"
        :class="[
          'w-full py-3 duration-300 lg:flex lg:w-auto lg:items-center lg:gap-6',
          'transition-[background-color,backdrop-filter,box-shadow]',
          'max-lg:rounded-2xl max-lg:px-6',
          menuState ? 'max-lg:space-y-6 max-lg:bg-background max-lg:border max-lg:border-border max-lg:shadow-2xl' : '',
          barLgClass,
        ]"
      >
        <!-- 品牌行：桌面是行内第一项；移动端与汉堡同一行 -->
        <div class="flex items-center justify-between gap-6">
          <!-- Logo -->
          <RouterLink to="/" aria-label="home" class="flex items-center gap-2 transition-opacity hover:opacity-75">
            <span class="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              R
            </span>
            <span class="text-base font-semibold tracking-tight">RionStudio</span>
          </RouterLink>

          <!-- 移动端汉堡 -->
          <button
            @click="menuState = !menuState"
            :aria-label="menuState ? 'Close Menu' : 'Open Menu'"
            class="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
          >
            <Menu :class="['m-auto size-6 duration-200', menuState && 'rotate-180 scale-0 opacity-0']" />
            <X :class="['absolute inset-0 m-auto size-6 duration-200', !menuState && '-rotate-180 scale-0 opacity-0']" />
          </button>
        </div>

        <!-- 桌面菜单（导航收窄时用短标签，避免文字被挤成竖排） -->
        <ul class="hidden gap-6 text-sm lg:flex xl:gap-8">
            <li v-for="item in menuItems" :key="item.name">
              <RouterLink
                :to="item.href"
                :aria-label="item.name"
                class="block whitespace-nowrap transition-all duration-150 hover:font-semibold hover:text-accent-foreground"
                :class="isActive(item.href) ? 'font-semibold text-accent-foreground' : 'text-muted-foreground'"
              >
                <!-- 长 / 短两个文案叠在同一格里交叉淡入淡出，外层 max-width 同步过渡
                     （300ms 与导航栏收窄一致）—— 不然换文案是硬跳，文字会「啪」地少两个字。
                     上限用 em：窄状态按短文案字数收（中文一个字≈1em），宽状态给 5em 留出
                     hover 加粗与不同字体的余量；两端宽度与改之前完全一致。
                     justify-items-start 必须有：grid 列宽会被**长标签**撑满（如「UI 组件」45.7px），
                     而按钮/链接里的文字是居中的 → 短标签会被居中到格子中间，被 max-width 裁掉尾巴。
                     aria-hidden + 链接上的 aria-label：两个标签都在 DOM 里（过渡需要），
                     否则读屏会把名字念成「UI 组件 组件」 -->
                <span
                  aria-hidden="true"
                  class="inline-grid justify-items-start overflow-hidden transition-[max-width] duration-300"
                  :style="{ maxWidth: compactLabels ? '5em' : `${item.short.length}em` }"
                >
                  <span
                    class="col-start-1 row-start-1 transition-opacity duration-300"
                    :class="compactLabels ? 'opacity-100' : 'opacity-0'"
                  >{{ item.name }}</span>
                  <span
                    class="col-start-1 row-start-1 transition-opacity duration-300"
                    :class="compactLabels ? 'opacity-0' : 'opacity-100'"
                  >{{ item.short }}</span>
                </span>
              </RouterLink>
            </li>
        </ul>

        <!-- 移动端菜单（汉堡展开时，跟在品牌行后面） -->
        <ul :class="[menuState ? 'block' : 'hidden', 'space-y-6 text-base lg:hidden']">
          <li v-for="item in menuItems" :key="`mobile-${item.name}`">
            <RouterLink :to="item.href" class="text-muted-foreground block duration-150 hover:text-accent-foreground" @click="menuState = false">
              {{ item.name }}
            </RouterLink>
          </li>
        </ul>

        <!-- 操作：深色 / GitHub / 主题预览（未滚动）· 开始使用（滚动后） -->
        <div
          :class="[
            menuState ? 'flex' : 'hidden',
            'flex-col gap-3 lg:flex lg:flex-row lg:items-center lg:gap-3',
          ]"
        >
          <Button variant="ghost" size="icon" aria-label="切换主题" @click="toggleDark()">
            <Sun v-if="isDark" class="size-4" />
            <Moon v-else class="size-4" />
          </Button>
          <a href="https://github.com/mffeiron-ai/vue-base-components" target="_blank">
            <Button variant="outline" size="sm" class="border-border">
              <Github class="size-4" />
              <span>GitHub</span>
            </Button>
          </a>
          <!-- 主题预览：菜单里已有同名入口，按钮只在 xl 以上（空间充足时）显示 -->
          <RouterLink to="/playground" :class="wideLabels ? 'hidden xl:block' : 'hidden'">
            <Button size="sm">
              <span>主题预览</span>
            </Button>
          </RouterLink>
          <RouterLink :to="firstComponentLink" :class="wideLabels ? 'hidden' : 'lg:inline-flex'">
            <Button size="sm">
              <span>开始使用</span>
            </Button>
          </RouterLink>
        </div>
      </nav>

      <!-- ② 外观栏：lg+ 在右侧区域里居中；<lg 是汉堡展开的第二张卡片 -->
      <!--
        显隐必须用**互斥**的 block / hidden（不能写成 `hidden` + 菜单打开时追加 `block`）：
        实测 Tailwind 生成的 CSS 里 `.hidden` 排在 `.block` 之后，两者同时存在时永远是 none，
        于是汉堡菜单点开也看不到面板（这是个一直存在的老 bug）。lg 以上用 `lg:flex` 常显
        （媒体查询的变体排在无变体之后，所以能压过这里的 hidden）。
      -->
      <div class="flex w-full justify-center lg:w-auto lg:flex-1">
        <nav
          aria-label="外观与操作"
          :class="[
            'w-full py-3 duration-300 lg:flex lg:w-fit lg:items-center lg:gap-3',
            'transition-[background-color,backdrop-filter,box-shadow]',
            'max-lg:rounded-2xl max-lg:px-6',
            menuState ? 'max-lg:bg-background max-lg:border max-lg:border-border max-lg:shadow-2xl' : 'hidden',
            'lg:flex',
            barLgClass,
          ]"
        >
          <!-- 外观设置：风格 / 主题 / 字体 / 动效 -->
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
            <!-- 风格选择（打开右侧 Sheet）；滚动后导航栏变窄，标签改成短名 -->
            <Button variant="ghost" size="sm" @click="styleSheetOpen = true">
              <SlidersHorizontal class="size-4" />
              <span class="hidden lg:inline">{{ compactLabels ? `${currentStyleLabel} · ${currentLayoutLabel}` : currentStyleLabel }}</span>
            </Button>

            <!-- 主题选择（打开抽屉） -->
            <Button variant="ghost" size="sm" @click="themeDrawerOpen = true">
              <Palette class="size-4" />
              <span class="hidden max-w-[7rem] truncate lg:inline-block" :title="currentThemeLabel">{{ currentThemeLabel }}</span>
            </Button>

            <!-- 字体选择（与「风格」「主题」并列的一等选项，打开右侧 Sheet） -->
            <!-- 文字标签只在 xl 以上显示：lg 段（1024–1279）右侧空间不够，只留图标 -->
            <Button variant="ghost" size="sm" @click="fontSheetOpen = true">
              <Type class="size-4" />
              <span class="hidden max-w-[6rem] truncate xl:inline-block" :title="fontSans">{{ currentFontLabel }}</span>
            </Button>

            <!-- 动效选择（与「风格」「字体」「主题」并列；文字标签只在 xl 以上显示）
                 标签同样长/短切换：滚动收窄后只留 2 个字（如「从左滑入」→「左滑」），
                 否则 4 个字的长名会把右侧按钮组挤到换行 -->
            <Button
              variant="ghost"
              size="sm"
              :aria-label="`动效：${currentAnimLabel}`"
              @click="animSheetOpen = true"
            >
              <Sparkles class="size-4" />
              <span
                aria-hidden="true"
                class="hidden justify-items-start overflow-hidden transition-[max-width] duration-300 xl:inline-grid"
                :style="{ maxWidth: compactLabels ? '5em' : `${currentAnimShort.length}em` }"
              >
                <span
                  class="col-start-1 row-start-1 whitespace-nowrap transition-opacity duration-300"
                  :class="wideLabels ? 'opacity-100' : 'opacity-0'"
                >{{ currentAnimLabel }}</span>
                <span
                  class="col-start-1 row-start-1 whitespace-nowrap transition-opacity duration-300"
                  :class="wideLabels ? 'opacity-0' : 'opacity-100'"
                >{{ currentAnimShort }}</span>
              </span>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  </div>

  <!-- 主题选择抽屉 -->
  <Drawer v-model:open="themeDrawerOpen">
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>选择主题</DrawerTitle>
        <DrawerDescription>选择你喜欢的主题风格</DrawerDescription>
      </DrawerHeader>
      <div class="px-4 pb-6">
        <div class="mb-6 flex max-h-[55vh] flex-wrap gap-2 overflow-y-auto pr-1">
          <Badge
            v-for="(theme, i) in themes"
            :key="theme.label || i"
            @click="selectTheme(i)"
            class="cursor-pointer px-3 py-2 transition-all flex items-center gap-2"
            :variant="i === themeIndex ? 'default' : 'secondary'"
          >
            <span>{{ theme.label_zh || theme.label }}</span>
            <span class="flex gap-1">
              <span
                class="h-2 w-2 rounded-full"
                :style="{ backgroundColor: theme.styles?.light?.primary || 'currentColor' }"
              />
              <span
                class="h-2 w-2 rounded-full"
                :style="{ backgroundColor: theme.styles?.dark?.primary || 'currentColor' }"
              />
            </span>
          </Badge>
        </div>
      </div>
    </DrawerContent>
  </Drawer>

  <!-- 风格选择（右侧 Sheet） -->
  <Sheet v-model:open="styleSheetOpen">
    <SheetContent side="right" class="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>选择风格</SheetTitle>
        <SheetDescription>风格、圆角与阴影实时作用于整站；字体是与风格/主题并列的独立维度，见导航栏的字体入口。</SheetDescription>
      </SheetHeader>

      <div class="flex-1 space-y-5 overflow-y-auto px-1 pb-6">
        <!-- 风格基础 -->
        <div class="space-y-3">
          <p class="text-sm font-semibold">风格基础</p>
          <div class="grid grid-cols-1 gap-3">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground/90 block">Style</label>
              <Select :model-value="styleKey" @update:model-value="v => setStyle(toStr(v))">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择风格" />
                </SelectTrigger>
                <SelectContent position="popper" class="style-vega">
                  <SelectItem v-for="style in STYLE_OPTIONS" :key="style.value" :value="style.value">
                    {{ style.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground/90 block">主题色</label>
              <Select :model-value="String(themeIndex)" @update:model-value="v => setIndex(Number(v))">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择主题" />
                </SelectTrigger>
                <SelectContent position="popper" class="style-vega">
                  <SelectItem v-for="(theme, index) in themes" :key="theme.label + index" :value="String(index)">
                    {{ theme.label_zh || theme.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground/90 block">图标库</label>
              <Select :model-value="iconLibrary" @update:model-value="v => setIconLibrary(toStr(v))">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择图标库" />
                </SelectTrigger>
                <SelectContent position="popper" class="style-vega">
                  <SelectItem v-for="icon in ICON_LIBRARY_OPTIONS" :key="icon.value" :value="icon.value">
                    {{ icon.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <!-- 字体系统已提升为与「风格」「主题」并列的独立入口，见导航栏的「字体」按钮 -->

        <!-- 细节调节 -->
        <div class="space-y-3">
          <p class="text-sm font-semibold">细节调节</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground/90 block">圆角与排版</label>
              <Select :model-value="layoutKey" @update:model-value="v => setLayout(toStr(v))">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择排版档位" />
                </SelectTrigger>
                <SelectContent position="popper" class="style-vega">
                  <SelectItem v-for="preset in LAYOUT_PRESETS" :key="preset.key" :value="preset.key">
                    {{ preset.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground/90 block">阴影</label>
              <Select :model-value="shadowKey" @update:model-value="v => setShadow(toStr(v))">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="选择阴影档位" />
                </SelectTrigger>
                <SelectContent position="popper" class="style-vega">
                  <SelectItem v-for="preset in SHADOW_PRESETS" :key="preset.key" :value="preset.key">
                    {{ preset.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <!-- 重置 / 随机 -->
        <div class="grid grid-cols-2 gap-3">
          <Button variant="outline" @click="reset">重置</Button>
          <Button variant="secondary" @click="randomize">随机</Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>

  <!-- 字体选择（右侧 Sheet）：与「风格」「主题」并列的一等维度 -->
  <Sheet v-model:open="fontSheetOpen">
    <SheetContent side="right" class="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>选择字体</SheetTitle>
        <SheetDescription>切换风格或主题会自动带上它们的字体，在这里可以手动覆盖。</SheetDescription>
      </SheetHeader>

      <div class="flex-1 space-y-5 overflow-y-auto px-1 pb-6">
        <div class="space-y-3">
          <p class="text-sm font-semibold">字体系统</p>
          <div class="grid grid-cols-1 gap-3">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground/90 block">正文字体</label>
              <Select :model-value="fontSans" @update:model-value="v => setFonts({ ...fonts, fontSans: toStr(v) })">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="正文字体" />
                </SelectTrigger>
                <SelectContent position="popper" class="style-vega">
                  <SelectItem v-for="font in sansFontOptions" :key="font" :value="font">{{ font }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground/90 block">标题字体</label>
              <Select :model-value="fontSerif" @update:model-value="v => setFonts({ ...fonts, fontSerif: toStr(v) })">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="标题字体" />
                </SelectTrigger>
                <SelectContent position="popper" class="style-vega">
                  <SelectItem v-for="font in serifFontOptions" :key="font" :value="font">{{ font }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground/90 block">等宽字体</label>
              <Select :model-value="fontMono" @update:model-value="v => setFonts({ ...fonts, fontMono: toStr(v) })">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="等宽字体" />
                </SelectTrigger>
                <SelectContent position="popper" class="style-vega">
                  <SelectItem v-for="font in monoFontOptions" :key="font" :value="font">{{ font }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p class="text-xs leading-relaxed text-muted-foreground">
            风格自带的正文：小巧 / 经典 / 紧凑 / 胶囊 / 饱满 / 排版 → Inter，圆润 → Figtree，直角 → JetBrains Mono；
            主题则自带它自己的一套字体（如 Poppins / Montserrat）。
          </p>
        </div>
      </div>
    </SheetContent>
  </Sheet>

  <!-- 动效选择（右侧 Sheet）：整站动画形式统一切换 -->
  <Sheet v-model:open="animSheetOpen">
    <SheetContent side="right" class="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>选择动效</SheetTitle>
        <SheetDescription>
          全局动画形式：浮层进出（弹窗 / 抽屉 / 下拉 / 气泡）、表格行进入、页面切换都按它来。
          <strong class="font-medium">方向不在这里选</strong>：往哪边滑由组件自己决定
          —— 右侧抽屉从右边滑入、下方展开的菜单从上方落下、页面与表格行默认从下往上。
          折叠高度、开关滑块这类有物理含义的动效不换形式，只跟随时长。
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 space-y-5 overflow-y-auto px-1 pb-6">
        <!-- 预览：切换形式/时长后重播一次（:key 换掉元素即重启动画） -->
        <div class="flex items-center gap-4 rounded-lg border border-border bg-muted/40 p-4">
          <div :key="animPreviewKey" class="cn-anim-enter size-12 shrink-0 rounded-md bg-primary/25 ring-1 ring-primary/40" />
          <div class="text-sm">
            当前：<span class="font-medium">{{ animSummary }}</span>
            <p class="mt-1 text-xs leading-snug text-muted-foreground">
              每换一次形式或时长，左侧方块会重播；不过「无动画」时不会动。
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-sm font-semibold">动画形式</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="opt in ANIM_OPTIONS"
              :key="opt.value"
              type="button"
              class="rounded-lg border px-3 py-2 text-left transition-colors"
              :class="animKey === opt.value
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-accent/50'"
              @click="setAnim(opt.value)"
            >
              <span class="text-sm font-medium" :class="animKey === opt.value ? 'text-foreground' : 'text-muted-foreground'">
                {{ opt.label }}
              </span>
              <p class="text-[11px] leading-snug text-muted-foreground/80">{{ opt.hint }}</p>
            </button>
          </div>
        </div>

        <!-- 时长：固定档位 + 自定义滑块 -->
        <div class="space-y-3">
          <p class="text-sm font-semibold">动画时长</p>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="opt in ANIM_SPEED_OPTIONS"
              :key="opt.value"
              type="button"
              class="rounded-lg border px-2 py-2 text-center transition-colors"
              :class="animSpeed === opt.value
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-accent/50'"
              @click="setAnimSpeed(opt.value)"
            >
              <span class="text-sm font-medium" :class="animSpeed === opt.value ? 'text-foreground' : 'text-muted-foreground'">
                {{ opt.label }}
              </span>
              <p class="text-[11px] leading-snug text-muted-foreground/80">
                {{ opt.ms === null ? '用滑块' : `${opt.ms}ms` }}
              </p>
            </button>
          </div>

          <div class="rounded-lg border px-3 py-3" :class="animSpeed === 'custom' ? 'border-primary bg-primary/5' : 'border-border'">
            <div class="flex items-baseline justify-between">
              <span class="text-xs text-muted-foreground">自定义时长</span>
              <span class="text-xs font-medium tabular-nums">{{ animMs }}ms</span>
            </div>
            <Slider
              class="mt-3"
              :model-value="[animMs]"
              :min="ANIM_MS_MIN"
              :max="ANIM_MS_MAX"
              :step="ANIM_MS_STEP"
              @update:model-value="onAnimMs"
            />
            <p class="mt-2 text-[11px] leading-snug text-muted-foreground/80">
              拖动即切到「自定义」；上限 {{ ANIM_MS_MAX }}ms。退出动画固定为进入的 2/3（当前 {{ Math.round(currentMs * 2 / 3) }}ms）。
            </p>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
