<script setup lang="ts">
/**
 * ParticleText 文档页（路由 /motion/particle-text）
 * 移植自 React Bits 的 Particle Text（MIT）：原版就是纯 Canvas 2D、零依赖。
 */
import { computed, reactive, ref } from 'vue'
import { ParticleText } from '@/components/motion'
import type { ParticleTextTrigger } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { toHexColor, useThemeTick } from '../lib/themeColors'

const TEXT_PRESETS = [
  { label: '未来界面', value: 'Future Interfaces' },
  { label: 'React Bits', value: 'React Bits' },
  { label: '更快上线', value: 'Launch Faster' },
]

const TRIGGER_OPTIONS: { label: string; hint: string; value: ParticleTextTrigger }[] = [
  { label: '挂载即播', hint: '进来就散开重聚', value: 'mount' },
  { label: '悬停', hint: '指上去重播', value: 'hover' },
  { label: '点击', hint: '点一下重播', value: 'click' },
]

const particle = reactive({
  text: TEXT_PRESETS[0].value,
  particleSize: 2.2,
  density: 4,
  // 颜色默认写成主题变量名：组件会按当前主题解析，切主题时粒子自动用新色重聚一次
  color: '--color-foreground',
  highlightColor: '--color-primary',
  scatter: 190,
  gatherDuration: 1600,
  stagger: 420,
  pointerRepel: 42,
  repelRadius: 120,
  idleDrift: 0.8,
  trigger: 'mount' as ParticleTextTrigger,
  glow: true,
})

/* 取色器只吃 #rrggbb，所以把当前的（可能还是变量名的）颜色解析出来给它；
   useThemeTick 让它在切主题 / 切风格时跟着重算 */
const themeTick = useThemeTick()
const colorHex = computed(() => {
  themeTick.value
  return toHexColor(particle.color, '#000000')
})
const highlightHex = computed(() => {
  themeTick.value
  return toHexColor(particle.highlightColor, '#8b5cf6')
})
/** 两个颜色都是变量名 = 还在跟随主题（任一手动改成具体颜色就不再跟随） */
const followTheme = computed(
  () => particle.color.startsWith('--') && particle.highlightColor.startsWith('--'),
)
function resetToThemeColors() {
  particle.color = '--color-foreground'
  particle.highlightColor = '--color-primary'
}

type NumberKey =
  | 'particleSize' | 'density' | 'scatter' | 'gatherDuration'
  | 'stagger' | 'pointerRepel' | 'repelRadius' | 'idleDrift'

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: 'particleSize', label: '粒子大小', min: 1, max: 4, step: 0.1, unit: 'px' },
  { key: 'density', label: '采样步长', min: 2, max: 8, step: 1 },
  { key: 'scatter', label: '散开距离', min: 0, max: 320, step: 5, unit: 'px' },
  { key: 'gatherDuration', label: '聚合时长', min: 200, max: 3000, step: 50, unit: 'ms' },
  { key: 'stagger', label: '逐粒子延迟', min: 0, max: 900, step: 10, unit: 'ms' },
  { key: 'pointerRepel', label: '排斥强度', min: 0, max: 90, step: 1 },
  { key: 'repelRadius', label: '排斥半径', min: 40, max: 220, step: 5, unit: 'px' },
  { key: 'idleDrift', label: '静止漂移', min: 0, max: 2, step: 0.1, unit: 'px' },
]

function setSlider(key: NumberKey, value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') particle[key] = v
}

/** 换 key 重挂载 → 重新采样并重看一次聚合 */
const replay = ref(0)
const demoKey = computed(
  () => `${particle.text}|${particle.density}|${particle.particleSize}|${particle.scatter}|${replay.value}`,
)

const usageSnippet = computed(
  () => `<ParticleText
  text="${particle.text}"
  density={${particle.density}}
  color="${particle.color}"
  highlight-color="${particle.highlightColor}"
  trigger="${particle.trigger}"
  glow={${particle.glow}}
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "'React Bits'", desc: '要被采样成粒子的文字' },
  { name: 'particleSize', type: 'number', def: '2', desc: '每颗粒子的渲染尺寸（CSS 像素）' },
  { name: 'density', type: 'number', def: '4', desc: '采样步长：越小粒子越多' },
  { name: 'color', type: 'string', def: "'--color-foreground'", desc: '主色：任意 CSS 颜色，或 `--` 开头的变量名（默认跟随主题）' },
  { name: 'highlightColor', type: 'string', def: "'--color-primary'", desc: '高亮色（同时用于光晕）：按 x 位置在主色与它之间插值' },
  { name: 'scatter', type: 'number', def: '180', desc: '起始散开半径' },
  { name: 'gatherDuration', type: 'number', def: '1600', desc: '聚合用的时长（毫秒）' },
  { name: 'stagger', type: 'number', def: '420', desc: '每颗粒子的最大延迟（毫秒）' },
  { name: 'pointerRepel', type: 'number', def: '40', desc: '指针排斥强度' },
  { name: 'repelRadius', type: 'number', def: '120', desc: '指针影响半径（px）' },
  { name: 'idleDrift', type: 'number', def: '0.7', desc: '成形后的静止漂移幅度（px），0 = 完全静止' },
  { name: 'trigger', type: "'mount' | 'hover' | 'click'", def: "'mount'", desc: '首次成形后，靠什么再触发一次「散开 → 聚合」' },
  { name: 'fontSize', type: 'number | string', def: "'clamp(3rem, 12vw, 8rem)'", desc: '采样用的字号（CSS 长度按视口算，不是容器）' },
  { name: 'fontWeight', type: 'number | string', def: '800', desc: '采样用的字重' },
  { name: 'fontFamily', type: 'string', def: "'inherit'", desc: '采样字体，inherit = 跟随容器（会等字体就位再采样）' },
  { name: 'glow', type: 'boolean', def: 'true', desc: '用高亮色给粒子加一层柔和光晕' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">粒子文字 ParticleText</h1>
    <p class="mt-3 text-muted-foreground">
      文字不是画上去的，是几千颗粒子聚出来的：先在离屏画布上采样字形，每个像素点当一颗粒子的目标位置，
      再让它们从四周散开的状态聚合回来；鼠标靠近会把粒子推开（软排斥）。
      <strong>移植自 React Bits</strong>（MIT）—— 原版就是纯 Canvas 2D、零依赖，直接等价搬过来。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>鼠标移进画布左右扫，粒子会被推开再弹回去；「采样步长」调小粒子会翻倍。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="h-[380px] overflow-hidden rounded-xl border border-border bg-background">
          <ParticleText
            :key="demoKey"
            :text="particle.text"
            :particle-size="particle.particleSize"
            :density="particle.density"
            :color="particle.color"
            :highlight-color="particle.highlightColor"
            :scatter="particle.scatter"
            :gather-duration="particle.gatherDuration"
            :stagger="particle.stagger"
            :pointer-repel="particle.pointerRepel"
            :repel-radius="particle.repelRadius"
            :idle-drift="particle.idleDrift"
            :trigger="particle.trigger"
            :glow="particle.glow"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.value"
                :variant="particle.text === t.value ? 'default' : 'outline'"
                size="sm"
                @click="particle.text = t.value"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">重播触发</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="opt in TRIGGER_OPTIONS"
                :key="opt.value"
                :variant="particle.trigger === opt.value ? 'default' : 'outline'"
                size="sm"
                @click="particle.trigger = opt.value"
              >{{ opt.label }}</Button>
            </div>
            <p class="text-[11px] text-muted-foreground">
              {{ TRIGGER_OPTIONS.find(t => t.value === particle.trigger)?.hint }}
            </p>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-semibold">参数</p>
            <div class="flex flex-wrap items-center gap-4">
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                主色
                <input
                  type="color"
                  class="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                  :value="colorHex"
                  @input="particle.color = ($event.target as HTMLInputElement).value"
                >
              </label>
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                高亮
                <input
                  type="color"
                  class="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                  :value="highlightHex"
                  @input="particle.highlightColor = ($event.target as HTMLInputElement).value"
                >
              </label>
              <Button variant="outline" size="sm" :disabled="followTheme" @click="resetToThemeColors">
                {{ followTheme ? '已跟随主题' : '跟随主题' }}
              </Button>
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                光晕
                <Switch :model-value="particle.glow" @update:model-value="v => (particle.glow = !!v)" />
              </label>
              <Button variant="outline" size="sm" @click="replay++">重播聚合</Button>
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
                <span class="text-xs font-medium tabular-nums">{{ particle[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[particle[s.key]]"
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
            <li>组件内部是 <code>h-full</code>，高度由外层容器给（这里 380px）；没给高度时兜底 <code>min-height: 240px</code>。</li>
            <li>鼠标移进画布左右扫，粒子会被推开再弹回去；「采样步长」调小粒子会翻倍。</li>
            <li><code>color</code> / <code>highlightColor</code> 接受任意 CSS 颜色，也可以传 <code>--color-*</code> 这类<strong>变量名</strong>（默认就是这么传的）—— 组件会按当前主题解析，并监听主题变化自动换色。</li>
            <li><code>fontSize</code> 默认 <code>clamp(3rem, 12vw, 8rem)</code> —— 跟<strong>视口</strong>宽度相关，不是容器宽度，换容器尺寸字号不会自己变。</li>
            <li>文字既画进 canvas 又留了一份 <code>sr-only</code> 文本，读屏能读到、SEO 也不算丢。</li>
            <li>系统开了「减少动态效果」时不播动画，直接把粒子放到字形上。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { ParticleText } from '@/components/motion'</code></CardDescription>
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
