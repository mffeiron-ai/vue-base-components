<script setup lang="ts">
/**
 * StrokeText 文档页（路由 /motion/stroke-text）
 * 移植自 React Bits 的 Stroke Text（MIT）：原版用 GSAP 做描边与填充，这里换成 WAAPI + IntersectionObserver。
 */
import { computed, reactive, ref } from 'vue'
import { StrokeText } from '@/components/motion'
import type { StrokeTextFillMode, StrokeTextTrigger } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { toHexColor, useThemeTick } from '../lib/themeColors'

const TEXT_PRESETS = [
  { label: '默认', value: 'Draw Attention' },
  { label: '短', value: 'Hello' },
  { label: '中文', value: '画出注意力' },
  { label: '长', value: 'Motion in the details' },
]

const TRIGGER_OPTIONS: { label: string; hint: string; value: StrokeTextTrigger }[] = [
  { label: '挂载', hint: '进来就写', value: 'mount' },
  { label: '悬停', hint: '指上去重写', value: 'hover' },
  { label: '进入视口', hint: '滚到才写', value: 'scroll' },
  { label: '循环', hint: '写完停一会再来', value: 'loop' },
]

const FILL_MODES: { label: string; hint: string; value: StrokeTextFillMode }[] = [
  { label: '扫过', hint: '从左往右灌', value: 'wipe' },
  { label: '淡入', hint: '整体淡进', value: 'fade' },
  { label: '不填充', hint: '只留描边', value: 'none' },
]

const EASE_OPTIONS = [
  { label: 'Power Out', value: 'power2.out' },
  { label: 'Crisp Out', value: 'power3.out' },
  { label: 'Expo Out', value: 'expo.out' },
  { label: 'Sine In Out', value: 'sine.inOut' },
]

const stroke = reactive({
  text: TEXT_PRESETS[0].value,
  // 颜色默认跟随主题：描边用主色，填充用前景色
  strokeColor: '--color-primary',
  fillColor: '--color-foreground',
  strokeWidth: 1.4,
  drawDuration: 1.6,
  fillDelay: 0.2,
  stagger: 0.05,
  ease: 'power2.out',
  trigger: 'mount' as StrokeTextTrigger,
  fillMode: 'wipe' as StrokeTextFillMode,
  fontSize: 128,
  fontWeight: 800,
  letterSpacing: -4,
  reverse: false,
})

/* 取色器只吃 #rrggbb，把（可能是变量名的）颜色解析出来给它；useThemeTick 让它在切主题时重算 */
const themeTick = useThemeTick()
const strokeHex = computed(() => {
  themeTick.value
  return toHexColor(stroke.strokeColor, '#A78BFA')
})
const fillHex = computed(() => {
  themeTick.value
  return toHexColor(stroke.fillColor, '#F8FAFC')
})
const followTheme = computed(
  () => stroke.strokeColor.startsWith('--') && stroke.fillColor.startsWith('--'),
)
function resetToThemeColors() {
  stroke.strokeColor = '--color-primary'
  stroke.fillColor = '--color-foreground'
}

type NumberKey = 'strokeWidth' | 'drawDuration' | 'fillDelay' | 'stagger' | 'fontSize' | 'fontWeight' | 'letterSpacing'

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: 'strokeWidth', label: '描边宽度', min: 0.5, max: 4, step: 0.1 },
  { key: 'drawDuration', label: '描写时长', min: 0.6, max: 3, step: 0.1, unit: 's' },
  { key: 'fillDelay', label: '填充延迟', min: 0, max: 1, step: 0.05, unit: 's' },
  { key: 'stagger', label: '逐字错峰', min: 0, max: 0.12, step: 0.005, unit: 's' },
  { key: 'fontSize', label: '字号', min: 48, max: 200, step: 2, unit: 'px' },
  { key: 'fontWeight', label: '字重', min: 300, max: 900, step: 100 },
  { key: 'letterSpacing', label: '字距', min: -12, max: 8, step: 1, unit: 'px' },
]

function setSlider(key: NumberKey, value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') stroke[key] = v
}

/** 重播：换 key 重挂载（scroll / mount 这类触发也能重看一遍） */
const replay = ref(0)

const usageSnippet = computed(
  () => `<StrokeText
  text="${stroke.text}"
  stroke-color="${stroke.strokeColor}"
  fill-color="${stroke.fillColor}"
  trigger="${stroke.trigger}"
  fill-mode="${stroke.fillMode}"
  :draw-duration="${stroke.drawDuration}"
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "'Draw Attention'", desc: '要描的文案' },
  { name: 'strokeColor', type: 'string', def: "'--color-primary'", desc: '描边颜色：任意 CSS 颜色，或 `--` 变量名（默认跟随主题）' },
  { name: 'fillColor', type: 'string', def: "'--color-foreground'", desc: '填充颜色：同上' },
  { name: 'strokeWidth', type: 'number', def: '1.4', desc: '描边宽度' },
  { name: 'drawDuration', type: 'number', def: '1.6', desc: '每个字的描边写多久（秒）' },
  { name: 'fillDelay', type: 'number', def: '0.2', desc: '描边写完后等多久开始灌填充（秒）' },
  { name: 'stagger', type: 'number', def: '0.05', desc: '相邻字开始写的间隔（秒）' },
  { name: 'ease', type: 'string', def: "'power2.out'", desc: 'CSS 缓动，或 GSAP 常见名字（power2.out / expo.out / sine.inOut… 内部有映射）' },
  { name: 'trigger', type: "'mount' | 'hover' | 'scroll' | 'loop'", def: "'mount'", desc: '何时开始写' },
  { name: 'fillMode', type: "'wipe' | 'fade' | 'none'", def: "'wipe'", desc: '填充方式：从左往右扫 / 淡入 / 不填充' },
  { name: 'fontSize', type: 'number | string', def: '128', desc: '字号（px）；容器窄了由 viewBox 等比缩' },
  { name: 'fontWeight', type: 'number | string', def: '800', desc: '字重' },
  { name: 'letterSpacing', type: 'number | string', def: '-4', desc: '字距（px）' },
  { name: 'reverse', type: 'boolean', def: 'false', desc: '错峰反向：从最后一个字写回第一个' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">描边文字 StrokeText</h1>
    <p class="mt-3 text-muted-foreground">
      文字先一笔一笔「描」出来，再把填充色灌进去：两层 SVG 文字（一层只有描边、一层只有填充），
      描边层靠 <code>stroke-dashoffset</code> 逐字写，填充层靠 <code>clip-path</code> 从左往右扫。
      <strong>移植自 React Bits</strong>（MIT）—— 原版用 GSAP + ScrollTrigger，这里等价换成浏览器自带能力，不引依赖。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>「进入视口」触发时滚页面能重看；「循环」会写完停一下再重来。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex min-h-[240px] items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 px-6 py-10">
          <StrokeText
            :key="replay"
            :text="stroke.text"
            :stroke-color="stroke.strokeColor"
            :fill-color="stroke.fillColor"
            :stroke-width="stroke.strokeWidth"
            :draw-duration="stroke.drawDuration"
            :fill-delay="stroke.fillDelay"
            :stagger="stroke.stagger"
            :ease="stroke.ease"
            :trigger="stroke.trigger"
            :fill-mode="stroke.fillMode"
            :font-size="stroke.fontSize"
            :font-weight="stroke.fontWeight"
            :letter-spacing="stroke.letterSpacing"
            :reverse="stroke.reverse"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.value"
                :variant="stroke.text === t.value ? 'default' : 'outline'"
                size="sm"
                @click="stroke.text = t.value"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">触发时机</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in TRIGGER_OPTIONS"
                :key="opt.value"
                :variant="stroke.trigger === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="stroke.trigger = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">填充方式</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in FILL_MODES"
                :key="opt.value"
                :variant="stroke.fillMode === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="stroke.fillMode = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">缓动</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in EASE_OPTIONS"
                :key="opt.value"
                :variant="stroke.ease === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="stroke.ease = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-semibold">参数</p>
            <div class="flex flex-wrap items-center gap-4">
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                描边
                <input
                  type="color"
                  class="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                  :value="strokeHex"
                  @input="stroke.strokeColor = ($event.target as HTMLInputElement).value"
                >
              </label>
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                填充
                <input
                  type="color"
                  class="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                  :value="fillHex"
                  @input="stroke.fillColor = ($event.target as HTMLInputElement).value"
                >
              </label>
              <Button variant="outline" size="sm" :disabled="followTheme" @click="resetToThemeColors">
                {{ followTheme ? '已跟随主题' : '跟随主题' }}
              </Button>
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                反向错峰
                <Switch :model-value="stroke.reverse" @update:model-value="v => (stroke.reverse = !!v)" />
              </label>
              <Button variant="outline" size="sm" @click="replay++">重播</Button>
            </div>
          </div>

          <p class="text-xs text-muted-foreground">
            两个颜色默认跟随主题（<code>--color-primary</code> / <code>--color-foreground</code>）；
            手动改取色器就固定成该颜色，点「跟随主题」回到跟随。
          </p>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="s in SLIDERS" :key="s.key" class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">{{ s.label }}</span>
                <span class="text-xs font-medium tabular-nums">{{ stroke[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[stroke[s.key]]"
                :min="s.min"
                :max="s.max"
                :step="s.step"
                @update:model-value="v => setSlider(s.key, v)"
              />
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">用法</p>
          <pre class="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed"><code>{{ usageSnippet }}</code></pre>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">实现上的注意点</p>
          <ul class="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li>字号只是「测量用的字号」：文案量出包围盒后写进 <code>viewBox</code>，svg 再按容器等比缩放，所以写 128 也不会溢出。</li>
            <li><code>strokeColor</code> / <code>fillColor</code> 支持 <code>--color-*</code> 变量名（默认就是这么传的），颜色写在 CSS 上，切主题由 CSS 自己更新。</li>
            <li><code>ease</code> 换成 CSS 缓动；原版文档里的 <code>power2.out</code> / <code>expo.out</code> / <code>sine.inOut</code> 这些名字也做了映射，能直接写。</li>
            <li><code>scroll</code> 触发用 IntersectionObserver（露出到视口下方 18% 以内开始），只触发一次；<code>loop</code> 用定时器循环，写完停 0.9s 再来。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { StrokeText } from '@/components/motion'</code></CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">属性</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in PROPS" :key="p.name" class="border-b">
                <td class="py-2 pr-4 align-top"><code>{{ p.name }}</code></td>
                <td class="py-2 pr-4 align-top text-muted-foreground">{{ p.type }}</td>
                <td class="py-2 pr-4 align-top text-muted-foreground">{{ p.def }}</td>
                <td class="py-2 align-top text-muted-foreground">{{ p.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
