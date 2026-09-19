<script setup lang="ts">
/**
 * FuzzyText 文档页（路由 /motion/fuzzy-text）
 * 移植自 React Bits 的 Fuzzy Text（MIT）：canvas 离屏光栅化 + 逐行/逐列随机错位。
 */
import { computed, reactive, ref } from 'vue'
import { FuzzyText } from '@/components/motion'
import type { FuzzyTextDirection } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

const TEXT_PRESETS = [
  { label: '404', value: '404' },
  { label: 'ERROR', value: 'Error' },
  { label: '中文', value: '找不到页面' },
  { label: '长一点', value: 'Not Found' },
]

const SIZE_OPTIONS: { label: string; value: number | string }[] = [
  { label: 'clamp（上游默认，跟视口）', value: 'clamp(2rem, 8vw, 8rem)' },
  { label: '72px', value: 72 },
  { label: '120px', value: 120 },
]

const FONT_OPTIONS = [
  { label: 'inherit（上游默认）', value: 'inherit' },
  { label: '等宽', value: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  { label: '衬线', value: 'Georgia, "Times New Roman", serif' },
]

const COLOR_OPTIONS: { label: string; color: string; gradient?: string[] }[] = [
  { label: '跟随主题（前景色）', color: '--color-foreground' },
  { label: '主题主色', color: '--color-primary' },
  { label: '主色 → 前景 → 主色（渐变）', color: '--color-foreground', gradient: ['--color-primary', '--color-foreground', '--color-primary'] },
  { label: '上游默认白字', color: '#ffffff' },
]

const DIRECTION_OPTIONS: { label: string; value: FuzzyTextDirection }[] = [
  { label: '横向（上游默认）', value: 'horizontal' },
  { label: '纵向', value: 'vertical' },
  { label: '双向', value: 'both' },
]

const fuzzy = reactive({
  text: TEXT_PRESETS[0].value,
  textLabel: TEXT_PRESETS[0].label,
  sizeLabel: SIZE_OPTIONS[0].label,
  fontSize: SIZE_OPTIONS[0].value as number | string,
  fontLabel: FONT_OPTIONS[0].label,
  fontFamily: FONT_OPTIONS[0].value,
  colorLabel: COLOR_OPTIONS[0].label,
  color: COLOR_OPTIONS[0].color,
  gradient: undefined as string[] | undefined,
  direction: 'horizontal' as FuzzyTextDirection,
  baseIntensity: 0.2,
  hoverIntensity: 0.5,
  fuzzRange: 30,
  fps: 60,
  transitionDuration: 12,
  letterSpacing: 0,
  glitchInterval: 2000,
  glitchDuration: 200,
  enableHover: true,
  clickEffect: true,
  glitchMode: false,
})

function pickText(preset: (typeof TEXT_PRESETS)[number]) {
  fuzzy.textLabel = preset.label
  fuzzy.text = preset.value
}

function pickSize(preset: (typeof SIZE_OPTIONS)[number]) {
  fuzzy.sizeLabel = preset.label
  fuzzy.fontSize = preset.value
}

function pickFont(preset: (typeof FONT_OPTIONS)[number]) {
  fuzzy.fontLabel = preset.label
  fuzzy.fontFamily = preset.value
}

function pickColor(preset: (typeof COLOR_OPTIONS)[number]) {
  fuzzy.colorLabel = preset.label
  fuzzy.color = preset.color
  fuzzy.gradient = preset.gradient ? [...preset.gradient] : undefined
}

type NumberKey =
  | 'baseIntensity'
  | 'hoverIntensity'
  | 'fuzzRange'
  | 'fps'
  | 'transitionDuration'
  | 'letterSpacing'
  | 'glitchInterval'
  | 'glitchDuration'

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; unit?: string }[] = [
  { key: 'baseIntensity', label: '静止强度', min: 0, max: 1, step: 0.01 },
  { key: 'hoverIntensity', label: '悬停强度', min: 0, max: 1.5, step: 0.01 },
  { key: 'fuzzRange', label: '最大位移', min: 0, max: 100, step: 1, unit: 'px' },
  { key: 'fps', label: '帧率上限', min: 10, max: 120, step: 5, unit: 'fps' },
  { key: 'transitionDuration', label: '强度过渡帧数', min: 0, max: 60, step: 1 },
  { key: 'letterSpacing', label: '字符间距', min: -10, max: 50, step: 1, unit: 'px' },
  { key: 'glitchInterval', label: '故障间隔', min: 500, max: 5000, step: 100, unit: 'ms' },
  { key: 'glitchDuration', label: '故障时长', min: 50, max: 1000, step: 50, unit: 'ms' },
]

function setSlider(key: NumberKey, value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') fuzzy[key] = v
}

const TOGGLES: { key: 'enableHover' | 'clickEffect' | 'glitchMode'; label: string; hint: string }[] = [
  { key: 'enableHover', label: '悬停加强', hint: '鼠标移到文字范围内强度跳到悬停值' },
  { key: 'clickEffect', label: '点击瞬间拉满', hint: '点一下强度冲到 1，持续 150ms' },
  { key: 'glitchMode', label: '故障模式', hint: '每隔一段时间自动抽一下' },
]

const usageSnippet = computed(
  () => `<FuzzyText
  text="${fuzzy.text}"
  :font-size="'${fuzzy.fontSize}'"
  font-family="${fuzzy.fontFamily}"
  color="${fuzzy.color}"
  ${fuzzy.gradient ? `:gradient="['${fuzzy.gradient.join("', '")}']"\n  ` : ''}:base-intensity="${fuzzy.baseIntensity}"
  :hover-intensity="${fuzzy.hoverIntensity}"
  :fuzz-range="${fuzzy.fuzzRange}"
  direction="${fuzzy.direction}"
  :fps="${fuzzy.fps}"
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "'404'", desc: '文案（对应上游的 children）' },
  { name: 'fontSize', type: 'number | string', def: "'clamp(2rem, 8vw, 8rem)'", desc: '字号：数字按 px，也接受任意 CSS 长度' },
  { name: 'fontWeight', type: 'string | number', def: '900', desc: '字重' },
  { name: 'fontFamily', type: 'string', def: "'inherit'", desc: '字体族；`inherit` 沿用画布的 computed 字体' },
  { name: 'color', type: 'string', def: "'--color-foreground'", desc: '文字颜色；传 `--color-*` 变量名跟随主题（上游默认 #fff）' },
  { name: 'gradient', type: 'string[]', def: 'undefined', desc: '≥2 个颜色时改为水平渐变（同样支持 `--color-*`）' },
  { name: 'enableHover', type: 'boolean', def: 'true', desc: '悬停加强' },
  { name: 'baseIntensity', type: 'number', def: '0.18', desc: '静止时的毛刺强度' },
  { name: 'hoverIntensity', type: 'number', def: '0.5', desc: '悬停时的毛刺强度' },
  { name: 'fuzzRange', type: 'number', def: '30', desc: '最大位移像素' },
  { name: 'fps', type: 'number', def: '60', desc: '帧率上限（降低省 CPU）' },
  { name: 'direction', type: "'horizontal' | 'vertical' | 'both'", def: "'horizontal'", desc: '位移方向' },
  { name: 'transitionDuration', type: 'number', def: '0', desc: '强度切换的过渡帧数（0 = 立即）' },
  { name: 'clickEffect', type: 'boolean', def: 'false', desc: '点击时瞬间拉到最大强度' },
  { name: 'glitchMode', type: 'boolean', def: 'false', desc: '周期性强度尖峰（故障感）' },
  { name: 'glitchInterval', type: 'number', def: '2000', desc: '故障间隔（毫秒）' },
  { name: 'glitchDuration', type: 'number', def: '200', desc: '每次故障持续（毫秒）' },
  { name: 'letterSpacing', type: 'number', def: '0', desc: '字符额外间距（px）' },
  { name: '（根 class）', type: '—', def: '—', desc: 'Vue 里直接写 class（透传到 canvas），等价上游 className' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">毛刺文字 FuzzyText</h1>
    <p class="mt-3 text-muted-foreground">
      把文字光栅化到离屏 canvas，再<strong>逐行</strong>（或逐列）按强度随机错位重绘 —— 就是「信号不稳」的那股毛刺感。
      <strong>移植自 React Bits</strong>（MIT）：逐行照搬上游算法，另外支持
      <code>devicePixelRatio</code>（上游只有 1x，高分屏会糊），颜色参数接受 <code>--color-*</code> 跟随主题。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>鼠标移进文字范围会加强；点一下会瞬间拉满（「点击瞬间拉满」开着时）。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 px-6 py-10">
          <FuzzyText
            :text="fuzzy.text"
            :font-size="fuzzy.fontSize"
            :font-family="fuzzy.fontFamily"
            :color="fuzzy.color"
            :gradient="fuzzy.gradient"
            :enable-hover="fuzzy.enableHover"
            :base-intensity="fuzzy.baseIntensity"
            :hover-intensity="fuzzy.hoverIntensity"
            :fuzz-range="fuzzy.fuzzRange"
            :fps="fuzzy.fps"
            :direction="fuzzy.direction"
            :transition-duration="fuzzy.transitionDuration"
            :click-effect="fuzzy.clickEffect"
            :glitch-mode="fuzzy.glitchMode"
            :glitch-interval="fuzzy.glitchInterval"
            :glitch-duration="fuzzy.glitchDuration"
            :letter-spacing="fuzzy.letterSpacing"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="fuzzy.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">字号</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="s in SIZE_OPTIONS"
                :key="s.label"
                :variant="fuzzy.sizeLabel === s.label ? 'default' : 'outline'"
                size="sm"
                @click="pickSize(s)"
              >{{ s.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">字体</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="f in FONT_OPTIONS"
                :key="f.label"
                :variant="fuzzy.fontLabel === f.label ? 'default' : 'outline'"
                size="sm"
                @click="pickFont(f)"
              >{{ f.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">配色（<code>--color-*</code> 跟随主题）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="c in COLOR_OPTIONS"
                :key="c.label"
                :variant="fuzzy.colorLabel === c.label ? 'default' : 'outline'"
                size="sm"
                @click="pickColor(c)"
              >{{ c.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">位移方向</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="d in DIRECTION_OPTIONS"
                :key="d.value"
                :variant="fuzzy.direction === d.value ? 'default' : 'outline'"
                size="sm"
                @click="fuzzy.direction = d.value"
              >{{ d.label }}</Button>
            </div>
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
              <Switch v-model="fuzzy[t.key]" />
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
              :class="(s.key === 'glitchInterval' || s.key === 'glitchDuration') && !fuzzy.glitchMode ? 'opacity-50' : ''"
            >
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">{{ s.label }}</span>
                <span class="text-xs font-medium tabular-nums">{{ fuzzy[s.key] }}{{ s.unit ?? '' }}</span>
              </div>
              <Slider
                :model-value="[fuzzy[s.key]]"
                :min="s.min"
                :max="s.max"
                :step="s.step"
                :disabled="(s.key === 'glitchInterval' || s.key === 'glitchDuration') && !fuzzy.glitchMode"
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
            <li><strong>两步走</strong>：先把文字画到离屏 canvas（按 <code>actualBoundingBox*</code> 收紧到文字实际范围），再在 rAF 里按
              <code>intensity × fuzzRange × (random − 0.5)</code> 给每一行（横向）/ 每一列（纵向）整条 1px 切片做位移。</li>
            <li><code>transitionDuration</code> 的单位是<strong>帧数</strong>（上游如此）：每帧朝目标强度走 <code>1 / (帧数 ÷ 单帧时长)</code>。</li>
            <li>强度优先级：点击 / 故障（都取 1）> 悬停（<code>hoverIntensity</code>）> 静止（<code>baseIntensity</code>）。</li>
            <li>悬停判定用的是<strong>文字实际占据的矩形</strong>（<code>horizontalMargin + xOffset</code> 起、宽 <code>textBoundingWidth</code>），不是整块画布 —— 画布留了 <code>fuzzRange + 20</code> 的余量给位移用。</li>
            <li>画布<strong>按 devicePixelRatio 放大</strong>（上游是 1x）：绘制坐标仍是 CSS px，取源按 <code>j × dpr</code> 取 dpr 行，所以高分屏不糊。</li>
            <li>颜色要真实色值 → <code>--color-*</code> 用 <code>getComputedStyle</code> 解析；主题切换由 MutationObserver 触发整体重建（画布是位图，不会自动跟着变量变）。</li>
            <li>字号用 <code>clamp(...)</code> 时，窗口尺寸变化会重新光栅化（防抖 150ms）—— 上游没有这一步，改窗口大小字会糊掉。</li>
            <li>挂载后<strong>先同步画一帧</strong>：后台标签页里 rAF 被冻结，否则会是一片空白。</li>
            <li><code>letterSpacing ≠ 0</code> 时逐字 <code>fillText</code> 并累加间距（上游如此，因为 canvas 没有 letter-spacing）。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { FuzzyText } from '@/components/motion'</code></CardDescription>
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
