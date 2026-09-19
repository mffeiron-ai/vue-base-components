<script setup lang="ts">
/**
 * VariableProximity 文档页（路由 /motion/variable-proximity）
 * 移植自 React Bits 的 Variable Proximity（MIT）：上游用 motion 起常驻 rAF，这里改成按需重算。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { VariableProximity } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

/** 文档站自托管的可变字体（@fontsource-variable/roboto-flex）的族名 */
const VARIABLE_FONT = 'Roboto Flex Variable'

const TEXT_PRESETS = [
  { label: '上游示例', value: 'Hover me!' },
  { label: '英文长句', value: 'Move your cursor across this text and watch the letters flex' },
  { label: '中英混排', value: '光标扫过 Variable Proximity 时，字会被「吸」过去' },
  { label: '纯中文', value: '鼠标移过来，靠近的字会变粗变宽' },
]

/** 轴组合预设：Fontsource 的 `standard` 子集含 wght / wdth / slnt（不含 opsz） */
const AXIS_PRESETS = [
  { label: '加粗（wght 400→900）', from: "'wght' 400", to: "'wght' 900" },
  { label: '加宽（wdth 75→125）', from: "'wdth' 75", to: "'wdth' 125" },
  { label: '倾斜（slnt 0→-10）', from: "'slnt' 0", to: "'slnt' -10" },
  { label: '粗+宽（上游观感）', from: "'wght' 300, 'wdth' 75", to: "'wght' 1000, 'wdth' 125" },
  { label: '粗+宽+斜', from: "'wght' 300, 'wdth' 90, 'slnt' 0", to: "'wght' 900, 'wdth' 125, 'slnt' -8" },
]

const FALLOFFS = [
  { label: 'linear（上游默认）', value: 'linear' },
  { label: 'exponential', value: 'exponential' },
  { label: 'gaussian', value: 'gaussian' },
]

const vp = reactive({
  textLabel: TEXT_PRESETS[0].label,
  label: TEXT_PRESETS[0].value,
  axisLabel: AXIS_PRESETS[0].label,
  from: AXIS_PRESETS[0].from,
  to: AXIS_PRESETS[0].to,
  radius: 100,
  falloff: 'linear',
})

function pickText(item: (typeof TEXT_PRESETS)[number]) {
  vp.textLabel = item.label
  vp.label = item.value
}

function pickAxes(item: (typeof AXIS_PRESETS)[number]) {
  vp.axisLabel = item.label
  vp.from = item.from
  vp.to = item.to
}

function onSlider(key: 'radius', value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') vp[key] = v
}

function resetAll() {
  vp.radius = 100
  vp.falloff = 'linear'
  vp.textLabel = TEXT_PRESETS[0].label
  vp.label = TEXT_PRESETS[0].value
  vp.axisLabel = AXIS_PRESETS[0].label
  vp.from = AXIS_PRESETS[0].from
  vp.to = AXIS_PRESETS[0].to
}

/* ── 读数 ──────────────────────────────────────────────── */

interface Stats {
  letters: number
  settings: string[]
  axes: { axis: string; fromValue: number; toValue: number }[]
  reduceMotion: boolean
}

const compRef = ref<{ update?: () => void; stats?: () => Stats } | null>(null)
const stats = ref<Stats | null>(null)
/** 可变字体是否真的生效（轴能改变宽度才算） */
const fontReady = ref(false)

/**
 * 判断「可变字体真的可用」：拿同样一段字，分别设 `wght` 200 / 900 量宽度。
 * 不用 `document.fonts.check()` —— 它对 `@font-face` 在未加载时会返回 false（误报），
 * 而且「字体存在」不等于「轴可用」；直接看宽度变不变才是真的。
 */
function checkVariableFont(family: string) {
  const probe = document.createElement('span')
  probe.textContent = 'Hover me!'
  probe.style.cssText = `position:absolute;left:-9999px;top:0;white-space:nowrap;font-size:32px;font-family:${family};`
  document.body.appendChild(probe)
  probe.style.fontVariationSettings = '"wght" 200'
  const light = probe.getBoundingClientRect().width
  probe.style.fontVariationSettings = '"wght" 900'
  const bold = probe.getBoundingClientRect().width
  probe.remove()
  return Math.abs(bold - light) > 0.5
}

function syncStats() {
  stats.value = compRef.value?.stats?.() ?? null
}

let timer = 0

onMounted(async () => {
  syncStats()
  timer = window.setInterval(syncStats, 150)
  // 等字体真正加载完再测（否则量到的是 fallback 字体的宽度）
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready
    } catch {
      /* 加载失败也不影响页面 */
    }
  }
  fontReady.value = checkVariableFont(`"${VARIABLE_FONT}"`)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})

/** 取中间那个字符的当前轴值当读数（比第一个更有代表性） */
const sampleSetting = computed(() => {
  const list = stats.value?.settings ?? []
  if (!list.length) return '—'
  return list[Math.floor(list.length / 2)] || '—'
})

const usageSnippet = computed(
  () => `<!-- 需要可变字体；这里用的是 @fontsource-variable/roboto-flex -->
<VariableProximity
  label="${vp.label.slice(0, 30)}${vp.label.length > 30 ? '…' : ''}"
  :from-font-variation-settings="\\"${vp.from}\\""
  :to-font-variation-settings="\\"${vp.to}\\""
  :radius="${vp.radius}"
  falloff="${vp.falloff}"
  font-family="Roboto Flex Variable"
  class="text-5xl font-semibold"
/>`,
)

const PROPS = [
  { name: 'label', type: 'string', def: "'Hover me!'", desc: '展示的文案（会逐字拆开，每个字符单独写轴值）' },
  { name: 'fromFontVariationSettings', type: 'string', def: "\"'wght' 400, 'wdth' 100\"", desc: '静止时（距离 ≥ radius）的轴值，写法同 CSS 的 `font-variation-settings`' },
  { name: 'toFontVariationSettings', type: 'string', def: "\"'wght' 900, 'wdth' 125\"", desc: '光标贴着字符时的轴值；`to` 里没写的轴保持不动' },
  { name: 'radius', type: 'number', def: '100', desc: '影响半径（px），超过就完全回到起始轴值' },
  { name: 'falloff', type: "'linear' | 'exponential' | 'gaussian'", def: "'linear'", desc: '距离衰减曲线：`linear` 是 1−d/r（上游），`exponential` 更集中，`gaussian` 最平滑' },
  { name: 'fontFamily', type: 'string', def: "'Roboto Flex Variable', …", desc: '可变字体族名（**必须是可变字体**，否则轴不生效）' },
  { name: 'mainClassName', type: 'string', def: "''", desc: '外层类名（Vue 里直接写 class 也会透传到根元素）' },
]

const EXPOSED = [
  { name: 'update()', desc: '按当前光标位置重算一次（布局变化后可以手动调）' },
  { name: 'stats()', desc: '读数：{ letters, settings, axes, reduceMotion }' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">近距变轴 VariableProximity</h1>
    <p class="mt-3 text-muted-foreground">
      光标靠近时，字符的<strong>可变字体轴</strong>被「吸」过去 —— 变粗、变宽、变斜，
      离得越近越明显，超过半径就完全回到原样。
      <strong>移植自 React Bits</strong>（MIT）：上游用 motion 起一个常驻 rAF 逐帧算距离，
      这里改成<strong>只在光标移动时重算</strong>（rAF 节流，停下就完全不干活），零依赖。
      <strong>把鼠标扫过下面的文字</strong>试试。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription class="min-h-[3.5rem]">
          <span class="font-mono">{{ stats?.letters ?? 0 }}</span> 个字符
          · 中间那个字符当前 <span class="font-mono">{{ sampleSetting }}</span>
          · <span :class="fontReady ? '' : 'text-destructive'">
            可变字体 {{ fontReady ? '已就绪' : '不可用（轴不会生效）' }}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex min-h-[220px] items-center overflow-hidden rounded-xl border border-border bg-muted/40 p-8">
          <VariableProximity
            ref="compRef"
            :label="vp.label"
            :from-font-variation-settings="vp.from"
            :to-font-variation-settings="vp.to"
            :radius="vp.radius"
            :falloff="vp.falloff"
            :font-family="VARIABLE_FONT"
            main-class-name="text-3xl font-semibold leading-snug sm:text-5xl"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="resetAll">重置参数</Button>
          <span class="text-xs text-muted-foreground">
            监听的是全局鼠标位置，所以从外面移进来也会立刻生效；
            开「减少动效」的系统里会一直停在起始轴值
          </span>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="vp.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">衰减曲线（<code>falloff</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="f in FALLOFFS"
                :key="f.value"
                :variant="vp.falloff === f.value ? 'default' : 'outline'"
                size="sm"
                @click="vp.falloff = f.value"
              >{{ f.label }}</Button>
            </div>
          </div>

          <div class="space-y-2 sm:col-span-2">
            <p class="text-sm font-semibold">轴组合（<code>fromFontVariationSettings</code> → <code>toFontVariationSettings</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="a in AXIS_PRESETS"
                :key="a.label"
                :variant="vp.axisLabel === a.label ? 'default' : 'outline'"
                size="sm"
                @click="pickAxes(a)"
              >{{ a.label }}</Button>
            </div>
            <p class="text-xs text-muted-foreground">
              <code>{{ vp.from }}</code> → <code>{{ vp.to }}</code>
            </p>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="space-y-1.5">
            <div class="flex items-baseline justify-between">
              <span class="text-xs text-muted-foreground">影响半径</span>
              <span class="text-xs font-medium tabular-nums">{{ vp.radius }}px</span>
            </div>
            <Slider
              :model-value="[vp.radius]"
              :min="20"
              :max="400"
              :step="10"
              @update:model-value="v => onSlider('radius', v)"
            />
          </div>
          <p class="text-xs text-muted-foreground">
            <code>falloff</code> 决定「从中心到半径边缘怎么衰减」：<code>linear</code> 是 <code>1 − d/r</code>（上游）；
            <code>exponential</code> 取它的平方，效果更「只贴近光标的那几个字」；
            <code>gaussian</code> 用 <code>e^(−(d/(r/2))²/2)</code>，过渡最柔和。
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">用法</p>
          <pre class="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed"><code>{{ usageSnippet }}</code></pre>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">实现上的注意点</p>
          <ul class="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li><strong>必须用可变字体</strong>（Variable Font）：这个效果就是把
              <code>font-variation-settings</code> 从一组轴值插值到另一组。文档站自托管的是
              <code>@fontsource-variable/roboto-flex</code> 的族名 <code>Roboto Flex Variable</code>；
              上游远程加载 Google Fonts，这里不联网。</li>
            <li><strong>轴值要跟字体实际提供的轴对齐</strong>：Fontsource 的 <code>standard</code> 子集只含
              <code>wght</code> / <code>wdth</code> / <code>slnt</code>（<strong>不含 <code>opsz</code></strong>），
              所以默认轴组合是 <code>wght + wdth</code> 而不是上游的 <code>wght + opsz</code> ——
              传了字体没有的轴不会报错，只是<strong>静默无效</strong>。</li>
            <li><strong>不挂常驻 rAF</strong>：上游用 motion 起了一个一直在跑的循环，靠「位置没变就跳过」省事，
              但每帧仍在执行；这里只在 <code>mousemove</code> / <code>touchmove</code> 时用 rAF 节流重算一次，
              鼠标停住就彻底没有开销。</li>
            <li><strong>读 / 写分开，避免 layout thrashing</strong>：一轮里先把所有字符的
              <code>getBoundingClientRect()</code> 读完（这中间不写任何样式，浏览器只会做一次 layout），
              再统一写回 <code>font-variation-settings</code>。上游是「读一个写一个」交替，N 个字符会触发 N 次强制重排。</li>
            <li><strong>不需要容器元素</strong>：上游要你传 <code>containerRef</code> 只是为了把座标换成相对坐标，
              而<strong>距离跟坐标原点无关</strong>，直接拿视口坐标量就行，所以这个 API 被省掉了。</li>
            <li>轴值是<strong>以 <code>from</code> 里的轴为准逐轴配对</strong>的：<code>to</code> 里没写的轴保持不动
              （跟上游一致），所以「只想变粗细」时 <code>to</code> 只写 <code>wght</code> 就行。</li>
            <li><strong>中文要逐字成「词」</strong>：英文按空格切词、词内 <code>white-space: nowrap</code> 防止词中断行；
              中文没有空格，不拆的话整段会被当成一个词、再也不能换行。</li>
            <li>字号/行高由外部控制（组件只管拆字与写轴值），示例里是用 <code>mainClassName</code> 传的 Tailwind 类。</li>
            <li>无障碍：逐字那一层是 <code>aria-hidden</code>，另有一个视觉隐藏的完整文本给读屏，
              免得被念成一堆单字。</li>
            <li><code>prefers-reduced-motion: reduce</code> 时不参与：所有字符一直停在起始轴值。</li>
            <li>字体加载完成后（<code>document.fonts.ready</code>）会重算一次 —— 换字体意味着字宽变了、距离也就变了；
              另外用 <code>ResizeObserver</code> 盯着自身尺寸变化，布局一变就按当前光标重算。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { VariableProximity } from '@/components/motion'</code></CardDescription>
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
