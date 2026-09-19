<script setup lang="ts">
/**
 * Shuffle 文档页（路由 /motion/shuffle）
 * 移植自 React Bits 的 Shuffle（MIT）：原版用 gsap + SplitText + ScrollTrigger，这里换成自研切分 + WAAPI + IO。
 */
import { computed, reactive, ref } from 'vue'
import { Shuffle } from '@/components/motion'
import type { ShuffleAnimationMode, ShuffleDirection } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const TEXT_PRESETS = [
  { label: 'Hello World', value: 'Hello World' },
  { label: '中文', value: '洗牌机效果' },
  { label: '中英混排', value: '洗牌 Shuffle 效果' },
  { label: '长句（看折行）', value: 'Shuffle the letters and slide them into place' },
]

const DIRECTION_OPTIONS: { label: string; value: ShuffleDirection }[] = [
  { label: '向右', value: 'right' },
  { label: '向左', value: 'left' },
  { label: '向下', value: 'down' },
  { label: '向上', value: 'up' },
]

const MODE_OPTIONS: { label: string; hint: string; value: ShuffleAnimationMode }[] = [
  { label: '奇偶错峰', hint: '奇数位先动，偶数位从 0.7 × 奇数段总时长跟上', value: 'evenodd' },
  { label: '随机延迟', hint: '每条滚轮在 0 ~ maxDelay 之间随机', value: 'random' },
]

const EASE_OPTIONS = [
  { label: 'Power out', value: 'power3.out' },
  { label: 'Expo out', value: 'expo.out' },
  { label: 'Sine in out', value: 'sine.inOut' },
  { label: 'Soft back', value: 'back.out(1.2)' },
]

const CHARSET_OPTIONS = [
  { label: '无乱码（字滑进来）', value: '' },
  { label: '数字 01', value: '01' },
  { label: '符号 #*+=', value: '#*+=' },
  { label: '大写 ABCXYZ', value: 'ABCXYZ' },
  { label: '片假名', value: 'アイウエオカキ' },
  { label: '中文字', value: '零壹贰叁肆伍陆' },
]

const COLOR_OPTIONS: { label: string; from?: string; to?: string }[] = [
  { label: '默认（继承主题文字色）', from: undefined, to: undefined },
  { label: '主色 → 前景色', from: '--color-primary', to: '--color-foreground' },
  { label: '前景色 → 主色', from: '--color-foreground', to: '--color-primary' },
]

const ROOT_MARGIN_OPTIONS = [
  { label: '-100px（上游默认）', value: '-100px' },
  { label: '0px', value: '0px' },
  { label: '-220px', value: '-220px' },
]

const shuffle = reactive({
  text: TEXT_PRESETS[0].value,
  textLabel: TEXT_PRESETS[0].label,
  direction: 'right' as ShuffleDirection,
  mode: 'evenodd' as ShuffleAnimationMode,
  ease: 'power3.out',
  charset: '',
  charsetLabel: CHARSET_OPTIONS[0].label,
  colorLabel: COLOR_OPTIONS[0].label,
  from: undefined as string | undefined,
  to: undefined as string | undefined,
  duration: 0.35,
  shuffleTimes: 1,
  stagger: 0.03,
  maxDelay: 0.3,
  loopDelay: 0.4,
  threshold: 0.1,
  rootMargin: '-100px',
  loop: false,
  triggerOnce: true,
  triggerOnHover: true,
  respectReducedMotion: true,
  loud: true,
})

type NumberKey = 'duration' | 'shuffleTimes' | 'stagger' | 'maxDelay' | 'loopDelay' | 'threshold'

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string; mode?: ShuffleAnimationMode }[] = [
  { key: 'duration', label: '单格滚动时长', min: 0.1, max: 1.5, step: 0.05, unit: 's' },
  { key: 'shuffleTimes', label: '滚过几格乱码', min: 1, max: 6, step: 1 },
  { key: 'stagger', label: '同组错峰', min: 0, max: 0.15, step: 0.005, unit: 's', mode: 'evenodd' },
  { key: 'maxDelay', label: '最大随机延迟', min: 0, max: 1, step: 0.05, unit: 's', mode: 'random' },
  { key: 'loopDelay', label: '循环停顿', min: 0, max: 2, step: 0.1, unit: 's' },
  { key: 'threshold', label: '触发阈值', min: 0, max: 1, step: 0.05 },
]

function setSlider(key: NumberKey, value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') shuffle[key] = v
}

function pickText(preset: (typeof TEXT_PRESETS)[number]) {
  shuffle.textLabel = preset.label
  shuffle.text = preset.value
}

function pickCharset(preset: (typeof CHARSET_OPTIONS)[number]) {
  shuffle.charsetLabel = preset.label
  shuffle.charset = preset.value
}

function pickColor(preset: (typeof COLOR_OPTIONS)[number]) {
  shuffle.colorLabel = preset.label
  shuffle.from = preset.from
  shuffle.to = preset.to
}

const TOGGLES: { key: 'loop' | 'triggerOnce' | 'triggerOnHover' | 'respectReducedMotion' | 'loud'; label: string; hint: string }[] = [
  { key: 'loop', label: '循环播放', hint: '一轮完了隔 loopDelay 再来一轮' },
  { key: 'triggerOnce', label: '只自动触发一次', hint: '关掉则每次进入视口都重播' },
  { key: 'triggerOnHover', label: '悬停重播', hint: '播完后鼠标移上去再洗一次' },
  { key: 'respectReducedMotion', label: '尊重减少动效', hint: '系统开启时直接落位，不做动画' },
  { key: 'loud', label: '放大 + 大写（示例观感）', hint: '上游组件自带这组样式，本站改为按需加 class' },
]

const replay = ref(0)
const events = ref<string[]>([])
function onComplete() {
  const at = new Date().toLocaleTimeString()
  events.value = [`${at} · 一轮完成`, ...events.value].slice(0, 4)
}

const usageSnippet = computed(
  () => `<Shuffle
  text="${shuffle.text.slice(0, 20)}"
  shuffle-direction="${shuffle.direction}"
  animation-mode="${shuffle.mode}"
  :duration="${shuffle.duration}"
  :shuffle-times="${shuffle.shuffleTimes}"
  :stagger="${shuffle.stagger}"
  ${shuffle.charset ? `scramble-charset="${shuffle.charset}"` : 'scramble-charset=""'}
  ${shuffle.from && shuffle.to ? `color-from="${shuffle.from}"\n  color-to="${shuffle.to}"` : ''}
  :loop="${shuffle.loop}"
  @complete="onComplete"
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "''", desc: '要洗牌的文案' },
  { name: 'shuffleDirection', type: "'left' | 'right' | 'up' | 'down'", def: "'right'", desc: '滚轮往哪边滚（上下为竖直滚轮）' },
  { name: 'duration', type: 'number', def: '0.35', desc: '单条滚轮滚动一次的时长（秒）' },
  { name: 'maxDelay', type: 'number', def: '0', desc: 'animationMode="random" 时的最大随机延迟（秒）' },
  { name: 'ease', type: 'string', def: "'power3.out'", desc: '缓动：CSS 缓动名，或 GSAP 常见名（内部有映射）' },
  { name: 'threshold', type: 'number', def: '0.1', desc: '进入视口的比例阈值（0–1）' },
  { name: 'rootMargin', type: 'string', def: "'-100px'", desc: '触发的 rootMargin（负数=更晚触发）' },
  { name: 'tag', type: "'h1'…'h6' | 'p' | 'span'", def: "'p'", desc: '渲染成什么标签' },
  { name: 'textAlign', type: 'left | center | right', def: "'center'", desc: '对齐' },
  { name: 'shuffleTimes', type: 'number', def: '1', desc: '中途要滚过几个乱码格（滚轮总格数 = 这个值 + 2）' },
  { name: 'animationMode', type: "'evenodd' | 'random'", def: "'evenodd'", desc: '奇数位先动 / 每条随机延迟' },
  { name: 'loop', type: 'boolean', def: 'false', desc: '循环播放' },
  { name: 'loopDelay', type: 'number', def: '0', desc: '循环之间的停顿（秒）' },
  { name: 'stagger', type: 'number', def: '0.03', desc: 'evenodd 模式下同一组内部的错峰（秒）' },
  { name: 'scrambleCharset', type: 'string', def: "''", desc: '乱码字符集；留空则中间格用真字本身' },
  { name: 'colorFrom', type: 'string', def: 'undefined', desc: '起始文字颜色；传 `--color-*` 变量名会在播放时解析成真实颜色' },
  { name: 'colorTo', type: 'string', def: 'undefined', desc: '结束文字颜色' },
  { name: 'triggerOnce', type: 'boolean', def: 'true', desc: '只自动触发一次（false 则每次进入视口都重播）' },
  { name: 'respectReducedMotion', type: 'boolean', def: 'true', desc: '系统开启「减少动效」时直接落位' },
  { name: 'triggerOnHover', type: 'boolean', def: 'true', desc: '播完后悬停可重播' },
  { name: '（事件）complete', type: '() => void', def: '—', desc: '一轮完成（或每次循环重复）时触发，对应上游 onShuffleComplete' },
  { name: '（根 class）', type: '—', def: '—', desc: 'Vue 里直接写 class（透传到根元素），等价上游 className' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">洗牌机 Shuffle</h1>
    <p class="mt-3 text-muted-foreground">
      每个字符是一条<strong>滚轮</strong>：滚过几格乱码，最后停在真字上。
      <strong>移植自 React Bits</strong>（MIT）—— 原版用 <code>gsap</code> + <code>SplitText</code> + <code>ScrollTrigger</code>；
      这里换成自研切分（词为块、字符为滚轮）+ WAAPI 的 <code>transform</code> + IntersectionObserver，
      每格的宽高在挂载时实测。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>滚出去再滚回来会重新触发（或点「重播」重新挂载）。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex min-h-[220px] items-center justify-center rounded-xl border border-border bg-muted/40 px-8 py-10">
          <Shuffle
            :key="replay"
            :text="shuffle.text"
            :shuffle-direction="shuffle.direction"
            :animation-mode="shuffle.mode"
            :ease="shuffle.ease"
            :duration="shuffle.duration"
            :shuffle-times="shuffle.shuffleTimes"
            :stagger="shuffle.stagger"
            :max-delay="shuffle.maxDelay"
            :loop="shuffle.loop"
            :loop-delay="shuffle.loopDelay"
            :scramble-charset="shuffle.charset"
            :color-from="shuffle.from"
            :color-to="shuffle.to"
            :threshold="shuffle.threshold"
            :root-margin="shuffle.rootMargin"
            :trigger-once="shuffle.triggerOnce"
            :trigger-on-hover="shuffle.triggerOnHover"
            :respect-reduced-motion="shuffle.respectReducedMotion"
            :class="shuffle.loud ? 'text-5xl font-bold uppercase tracking-wide text-foreground' : 'text-2xl text-foreground'"
            @complete="onComplete"
          />
        </div>

        <div class="space-y-1 text-xs text-muted-foreground">
          <p>
            滚轮总格数 = <span class="font-mono">{{ shuffle.shuffleTimes + 2 }}</span>
            （真字副本 + {{ shuffle.shuffleTimes }} 格乱码 + 真字）
          </p>
          <p>事件 <code>complete</code>：</p>
          <ul v-if="events.length" class="space-y-0.5 font-mono">
            <li v-for="e in events" :key="e">{{ e }}</li>
          </ul>
          <p v-else class="font-mono">（还没跑完一轮）</p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="shuffle.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">滚动方向</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in DIRECTION_OPTIONS"
                :key="opt.value"
                :variant="shuffle.direction === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="shuffle.direction = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">节奏模式</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in MODE_OPTIONS"
                :key="opt.value"
                :variant="shuffle.mode === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="shuffle.mode = opt.value"
              >{{ opt.label }}</Button>
            </div>
            <p class="text-[11px] leading-relaxed text-muted-foreground">
              {{ MODE_OPTIONS.find(m => m.value === shuffle.mode)?.hint }}
            </p>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">缓动</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in EASE_OPTIONS"
                :key="opt.value"
                :variant="shuffle.ease === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="shuffle.ease = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">乱码字符集</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in CHARSET_OPTIONS"
                :key="opt.label"
                :variant="shuffle.charsetLabel === opt.label ? 'default' : 'outline'"
                size="sm"
                @click="pickCharset(opt)"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">配色（<code>--color-*</code> 会跟随主题）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in COLOR_OPTIONS"
                :key="opt.label"
                :variant="shuffle.colorLabel === opt.label ? 'default' : 'outline'"
                size="sm"
                @click="pickColor(opt)"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">触发偏移</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in ROOT_MARGIN_OPTIONS"
                :key="opt.value"
                :variant="shuffle.rootMargin === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="shuffle.rootMargin = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">其他</p>
            <Button variant="outline" size="sm" @click="replay++">重播</Button>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">开关</p>
          <div class="grid gap-3 sm:grid-cols-2">
            <label
              v-for="t in TOGGLES"
              :key="t.key"
              class="flex cursor-pointer items-center justify-between gap-4 rounded-md px-1 py-1"
            >
              <span class="space-y-0.5">
                <span class="block text-sm">{{ t.label }}</span>
                <span class="block text-xs text-muted-foreground">{{ t.hint }}</span>
              </span>
              <Switch v-model="shuffle[t.key]" />
            </label>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div
              v-for="s in SLIDERS"
              :key="s.key"
              class="space-y-1.5"
              :class="s.mode && s.mode !== shuffle.mode ? 'opacity-50' : ''"
            >
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">{{ s.label }}</span>
                <span class="text-xs font-medium tabular-nums">{{ shuffle[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[shuffle[s.key]]"
                :min="s.min"
                :max="s.max"
                :step="s.step"
                :disabled="!!s.mode && s.mode !== shuffle.mode"
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
            <li><strong>不依赖 GSAP</strong>：滚动是 WAAPI 的 <code>transform</code> 关键帧，节奏拆成「每条滚轮一个 delay」，不再用 timeline。</li>
            <li><strong>滚轮结构</strong>：<code>[真字副本, N 格乱码, 真字]</code>；左/上方向直接按这个顺序滚（终点是最后一格），右/下方向把顺序旋转成 <code>[真字, …, 真字副本]</code>（终点是 <code>translate 0</code>）—— 两种写法在起点看到的都是「真字」，不会闪。</li>
            <li><strong>尺寸是实测的</strong>：挂载后先渲染一遍朴素字符（此时整块 <code>visibility: hidden</code>），量出每个字符的宽、以及竖直滚轮需要的一格高度，再切到滚轮结构。所以字体加载完会自动重测。</li>
            <li><code>evenodd</code> 的节奏与上游一致：奇数位从 0 开始、偶数位从 <code>(duration + (奇数个数-1) × stagger) × 0.7</code> 开始，两组内部各自按 <code>stagger</code> 递增。</li>
            <li><code>scrambleCharset</code> 留空时中间格就是真字本身（观感是「字滑进来」）；非空时每轮播放 / 每次循环都会重新抽一次乱码。</li>
            <li>播完会<strong>落成静态结构</strong>（只留真字、清掉 transform）—— 上游的 <code>cleanupToStill</code>，避免一直挂着 <code>will-change</code>。</li>
            <li><code>colorFrom</code> / <code>colorTo</code> 传 <code>--color-*</code> 时会在<strong>播放时解析成真实颜色</strong>（WAAPI 没法在 <code>var()</code> 之间插值）；主题切换后会重算落位颜色。不传就是继承外层文字色（即当前主题色）。</li>
            <li>竖直方向每格等高（取实测字符高度），所以 <code>up</code> / <code>down</code> 也能对齐。</li>
            <li>换行：<strong>词</strong>（或单个 CJK 字）是 <code>inline-block</code>，换行只发生在它们之间，不会把英文单词劈开。</li>
            <li>屏幕阅读器只会读到真字：乱码格都带 <code>aria-hidden</code>。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { Shuffle } from '@/components/motion'</code></CardDescription>
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
