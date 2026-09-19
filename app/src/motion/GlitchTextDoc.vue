<script setup lang="ts">
/**
 * GlitchText 文档页（路由 /motion/glitch-text）
 * 移植自 React Bits 的 Glitch Text（MIT）：上游是 CSS 伪元素 + clip-path 关键帧，这里照搬并补了自动遮罩色。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { GlitchText } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

const TEXT_PRESETS = [
  { label: '上游示例', value: 'React Bits' },
  { label: '短词', value: 'GLITCH' },
  { label: '报错风', value: 'ERROR 404' },
  { label: '中文', value: '故障文字' },
]

const COLOR_PRESETS = [
  { label: '红 / 青（上游）', value: ['red', 'cyan'] },
  { label: '主题色 / 主题主色', value: ['--color-destructive', '--color-primary'] },
  { label: '品红 / 青', value: ['#ff0080', '#00e5ff'] },
  { label: '黄 / 蓝', value: ['#ffd400', '#2b6cff'] },
]

/** 示例容器底色：遮罩色是自动测量出来的，换底色能直接看出它跟着变 */
const SURFACES = [
  { label: '深色底', value: 'dark', cls: 'bg-neutral-950 text-neutral-50' },
  { label: '浅色底', value: 'light', cls: 'bg-white text-neutral-900' },
  { label: '跟随页面', value: 'page', cls: 'bg-background' },
]

const glitch = reactive({
  textLabel: TEXT_PRESETS[0].label,
  text: TEXT_PRESETS[0].value,
  colorLabel: COLOR_PRESETS[0].label,
  shadowColors: COLOR_PRESETS[0].value,
  surface: 'dark',
  speed: 0.5,
  shadowOffset: 5,
  layerOffset: 10,
  enableShadows: true,
  enableOnHover: false,
})

const compRef = ref<{
  refreshMask?: () => void
  stats?: () => { mask: string; text: string; vars: Record<string, string> }
} | null>(null)

const stats = ref<{ mask: string; vars: Record<string, string> } | null>(null)

function syncStats() {
  const s = compRef.value?.stats?.()
  stats.value = s ? { mask: s.mask, vars: s.vars } : null
}

const surfaceClass = computed(
  () => SURFACES.find((s) => s.value === glitch.surface)?.cls ?? 'bg-neutral-950 text-neutral-50',
)

/** 底色变了要重测遮罩色；等过渡动画走完再读，否则读到的是渐变中间色 */
async function pickSurface(item: (typeof SURFACES)[number]) {
  glitch.surface = item.value
  await nextTick()
  window.setTimeout(() => {
    compRef.value?.refreshMask?.()
    syncStats()
  }, 400)
}

function pickText(item: (typeof TEXT_PRESETS)[number]) {
  glitch.textLabel = item.label
  glitch.text = item.value
}

function pickColors(item: (typeof COLOR_PRESETS)[number]) {
  glitch.colorLabel = item.label
  glitch.shadowColors = item.value
}

function onSlider(key: 'speed' | 'shadowOffset' | 'layerOffset', value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') glitch[key] = v
}

function resetAll() {
  glitch.speed = 0.5
  glitch.shadowOffset = 5
  glitch.layerOffset = 10
  glitch.enableShadows = true
  glitch.enableOnHover = false
  glitch.colorLabel = COLOR_PRESETS[0].label
  glitch.shadowColors = COLOR_PRESETS[0].value
  glitch.surface = 'dark'
  window.setTimeout(() => {
    compRef.value?.refreshMask?.()
    syncStats()
  }, 400)
}

let timer = 0
onMounted(() => {
  syncStats()
  timer = window.setInterval(syncStats, 400)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})

const usageSnippet = computed(
  () => `<GlitchText
  text="${glitch.text}"
  :speed="${glitch.speed}"
  :enable-shadows="${glitch.enableShadows}"
  :enable-on-hover="${glitch.enableOnHover}"
  :shadow-colors="['red', 'cyan']"
/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "''", desc: '要显示的文字（会复制成两份伪元素副本）' },
  { name: 'speed', type: 'number', def: '0.5', desc: '速度倍数：越大越慢（两份副本的周期分别是 `speed×3s` / `speed×2s`）' },
  { name: 'enableShadows', type: 'boolean', def: 'true', desc: '是否给副本加红/青文字阴影（色差）' },
  { name: 'enableOnHover', type: 'boolean', def: 'false', desc: '只在悬停时才故障（平时完全隐藏两份副本）' },
  { name: 'shadowColors', type: 'string[]', def: "['red', 'cyan']", desc: '两份副本的阴影色 `[after, before]`；支持 `--color-*` 主题变量' },
  { name: 'shadowOffset', type: 'number', def: '5', desc: '阴影的横向偏移（px）—— 色差看起来「拉多开」' },
  { name: 'layerOffset', type: 'number', def: '10', desc: '两份副本相对原字的横向偏移（px）' },
  { name: 'maskColor', type: 'string', def: "'auto'", desc: '副本那层遮罩的背景色；`auto` = 自动测出元素背后的第一个不透明背景（主题色是 oklch 也能认）' },
  { name: 'mainClassName', type: 'string', def: "''", desc: '额外类名' },
]

const EXPOSED = [
  { name: 'refreshMask()', desc: '重新测一次遮罩背景色（外层容器换了底色之后调）' },
  { name: 'stats()', desc: '读数：{ mask, text, vars }' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">故障文字 GlitchText</h1>
    <p class="mt-3 text-muted-foreground">
      文字上下叠了两份彩色副本，被 <code>clip-path</code> 不断切成横条、左右错开 ——
      像信号不稳的显示器。<strong>移植自 React Bits</strong>（MIT）：上游整个效果就是
      <strong>两个伪元素 + 一段关键帧 + 几个 CSS 变量</strong>，这里照搬，
      只额外把「副本那层遮罩的背景色」改成<strong>自动测量</strong>（上游写死一个深色，
      放在浅色主题里会露出色块）。<strong>把鼠标移上去</strong>看看（开了 <code>enableOnHover</code> 时才有用）。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription class="min-h-[3.5rem]">
          遮罩色 <span class="font-mono">{{ stats?.mask ?? '—' }}</span>
          · 副本周期 <span class="font-mono">{{ stats?.vars?.['--glitch-after-duration'] ?? '—' }}</span> /
          <span class="font-mono">{{ stats?.vars?.['--glitch-before-duration'] ?? '—' }}</span>
          · 阴影 <span class="font-mono">{{ stats?.vars?.['--glitch-after-shadow'] ?? '—' }}</span>
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div
          class="flex min-h-[280px] items-center justify-center overflow-hidden rounded-xl border border-border p-6 transition-colors"
          :class="surfaceClass"
        >
          <GlitchText
            ref="compRef"
            :text="glitch.text"
            :speed="glitch.speed"
            :enable-shadows="glitch.enableShadows"
            :enable-on-hover="glitch.enableOnHover"
            :shadow-colors="glitch.shadowColors"
            :shadow-offset="glitch.shadowOffset"
            :layer-offset="glitch.layerOffset"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-muted-foreground">示例容器底色：</span>
          <Button
            v-for="s in SURFACES"
            :key="s.value"
            :variant="glitch.surface === s.value ? 'default' : 'outline'"
            size="sm"
            @click="pickSurface(s)"
          >{{ s.label }}</Button>
          <Button variant="outline" size="sm" @click="resetAll">重置参数</Button>
        </div>

        <p class="text-xs text-muted-foreground">
          换底色时遮罩色会跟着变（<code>maskColor="auto"</code> 会从组件自己往上找第一个不透明背景）——
          所以它在深色 / 浅色主题里都不会露出色块。也可以手动传一个固定颜色。
        </p>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="glitch.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">色差配色（<code>shadowColors</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="c in COLOR_PRESETS"
                :key="c.label"
                :variant="glitch.colorLabel === c.label ? 'default' : 'outline'"
                size="sm"
                @click="pickColors(c)"
              >{{ c.label }}</Button>
            </div>
          </div>

          <div class="space-y-2 sm:col-span-2">
            <p class="text-sm font-semibold">开关</p>
            <div class="flex flex-wrap gap-2">
              <Button
                :variant="glitch.enableShadows ? 'default' : 'outline'"
                size="sm"
                @click="glitch.enableShadows = !glitch.enableShadows"
              >enableShadows</Button>
              <Button
                :variant="glitch.enableOnHover ? 'default' : 'outline'"
                size="sm"
                @click="glitch.enableOnHover = !glitch.enableOnHover"
              >enableOnHover</Button>
            </div>
            <p class="text-xs text-muted-foreground">
              开了 <code>enableOnHover</code> 后，两份副本默认是 <code>content: ''</code> + <code>opacity: 0</code>，
              鼠标移上来才开始切片
            </p>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">速度倍数</span>
                <span class="text-xs font-medium tabular-nums">{{ glitch.speed.toFixed(1) }}</span>
              </div>
              <Slider
                :model-value="[glitch.speed]"
                :min="0.1"
                :max="5"
                :step="0.1"
                @update:model-value="v => onSlider('speed', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">阴影偏移</span>
                <span class="text-xs font-medium tabular-nums">{{ glitch.shadowOffset }}px</span>
              </div>
              <Slider
                :model-value="[glitch.shadowOffset]"
                :min="0"
                :max="12"
                :step="1"
                @update:model-value="v => onSlider('shadowOffset', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">副本错位</span>
                <span class="text-xs font-medium tabular-nums">{{ glitch.layerOffset }}px</span>
              </div>
              <Slider
                :model-value="[glitch.layerOffset]"
                :min="0"
                :max="20"
                :step="1"
                @update:model-value="v => onSlider('layerOffset', v)"
              />
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            <code>speed</code> 是<strong>倍数</strong>（越大越慢）：两份副本的动画周期分别是
            <code>speed × 3s</code> 与 <code>speed × 2s</code> —— 周期不同才不会同步，
            再叠上 <code>alternate-reverse</code>，切片的节奏看着就很"随机"。
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">用法</p>
          <pre class="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed"><code>{{ usageSnippet }}</code></pre>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">实现上的注意点</p>
          <ul class="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li><strong>上游整个效果就是 CSS：</strong>真正的文字放在带 <code>data-text</code> 的元素里，
              <code>::before</code> / <code>::after</code> 用 <code>content: attr(data-text)</code> 复制一份，
              各自 <code>left: ∓10px</code> 错开并叠 <code>text-shadow</code> 做红/青<strong>色差</strong>，
              再用同一个 <code>clip-path: inset(上 0 下 0)</code> 关键帧把副本裁成横条。
              JS 只负责算几个 CSS 变量，没有任何动画循环。</li>
            <li><strong>两层为什么看着「随机」：</strong>它们用<strong>同一个关键帧</strong>但<strong>周期不同</strong>
              （<code>3s</code> / <code>2s</code>，都是 <code>alternate-reverse</code>，即来回播）——
              两个不同频率的三角波错开，切片高度就一直对不齐。</li>
            <li><strong>副本那层实心背景是关键：</strong>它把下面的原字盖住，被裁出来的横条才像「这一段被替换了」；
              不加就只是文字重影。上游写死 <code>#120F17</code>（假设页面是深色），
              这里改成<strong>自动测量</strong>：从组件自己沿 DOM 往上找第一个足够不透明的背景，
              并且用 <strong>1px canvas 归一化</strong>（本项目主题色是 <code>oklch()</code>，正则抠 <code>rgba()</code> 认不出来）。</li>
            <li>换底色 / 换主题后要重新测量 —— 组件盯了 <code>&lt;html&gt;</code> 的属性与 <code>&lt;head&gt;</code> 的变化，
              另外暴露了 <code>refreshMask()</code>（示例里的底色切换就是手动调的）；
              带 <code>transition-colors</code> 时还要<strong>等过渡走完再读</strong>，不然读到的是渐变中间色。</li>
            <li><code>enableOnHover</code> 的实现：默认 <code>content: ''</code> + <code>opacity: 0</code> + <code>animation: none</code>，
              <code>:hover</code> 时再把完整 <code>animation</code> 简写写回去 ——
              注意这里要用<strong>完整简写</strong>，因为 <code>animation: none</code> 会把所有子属性清成初始值，
              只补一个 <code>animation-name</code> 的话时长还是 <code>0s</code>，等于没动画。</li>
            <li>关键帧写在 <strong>scoped 样式块里</strong>是安全的：Vue 会给 <code>@keyframes</code> 改名，
              同时改写同一文件里的 <code>animation</code> 引用，两边一致。
              （别像某些组件那样把 animation-name 写进内联 style —— 那种情况下 scoped 会失配。）</li>
            <li>字号仍是上游的 <code>clamp(2rem, 10vw, 8rem)</code> + <code>font-weight: 900</code> + <code>white-space: nowrap</code>
              （这个效果必须一行），颜色改成<strong>继承</strong>（上游写死白色）；
              要改字号得用 <code>text-6xl!</code> 这类 important 写法，并且给外层容器留 <code>overflow: hidden</code>。</li>
            <li><code>prefers-reduced-motion: reduce</code> 时停掉切片动画（保留静态的色差错位），不再抖动。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { GlitchText } from '@/components/motion'</code></CardDescription>
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
          <p class="text-sm font-semibold">暴露的方法</p>
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
