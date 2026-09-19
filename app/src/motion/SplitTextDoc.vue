<script setup lang="ts">
/**
 * SplitText 文档页（路由 /motion/split-text）
 * 移植自 React Bits 的 Split Text（MIT）：原版用 gsap + SplitText + ScrollTrigger，这里换成自研切分 + IO + WAAPI。
 */
import { computed, reactive, ref } from 'vue'
import { SplitText } from '@/components/motion'
import type { SplitTextTag, SplitTextType, SplitTextVars } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

const TEXT_PRESETS = [
  { label: '默认', value: 'Hello, GSAP!' },
  { label: '长句（看分行）', value: 'Split the words, the letters, and the lines — then let them arrive one by one.' },
  { label: '中文', value: '切开、错峰、落位' },
  { label: '标题', value: 'Design in the details' },
]

const SPLIT_OPTIONS: { label: string; hint: string; value: SplitTextType }[] = [
  { label: '字符', hint: '一块一个字符', value: 'chars' },
  { label: '单词', hint: '一块一个词', value: 'words' },
  { label: '行', hint: '按渲染后的行', value: 'lines' },
  { label: '词 + 字符', hint: '词内再切字符（同「字符」）', value: 'words, chars' },
]

const EASE_OPTIONS = [
  { label: 'Power out', value: 'power3.out' },
  { label: 'Expo out', value: 'expo.out' },
  { label: 'Soft back', value: 'back.out(1.2)' },
  { label: 'Sine in out', value: 'sine.inOut' },
]

/** from / to 是 GSAP 风格的属性对象，这里给几个常用的起始/结束组合 */
const VAR_PRESETS: { label: string; from: SplitTextVars; to: SplitTextVars }[] = [
  { label: '下浮', from: { opacity: 0, y: 40 }, to: { opacity: 1, y: 0 } },
  { label: '上浮', from: { opacity: 0, y: -40 }, to: { opacity: 1, y: 0 } },
  { label: '右滑', from: { opacity: 0, x: -40 }, to: { opacity: 1, x: 0 } },
  { label: '缩放', from: { opacity: 0, scale: 0.6 }, to: { opacity: 1, scale: 1 } },
  { label: '模糊', from: { opacity: 0, y: 12, blur: 8 }, to: { opacity: 1, y: 0, blur: 0 } },
]

const ROOT_MARGIN_OPTIONS = [
  { label: '默认 -100px', value: '-100px' },
  { label: '不偏移', value: '0px' },
  { label: '更晚 -220px', value: '-220px' },
]

const ALIGN_OPTIONS: { label: string; value: 'left' | 'center' | 'right' }[] = [
  { label: '左', value: 'left' },
  { label: '中', value: 'center' },
  { label: '右', value: 'right' },
]

const TAG_OPTIONS: SplitTextTag[] = ['p', 'h2', 'span']

const split = reactive({
  text: TEXT_PRESETS[0].value,
  splitType: 'chars' as SplitTextType,
  ease: 'power3.out',
  varLabel: VAR_PRESETS[0].label,
  from: { ...VAR_PRESETS[0].from } as SplitTextVars,
  to: { ...VAR_PRESETS[0].to } as SplitTextVars,
  delay: 50,
  duration: 1.25,
  threshold: 0.1,
  rootMargin: '-100px',
  textAlign: 'center' as 'left' | 'center' | 'right',
  tag: 'p' as SplitTextTag,
  /** 示例框宽度：分行模式要看折行才有意义，所以宽度可以调 */
  boxWidth: 480,
})

function pickVars(preset: (typeof VAR_PRESETS)[number]) {
  split.varLabel = preset.label
  split.from = { ...preset.from }
  split.to = { ...preset.to }
}

type NumberKey = 'delay' | 'duration' | 'threshold' | 'boxWidth'

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: 'delay', label: '错峰间隔', min: 0, max: 200, step: 5, unit: 'ms' },
  { key: 'duration', label: '单块时长', min: 0.2, max: 2.5, step: 0.05, unit: 's' },
  { key: 'threshold', label: '触发阈值', min: 0, max: 1, step: 0.05 },
  { key: 'boxWidth', label: '示例框宽度', min: 320, max: 900, step: 20, unit: 'px' },
]

function setSlider(key: NumberKey, value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') split[key] = v
}

const replay = ref(0)
const completedAt = ref('')
function onComplete() {
  completedAt.value = new Date().toLocaleTimeString()
}

const usageSnippet = computed(
  () => `<SplitText
  text="${split.text.slice(0, 24)}"
  split-type="${split.splitType}"
  :delay="${split.delay}"
  :duration="${split.duration}"
  ease="${split.ease}"
  :from="{ ${Object.entries(split.from).map(([k, v]) => `${k}: ${v}`).join(', ')} }"
  :to="{ ${Object.entries(split.to).map(([k, v]) => `${k}: ${v}`).join(', ')} }"
  @complete="onComplete"
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "''", desc: '要切分的文案' },
  { name: 'splitType', type: "'chars' | 'words' | 'lines' | 'words, chars'", def: "'chars'", desc: '按什么切分；含 chars 时动的是字符' },
  { name: 'delay', type: 'number', def: '50', desc: '每个单位之间的入场间隔（毫秒）' },
  { name: 'duration', type: 'number', def: '1.25', desc: '每个单位自己的入场时长（秒）' },
  { name: 'ease', type: 'string', def: "'power3.out'", desc: 'CSS 缓动，或 GSAP 常见名字（内部有映射）' },
  { name: 'from', type: 'SplitTextVars', def: '{ opacity: 0, y: 40 }', desc: '起始属性：支持 opacity / x / y / scale / rotate / blur' },
  { name: 'to', type: 'SplitTextVars', def: '{ opacity: 1, y: 0 }', desc: '结束属性：同上' },
  { name: 'threshold', type: 'number', def: '0.1', desc: '进入视口的比例阈值（0–1）' },
  { name: 'rootMargin', type: 'string', def: "'-100px'", desc: '触发的 rootMargin（ScrollTrigger 的写法，负数=更晚触发）' },
  { name: 'tag', type: "'h1'…'h6' | 'p' | 'span'", def: "'p'", desc: '渲染成什么标签' },
  { name: 'textAlign', type: 'left | center | right | justify', def: "'center'", desc: '对齐' },
  { name: '（事件）complete', type: 'emit', def: '—', desc: '全部单位播完后触发（对应原版的 onLetterAnimationComplete）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">切分文字 SplitText</h1>
    <p class="mt-3 text-muted-foreground">
      把文案切成<strong>字符 / 单词 / 行</strong>，进入视口后逐单位错峰入场。
      <strong>移植自 React Bits</strong>（MIT，这是他们最早的一个组件）—— 原版用 GSAP SplitText + ScrollTrigger，
      这里换成自研切分 + IntersectionObserver + WAAPI，不引依赖。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>「重播」会重新挂载；想再触发一次「进入视口」，滚出去再滚回来。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div
          class="mx-auto w-full overflow-hidden rounded-xl border border-border bg-muted/40 px-8 py-14 text-center"
          :style="{ maxWidth: `${split.boxWidth}px` }"
        >
          <SplitText
            :key="replay"
            :text="split.text"
            :split-type="split.splitType"
            :delay="split.delay"
            :duration="split.duration"
            :ease="split.ease"
            :from="split.from"
            :to="split.to"
            :threshold="split.threshold"
            :root-margin="split.rootMargin"
            :tag="split.tag"
            :text-align="split.textAlign"
            class="text-foreground"
            @complete="onComplete"
          />
        </div>

        <p class="text-xs text-muted-foreground">
          完成回调：<span class="font-mono">{{ completedAt || '（还没播完）' }}</span>
        </p>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="split.text === t.value ? 'default' : 'outline'"
                size="sm"
                @click="split.text = t.value"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">切分方式</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in SPLIT_OPTIONS"
                :key="opt.value"
                :variant="split.splitType === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="split.splitType = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">起点 / 终点</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in VAR_PRESETS"
                :key="opt.label"
                :variant="split.varLabel === opt.label ? 'default' : 'outline'"
                size="sm"
                @click="pickVars(opt)"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">缓动</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in EASE_OPTIONS"
                :key="opt.value"
                :variant="split.ease === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="split.ease = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">触发偏移</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in ROOT_MARGIN_OPTIONS"
                :key="opt.value"
                :variant="split.rootMargin === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="split.rootMargin = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">对齐</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in ALIGN_OPTIONS"
                :key="opt.value"
                :variant="split.textAlign === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="split.textAlign = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">标签</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="tag in TAG_OPTIONS"
                :key="tag"
                :variant="split.tag === tag ? 'default' : 'outline'"
                size="sm"
                @click="split.tag = tag"
              >{{ tag }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">其他</p>
            <Button variant="outline" size="sm" @click="replay++">重播</Button>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-3">
            <div v-for="s in SLIDERS" :key="s.key" class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">{{ s.label }}</span>
                <span class="text-xs font-medium tabular-nums">{{ split[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[split[s.key]]"
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
            <li>切分方式：<strong>词</strong>是 <code>inline-block</code>（词内不断行），<strong>字符</strong>在词里再包一层 <code>inline-block</code> —— 这样换行只发生在词之间，和 GSAP SplitText 的 <code>smartWrap</code> 一个道理。</li>
            <li><code>lines</code> 是<strong>按渲染结果归组</strong>的：先量每个词的 <code>offsetTop</code>，同一行的归一块；字体就绪、容器尺寸变化后都会重新量（相当于原版的 <code>autoSplit</code>）。所以<strong>宽度要窄到真的折行，行模式才看得出来</strong> —— 上面那个「示例框宽度」滑杆就是干这个的。</li>
            <li>「有字就动字，其次词，最后行」—— 和原版 <code>assignTargets</code> 的优先级一致，所以 <code>words, chars</code> 动的还是字符。</li>
            <li><code>from</code> / <code>to</code> 是 GSAP 风格的对象，这里支持常用的 <code>opacity</code> / <code>x</code> / <code>y</code> / <code>scale</code> / <code>rotate</code> / <code>blur</code>。</li>
            <li>完成事件用定时器（<code>duration + (n-1) × delay</code>）报，不用 WAAPI 的 <code>finished</code> —— 后者在后台标签页里可能一直不 resolve。</li>
            <li>颜色没有单独参数：文字颜色随外层（<code>color</code> / <code>text-foreground</code> 之类），所以天然跟着主题走。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { SplitText } from '@/components/motion'</code></CardDescription>
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
