<script setup lang="ts">
/**
 * 主题预览（/playground）· 主题 / 随机 UI
 *
 * 只放「看效果、做选择」这两件事：8 套风格、41 套色板、76 个随机 UI 场景。
 * 动效（独立动效组件 + 全局过渡设置）在 `/motion`，导航里叫「动效设计」——
 * 分开是因为「换主题」和「调动效」的心态不一样，混在一个页面里反而互相干扰。
 *
 * Tab 同步到 `?tab=`，每个 Tab 都能单独分享链接；不给参数就落在「主题」。
 */
import { computed, ref, watch } from 'vue'
import RandomUITest from '@/random-ui/RandomUITest.vue'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { STYLE_OPTIONS, useGlobalStyle } from '../lib/style'
import { useGlobalTheme } from '../lib/theme'

const TABS = [
  { value: 'theme', label: '主题' },
  { value: 'random', label: '随机 UI' },
] as const
type TabValue = typeof TABS[number]['value']

/**
 * Tab 写进 `?tab=`，分享链接能直接落到对应 Tab。
 *
 * 用 URLSearchParams + history.replaceState 而不是 router.replace：设计系统的
 * `?style=` / `?iconLibrary=` 也是这么写的（见 useDesignSystemSearchParams），
 * 走 router 只能拿到过期的 query，会把它们的参数挤掉。
 */
const TAB_PARAM = 'tab'
function readTab(search: string): TabValue {
  const v = new URLSearchParams(search).get(TAB_PARAM)
  return v && TABS.some(t => t.value === v) ? (v as TabValue) : 'theme'
}
const activeTab = ref<TabValue>(readTab(window.location.search))
watch(activeTab, v => {
  const sp = new URLSearchParams(window.location.search)
  sp.set(TAB_PARAM, v)
  window.history.replaceState(null, '', `${window.location.pathname}?${sp.toString()}`)
})

/* ── 主题 / 风格 ────────────────────────────────────────── */

const { themes, index: themeIndex, setIndex: setThemeIndex } = useGlobalTheme()
const { styleKey, setStyle } = useGlobalStyle()

const currentThemeLabel = computed(() => {
  const t = themes[themeIndex.value]
  return t?.label_zh || t?.label || '主题'
})

/** 主题色点：兼容 `styles.light.primary` 与 `styles.light['--color-primary']` 两种键名 */
function themeDot(t: any): string {
  return t?.styles?.light?.primary ?? t?.styles?.light?.['--color-primary'] ?? '#94a3b8'
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">主题预览</h1>
    <p class="mt-3 text-muted-foreground">
      看效果、做选择：<strong>主题</strong>（8 套风格 + 41 套色板）·
      <strong>随机 UI</strong>（76 个 Demo 场景随机拼装）。
      选择即时生效并记忆，刷新后保持；动效在
      <RouterLink to="/motion" class="underline underline-offset-4 hover:text-foreground">动效设计</RouterLink>。
    </p>

    <Tabs v-model="activeTab" class="mt-8">
      <TabsList variant="line">
        <TabsTrigger v-for="t in TABS" :key="t.value" :value="t.value">{{ t.label }}</TabsTrigger>
      </TabsList>

      <!-- ── 主题 ─────────────────────────────────────── -->
      <TabsContent value="theme" class="mt-6 space-y-8">
        <Card>
          <CardHeader>
            <h2 class="text-xl font-semibold">风格（设计系统）</h2>
            <CardDescription>
              8 套几何与密度预设；颜色与字体分别由「主题」「字体」决定。点一下即时全站生效。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                v-for="s in STYLE_OPTIONS"
                :key="s.value"
                type="button"
                class="rounded-lg border px-3 py-3 text-left transition-colors"
                :class="styleKey === s.value ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/50'"
                @click="setStyle(s.value)"
              >
                <span class="text-sm font-medium">{{ s.label }}</span>
                <p class="mt-1 font-mono text-[11px] text-muted-foreground">{{ s.value }}</p>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 class="text-xl font-semibold">主题色板</h2>
            <CardDescription>
              共 {{ themes.length }} 套，当前：<strong>{{ currentThemeLabel }}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              <button
                v-for="(t, i) in themes"
                :key="i"
                type="button"
                class="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors"
                :class="themeIndex === i ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/50'"
                @click="setThemeIndex(i)"
              >
                <span class="size-4 shrink-0 rounded-full border border-border" :style="{ background: themeDot(t) }" />
                <span class="truncate text-xs">{{ t.label_zh || t.label }}</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- ── 随机 UI ───────────────────────────────────── -->
      <TabsContent value="random" class="mt-6">
        <RandomUITest />
      </TabsContent>
    </Tabs>
  </div>
</template>
