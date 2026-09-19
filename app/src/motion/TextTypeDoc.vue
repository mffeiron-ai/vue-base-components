<script setup lang="ts">
/**
 * TextType 文档页（路由 /motion/text-type）
 * 移植自 React Bits 的 Text Type（MIT）：原版用 gsap 做光标闪烁，这里换成 CSS @keyframes。
 */
import { computed, reactive, ref } from 'vue'
import { TextType } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const TEXT_PRESETS: { label: string; texts: string[]; loop?: boolean }[] = [
  {
    label: '两句循环（上游默认）',
    texts: ['Welcome to React Bits! Good to see you!', 'Build some amazing experiences!'],
  },
  {
    label: '单句不循环',
    texts: ['只有这一句，打完就停在这里 —— 不会删除。'],
    loop: false,
  },
  {
    label: '中英混排',
    texts: ['打字机效果 Text Type', '颜色跟着主题走 ✦'],
  },
  {
    label: '长文本（看折行）',
    texts: ['这是一段比较长的中文，用来看折行是否自然、以及打字节奏会不会太快。'],
  },
  {
    label: '三句轮播',
    texts: ['第一句：先打个招呼', '第二句：再停一下', '第三句：然后删掉重来'],
  },
]

const CURSOR_PRESETS = [
  { label: '竖线 |', value: '|' },
  { label: '下划线 _', value: '_' },
  { label: '方块 ▎', value: '▎' },
  { label: '圆点 ●', value: '●' },
  { label: '实心块 █', value: '█' },
  { label: '箭头 ▸', value: '▸' },
]

/** 传 --color-* 变量名 → 自动包成 var(...)，换主题颜色跟着变 */
const COLOR_PRESETS: { label: string; colors: string[] }[] = [
  { label: '跟随主题', colors: [] },
  { label: '主色', colors: ['--color-primary'] },
  { label: '主色 · 前景交替', colors: ['--color-primary', '--color-foreground'] },
  { label: '按句轮换', colors: ['--color-primary', '--color-foreground', '--color-primary', '--color-foreground'] },
]

const typing = reactive({
  texts: [...TEXT_PRESETS[0].texts],
  textLabel: TEXT_PRESETS[0].label,
  loop: true,
  cursorCharacter: '|',
  showCursor: true,
  hideCursorWhileTyping: false,
  reverseMode: false,
  startOnVisible: false,
  variableSpeedEnabled: false,
  colors: [] as string[],
  colorLabel: COLOR_PRESETS[0].label,
  typingSpeed: 75,
  deletingSpeed: 50,
  pauseDuration: 1500,
  initialDelay: 300,
  cursorBlinkDuration: 0.5,
  varMin: 60,
  varMax: 120,
})

function pickText(preset: (typeof TEXT_PRESETS)[number]) {
  typing.textLabel = preset.label
  typing.texts = [...preset.texts]
  if (preset.loop !== undefined) typing.loop = preset.loop
}

function pickColor(preset: (typeof COLOR_PRESETS)[number]) {
  typing.colorLabel = preset.label
  typing.colors = [...preset.colors]
}

type NumberKey =
  | 'typingSpeed'
  | 'deletingSpeed'
  | 'pauseDuration'
  | 'initialDelay'
  | 'cursorBlinkDuration'
  | 'varMin'
  | 'varMax'

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: 'typingSpeed', label: '打字间隔', min: 10, max: 200, step: 5, unit: 'ms' },
  { key: 'deletingSpeed', label: '删除间隔', min: 10, max: 100, step: 5, unit: 'ms' },
  { key: 'pauseDuration', label: '打完停顿', min: 200, max: 5000, step: 100, unit: 'ms' },
  { key: 'initialDelay', label: '初始延迟', min: 0, max: 3000, step: 50, unit: 'ms' },
  { key: 'cursorBlinkDuration', label: '光标闪烁（半周期）', min: 0.1, max: 2, step: 0.1, unit: 's' },
  { key: 'varMin', label: '抖动下限', min: 10, max: 200, step: 5, unit: 'ms' },
  { key: 'varMax', label: '抖动上限', min: 40, max: 400, step: 5, unit: 'ms' },
]

function setSlider(key: NumberKey, value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') typing[key] = v
}

type ToggleKey = 'loop' | 'showCursor' | 'hideCursorWhileTyping' | 'reverseMode' | 'startOnVisible' | 'variableSpeedEnabled'

const TOGGLES: { key: ToggleKey; label: string; hint: string }[] = [
  { key: 'loop', label: '循环播放', hint: '整组句子打完删完再从头来' },
  { key: 'showCursor', label: '显示光标', hint: '关掉就只剩文字' },
  { key: 'hideCursorWhileTyping', label: '打字时隐藏光标', hint: '只在停顿、打字结束时显示' },
  { key: 'reverseMode', label: '反向打字', hint: '把每句的字序倒过来打（从右往左）' },
  { key: 'variableSpeedEnabled', label: '速度抖动', hint: '在区间内随机取值，手打感更自然' },
  { key: 'startOnVisible', label: '从可见开始', hint: '进入视口才开始（默认挂载即开始）' },
]

const replay = ref(0)
const events = ref<string[]>([])
function onSentenceComplete(sentence: string, index: number) {
  const at = new Date().toLocaleTimeString()
  events.value = [`${at} · #${index} 「${sentence.slice(0, 24)}」删完`, ...events.value].slice(0, 4)
}

const variableSpeed = computed(() =>
  typing.variableSpeedEnabled ? { min: typing.varMin, max: typing.varMax } : undefined,
)

const usageSnippet = computed(
  () => `<TextType
  :text="[${typing.texts.map(t => `'${t.slice(0, 18)}'`).join(', ')}]"
  :typing-speed="${typing.typingSpeed}"
  :deleting-speed="${typing.deletingSpeed}"
  :pause-duration="${typing.pauseDuration}"
  :initial-delay="${typing.initialDelay}"
  :loop="${typing.loop}"
  cursor-character="${typing.cursorCharacter}"
  :cursor-blink-duration="${typing.cursorBlinkDuration}"
  :text-colors="[${typing.colors.map(c => `'${c}'`).join(', ')}]"
  @sentence-complete="onSentenceComplete"
/>`,
)

const PROPS = [
  { name: 'text', type: 'string | string[]', def: '—', desc: '要打的一句话，或一组句子' },
  { name: 'as', type: "'div' | 'span' | 'p' | 'h1'…'h4'", def: "'div'", desc: '渲染成什么标签' },
  { name: 'typingSpeed', type: 'number', def: '50', desc: '每个字符之间的间隔（毫秒）' },
  { name: 'initialDelay', type: 'number', def: '0', desc: '开始打字前的延迟（毫秒）' },
  { name: 'pauseDuration', type: 'number', def: '2000', desc: '打完到开始删除之间的停顿（毫秒）' },
  { name: 'deletingSpeed', type: 'number', def: '30', desc: '删除时每个字符的间隔（毫秒）' },
  { name: 'loop', type: 'boolean', def: 'true', desc: '是否循环整组句子；false 时最后一句打完停住（不删、不抛事件）' },
  { name: 'showCursor', type: 'boolean', def: 'true', desc: '是否显示光标' },
  { name: 'hideCursorWhileTyping', type: 'boolean', def: 'false', desc: '打字 / 删除过程中隐藏光标' },
  { name: 'cursorCharacter', type: 'string', def: "'|'", desc: '光标字符（emoji / 符号都行）' },
  { name: 'cursorClassName', type: 'string', def: "''", desc: '光标额外 class' },
  { name: 'cursorBlinkDuration', type: 'number', def: '0.5', desc: '光标闪烁的半周期时长（秒）' },
  { name: 'textColors', type: 'string[]', def: '[]', desc: '每句颜色，按句序号轮换；传 `--color-*` 变量名会跟随主题' },
  { name: 'variableSpeed', type: '{ min: number; max: number }', def: 'undefined', desc: '打字速度在区间内随机，模拟手打' },
  { name: 'startOnVisible', type: 'boolean', def: 'false', desc: '进入视口才开始（默认挂载即开始）' },
  { name: 'reverseMode', type: 'boolean', def: 'false', desc: '反向打字（每句字序倒过来）' },
  { name: '（事件）sentenceComplete', type: '(sentence, index) => void', def: '—', desc: '一句话被完整删完时触发（对应上游 onSentenceComplete）' },
  { name: '（根 class）', type: '—', def: '—', desc: 'Vue 里直接写 class（透传到根元素），等价上游 className' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">打字机 TextType</h1>
    <p class="mt-3 text-muted-foreground">
      逐<strong>字</strong>打出来、停一下、再逐字删掉，支持多句轮播。
      <strong>移植自 React Bits</strong>（MIT）—— 原版只用 gsap 做<strong>光标闪烁</strong>，
      打字状态机本身就是 <code>useEffect + setTimeout</code> 链；这里把闪烁换成 CSS
      <code>@keyframes</code>（<code>alternate infinite</code> 等价 <code>yoyo + repeat: -1</code>），节奏仍用 <code>setTimeout</code>。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>「重播」会从头开始；改文案 / 反向开关也会自动重来。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="min-h-[200px] rounded-xl border border-border bg-muted/40 px-6 py-6">
          <TextType
            :key="replay"
            :text="typing.texts"
            :typing-speed="typing.typingSpeed"
            :deleting-speed="typing.deletingSpeed"
            :pause-duration="typing.pauseDuration"
            :initial-delay="typing.initialDelay"
            :loop="typing.loop"
            :show-cursor="typing.showCursor"
            :hide-cursor-while-typing="typing.hideCursorWhileTyping"
            :cursor-character="typing.cursorCharacter"
            :cursor-blink-duration="typing.cursorBlinkDuration"
            :text-colors="typing.colors"
            :variable-speed="variableSpeed"
            :start-on-visible="typing.startOnVisible"
            :reverse-mode="typing.reverseMode"
            class="text-2xl font-semibold leading-relaxed"
            @sentence-complete="onSentenceComplete"
          />
        </div>

        <div class="space-y-1 text-xs text-muted-foreground">
          <p>
            变量速度：
            <span class="font-mono">{{ variableSpeed ? `${typing.varMin}–${typing.varMax}ms 随机` : '关闭（用打字间隔）' }}</span>
          </p>
          <p>
            事件 <code>sentenceComplete</code>（一句被<strong>完整删完</strong>时抛，与上游一致）：
          </p>
          <ul v-if="events.length" class="space-y-0.5 font-mono">
            <li v-for="e in events" :key="e">{{ e }}</li>
          </ul>
          <p v-else class="font-mono">（还没删完过一句）</p>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="typing.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">光标字符</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="c in CURSOR_PRESETS"
                :key="c.value"
                :variant="typing.cursorCharacter === c.value ? 'default' : 'outline'"
                size="sm"
                @click="typing.cursorCharacter = c.value"
              >{{ c.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">配色（按句轮换）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="c in COLOR_PRESETS"
                :key="c.label"
                :variant="typing.colorLabel === c.label ? 'default' : 'outline'"
                size="sm"
                @click="pickColor(c)"
              >{{ c.label }}</Button>
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
              <Switch v-model="typing[t.key]" />
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
              :class="(s.key === 'varMin' || s.key === 'varMax') && !typing.variableSpeedEnabled ? 'opacity-50' : ''"
            >
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">{{ s.label }}</span>
                <span class="text-xs font-medium tabular-nums">{{ typing[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[typing[s.key]]"
                :min="s.min"
                :max="s.max"
                :step="s.step"
                :disabled="(s.key === 'varMin' || s.key === 'varMax') && !typing.variableSpeedEnabled"
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
            <li><strong>不依赖 GSAP</strong>：光标闪烁是纯 CSS <code>@keyframes</code> + <code>alternate infinite</code>，等价上游的 <code>yoyo: true, repeat: -1</code>；缓动 <code>cubic-bezier(.65,0,.35,1)</code> 就是 <code>power2.inOut</code>。</li>
            <li>打字节奏走 <code>setTimeout</code> 链而<strong>不是 rAF</strong>（后台标签页里 rAF 会被冻结，动画会停）。</li>
            <li><code>sentenceComplete</code> 的时机与上游一致：<strong>一句话被完整删完</strong>时抛，不是刚打完时；事件参数是 <code>(sentence, index)</code>。</li>
            <li><code>loop=false</code> 时最后一句<strong>打完就停住</strong>：不删除、也不抛事件（上游行为）。</li>
            <li>逐字按<strong>码点</strong>切（<code>Array.from</code>），所以 emoji / 生僻字不会被劈成两半（上游按 UTF-16 下标切）。</li>
            <li>颜色：<code>textColors</code> 里传 <code>--color-*</code> 变量名会包成 <code>var(...)</code>，换主题自动跟着变；不传则是 <code>inherit</code>（继承外层文字色）。</li>
            <li><code>prefers-reduced-motion</code> 只关掉光标闪烁 —— 打字本身是内容，不做降级。</li>
            <li><code>startOnVisible</code> 用 IntersectionObserver，只触发一次；其余情况挂载即开始。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { TextType } from '@/components/motion'</code></CardDescription>
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
