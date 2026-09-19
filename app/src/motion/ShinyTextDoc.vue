<script setup lang="ts">
/**
 * ShinyText 文档页（路由 /motion/shiny-text）
 * 移植自 React Bits 的 Shiny Text（MIT）：原版用 rAF 推 background-position，这里换成等价的一整套 CSS keyframes。
 */
import { computed, reactive, ref } from 'vue'
import { ShinyText } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const TEXT_PRESETS = [
  { label: '默认', value: '✨ Shiny Text Effect' },
  { label: '中文', value: '一条高光扫过整行文字' },
  { label: '中英混排', value: '扫光 Shiny Text 效果' },
  { label: '长句（看折行）', value: 'A shine sweeping across the whole line of text' },
]

const COLOR_PRESETS: { label: string; color: string; shineColor: string }[] = [
  { label: '跟随主题（默认）', color: '--color-muted-foreground', shineColor: '--color-foreground' },
  { label: '主题主色', color: '--color-muted-foreground', shineColor: '--color-primary' },
  { label: '底色即前景色', color: '--color-foreground', shineColor: '--color-primary' },
  { label: '经典灰白（上游默认）', color: '#b5b5b5', shineColor: '#ffffff' },
]

const DIRECTION_OPTIONS = [
  { label: '从右往左（上游默认）', value: 'left' as const },
  { label: '从左往右', value: 'right' as const },
]

const shiny = reactive({
  text: TEXT_PRESETS[0].value,
  textLabel: TEXT_PRESETS[0].label,
  colorLabel: COLOR_PRESETS[0].label,
  color: COLOR_PRESETS[0].color,
  shineColor: COLOR_PRESETS[0].shineColor,
  direction: 'left' as 'left' | 'right',
  speed: 2,
  delay: 0,
  spread: 120,
  yoyo: false,
  pauseOnHover: false,
  disabled: false,
  loud: true,
})

type NumberKey = 'speed' | 'delay' | 'spread'

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: 'speed', label: '一个来回时长', min: 0.5, max: 6, step: 0.1, unit: 's' },
  { key: 'delay', label: '循环之间的停顿', min: 0, max: 3, step: 0.1, unit: 's' },
  { key: 'spread', label: '渐变角度', min: 0, max: 360, step: 5, unit: '°' },
]

function setSlider(key: NumberKey, value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') shiny[key] = v
}

function pickText(preset: (typeof TEXT_PRESETS)[number]) {
  shiny.textLabel = preset.label
  shiny.text = preset.value
}

function pickColor(preset: (typeof COLOR_PRESETS)[number]) {
  shiny.colorLabel = preset.label
  shiny.color = preset.color
  shiny.shineColor = preset.shineColor
}

const TOGGLES: { key: 'yoyo' | 'pauseOnHover' | 'disabled' | 'loud'; label: string; hint: string }[] = [
  { key: 'yoyo', label: '来回扫', hint: '扫到头再原路扫回来（否则每次从同一边重新开始）' },
  { key: 'pauseOnHover', label: '悬停暂停', hint: '鼠标移上去停住，移开继续' },
  { key: 'disabled', label: '关掉扫光', hint: '静态显示，只保留渐变底色' },
  { key: 'loud', label: '放大（示例观感）', hint: '放大字号，看得更清楚' },
]

const cycle = computed(() => (shiny.yoyo ? shiny.speed * 2 + shiny.delay : shiny.speed + shiny.delay))

const usageSnippet = computed(
  () => `<ShinyText
  text="${shiny.text.slice(0, 20)}"
  :speed="${shiny.speed}"
  :delay="${shiny.delay}"
  :spread="${shiny.spread}"
  direction="${shiny.direction}"
  color="${shiny.color}"
  shine-color="${shiny.shineColor}"
  ${shiny.yoyo ? 'yoyo\n  ' : ''}${shiny.pauseOnHover ? 'pause-on-hover\n  ' : ''}:disabled="${shiny.disabled}"
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "''", desc: '展示的文案' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '关掉扫光（静态显示）' },
  { name: 'speed', type: 'number', def: '2', desc: '一个扫光来回的时长（秒）' },
  { name: 'delay', type: 'number', def: '0', desc: '循环之间的停顿（秒）；yoyo 时平均分在两端' },
  { name: 'spread', type: 'number', def: '120', desc: '渐变角度（度）' },
  { name: 'color', type: 'string', def: "'--color-muted-foreground'", desc: '底色；传 `--color-*` 变量名跟随主题（上游是 #b5b5b5）' },
  { name: 'shineColor', type: 'string', def: "'--color-foreground'", desc: '高光色；传 `--color-*` 变量名跟随主题（上游是 #ffffff）' },
  { name: 'direction', type: "'left' | 'right'", def: "'left'", desc: '扫光方向' },
  { name: 'yoyo', type: 'boolean', def: 'false', desc: '来回扫' },
  { name: 'pauseOnHover', type: 'boolean', def: 'false', desc: '悬停暂停' },
  { name: '（根 class）', type: '—', def: '—', desc: 'Vue 里直接写 class/style（透传到根元素），等价上游 className' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">扫光文字 ShinyText</h1>
    <p class="mt-3 text-muted-foreground">
      一条<strong>高光</strong>扫过整行文字 —— 底色 + 高光拼成一条渐变，裁到文字上，靠推
      <code>background-position</code> 实现。<strong>移植自 React Bits</strong>（MIT）：原版用 rAF 逐帧推，
      这里换成<strong>等价的一整套 CSS keyframes</strong>（<code>yoyo</code> / <code>delay</code> 折成关键帧里的停滞段），
      更省电、切回标签页也不会错位；颜色默认取主题 token，所以跟着当前主题走。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>
          一个完整循环 <span class="font-mono">{{ cycle.toFixed(1) }}s</span>
          （{{ shiny.yoyo ? `来回 2 × ${shiny.speed}s` : `${shiny.speed}s` }} 扫动{{ shiny.delay ? ` + ${shiny.delay}s 停顿` : '' }}）
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex min-h-[180px] items-center justify-center rounded-xl border border-border bg-muted/40 px-8 py-12">
          <ShinyText
            :text="shiny.text"
            :speed="shiny.speed"
            :delay="shiny.delay"
            :spread="shiny.spread"
            :direction="shiny.direction"
            :color="shiny.color"
            :shine-color="shiny.shineColor"
            :yoyo="shiny.yoyo"
            :pause-on-hover="shiny.pauseOnHover"
            :disabled="shiny.disabled"
            :class="shiny.loud ? 'text-5xl font-bold tracking-tight' : 'text-2xl'"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="shiny.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">配色（<code>--color-*</code> 跟随主题）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="c in COLOR_PRESETS"
                :key="c.label"
                :variant="shiny.colorLabel === c.label ? 'default' : 'outline'"
                size="sm"
                @click="pickColor(c)"
              >{{ c.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">方向</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in DIRECTION_OPTIONS"
                :key="opt.value"
                :variant="shiny.direction === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="shiny.direction = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">其他</p>
            <Button
              variant="outline"
              size="sm"
              @click="shiny.disabled = !shiny.disabled"
            >{{ shiny.disabled ? '开启扫光' : '关掉扫光' }}</Button>
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
              <Switch v-model="shiny[t.key]" />
            </label>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div v-for="s in SLIDERS" :key="s.key" class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">{{ s.label }}</span>
                <span class="text-xs font-medium tabular-nums">{{ shiny[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[shiny[s.key]]"
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
            <li><strong>不逐帧推</strong>：上游用 rAF 改 <code>background-position</code>；这里把整条时间线写成 CSS keyframes
              （<code>150% → -50%</code> 与上游一致），<code>yoyo</code> / <code>delay</code> 折成停滞段，时长按参数算出来。</li>
            <li>因为停滞段的比例随参数变，<code>@keyframes</code> 是<strong>按实例动态生成</strong>并挂到 <code>&lt;head&gt;</code>（名字唯一，卸载时移除），这样多个实例互不干扰。</li>
            <li><code>background-clip: text</code> + <code>-webkit-text-fill-color: transparent</code> —— 渐变只画在文字上。</li>
            <li>颜色参数接受 <code>--color-*</code> 变量名（包成 <code>var(变量, 兜底)</code>），所以<strong>默认就跟着主题走</strong>。上游默认是 <code>#b5b5b5</code> / <code>#ffffff</code>（浅灰底 + 白高光），这里默认 <code>--color-muted-foreground</code> / <code>--color-foreground</code>（浅色主题下是「深色高光扫过灰字」，深色主题下是「亮色高光」，两边都自然）。</li>
            <li><code>pauseOnHover</code> 用 <code>animation-play-state: paused</code> 实现，不是靠 JS 计时器 —— 移开继续时不会跳帧。</li>
            <li><code>disabled</code> 时把高光停在屏幕外（<code>background-position: 150%</code>），文字就是纯底色。</li>
            <li>装饰性动画：<code>prefers-reduced-motion: reduce</code> 时直接不扫（CSS 媒体查询，无额外 prop）。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { ShinyText } from '@/components/motion'</code></CardDescription>
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
