<script setup lang="ts">
/**
 * BlurText 文档页（路由 /motion/blur-text）
 * 移植自 React Bits 的 Blur Text（MIT）：原版用 motion/react 的 keyframes + times，这里换成 WAAPI（times → keyframe.offset）。
 */
import { computed, reactive, ref } from 'vue'
import { BlurText } from '@/components/motion'
import type { BlurTextAnimateBy, BlurTextDirection, BlurTextEasing, BlurTextVars } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

const TEXT_PRESETS = [
  { label: '默认', value: "Isn't this so cool?!" },
  { label: '长句（看折行）', value: 'Blur out, sharpen in — one word at a time, following the theme color.' },
  { label: '中文', value: '从模糊到清晰，一个字一个字来' },
  { label: '中英混排', value: '中英混排 mixed text 也是逐个单位' },
  { label: '标题', value: 'Design in the details' },
]

const ANIMATE_OPTIONS: { label: string; hint: string; value: BlurTextAnimateBy }[] = [
  { label: '按词', hint: '一块一个词', value: 'words' },
  { label: '按字', hint: '一块一个字', value: 'letters' },
]

const DIRECTION_OPTIONS: { label: string; value: BlurTextDirection }[] = [
  { label: '从上落下', value: 'top' },
  { label: '从下浮起', value: 'bottom' },
]

/** from / to[] 就是上游那套关键帧写法；不传（undefined）时由 direction 推导默认关键帧 */
const KEYFRAME_PRESETS: { label: string; from?: BlurTextVars; to?: BlurTextVars[] }[] = [
  { label: '跟随方向（上游默认）', from: undefined, to: undefined },
  {
    label: '固定：从上',
    from: { filter: 'blur(10px)', opacity: 0, y: -50 },
    to: [{ filter: 'blur(5px)', opacity: 0.5, y: 5 }, { filter: 'blur(0px)', opacity: 1, y: 0 }],
  },
  {
    label: '固定：从下',
    from: { filter: 'blur(10px)', opacity: 0, y: 50 },
    to: [{ filter: 'blur(5px)', opacity: 0.5, y: -5 }, { filter: 'blur(0px)', opacity: 1, y: 0 }],
  },
  {
    label: '大模糊',
    from: { filter: 'blur(24px)', opacity: 0, y: 0 },
    to: [{ filter: 'blur(10px)', opacity: 0.4, y: 0 }, { filter: 'blur(0px)', opacity: 1, y: 0 }],
  },
  {
    label: '横向滑入',
    from: { filter: 'blur(8px)', opacity: 0, x: -40 },
    to: [{ filter: 'blur(4px)', opacity: 0.6, x: -6 }, { filter: 'blur(0px)', opacity: 1, x: 0 }],
  },
  {
    label: '缩放聚焦',
    from: { filter: 'blur(12px)', opacity: 0, scale: 1.35 },
    to: [{ filter: 'blur(4px)', opacity: 0.6, scale: 1.05 }, { filter: 'blur(0px)', opacity: 1, scale: 1 }],
  },
  {
    label: '三段更慢',
    from: { filter: 'blur(20px)', opacity: 0, y: 24 },
    to: [
      { filter: 'blur(14px)', opacity: 0.25, y: 12 },
      { filter: 'blur(6px)', opacity: 0.7, y: 2 },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
  },
]

// 函数缓动要放在模块级：每次都新建函数会让组件的 watch 以为参数变了、反复重播
const SQUARE: (t: number) => number = t => t * t
const EASE_OPTIONS: { label: string; value: BlurTextEasing }[] = [
  { label: 'Linear（上游默认）', value: 'linear' },
  { label: 'Power out', value: 'power3.out' },
  { label: 'Expo out', value: 'expo.out' },
  { label: '函数 t²', value: SQUARE },
]

const ROOT_MARGIN_OPTIONS = [
  { label: '0px（上游默认）', value: '0px' },
  { label: '-100px', value: '-100px' },
  { label: '-220px', value: '-220px' },
]

const ALIGN_OPTIONS: { label: string; value: 'left' | 'center' | 'right' }[] = [
  { label: '左', value: 'left' },
  { label: '中', value: 'center' },
  { label: '右', value: 'right' },
]

const TAG_OPTIONS = ['p', 'h2', 'span'] as const

const blur = reactive({
  text: TEXT_PRESETS[0].value,
  animateBy: 'words' as BlurTextAnimateBy,
  direction: 'top' as BlurTextDirection,
  keyLabel: KEYFRAME_PRESETS[0].label,
  from: undefined as BlurTextVars | undefined,
  to: undefined as BlurTextVars[] | undefined,
  easing: 'linear' as BlurTextEasing,
  delay: 200,
  stepDuration: 0.35,
  threshold: 0.1,
  rootMargin: '0px',
  textAlign: 'center' as 'left' | 'center' | 'right',
  tag: 'p' as (typeof TAG_OPTIONS)[number],
  boxWidth: 520,
})

function pickKeyframes(preset: (typeof KEYFRAME_PRESETS)[number]) {
  blur.keyLabel = preset.label
  blur.from = preset.from ? { ...preset.from } : undefined
  blur.to = preset.to ? preset.to.map(s => ({ ...s })) : undefined
}

type NumberKey = 'delay' | 'stepDuration' | 'threshold' | 'boxWidth'

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: 'delay', label: '错峰间隔', min: 0, max: 600, step: 10, unit: 'ms' },
  { key: 'stepDuration', label: '单档时长', min: 0.05, max: 1, step: 0.05, unit: 's' },
  { key: 'threshold', label: '触发阈值', min: 0, max: 1, step: 0.05 },
  { key: 'boxWidth', label: '示例框宽度', min: 300, max: 900, step: 20, unit: 'px' },
]

function setSlider(key: NumberKey, value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') blur[key] = v
}

const replay = ref(0)
const completedAt = ref('')
function onComplete() {
  completedAt.value = new Date().toLocaleTimeString()
}

const totalDuration = computed(() => (((blur.to ? blur.to.length : 2)) * blur.stepDuration).toFixed(2))

const usageSnippet = computed(() => {
  const lines = [
    `  text="${blur.text.slice(0, 20)}"`,
    `  animate-by="${blur.animateBy}"`,
    `  direction="${blur.direction}"`,
    `  :delay="${blur.delay}"`,
    `  :step-duration="${blur.stepDuration}"`,
  ]
  if (blur.from && blur.to) {
    lines.push(`  :animation-from="{ ${Object.entries(blur.from).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')} }"`)
    lines.push(`  :animation-to="[${blur.to.map(s => `{ ${Object.entries(s).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')} }`).join(', ')}]"`)
  }
  lines.push('  @complete="onComplete"')
  return `<BlurText\n${lines.join('\n')}\n/>`
})

const PROPS = [
  { name: 'text', type: 'string', def: "''", desc: '要播的文案' },
  { name: 'animateBy', type: "'words' | 'letters'", def: "'words'", desc: '按词或按字切分' },
  { name: 'direction', type: "'top' | 'bottom'", def: "'top'", desc: '起始位移的方向（决定 from 的 y 正负）' },
  { name: 'delay', type: 'number', def: '200', desc: '每个单位之间的间隔（毫秒）' },
  { name: 'stepDuration', type: 'number', def: '0.35', desc: '单档时长（秒）；总时长 = stepDuration × (档数 − 1)' },
  { name: 'threshold', type: 'number', def: '0.1', desc: '进入视口的比例阈值（0–1）' },
  { name: 'rootMargin', type: 'string', def: "'0px'", desc: '触发的 rootMargin（负数=更晚触发）' },
  { name: 'animationFrom', type: 'BlurTextVars', def: '{ filter: blur(10px), opacity: 0, y: ∓50 }', desc: '起始关键帧；支持 opacity / x / y / scale / rotate / blur / filter' },
  { name: 'animationTo', type: 'BlurTextVars[]', def: '[ { blur(5px), .5, y ±5 }, { blur(0), 1, y 0 } ]', desc: '中间 + 结束关键帧（数组，最后一项是终态）' },
  { name: 'easing', type: 'string | (t) => number', def: "'linear'", desc: '缓动；传函数时内部采样成关键帧' },
  { name: 'tag', type: "'p' | 'h1'…'span' | 'div'", def: "'p'", desc: '扩展：渲染成什么标签' },
  { name: 'textAlign', type: 'left | center | right', def: "'center'", desc: '扩展：外层是 flex，映射到 justify-content' },
  { name: '（事件）complete', type: 'emit', def: '—', desc: '全部单位播完后触发（对应上游 onAnimationComplete）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">模糊文字 BlurText</h1>
    <p class="mt-3 text-muted-foreground">
      逐<strong>词</strong> / 逐<strong>字</strong>从模糊到清晰：先虚着飞进来，再<strong>过冲</strong>一下落位。
      <strong>移植自 React Bits</strong>（MIT）—— 原版依赖 <code>motion/react</code>，这里换成 WAAPI：
      <code>times</code> 均分正好就是 <code>keyframe.offset</code>，所以是等价翻译，不需要凑近似值。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>「重播」会重新挂载；想再触发一次「进入视口」，滚出去再滚回来。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div
          class="mx-auto w-full overflow-hidden rounded-xl border border-border bg-muted/40 px-8 py-14"
          :style="{ maxWidth: `${blur.boxWidth}px` }"
        >
          <BlurText
            :key="replay"
            :text="blur.text"
            :animate-by="blur.animateBy"
            :direction="blur.direction"
            :delay="blur.delay"
            :step-duration="blur.stepDuration"
            :animation-from="blur.from"
            :animation-to="blur.to"
            :easing="blur.easing"
            :threshold="blur.threshold"
            :root-margin="blur.rootMargin"
            :tag="blur.tag"
            :text-align="blur.textAlign"
            class="text-2xl font-semibold text-foreground"
            @complete="onComplete"
          />
        </div>

        <p class="text-xs text-muted-foreground">
          总时长 = stepDuration × (档数 − 1) = <span class="font-mono">{{ totalDuration }}s</span>
          ｜末个单位还要再等 (数量−1) × delay ｜完成回调：<span class="font-mono">{{ completedAt || '（还没播完）' }}</span>
        </p>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="blur.text === t.value ? 'default' : 'outline'"
                size="sm"
                @click="blur.text = t.value"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">切分方式</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in ANIMATE_OPTIONS"
                :key="opt.value"
                :variant="blur.animateBy === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="blur.animateBy = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">方向</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in DIRECTION_OPTIONS"
                :key="opt.value"
                :variant="blur.direction === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="blur.direction = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">关键帧（from + to[]）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in KEYFRAME_PRESETS"
                :key="opt.label"
                :variant="blur.keyLabel === opt.label ? 'default' : 'outline'"
                size="sm"
                @click="pickKeyframes(opt)"
              >{{ opt.label }}</Button>
            </div>
            <p class="text-[11px] leading-relaxed text-muted-foreground">
              <template v-if="blur.to">当前是<strong>自定义关键帧</strong> → <code>direction</code> 不生效（与上游一致：<code>animationFrom ?? defaultFrom</code>）。</template>
              <template v-else>不传 <code>animationFrom</code> / <code>animationTo</code>，方向由 <code>direction</code> 推导 —— 上方「方向」切换才看得到变化。</template>
            </p>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">缓动</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in EASE_OPTIONS"
                :key="opt.label"
                :variant="blur.easing === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="blur.easing = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">触发偏移</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in ROOT_MARGIN_OPTIONS"
                :key="opt.value"
                :variant="blur.rootMargin === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="blur.rootMargin = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">对齐</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in ALIGN_OPTIONS"
                :key="opt.value"
                :variant="blur.textAlign === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="blur.textAlign = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">标签</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="tag in TAG_OPTIONS"
                :key="tag"
                :variant="blur.tag === tag ? 'default' : 'outline'"
                size="sm"
                @click="blur.tag = tag"
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
          <div class="grid gap-4 sm:grid-cols-2">
            <div v-for="s in SLIDERS" :key="s.key" class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">{{ s.label }}</span>
                <span class="text-xs font-medium tabular-nums">{{ blur[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[blur[s.key]]"
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
            <li><strong>motion 的 <code>times</code> == WAAPI 的 <code>keyframe.offset</code></strong>：上游把 <code>[from, ...to]</code> 拼成同长度数组、<code>times</code> 均分，这里直接写成带 <code>offset</code> 的关键帧，语义完全一致。</li>
            <li>总时长 = <code>stepDuration × (档数 − 1)</code>（默认 3 档 → <code>0.35 × 2 = 0.7s</code>）；单位之间再各自 <code>delay = index × delay</code> 错峰。</li>
            <li>外层是 <code>display: flex; flex-wrap: wrap</code>（上游如此），单位是 <code>inline-block</code>；词与词之间的空隙由单位自带的 <code>\u00A0</code> 顶着，所以<strong>换行只发生在单位之间</strong>。</li>
            <li><code>animationFrom</code> / <code>animationTo</code> 是「属性表」，支持 <code>opacity</code> / <code>x</code> / <code>y</code> / <code>scale</code> / <code>rotate</code> / <code>blur</code> / <code>filter</code>；<code>to</code> 是<strong>数组</strong>（≥1 项），最后一项即终态。</li>
            <li><code>easing</code> 传<strong>函数</strong>时没法直接交给 WAAPI，内部按该函数把关键帧<strong>采样</strong>出来（线性播放 = 该缓动曲线），所以 <code>t =&gt; t * t</code> 这类也能用。</li>
            <li>完成事件用定时器报，不用 WAAPI 的 <code>finished</code>（后台标签页里可能一直不 resolve）；只触发一次（与上游 <code>unobserve</code> 一致）。</li>
            <li>颜色没有单独参数：文字色随外层（<code>text-foreground</code> 之类），所以天然跟着主题走。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { BlurText } from '@/components/motion'</code></CardDescription>
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
