<script setup lang="ts">
/**
 * GradientText 文档页（路由 /motion/gradient-text）
 * 移植自 React Bits 的 Gradient Text（MIT）：原版用 rAF 逐帧推 background-position，这里换成等价的 CSS keyframes。
 */
import { computed, reactive } from 'vue'
import { GradientText } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { toHexColor, useThemeTick } from '../lib/themeColors'

const TEXT_PRESETS = [
  { label: '默认', value: 'Gradient Magic' },
  { label: '中文', value: '渐变文字，流动起来' },
  { label: '中英混排', value: '渐变 Gradient Text 效果' },
  { label: '长句', value: 'A gradient flowing across the whole line' },
]

const COLOR_PRESETS: { label: string; colors: string[] }[] = [
  { label: '跟随主题（默认）', colors: ['--color-primary', '--color-foreground', '--color-primary'] },
  { label: '主题色阶（同色系）', colors: ['--color-primary', '--color-chart-2', '--color-primary'] },
  { label: '主色 ↔ 危险色', colors: ['--color-primary', '--color-destructive', '--color-primary'] },
  { label: '上游紫粉', colors: ['#5227FF', '#FF9FFC', '#B497CF'] },
  { label: '青蓝循环（上游用法示例）', colors: ['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa'] },
]

const DIRECTION_OPTIONS: { label: string; value: 'horizontal' | 'vertical' | 'diagonal' }[] = [
  { label: '横向（上游默认）', value: 'horizontal' },
  { label: '纵向', value: 'vertical' },
  { label: '对角', value: 'diagonal' },
]

/** 加色标时的取色来源（按顺序补，凑够数量为止） */
const PALETTE = ['--color-primary', '#40ffaa', '#4079ff', '#FF9FFC', '#B497CF', '#f59e0b', '#10b981', '#ef4444']

const gradient = reactive({
  text: TEXT_PRESETS[0].value,
  textLabel: TEXT_PRESETS[0].label,
  colors: [...COLOR_PRESETS[0].colors],
  colorLabel: COLOR_PRESETS[0].label,
  direction: 'horizontal' as 'horizontal' | 'vertical' | 'diagonal',
  animationSpeed: 8,
  yoyo: true,
  pauseOnHover: false,
  showBorder: false,
  loud: true,
})

const tick = useThemeTick()

/** 色标可能是主题变量名（`--color-*`），取色器只吃 `#rrggbb`，先解析成 hex */
const colorHexes = computed(() => {
  tick.value // 依赖主题变化重算
  return gradient.colors.map(c => toHexColor(c, '#000000'))
})

function pickText(preset: (typeof TEXT_PRESETS)[number]) {
  gradient.textLabel = preset.label
  gradient.text = preset.value
}

function pickColors(preset: (typeof COLOR_PRESETS)[number]) {
  gradient.colorLabel = preset.label
  gradient.colors = [...preset.colors]
}

function setColorCount(value: number[] | undefined) {
  const n = value?.[0]
  if (typeof n !== 'number') return
  const list = gradient.colors
  while (list.length < n) list.push(PALETTE[list.length % PALETTE.length])
  if (list.length > n) list.splice(n)
  gradient.colorLabel = '自定义'
}

function onColorInput(index: number, e: Event) {
  const value = (e.target as HTMLInputElement).value
  gradient.colors[index] = value
  gradient.colorLabel = '自定义'
}

function onSpeedInput(value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') gradient.animationSpeed = v
}

const TOGGLES: {
  key: 'yoyo' | 'pauseOnHover' | 'showBorder' | 'loud'
  label: string
  hint: string
}[] = [
  { key: 'yoyo', label: '来回流动', hint: '到端点原路返回（关掉则一直朝一个方向流）' },
  { key: 'pauseOnHover', label: '悬停暂停', hint: '鼠标移上去停住，移开继续' },
  { key: 'showBorder', label: '渐变描边', hint: '同一套渐变围出一圈 1px 的边（同时加一点内边距）' },
  { key: 'loud', label: '放大（示例观感）', hint: '放大字号，看得更清楚' },
]

const status = computed(() => {
  const dir = DIRECTION_OPTIONS.find(d => d.value === gradient.direction)?.label ?? ''
  return `${gradient.colors.length} 个色标 · ${dir} · ${gradient.animationSpeed}s · ${gradient.yoyo ? '来回' : '单向'}`
})

const usageSnippet = computed(
  () => `<GradientText
  text="${gradient.text.slice(0, 16)}"
  :colors="[${gradient.colors.map(c => `'${c}'`).join(', ')}]"
  :animation-speed="${gradient.animationSpeed}"
  direction="${gradient.direction}"
  ${gradient.yoyo ? 'yoyo\n  ' : ''}${gradient.pauseOnHover ? 'pause-on-hover\n  ' : ''}${gradient.showBorder ? ':show-border="true"\n  border-fill="--color-card"' : ':show-border="false"'}
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "'Gradient Magic'", desc: '展示的文案（也可以用默认插槽，插槽优先）；上游对应 children' },
  { name: 'colors', type: 'string[]', def: "['--color-primary', '--color-foreground', '--color-primary']", desc: '渐变色标；传 --color-* 变量名跟随主题（上游是 #5227FF / #FF9FFC / #B497CF）' },
  { name: 'animationSpeed', type: 'number', def: '8', desc: '一个动画循环的时长（秒）' },
  { name: 'direction', type: "'horizontal' | 'vertical' | 'diagonal'", def: "'horizontal'", desc: '渐变方向；对角与横向走同一套关键帧（只推横向）' },
  { name: 'yoyo', type: 'boolean', def: 'true', desc: '到端点原路返回；false 则一直朝一个方向流' },
  { name: 'pauseOnHover', type: 'boolean', def: 'false', desc: '悬停暂停（animation-play-state）' },
  { name: 'showBorder', type: 'boolean', def: 'false', desc: '加一圈渐变描边（同一套渐变铺满 + 中间挖空）' },
  { name: 'borderFill', type: 'string', def: "'--color-background'", desc: '描边模式里挖空块的颜色；放在卡片上就传 --color-card（上游写死 #120F17）' },
  { name: '（根 class / style）', type: '—', def: '—', desc: '透传到根元素，等价上游 className；组件自带 font-weight: 500 等无层样式，覆盖要写 font-bold! 这类 important' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">渐变文字 GradientText</h1>
    <p class="mt-3 text-muted-foreground">
      一条会<strong>流动</strong>的渐变铺在文字上 —— 渐变按 300% 的尺寸平铺、裁到文字上，靠推
      <code>background-position</code> 让颜色走起来。<strong>移植自 React Bits</strong>（MIT）：原版用 rAF 逐帧推，
      这里换成<strong>等价的一整套 CSS keyframes</strong>（上游的 <code>yoyo</code> 正好是 CSS 的
      <code>alternate</code>），更省电、切回标签页也不会错位；颜色默认取主题 token，跟着当前主题走。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>
          <span class="font-mono">{{ status }}</span>
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex min-h-[200px] items-center justify-center rounded-xl border border-border bg-background px-8 py-12">
          <GradientText
            :text="gradient.text"
            :colors="gradient.colors"
            :animation-speed="gradient.animationSpeed"
            :direction="gradient.direction"
            :yoyo="gradient.yoyo"
            :pause-on-hover="gradient.pauseOnHover"
            :show-border="gradient.showBorder"
            border-fill="--color-card"
            :class="gradient.loud ? 'text-5xl font-bold!' : 'text-2xl'"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="gradient.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">方向</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in DIRECTION_OPTIONS"
                :key="opt.value"
                :variant="gradient.direction === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="gradient.direction = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2 sm:col-span-2">
            <p class="text-sm font-semibold">配色预设（<code>--color-*</code> 跟随主题）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="c in COLOR_PRESETS"
                :key="c.label"
                :variant="gradient.colorLabel === c.label ? 'default' : 'outline'"
                size="sm"
                @click="pickColors(c)"
              >{{ c.label }}</Button>
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">色标</p>
          <div class="grid gap-3 sm:grid-cols-4">
            <label v-for="(hex, i) in colorHexes" :key="i" class="space-y-1.5">
              <span class="block text-xs text-muted-foreground">
                色标 {{ i + 1 }}
                <span v-if="gradient.colors[i] !== hex" class="font-mono">（{{ gradient.colors[i] }}）</span>
              </span>
              <span class="flex items-center gap-2">
                <input
                  type="color"
                  class="h-8 w-10 shrink-0 cursor-pointer rounded border border-border bg-transparent"
                  :value="hex"
                  @input="onColorInput(i, $event)"
                >
                <code class="text-xs">{{ hex }}</code>
              </span>
            </label>
          </div>
          <p class="text-xs text-muted-foreground">
            取色器只吃 <code>#rrggbb</code>，主题变量名会先解析成当前色值显示；动过取色器就会把该色标固定成具体颜色。
          </p>
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
              <Switch v-model="gradient[t.key]" />
            </label>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">一个循环的时长</span>
                <span class="text-xs font-medium tabular-nums">{{ gradient.animationSpeed }}s</span>
              </div>
              <Slider
                :model-value="[gradient.animationSpeed]"
                :min="1"
                :max="20"
                :step="0.5"
                @update:model-value="onSpeedInput"
              />
            </div>
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">色标数量</span>
                <span class="text-xs font-medium tabular-nums">{{ gradient.colors.length }}</span>
              </div>
              <Slider
                :model-value="[gradient.colors.length]"
                :min="2"
                :max="8"
                :step="1"
                @update:model-value="setColorCount"
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
            <li><strong>不逐帧推</strong>：上游用 rAF 改 <code>background-position</code>；这里把整条时间线写成 CSS keyframes。</li>
            <li><strong><code>yoyo</code> = CSS 的 <code>alternate</code></strong>：上游「去程 animationSpeed 秒、回程 animationSpeed 秒」与 <code>animation-direction: alternate</code> + 关键帧 <code>0% → 100%</code> 完全等价。</li>
            <li><strong>不 yoyo 时是 0% → 150%</strong>：上游的 <code>background-position</code> 会一直涨下去，因为背景是 <code>repeat</code> 的，涨满「一整圈」就接上了 —— 尺寸是 300%，所以位置百分比每 150% 正好是一圈；这里写成 0 → 150% 的无限循环，<strong>时长 ×1.5</strong> 让速度与上游一致。</li>
            <li><strong>首尾同色才顺</strong>：组件会自动把第一个色标补到末尾（上游注释也强调这点）。色标少于 2 个时回落到默认三色。</li>
            <li>颜色参数接受 <code>--color-*</code> 变量名（包成 <code>var(变量, 兜底)</code>），所以<strong>默认就跟着主题走</strong>；默认三色是「主色 → 前景色 → 主色」（前景色在深浅两套主题里都与主色差得开，渐变走向看得出来），上游默认是 <code>#5227FF</code> / <code>#FF9FFC</code> / <code>#B497CF</code>。</li>
            <li><strong>对角方向也只推横向</strong>（与上游一致）：斜着推两轴会产生干涉纹，看起来像在闪。</li>
            <li><strong>描边不是 border 画的</strong>：同一套渐变铺满整块，中间再盖一个「比外框小 2px 的挖空块」，露出来的那 1px 圈就是描边。挖空色默认 <code>--color-background</code>，放在卡片上要传 <code>border-fill="--color-card"</code>（本页示例就是这么传的）。</li>
            <li>挖空块靠 <code>z-index: -1</code> 盖到渐变之上，所以外层浮层必须 <code>z-index: 0</code> 自成层叠上下文 —— 少了这步挖空块会跑到渐变后面，看起来像「没有描边」。</li>
            <li><strong>keyframes 写在非 scoped 样式块里</strong>：scoped 会给 <code>@keyframes</code> 名字加哈希，而动画名是内联写在 <code>:style</code> 上的（Vue 只会改写 scoped CSS 里的 animation 声明）→ 名字对不上就完全不动。</li>
            <li><code>pauseOnHover</code> 用 <code>animation-play-state: paused</code>，移开续播不会跳帧；<code>prefers-reduced-motion: reduce</code> 时停在起始帧。</li>
            <li>组件自带上游的 <code>font-weight: 500</code> / <code>cursor: pointer</code> 等无层样式，要覆盖字号权重得用 important 写法（本页示例用的就是 <code>font-bold!</code>）。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { GradientText } from '@/components/motion'</code></CardDescription>
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
