<script setup lang="ts">
/**
 * FoldText 文档页（路由 /motion/fold-text）
 * 移植自 React Bits 的 Fold Text（MIT）：原版用 GSAP + ScrollTrigger，这里换成 WAAPI + IntersectionObserver。
 */
import { computed, reactive, ref } from 'vue'
import { FoldText } from '@/components/motion'
import type { FoldTextHinge, FoldTextSplitBy, FoldTextTrigger } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { toHexColor, useThemeTick } from '../lib/themeColors'

const TEXT_PRESETS = [
  { label: '默认', value: 'Design unfolds' },
  { label: '英文长句', value: 'Launch with clarity' },
  { label: '中文', value: '折页落位' },
  { label: '两行（配分行）', value: 'Design\nunfolds' },
]

const SPLIT_OPTIONS: { label: string; hint: string; value: FoldTextSplitBy }[] = [
  { label: '按字', hint: '一块一个字', value: 'char' },
  { label: '按词', hint: '一块一个词', value: 'word' },
  { label: '按行', hint: '一块一行（用 \\n 分行）', value: 'line' },
]

const HINGE_OPTIONS: { label: string; value: FoldTextHinge }[] = [
  { label: '上边', value: 'top' },
  { label: '下边', value: 'bottom' },
  { label: '左边', value: 'left' },
  { label: '右边', value: 'right' },
]

const TRIGGER_OPTIONS: { label: string; hint: string; value: FoldTextTrigger }[] = [
  { label: '挂载', hint: '进来就翻', value: 'mount' },
  { label: '悬停', hint: '指上去重翻', value: 'hover' },
  { label: '进入视口', hint: '滚到才翻', value: 'scroll' },
  { label: '循环', hint: '翻完停 0.75s 再来', value: 'loop' },
]

const EASE_OPTIONS = [
  { label: 'Power out', value: 'power3.out' },
  { label: 'Expo out', value: 'expo.out' },
  { label: 'Soft back', value: 'back.out(1.2)' },
  { label: 'Circular', value: 'circ.out' },
]

const fold = reactive({
  text: TEXT_PRESETS[0].value,
  splitBy: 'char' as FoldTextSplitBy,
  hinge: 'top' as FoldTextHinge,
  trigger: 'mount' as FoldTextTrigger,
  ease: 'power3.out',
  // 颜色默认跟随主题
  color: '--color-foreground',
  duration: 0.65,
  stagger: 0.045,
  perspective: 700,
  creaseShading: 0.55,
  fontSize: 80,
  fontWeight: 800,
})

/* 取色器只吃 #rrggbb，把（可能是变量名的）颜色解析出来给它；useThemeTick 让它在切主题时重算 */
const themeTick = useThemeTick()
const colorHex = computed(() => {
  themeTick.value
  return toHexColor(fold.color, '#18181b')
})
const followTheme = computed(() => fold.color.startsWith('--'))
function resetToThemeColor() {
  fold.color = '--color-foreground'
}

type NumberKey = 'duration' | 'stagger' | 'perspective' | 'creaseShading' | 'fontSize' | 'fontWeight'

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: 'duration', label: '单块时长', min: 0.35, max: 1.2, step: 0.05, unit: 's' },
  { key: 'stagger', label: '逐块错峰', min: 0.03, max: 0.08, step: 0.005, unit: 's' },
  { key: 'perspective', label: '透视距离', min: 350, max: 1200, step: 25, unit: 'px' },
  { key: 'creaseShading', label: '折痕强度', min: 0, max: 1, step: 0.05 },
  { key: 'fontSize', label: '字号', min: 44, max: 112, step: 2, unit: 'px' },
  { key: 'fontWeight', label: '字重', min: 300, max: 900, step: 100 },
]

function setSlider(key: NumberKey, value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') fold[key] = v
}

/** 重播：换 key 重挂载（scroll / mount 这类触发也能重看一遍） */
const replay = ref(0)

const usageSnippet = computed(
  () => `<FoldText
  text="${fold.text.replace(/\n/g, '\\n')}"
  split-by="${fold.splitBy}"
  hinge="${fold.hinge}"
  trigger="${fold.trigger}"
  ease="${fold.ease}"
  :perspective="${fold.perspective}"
  color="${fold.color}"
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "'Design unfolds'", desc: '文案；splitBy="line" 时用 \\n 分行' },
  { name: 'splitBy', type: "'char' | 'word' | 'line'", def: "'char'", desc: '按什么切段' },
  { name: 'hinge', type: "'top' | 'bottom' | 'left' | 'right'", def: "'top'", desc: '铰链在哪条边' },
  { name: 'duration', type: 'number', def: '0.65', desc: '每块翻开的时长（秒）' },
  { name: 'stagger', type: 'number', def: '0.045', desc: '相邻块开始的间隔（秒），0.03–0.08 最利落' },
  { name: 'ease', type: 'string', def: "'power3.out'", desc: 'CSS 缓动，或 GSAP 常见名字（power3.out / expo.out / back.out(1.2)… 内部有映射）' },
  { name: 'perspective', type: 'number', def: '700', desc: '每块父级的透视距离（px），越小越「近大远小」' },
  { name: 'creaseShading', type: 'number', def: '0.55', desc: '折起时的折痕阴影强度，0–1' },
  { name: 'trigger', type: "'mount' | 'hover' | 'scroll' | 'loop'", def: "'mount'", desc: '何时播放' },
  { name: 'fontSize', type: 'number | string', def: '80', desc: '字号' },
  { name: 'fontWeight', type: 'number | string', def: '800', desc: '字重' },
  { name: 'color', type: 'string', def: "'--color-foreground'", desc: '文字颜色：任意 CSS 颜色，或 `--` 变量名（默认跟随主题）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">折页文字 FoldText</h1>
    <p class="mt-3 text-muted-foreground">
      文案按字 / 词 / 行切成一块块，每块沿指定铰链像折纸一样翻开落平：段容器给透视、折片给旋转轴与角度，
      折痕阴影随翻开淡掉，相邻块按 stagger 错峰。
      <strong>移植自 React Bits</strong>（MIT）—— 原版用 GSAP + ScrollTrigger，这里等价换成浏览器自带动画，不引依赖。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>「进入视口」触发时滚页面能重看；「循环」翻完停 0.75s 再来一轮。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex min-h-[280px] items-center justify-center rounded-xl border border-border bg-muted/40 px-8 py-14">
          <FoldText
            :key="replay"
            :text="fold.text"
            :split-by="fold.splitBy"
            :hinge="fold.hinge"
            :trigger="fold.trigger"
            :ease="fold.ease"
            :duration="fold.duration"
            :stagger="fold.stagger"
            :perspective="fold.perspective"
            :crease-shading="fold.creaseShading"
            :font-size="fold.fontSize"
            :font-weight="fold.fontWeight"
            :color="fold.color"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="fold.text === t.value ? 'default' : 'outline'"
                size="sm"
                @click="fold.text = t.value"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">切法</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in SPLIT_OPTIONS"
                :key="opt.value"
                :variant="fold.splitBy === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="fold.splitBy = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">铰链</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in HINGE_OPTIONS"
                :key="opt.value"
                :variant="fold.hinge === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="fold.hinge = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">触发时机</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in TRIGGER_OPTIONS"
                :key="opt.value"
                :variant="fold.trigger === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="fold.trigger = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2 sm:col-span-2">
            <p class="text-sm font-semibold">缓动</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in EASE_OPTIONS"
                :key="opt.value"
                :variant="fold.ease === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="fold.ease = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-semibold">参数</p>
            <div class="flex flex-wrap items-center gap-4">
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                文字色
                <input
                  type="color"
                  class="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                  :value="colorHex"
                  @input="fold.color = ($event.target as HTMLInputElement).value"
                >
              </label>
              <Button variant="outline" size="sm" :disabled="followTheme" @click="resetToThemeColor">
                {{ followTheme ? '已跟随主题' : '跟随主题' }}
              </Button>
              <Button variant="outline" size="sm" @click="replay++">重播</Button>
            </div>
          </div>

          <p class="text-xs text-muted-foreground">
            颜色默认跟随主题（<code>--color-foreground</code>）；手动改取色器就固定成该颜色，点「跟随主题」回到跟随。
          </p>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="s in SLIDERS" :key="s.key" class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">{{ s.label }}</span>
                <span class="text-xs font-medium tabular-nums">{{ fold[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[fold[s.key]]"
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
            <li>两层结构：段容器负责 <code>perspective</code>（近大远小），折片负责 <code>transform-origin</code>（铰链在哪条边）与旋转角度（上下 ±92°、左右 ∓92°，略过 90° 免得纸「穿」过去）。</li>
            <li>折痕阴影是折片里一层<strong>真实元素</strong>（不是 <code>::after</code>）—— 它要单独动 opacity，而伪元素没法用 WAAPI 动。</li>
            <li><code>color</code> 支持 <code>--color-*</code> 变量名（默认就是这么传的），颜色写在 CSS 上，切主题由 CSS 自己更新。</li>
            <li><code>ease</code> 换成 CSS 缓动；原版文档里的 <code>power3.out</code> / <code>expo.out</code> / <code>back.out(1.2)</code> 这些名字也做了映射。</li>
            <li>容器别写 <code>overflow: hidden</code>：折片转起来是会超出文字的，裁掉就看不到折的过程了。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { FoldText } from '@/components/motion'</code></CardDescription>
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
