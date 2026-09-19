<script setup lang="ts">
/**
 * EchoText 文档页（路由 /motion/echo-text）
 * 移植自 React Bits 的 Echo Text（MIT）：原版就是纯 DOM + rAF、零依赖。
 */
import { computed, reactive, ref } from 'vue'
import { EchoText } from '@/components/motion'
import type { EchoTextDirection, EchoTextEase, EchoTextMode } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { toHexColor, useThemeTick } from '../lib/themeColors'

const TEXT_PRESETS = [
  { label: '默认', value: 'Motion Echo' },
  { label: '短', value: 'Echo' },
  { label: '中文', value: '回声文字' },
  { label: '短语', value: 'Depth in motion' },
]

const DIRECTION_OPTIONS: { label: string; value: EchoTextDirection }[] = [
  { label: '向右', value: 'right' },
  { label: '向左', value: 'left' },
  { label: '向上', value: 'up' },
  { label: '向下', value: 'down' },
  { label: '斜向', value: 'diagonal' },
]

const MODE_OPTIONS: { label: string; hint: string; value: EchoTextMode }[] = [
  { label: '入场 + 指针', hint: '两个都跑', value: 'both' },
  { label: '只入场', hint: '进来聚一次', value: 'entrance' },
  { label: '只指针', hint: '跟着光标拖尾', value: 'pointer' },
]

const EASE_OPTIONS: { label: string; value: EchoTextEase }[] = [
  { label: 'Ease out', value: 'ease-out' },
  { label: '线性', value: 'linear' },
  { label: 'Ease in out', value: 'ease-in-out' },
  { label: 'Snappy', value: 'snappy' },
]

const echo = reactive({
  text: TEXT_PRESETS[0].value,
  direction: 'right' as EchoTextDirection,
  mode: 'both' as EchoTextMode,
  ease: 'ease-out' as EchoTextEase,
  // 颜色默认跟随主题：正文用前景色，色偏用主色
  color: '--color-foreground',
  tint: '--color-primary',
  tintOn: true,
  echoes: 12,
  lag: 0.24,
  offset: 36,
  fade: 0.72,
  blur: 3,
  cursorRadius: 320,
  duration: 900,
  fontWeight: 800,
})

/* 取色器只吃 #rrggbb，把（可能是变量名的）颜色解析出来给它；useThemeTick 让它在切主题时重算 */
const themeTick = useThemeTick()
const colorHex = computed(() => {
  themeTick.value
  return toHexColor(echo.color, '#18181b')
})
const tintHex = computed(() => {
  themeTick.value
  return toHexColor(echo.tint, '#3b82f6')
})
const followTheme = computed(() => echo.color.startsWith('--') && echo.tint.startsWith('--'))
function resetToThemeColors() {
  echo.color = '--color-foreground'
  echo.tint = '--color-primary'
}

type NumberKey =
  | 'echoes' | 'lag' | 'offset' | 'fade' | 'blur' | 'cursorRadius' | 'duration' | 'fontWeight'

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: 'echoes', label: '副本数', min: 2, max: 18, step: 1 },
  { key: 'lag', label: '滞后', min: 0.05, max: 0.3, step: 0.01 },
  { key: 'offset', label: '位移幅度', min: 8, max: 56, step: 1, unit: 'px' },
  { key: 'fade', label: '透明度衰减', min: 0.35, max: 0.85, step: 0.01 },
  { key: 'blur', label: '最深模糊', min: 0, max: 7, step: 0.25, unit: 'px' },
  { key: 'cursorRadius', label: '光标半径', min: 80, max: 900, step: 10, unit: 'px' },
  { key: 'duration', label: '入场时长', min: 300, max: 1600, step: 50, unit: 'ms' },
  { key: 'fontWeight', label: '字重', min: 500, max: 950, step: 50 },
]

function setSlider(key: NumberKey, value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') echo[key] = v
}

/** 重播：换 key 重挂载（入场能重看一遍） */
const replay = ref(0)

const usageSnippet = computed(
  () => `<EchoText
  text="${echo.text}"
  :echoes="${echo.echoes}"
  direction="${echo.direction}"
  mode="${echo.mode}"
  tint="${echo.tintOn ? echo.tint : 'false'}"
  color="${echo.color}"
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "'Motion Echo'", desc: '文案' },
  { name: 'echoes', type: 'number', def: '12', desc: '后面放几份回声副本（0–24）' },
  { name: 'lag', type: 'number', def: '0.24', desc: '越深的副本追目标越慢（0.02–0.5）' },
  { name: 'offset', type: 'number', def: '36', desc: '入场的错开距离 / 指针拖尾的幅度（px，0–120）' },
  { name: 'direction', type: "'right' | 'left' | 'up' | 'down' | 'diagonal'", def: "'right'", desc: '入场从哪个方向追上来' },
  { name: 'fade', type: 'number', def: '0.72', desc: '相邻副本的透明度衰减系数（0.1–0.95）' },
  { name: 'blur', type: 'number', def: '3', desc: '最深那份副本的模糊（px，0–16）' },
  { name: 'tint', type: 'string | false', def: "'--color-primary'", desc: '副本色偏：任意 CSS 颜色或 `--` 变量名（默认跟随主题），false 关闭' },
  { name: 'mode', type: "'entrance' | 'pointer' | 'both'", def: "'both'", desc: '跑入场 / 跑指针拖尾 / 都跑' },
  { name: 'cursorRadius', type: 'number', def: '320', desc: '光标在多远（px）内能把文字拉到最大偏移（40–1200）' },
  { name: 'duration', type: 'number', def: '900', desc: '入场收敛时长（毫秒）' },
  { name: 'ease', type: "'linear' | 'ease-out' | 'ease-in-out' | 'snappy'", def: "'ease-out'", desc: '入场缓动' },
  { name: 'fontSize', type: 'string | number', def: "'clamp(3rem, 9vw, 7rem)'", desc: '字号（默认跟视口宽度相关）' },
  { name: 'fontWeight', type: 'number | string', def: '800', desc: '字重' },
  { name: 'color', type: 'string', def: "'--color-foreground'", desc: '正文颜色：任意 CSS 颜色，或 `--` 变量名（默认跟随主题）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">回声文字 EchoText</h1>
    <p class="mt-3 text-muted-foreground">
      正文后面叠一叠回声副本：入场时从一侧追上来；指针移动时被拉开成拖尾（越深的副本越迟钝、越淡、越糊），
      静止后自动收干净。副本透明度由「副本间分离度 / 目标移动速度」推出，所以不动的时候只有一份干净的字。
      <strong>移植自 React Bits</strong>（MIT）—— 原版就是纯 DOM + rAF、零依赖。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>鼠标在页面上扫一扫看拖尾；只选「只入场」时指针不参与。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex min-h-[260px] items-center justify-center rounded-xl border border-border bg-muted/40 px-10 py-16">
          <EchoText
            :key="replay"
            :text="echo.text"
            :echoes="echo.echoes"
            :lag="echo.lag"
            :offset="echo.offset"
            :direction="echo.direction"
            :fade="echo.fade"
            :blur="echo.blur"
            :tint="echo.tintOn ? echo.tint : false"
            :mode="echo.mode"
            :cursor-radius="echo.cursorRadius"
            :duration="echo.duration"
            :ease="echo.ease"
            :font-weight="echo.fontWeight"
            :color="echo.color"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="echo.text === t.value ? 'default' : 'outline'"
                size="sm"
                @click="echo.text = t.value"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">入场方向</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in DIRECTION_OPTIONS"
                :key="opt.value"
                :variant="echo.direction === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="echo.direction = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">模式</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in MODE_OPTIONS"
                :key="opt.value"
                :variant="echo.mode === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="echo.mode = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">入场缓动</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in EASE_OPTIONS"
                :key="opt.value"
                :variant="echo.ease === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="echo.ease = opt.value"
              >{{ opt.label }}</Button>
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-semibold">参数</p>
            <div class="flex flex-wrap items-center gap-4">
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                正文
                <input
                  type="color"
                  class="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                  :value="colorHex"
                  @input="echo.color = ($event.target as HTMLInputElement).value"
                >
              </label>
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                色偏
                <input
                  type="color"
                  class="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                  :value="tintHex"
                  @input="echo.tint = ($event.target as HTMLInputElement).value"
                >
              </label>
              <Button variant="outline" size="sm" :disabled="followTheme" @click="resetToThemeColors">
                {{ followTheme ? '已跟随主题' : '跟随主题' }}
              </Button>
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                开色偏
                <Switch :model-value="echo.tintOn" @update:model-value="v => (echo.tintOn = !!v)" />
              </label>
              <Button variant="outline" size="sm" @click="replay++">重播入场</Button>
            </div>
          </div>

          <p class="text-xs text-muted-foreground">
            两个颜色默认跟随主题（<code>--color-foreground</code> / <code>--color-primary</code>）；
            手动改取色器就固定成该颜色，点「跟随主题」回到跟随。
          </p>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="s in SLIDERS" :key="s.key" class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">{{ s.label }}</span>
                <span class="text-xs font-medium tabular-nums">{{ echo[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[echo[s.key]]"
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
            <li>副本位移与透明度都是<strong>每帧算出来写内联样式</strong>，不是 CSS 动画 —— 拖尾要跟着指针走，只能算。</li>
            <li>越深的副本 lerp 系数越小（<code>0.34 / (1 + index × lag × 4.2)</code>），这是「拖尾」的成因；<code>lag</code> 调大就散得更开。</li>
            <li>跑完（回到静止且入场结束）会<strong>停掉 rAF</strong>，指针再动时重启 —— 不占着主线程空转。</li>
            <li>只在支持 hover 的设备上挂指针监听；系统开了「减少动态效果」时不生成副本，只留正文。</li>
            <li>颜色支持 <code>--color-*</code> 变量名（默认就是这么传的），副本色偏用 <code>color-mix()</code> 按深度混出来。</li>
            <li>容器别写 <code>overflow: hidden</code>：副本会甩出文字框，裁掉就看不到回声了。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { EchoText } from '@/components/motion'</code></CardDescription>
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
