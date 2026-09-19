<script setup lang="ts">
/**
 * TrueFocus 文档页（路由 /motion/true-focus）
 * 移植自 React Bits 的 True Focus（MIT）：原版用 motion 补间方框，这里换成纯 CSS 过渡。
 */
import { computed, reactive, ref } from 'vue'
import { TrueFocus } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { toHexColor, useThemeTick } from '../lib/themeColors'

const SENTENCE_PRESETS = [
  { label: '默认', value: 'True Focus' },
  { label: '中文', value: '真聚焦 只清晰一个词' },
  { label: '中英混排', value: 'True 聚焦 Focus 效果' },
  { label: '长句（看折行）', value: 'Only one word stays sharp while the others fade away' },
]

const COLOR_PRESETS = [
  { label: '跟随主题（默认）', value: '--color-primary' },
  { label: '上游绿', value: 'green' },
  { label: '主题危险色', value: '--color-destructive' },
  { label: '纯白', value: '#ffffff' },
]

const focus = reactive({
  sentence: SENTENCE_PRESETS[0].value,
  sentenceLabel: SENTENCE_PRESETS[0].label,
  manualMode: false,
  blurAmount: 5,
  animationDuration: 0.5,
  pauseBetweenAnimations: 1,
  colorLabel: '跟随主题（默认）',
  borderColor: '--color-primary',
})

const compRef = ref<{
  currentIndex?: number
  words?: string[]
  focus?: (index: number) => void
} | null>(null)

const tick = useThemeTick()
const borderHex = computed(() => {
  tick.value
  return toHexColor(focus.borderColor, '#3b82f6')
})

function pickSentence(preset: (typeof SENTENCE_PRESETS)[number]) {
  focus.sentenceLabel = preset.label
  focus.sentence = preset.value
}

function pickColor(preset: (typeof COLOR_PRESETS)[number]) {
  focus.colorLabel = preset.label
  focus.borderColor = preset.value
}

function onColorInput(e: Event) {
  focus.colorLabel = '自定义'
  focus.borderColor = (e.target as HTMLInputElement).value
}

function onSlider(key: 'blurAmount' | 'animationDuration' | 'pauseBetweenAnimations', value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') focus[key] = v
}

const currentWord = computed(() => {
  const index = compRef.value?.currentIndex ?? 0
  const list = compRef.value?.words ?? []
  return `${index + 1}/${list.length}：${list[index] ?? ''}`
})

function nextWord() {
  const list = compRef.value?.words ?? []
  if (!list.length) return
  compRef.value?.focus?.(((compRef.value?.currentIndex ?? 0) + 1) % list.length)
}

const usageSnippet = computed(
  () => `<TrueFocus
  sentence="${focus.sentence.slice(0, 24)}"
  ${focus.manualMode ? 'manual-mode\n  ' : ''}:blur-amount="${focus.blurAmount}"
  :animation-duration="${focus.animationDuration}"
  :pause-between-animations="${focus.pauseBetweenAnimations}"
  border-color="${focus.borderColor}"
/>`,
)

const PROPS = [
  { name: 'sentence', type: 'string', def: "'True Focus'", desc: '要展示的句子（按 separator 切成词）' },
  { name: 'separator', type: 'string', def: "' '", desc: '切词用的分隔符' },
  { name: 'manualMode', type: 'boolean', def: 'false', desc: '手动模式：悬停哪个词就聚焦哪个；false 时按下面的时长自动轮换' },
  { name: 'blurAmount', type: 'number', def: '5', desc: '非当前词的模糊量（px）' },
  { name: 'borderColor', type: 'string', def: "'--color-primary'", desc: '四角括号的颜色；传 --color-* 变量名跟随主题（上游默认是 green）' },
  { name: 'glowColor', type: 'string', def: "''（跟 borderColor）", desc: '括号的辉光色；不传则与 borderColor 相同' },
  { name: 'animationDuration', type: 'number', def: '0.5', desc: '过渡时长（秒），也参与自动轮换间隔的计算' },
  { name: 'pauseBetweenAnimations', type: 'number', def: '1', desc: '自动轮换两次之间的停顿（秒）' },
]

const EXPOSED = [
  { name: 'currentIndex', desc: '当前聚焦的词下标（可读的 ref）' },
  { name: 'words', desc: '切好之后的词列表（可读；中文会逐字切开）' },
  { name: 'focus(index)', desc: '手动聚焦某个词（下标越界会被忽略）' },
  { name: 'remeasure()', desc: '重新量一次方框（外部改了字号 / 字体之后可以调）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">真聚焦 TrueFocus</h1>
    <p class="mt-3 text-muted-foreground">
      一排词里只有一个<strong>清晰</strong>，其余全糊掉，四角的<strong>括号</strong>会平滑地滑到当前词上。
      <strong>移植自 React Bits</strong>（MIT）：原版用 motion 把方框的 x/y/宽/高补间到当前词的矩形，
      这里换成<strong>纯 CSS 过渡</strong>（<code>translate()</code> + <code>width/height</code> + <code>transition</code>），
      观感一致且零依赖。默认按 <code>animationDuration + pauseBetweenAnimations</code>
      自动轮换，打开 <code>manualMode</code> 就改成「悬停哪个聚焦哪个」。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>
          当前聚焦：<span class="font-mono">{{ currentWord }}</span>
          <span v-if="focus.manualMode"> · 把鼠标移到任意词上</span>
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex min-h-[200px] items-center justify-center rounded-xl border border-border bg-background px-10 py-16">
          <TrueFocus
            ref="compRef"
            :sentence="focus.sentence"
            :manual-mode="focus.manualMode"
            :blur-amount="focus.blurAmount"
            :animation-duration="focus.animationDuration"
            :pause-between-animations="focus.pauseBetweenAnimations"
            :border-color="focus.borderColor"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="nextWord">手动聚焦下一个</Button>
          <span class="text-xs text-muted-foreground">调的是组件 <code>defineExpose</code> 出去的 <code>focus(index)</code></span>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">句子</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="s in SENTENCE_PRESETS"
                :key="s.label"
                :variant="focus.sentenceLabel === s.label ? 'default' : 'outline'"
                size="sm"
                @click="pickSentence(s)"
              >{{ s.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">括号颜色（<code>--color-*</code> 跟随主题）</p>
            <div class="flex flex-wrap items-center gap-2">
              <Button
                v-for="c in COLOR_PRESETS"
                :key="c.label"
                :variant="focus.colorLabel === c.label ? 'default' : 'outline'"
                size="sm"
                @click="pickColor(c)"
              >{{ c.label }}</Button>
              <input
                type="color"
                class="h-8 w-10 cursor-pointer rounded border border-border bg-transparent"
                :value="borderHex"
                @input="onColorInput"
              >
              <code class="text-xs">{{ borderHex }}</code>
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">开关</p>
          <label class="flex cursor-pointer items-center justify-between gap-4 rounded-md px-1 py-1">
            <span class="space-y-0.5">
              <span class="block text-sm">手动模式（manualMode）</span>
              <span class="block text-xs text-muted-foreground">打开后不再自动轮换，改为悬停哪个词就聚焦哪个（移开不会回退）</span>
            </span>
            <Switch v-model="focus.manualMode" />
          </label>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">模糊量</span>
                <span class="text-xs font-medium tabular-nums">{{ focus.blurAmount }}px</span>
              </div>
              <Slider
                :model-value="[focus.blurAmount]"
                :min="0"
                :max="15"
                :step="0.5"
                @update:model-value="v => onSlider('blurAmount', v)"
              />
            </div>
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">过渡时长</span>
                <span class="text-xs font-medium tabular-nums">{{ focus.animationDuration }}s</span>
              </div>
              <Slider
                :model-value="[focus.animationDuration]"
                :min="0.1"
                :max="3"
                :step="0.1"
                @update:model-value="v => onSlider('animationDuration', v)"
              />
            </div>
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">轮换停顿</span>
                <span class="text-xs font-medium tabular-nums">{{ focus.pauseBetweenAnimations }}s</span>
              </div>
              <Slider
                :model-value="[focus.pauseBetweenAnimations]"
                :min="0"
                :max="5"
                :step="0.5"
                :disabled="focus.manualMode"
                @update:model-value="v => onSlider('pauseBetweenAnimations', v)"
              />
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            自动模式的间隔 = 过渡时长 + 轮换停顿 = {{ (focus.animationDuration + focus.pauseBetweenAnimations).toFixed(1) }}s
            <span v-if="focus.manualMode">（手动模式下轮换停顿不参与）</span>
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">用法</p>
          <pre class="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed"><code>{{ usageSnippet }}</code></pre>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">实现上的注意点</p>
          <ul class="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li><strong>方框不是「算」出来的，是「量」出来的</strong>：每次切词都拿容器与当前词的 <code>getBoundingClientRect()</code> 相减，把结果写成方框的 <code>translate(x, y)</code> + <code>width/height</code>；平滑感交给 CSS 过渡（<code>transition: transform / width / height / opacity</code>），等价于上游用 motion 做的补间。</li>
            <li>绝对定位子项的包含块是容器的<strong>内边距盒</strong>，所以测量时会加上容器的边框宽度（消费者给根元素加 border 也不会错位）。</li>
            <li><strong>重新测量的时机</strong>：切词、容器尺寸变化（<code>ResizeObserver</code>）、窗口 resize、字体加载完成（<code>document.fonts.ready</code>）—— 上游只做了第一项，改了字号 / 字体后括号会错位。</li>
            <li>模糊与过渡是**逐词的内联样式**：当前词 <code>blur(0px)</code>、其余 <code>blur(blurAmount px)</code>，过渡时长用 <code>animationDuration</code>。</li>
            <li><strong>两种模式的差别</strong>：自动模式用 <code>setInterval</code> 每「过渡时长 + 停顿」秒切下一个词；手动模式只在 <code>mouseenter</code> 时改焦点 —— 与上游一致，<strong>移开鼠标不会回退</strong>（上游 <code>onMouseLeave</code> 里写的是「回到进入时记下的那个下标」）。</li>
            <li>四角括号就是四个 <code>1rem</code> 的方框，分别只留两条边（<code>border-right-width: 0</code> 之类），摆在方框外沿 <code>-10px</code> 处，配 <code>drop-shadow</code> 发光。</li>
            <li><strong>glowColor 真的生效了</strong>：上游 CSS/JSX 里写的是 <code>drop-shadow(... var(--border-color))</code>，`glowColor` 这个 prop 传了也没用；这里按 prop 的语义用它，不传则回落到 `borderColor`。</li>
            <li>首帧量完之前方框 <code>opacity: 0</code>，否则四个角会在左上角闪一下（上游没处理）。</li>
            <li>中文句子没有空格，会被当成一个词 → 组件对 CJK 逐字切开（和本仓库其它文字动效一致）。</li>
            <li>字号 / 字重来自上游 CSS（<code>3rem / 900</code>，无层样式）：想改要写 <code>text-5xl!</code> 这类 important 写法，或直接改组件的 scoped 样式。</li>
            <li><code>prefers-reduced-motion: reduce</code> 时过渡关掉（焦点直接跳过去）。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { TrueFocus } from '@/components/motion'</code></CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
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

        <div>
          <p class="text-sm font-semibold">暴露的方法 / 状态</p>
          <div class="mt-2 overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b text-left">
                  <th class="py-2 pr-4 font-medium">名称</th>
                  <th class="py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in EXPOSED" :key="p.name" class="border-b">
                  <td class="py-2 pr-4 align-top"><code>{{ p.name }}</code></td>
                  <td class="py-2 align-top text-muted-foreground">{{ p.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
