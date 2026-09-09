<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Github, Menu, Moon, Palette, Sun, SlidersHorizontal, X } from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'
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
import { componentDocs } from '../docs/registry'
import { useGlobalTheme } from '../lib/theme'
import { useGlobalStyle, STYLE_OPTIONS, LAYOUT_PRESETS, SHADOW_PRESETS, ICON_LIBRARY_OPTIONS } from '../lib/style'

const route = useRoute()
const menuState = ref(false)
const isScrolled = ref(false)
const isDark = useDark()
const toggleDark = useToggle(isDark)

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
const currentStyleLabel = computed(
  () => STYLE_OPTIONS.find(o => o.value === styleKey.value)?.label ?? '风格',
)
const currentLayoutLabel = computed(
  () => LAYOUT_PRESETS.find(p => p.key === layoutKey.value)?.label ?? '跟随主题',
)

// 字体更新辅助：整份字体对象（模板用于 ...fonts 展开）
const fonts = computed(() => ({ fontSans: fontSans.value, fontSerif: fontSerif.value, fontMono: fontMono.value }))

// Select 的 update:model-value 是 AcceptableValue（可能为 null），统一归一化为 string
function toStr(v: unknown) {
  return v == null ? '' : String(v)
}

// 第一个组件文档（用于「UI 组件 / 开始使用」这类入口链接）
const firstComponentLink = `/components/${componentDocs[0]?.name ?? 'accordion'}`

// 全站统一导航项
const menuItems = [
  { name: '首页', href: '/' },
  { name: 'UI 组件', href: firstComponentLink },
  { name: '业务组件', href: '/business/basetable' },
  { name: '主题预览', href: '/playground' },
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
})
</script>

<template>
  <nav
    :data-state="menuState ? 'active' : ''"
    class="fixed z-50 w-full px-2"
  >
    <div
      :class="[
        'mx-auto px-6 duration-300 lg:px-12',
        'transition-[max-width,background-color,backdrop-filter,box-shadow]',
        isScrolled
          ? 'bg-background/50 max-w-4xl rounded-2xl border border-border shadow-lg shadow-black/5 backdrop-blur-lg lg:px-5'
          : 'max-w-6xl',
      ]"
    >
      <div class="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-3">
        <!-- Logo -->
        <div class="flex w-full justify-between lg:w-auto">
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

        <!-- 桌面菜单 -->
        <div class="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center">
          <ul class="flex min-w-0 gap-8 text-sm">
            <li v-for="item in menuItems" :key="item.name">
              <RouterLink
                :to="item.href"
                class="block transition-all duration-150 hover:font-semibold hover:text-accent-foreground"
                :class="isActive(item.href) ? 'font-semibold text-accent-foreground' : 'text-muted-foreground'"
              >
                {{ item.name }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- 右侧按钮区 -->
        <div
          :class="[
            'bg-background mb-6 hidden w-full flex-wrap items-center justify-end rounded-3xl border border-border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none',
            menuState && 'block',
          ]"
        >
          <!-- 移动端菜单 -->
          <div class="w-full lg:hidden">
            <ul class="space-y-6 text-base">
              <li v-for="item in menuItems" :key="item.name">
                <RouterLink :to="item.href" class="text-muted-foreground block duration-150 hover:text-accent-foreground" @click="menuState = false">
                  {{ item.name }}
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- CTA -->
          <div class="mt-6 flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 lg:mt-0 md:w-fit">
            <!-- 风格选择（打开右侧 Sheet） -->
            <Button variant="ghost" size="sm" @click="styleSheetOpen = true">
              <SlidersHorizontal class="size-4" />
              <span class="hidden lg:inline">{{ currentStyleLabel }} · {{ currentLayoutLabel }}</span>
            </Button>

            <!-- 主题选择（打开抽屉） -->
            <Button variant="ghost" size="sm" @click="themeDrawerOpen = true">
              <Palette class="size-4" />
              <span class="hidden lg:inline">{{ currentThemeLabel }}</span>
            </Button>

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
            <RouterLink to="/playground">
              <Button size="sm" :class="isScrolled && 'lg:hidden'">
                <span>主题预览</span>
              </Button>
            </RouterLink>
            <RouterLink :to="firstComponentLink" :class="isScrolled && 'lg:inline-flex' || 'hidden'">
              <Button size="sm">
                <span>开始使用</span>
              </Button>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </nav>

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
        <SheetDescription>风格、字体、圆角与阴影实时作用于整站。</SheetDescription>
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

        <!-- 字体系统 -->
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
        </div>

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
</template>
