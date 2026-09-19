<script setup lang="ts">
/**
 * MaskedHeading 文档页（路由 /motion/masked-heading）
 * 一个动效一个页面 —— 这类演示本身要占满一屏，堆在一页里没法用。
 *
 * 移植自 React Bits 的 Masked Heading（MIT），详见组件内的注释。
 */
import { computed, ref } from 'vue'
import { MaskedHeading } from '@/components/motion'
import type { MaskedHeadingReveal, MaskedHeadingTrigger } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const TEXT_PRESETS = [
  { label: '细节', value: 'Designed in the details' },
  { label: 'Web', value: 'Made for the web' },
  { label: '外景', value: 'Shot on location' },
]

const IMAGE_PRESETS = [
  { label: '沙丘', value: '/sources/kevin-schmid.jpg' },
  { label: '硬件', value: '/sources/sandisk.jpg' },
  { label: '人像', value: '/sources/tamara-harhai.jpg' },
  { label: '街景', value: '/sources/tolga-ahmetler.jpg' },
]

const REVEAL_OPTIONS: { label: string; hint: string; value: MaskedHeadingReveal }[] = [
  { label: '上浮', hint: '逐词升起', value: 'rise' },
  { label: '扫过', hint: '从左往右擦', value: 'wipe' },
  { label: '淡入', hint: '整体放大淡入', value: 'fade' },
  { label: '无', hint: '直接是最终态', value: 'none' },
]

const TRIGGER_OPTIONS: { label: string; value: MaskedHeadingTrigger }[] = [
  { label: '进入视口', value: 'view' },
  { label: '挂载即播', value: 'mount' },
  { label: '悬停', value: 'hover' },
]

const ALIGN_OPTIONS = ['left', 'center', 'right'] as const

const heading = ref({
  text: TEXT_PRESETS[0].value,
  src: IMAGE_PRESETS[0].value,
  fillScale: 1.25,
  parallax: 26,
  drift: 18,
  grayscale: false,
  reveal: 'rise' as MaskedHeadingReveal,
  trigger: 'view' as MaskedHeadingTrigger,
  duration: 1.1,
  stagger: 0.09,
  align: 'center' as (typeof ALIGN_OPTIONS)[number],
  weight: 700,
  tracking: -0.03,
  lineHeight: 1.06,
  textScale: 0.115,
})

/** 改「素材 / 文案 / 入场」这类参数时换 key → 组件重挂载，入场动效能重看一遍 */
const replayKey = computed(
  () => `${heading.value.text}|${heading.value.src}|${heading.value.reveal}|${heading.value.trigger}`,
)
const replayToken = ref(0)

const SLIDERS: {
  key: 'fillScale' | 'parallax' | 'drift' | 'duration' | 'stagger' | 'textScale'
  label: string
  min: number
  max: number
  step: number
  unit?: string
}[] = [
  { key: 'fillScale', label: '放大', min: 1, max: 2, step: 0.05 },
  { key: 'parallax', label: '视差', min: 0, max: 80, step: 1, unit: 'px' },
  { key: 'drift', label: '漂移', min: 0, max: 60, step: 1, unit: 'px' },
  { key: 'duration', label: '时长', min: 0.2, max: 3, step: 0.1, unit: 's' },
  { key: 'stagger', label: '逐词延迟', min: 0, max: 0.4, step: 0.01, unit: 's' },
  { key: 'textScale', label: '字号占比', min: 0.05, max: 0.24, step: 0.005 },
]

function setSlider(key: (typeof SLIDERS)[number]['key'], value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') heading.value[key] = v
}

const usageSnippet = computed(
  () => `<MaskedHeading
  text="${heading.value.text}"
  src="${heading.value.src}"
  reveal="${heading.value.reveal}"
  parallax={${heading.value.parallax}}
  drift={${heading.value.drift}}
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "'Designed in the details'", desc: '标题文案' },
  { name: 'tag', type: 'string', def: "'h2'", desc: '渲染成什么标签（语义用）' },
  { name: 'mediaType', type: "'image' | 'video'", def: "'image'", desc: '字母后面透出来的媒体类型' },
  { name: 'src', type: 'string', def: "''", desc: '图片 / 视频地址' },
  { name: 'poster', type: 'string', def: "''", desc: '视频加载前的封面' },
  { name: 'fillScale', type: 'number', def: '1.25', desc: '媒体相对标题放大多少；放大出来的余量就是视差的活动范围' },
  { name: 'parallax', type: 'number', def: '26', desc: '指针视差幅度（px），0 = 不动' },
  { name: 'drift', type: 'number', def: '18', desc: '空闲漂移幅度（px），0 = 完全静止' },
  { name: 'brightness', type: 'number', def: '1', desc: '媒体亮度' },
  { name: 'saturation', type: 'number', def: '1', desc: '媒体饱和度' },
  { name: 'grayscale', type: 'boolean', def: 'false', desc: '媒体转黑白' },
  { name: 'reveal', type: "'rise' | 'wipe' | 'fade' | 'none'", def: "'rise'", desc: '入场形式：逐词上浮 / 从左扫过 / 整体淡入 / 无' },
  { name: 'trigger', type: "'view' | 'mount' | 'hover'", def: "'view'", desc: '何时入场：进入视口 / 挂载即播 / 悬停' },
  { name: 'duration', type: 'number', def: '1.1', desc: '入场时长（秒）' },
  { name: 'stagger', type: 'number', def: '0.09', desc: '逐词入场的相邻延迟（秒）' },
  { name: 'align', type: "'left' | 'center' | 'right'", def: "'center'", desc: '对齐' },
  { name: 'weight', type: 'number', def: '700', desc: '字重' },
  { name: 'tracking', type: 'number', def: '-0.03', desc: '字距（em）' },
  { name: 'lineHeight', type: 'number', def: '1.06', desc: '行高' },
  { name: 'textScale', type: 'number', def: '0.115', desc: '字号占容器宽度的比例（响应式靠它）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">遮罩标题 MaskedHeading</h1>
    <p class="mt-3 text-muted-foreground">
      图片从字母里透出来：媒体层被 SVG 文字裁成「字的形状」，指针视差和慢速漂移只动媒体、裁剪不动，
      所以字像一扇窗。<strong>移植自 React Bits</strong>（MIT）—— 原版入场用 GSAP，
      这里换成浏览器自带动画，不引依赖，参数保持一致。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>鼠标移到标题上左右移动看视差；「漂移」调到 0 就完全静止。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-hidden rounded-xl border border-border bg-muted">
          <MaskedHeading
            :key="`${replayKey}-${replayToken}`"
            :text="heading.text"
            :src="heading.src"
            :fill-scale="heading.fillScale"
            :parallax="heading.parallax"
            :drift="heading.drift"
            :grayscale="heading.grayscale"
            :reveal="heading.reveal"
            :trigger="heading.trigger"
            :duration="heading.duration"
            :stagger="heading.stagger"
            :align="heading.align"
            :weight="heading.weight"
            :tracking="heading.tracking"
            :line-height="heading.lineHeight"
            :text-scale="heading.textScale"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.value"
                :variant="heading.text === t.value ? 'default' : 'outline'"
                size="sm"
                @click="heading.text = t.value"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">图片</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="img in IMAGE_PRESETS"
                :key="img.value"
                :variant="heading.src === img.value ? 'default' : 'outline'"
                size="sm"
                @click="heading.src = img.value"
              >{{ img.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">入场形式</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="opt in REVEAL_OPTIONS"
                :key="opt.value"
                type="button"
                class="rounded-lg border px-3 py-2 text-left transition-colors"
                :class="heading.reveal === opt.value ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/50'"
                @click="heading.reveal = opt.value"
              >
                <span class="text-sm font-medium">{{ opt.label }}</span>
                <p class="text-[11px] leading-snug text-muted-foreground/80">{{ opt.hint }}</p>
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <p class="text-sm font-semibold">触发时机</p>
              <div class="flex flex-wrap gap-2">
                <Button
                  v-for="opt in TRIGGER_OPTIONS"
                  :key="opt.value"
                  :variant="heading.trigger === opt.value ? 'default' : 'outline'"
                  size="sm"
                  @click="heading.trigger = opt.value"
                >{{ opt.label }}</Button>
              </div>
            </div>
            <div class="space-y-2">
              <p class="text-sm font-semibold">对齐</p>
              <div class="flex flex-wrap gap-2">
                <Button
                  v-for="a in ALIGN_OPTIONS"
                  :key="a"
                  :variant="heading.align === a ? 'default' : 'outline'"
                  size="sm"
                  @click="heading.align = a"
                >{{ a }}</Button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold">参数</p>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 text-xs text-muted-foreground">
                黑白
                <Switch :model-value="heading.grayscale" @update:model-value="v => (heading.grayscale = !!v)" />
              </label>
              <Button variant="outline" size="sm" @click="replayToken++">重播入场</Button>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="s in SLIDERS" :key="s.key" class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">{{ s.label }}</span>
                <span class="text-xs font-medium tabular-nums">{{ heading[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[heading[s.key]]"
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
            <li>标题字号按容器宽度算（<code>textScale</code>），所以它<strong>不跟随全局字号预设</strong>。</li>
            <li>裁剪形状跟着字体走：<code>document.fonts.ready</code> 后会重新对齐一次，换字体不会错位。</li>
            <li>媒体是装饰、不参与交互（<code>pointer-events: none</code>），视差事件挂在标题本身上。</li>
            <li>系统开了「减少动态效果」时入场会自动跳过，直接给最终态。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { MaskedHeading } from '@/components/motion'</code></CardDescription>
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
