<script setup lang="ts">
/**
 * RotatingText 文档页（路由 /motion/rotating-text）
 * 移植自 React Bits 的 Rotating Text（MIT）：上游用 motion 的 AnimatePresence + 每字符一个 motion.span，
 * 这里用「弹簧解析解 → linear() 缓动 + WAAPI」复刻。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { RotatingText, springDuration } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

const TEXTS_PRESETS = [
  { label: '上游示例', value: ['thinking', 'coding', 'components!'] },
  { label: '中文（逐字）', value: ['思考中', '写代码', '做组件'] },
  { label: '中英混排', value: ['轮换文字', 'Rotating Text', '无依赖移植'] },
  { label: '长短差很多', value: ['a', 'much longer phrase'] },
  { label: '两行文本', value: ['第一行\n第二行', '换一段\n再看效果'] },
]

const SPLIT_BY = [
  { label: 'characters（按字）', value: 'characters' },
  { label: 'words（按词）', value: 'words' },
  { label: 'lines（按行）', value: 'lines' },
  { label: 'regex 空格', value: ' ' },
]

const STAGGER_FROM = [
  { label: 'first', value: 'first' },
  { label: 'last', value: 'last' },
  { label: 'center', value: 'center' },
  { label: 'random', value: 'random' },
]

const rotate = reactive({
  textsLabel: TEXTS_PRESETS[0].label,
  texts: TEXTS_PRESETS[0].value,
  splitBy: 'characters',
  staggerFrom: 'first',
  staggerDuration: 0.025,
  rotationInterval: 2000,
  stiffness: 300,
  damping: 25,
  mass: 1,
  auto: true,
  loop: true,
  clip: false,
})

function pickTexts(item: (typeof TEXTS_PRESETS)[number]) {
  rotate.textsLabel = item.label
  rotate.texts = item.value
}

function onSlider(
  key: 'staggerDuration' | 'rotationInterval' | 'stiffness' | 'damping' | 'mass',
  value: number[] | undefined,
) {
  const v = value?.[0]
  if (typeof v === 'number') rotate[key] = v
}

function resetAll() {
  rotate.staggerDuration = 0.025
  rotate.rotationInterval = 2000
  rotate.stiffness = 300
  rotate.damping = 25
  rotate.mass = 1
  rotate.auto = true
  rotate.loop = true
  rotate.clip = false
  rotate.splitBy = 'characters'
  rotate.staggerFrom = 'first'
  rotate.textsLabel = TEXTS_PRESETS[0].label
  rotate.texts = TEXTS_PRESETS[0].value
}

/* ── 读数 + 手动控制（验证暴露的方法） ─────────────────── */

interface Stats {
  index: number
  count: number
  text: string
  chars: number
  busy: boolean
}

const compRef = ref<{
  next?: () => void
  previous?: () => void
  jumpTo?: (i: number) => void
  reset?: () => void
  stats?: () => Stats
} | null>(null)

const stats = ref<Stats | null>(null)
let timer = 0

function syncStats() {
  stats.value = compRef.value?.stats?.() ?? null
}

onMounted(() => {
  timer = window.setInterval(syncStats, 150)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})

/** 弹簧在一次「入场」里实际跑多久（跟参数联动的读数） */
const springMs = computed(
  () => Math.round(springDuration({ stiffness: rotate.stiffness, damping: rotate.damping, mass: rotate.mass }) * 1000),
)

/** 整轮切换大概要多久：退场 + 入场各自的「弹簧时长 + 错开」之和 */
const cycleMs = computed(() => {
  const chars = stats.value?.chars ?? 0
  const spread = Math.max(0, chars - 1) * rotate.staggerDuration * 1000
  return Math.round((springMs.value + spread) * 2)
})

const usageSnippet = computed(
  () => `<span class="inline-flex items-baseline gap-2">
  Creative
  <RotatingText
    :texts="${JSON.stringify(rotate.texts)}"
    :rotation-interval="${rotate.rotationInterval}"
    :stagger-duration="${rotate.staggerDuration}"
    stagger-from="${rotate.staggerFrom}"
    split-by="${rotate.splitBy}"
    :stiffness="${rotate.stiffness}"
    :damping="${rotate.damping}"
  />
</span>`,
)

const PROPS = [
  { name: 'texts', type: 'string[]', def: '[]', desc: '要轮换的文本（至少 2 条才有轮换效果）' },
  { name: 'rotationInterval', type: 'number', def: '2000', desc: '每段停留多久（**毫秒**）' },
  { name: 'staggerDuration', type: 'number', def: '0', desc: '相邻字符错开的时长（**秒**；注意上游这两个单位不一致，这里保持一致）' },
  { name: 'staggerFrom', type: "'first' | 'last' | 'center' | 'random' | number", def: "'first'", desc: '错开从哪里开始；`random` 每个字符各掷一次骰子，所以是彻底打散的' },
  { name: 'loop', type: 'boolean', def: 'true', desc: '到最后一段后是否回到第一段' },
  { name: 'auto', type: 'boolean', def: 'true', desc: '是否自动轮换（关掉就只靠 next() / previous()）' },
  { name: 'splitBy', type: 'string', def: "'characters'", desc: "`characters` / `words` / `lines` / 任意分隔符（如 `' '`）" },
  { name: 'initial', type: 'RotatingTextTarget', def: "{ y: '100%', opacity: 0 }", desc: '入场起点（支持 x / y / scale / rotate / opacity）' },
  { name: 'animate', type: 'RotatingTextTarget', def: "{ y: '0%', opacity: 1 }", desc: '入场终点，也是静止态' },
  { name: 'exit', type: 'RotatingTextTarget', def: "{ y: '-120%', opacity: 0 }", desc: '出场终点' },
  { name: 'stiffness', type: 'number', def: '300', desc: '弹簧劲度系数（motion 的 `stiffness`）' },
  { name: 'damping', type: 'number', def: '25', desc: '弹簧阻尼（越小越弹、过冲越明显）' },
  { name: 'mass', type: 'number', def: '1', desc: '弹簧质量' },
  { name: 'clip', type: 'boolean', def: 'false', desc: '给文字层加 `overflow: hidden`（字符会「从边缘钻出来」；默认关，跟上游一样靠外层裁）' },
  { name: 'mainClassName', type: 'string', def: "''", desc: '外层类名' },
  { name: 'splitLevelClassName', type: 'string', def: "''", desc: '每个「词」容器的类名' },
  { name: 'elementLevelClassName', type: 'string', def: "''", desc: '每个字符的类名' },
]

const EXPOSED = [
  { name: 'next()', desc: '切到下一段（正在切换中会被忽略）' },
  { name: 'previous()', desc: '切到上一段' },
  { name: 'jumpTo(index)', desc: '跳到指定段（内部会夹到合法范围）' },
  { name: 'reset()', desc: '回到第一段' },
  { name: 'stats()', desc: '读数：{ index, count, text, chars, busy }' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">轮换文字 RotatingText</h1>
    <p class="mt-3 text-muted-foreground">
      一串词轮流上场：旧的字符<strong>向上飞出</strong>，新的字符<strong>从下方弹上来</strong>，
      每个字符按 <code>staggerFrom</code> 错开一点，所以是「波浪式」地换。
      <strong>移植自 React Bits</strong>（MIT）：原版用 motion 的 <code>AnimatePresence</code> + 每字符一个
      <code>motion.span</code>，这里用<strong>弹簧解析解采样成 <code>linear()</code> 缓动 + WAAPI</strong> 复刻，零依赖。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription class="min-h-[3.5rem]">
          第 <span class="font-mono">{{ (stats?.index ?? 0) + 1 }}</span> /
          <span class="font-mono">{{ stats?.count ?? 0 }}</span> 段
          · 当前 <span class="font-mono">{{ stats?.text }}</span>
          · <span class="font-mono">{{ stats?.chars ?? 0 }}</span> 个字符
          · 弹簧 <span class="font-mono">{{ springMs }}ms</span>
          · 整轮约 <span class="font-mono">{{ cycleMs }}ms</span>
          · {{ stats?.busy ? '切换中…' : '待机' }}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 p-8">
          <p class="flex flex-wrap items-baseline gap-3 text-2xl font-semibold sm:text-3xl">
            <span>Creative</span>
            <RotatingText
              ref="compRef"
              :texts="rotate.texts"
              :rotation-interval="rotate.rotationInterval"
              :stagger-duration="rotate.staggerDuration"
              :stagger-from="rotate.staggerFrom"
              :split-by="rotate.splitBy"
              :stiffness="rotate.stiffness"
              :damping="rotate.damping"
              :mass="rotate.mass"
              :auto="rotate.auto"
              :loop="rotate.loop"
              :clip="rotate.clip"
              main-class-name="text-primary"
            />
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="compRef?.previous?.()">上一段</Button>
          <Button variant="outline" size="sm" @click="compRef?.next?.()">下一段</Button>
          <Button variant="outline" size="sm" @click="compRef?.jumpTo?.(2)">跳到第 3 段</Button>
          <Button variant="outline" size="sm" @click="compRef?.reset?.()">回到第 1 段</Button>
          <Button variant="outline" size="sm" @click="resetAll">重置参数</Button>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXTS_PRESETS"
                :key="t.label"
                :variant="rotate.textsLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickTexts(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">拆分方式（<code>splitBy</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="s in SPLIT_BY"
                :key="s.value"
                :variant="rotate.splitBy === s.value ? 'default' : 'outline'"
                size="sm"
                @click="rotate.splitBy = s.value"
              >{{ s.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">错开方向（<code>staggerFrom</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="s in STAGGER_FROM"
                :key="s.value"
                :variant="rotate.staggerFrom === s.value ? 'default' : 'outline'"
                size="sm"
                @click="rotate.staggerFrom = s.value"
              >{{ s.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">开关</p>
            <div class="flex flex-wrap gap-2">
              <Button
                :variant="rotate.auto ? 'default' : 'outline'"
                size="sm"
                @click="rotate.auto = !rotate.auto"
              >auto</Button>
              <Button
                :variant="rotate.loop ? 'default' : 'outline'"
                size="sm"
                @click="rotate.loop = !rotate.loop"
              >loop</Button>
              <Button
                :variant="rotate.clip ? 'default' : 'outline'"
                size="sm"
                @click="rotate.clip = !rotate.clip"
              >clip</Button>
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">轮换间隔</span>
                <span class="text-xs font-medium tabular-nums">{{ rotate.rotationInterval }}ms</span>
              </div>
              <Slider
                :model-value="[rotate.rotationInterval]"
                :min="500"
                :max="5000"
                :step="100"
                @update:model-value="v => onSlider('rotationInterval', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">逐字错开</span>
                <span class="text-xs font-medium tabular-nums">{{ rotate.staggerDuration.toFixed(3) }}s</span>
              </div>
              <Slider
                :model-value="[rotate.staggerDuration]"
                :min="0"
                :max="0.1"
                :step="0.005"
                @update:model-value="v => onSlider('staggerDuration', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">弹簧时长（算出来的）</span>
                <span class="text-xs font-medium tabular-nums">{{ springMs }}ms</span>
              </div>
              <div class="h-9 rounded-md border border-dashed border-border" />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">stiffness</span>
                <span class="text-xs font-medium tabular-nums">{{ rotate.stiffness }}</span>
              </div>
              <Slider
                :model-value="[rotate.stiffness]"
                :min="100"
                :max="800"
                :step="10"
                @update:model-value="v => onSlider('stiffness', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">damping</span>
                <span class="text-xs font-medium tabular-nums">{{ rotate.damping }}</span>
              </div>
              <Slider
                :model-value="[rotate.damping]"
                :min="5"
                :max="60"
                :step="1"
                @update:model-value="v => onSlider('damping', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">mass</span>
                <span class="text-xs font-medium tabular-nums">{{ rotate.mass.toFixed(1) }}</span>
              </div>
              <Slider
                :model-value="[rotate.mass]"
                :min="0.5"
                :max="3"
                :step="0.1"
                @update:model-value="v => onSlider('mass', v)"
              />
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            <code>damping</code> 调小（比如 5）会明显<strong>过冲</strong> —— 字符弹过头再回来；
            <code>stiffness</code> 调大则更快更硬。<strong>把「轮换间隔」调到比「整轮耗时」还小</strong>时，
            正在切换中的请求会被忽略（不会排队、也不会打架）。
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">用法</p>
          <pre class="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed"><code>{{ usageSnippet }}</code></pre>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">实现上的注意点</p>
          <ul class="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li><strong>上游是 motion 的 <code>AnimatePresence</code>：</strong>
              每个字符一个 <code>motion.span</code>，入场 <code>{ y: '100%', opacity: 0 } → { y: 0, opacity: 1 }</code>、
              出场 <code>{ y: '-120%', opacity: 0 }</code>，<code>mode="wait"</code> 表示
              <strong>等上一段全部退场完，下一段才入场</strong>。这里用 <code>Animation.finished</code> 等退场。</li>
            <li><strong>弹簧怎么来的（<code>spring-ease.ts</code>）：</strong>
              质量-弹簧-阻尼系统有解析解 —— <code>ω₀ = √(k/m)</code>、<code>ζ = c / (2√(k·m))</code>，
              欠阻尼时 <code>x(t) = 1 − e^(−ζω₀t)·[cos(ω𝒹t) + (ζω₀/ω𝒹)·sin(ω𝒹t)]</code>。
              把它按时间采样成一串点喂给 WAAPI 的 <code>linear()</code> 缓动即可 —— 浏览器按点做分段线性插值，
              形状就是弹簧（含过冲），而且动画跑在合成器上，比每帧写样式便宜。
              不支持 <code>linear()</code> 时退回一个带过冲的 <code>cubic-bezier</code>。</li>
            <li><strong>弹簧「多久算停」用振幅包络算</strong>（<code>e^(−ζω₀t)/√(1−ζ²) &lt; 0.001</code>）：
              如果改成「逐帧试到进度接近 1」，会在第一个过冲的<strong>波峰</strong>上就误判成结束 ——
              动画提前收尾，过冲就看不见了。默认参数（300 / 25 / 1）约 <strong>580ms</strong>。</li>
            <li><code>staggerDuration</code> 是<strong>秒</strong>、<code>rotationInterval</code> 是<strong>毫秒</strong>（上游就是不一致的，
              这里保留原样并在文档里标明）；错开量按<strong>整个文本里的全局字符序号</strong>算，跨词累加。</li>
            <li><code>y: '100%'</code> 的百分比是<strong>相对字符自身高度</strong>（即行高），所以字是从下面一格「钻」上来的；
              <code>exit</code> 用 <code>-120%</code> 是让它飞得更远一点，配合外层裁剪看着更利落。</li>
            <li><strong><code>staggerFrom="random"</code> 是每个字符各掷一次骰子</strong>（不是挑一个基准点），
              所以延迟是彻底打散的 —— 这是上游的写法，照抄。</li>
            <li><code>splitBy="characters"</code> 先按空格切词、词内再按<strong>字素</strong>切
              （<code>Intl.Segmenter</code>，emoji 不会被切碎）；中文没有空格，天然就是逐字。</li>
            <li>首屏<strong>不播入场动画</strong>（对应上游 <code>animatePresenceInitial = false</code>），
              直接落在 <code>animate</code> 状态上；之后每次切换才播。</li>
            <li>切换中的重复请求会被<strong>忽略</strong>（不是一个队列）：把 <code>rotationInterval</code> 调得比
              「整轮耗时」小的时候，不会出现两段动画打架。</li>
            <li><strong>有意省掉的一处：</strong>上游用 motion 的 <code>layout</code> 让容器宽度在切换时平滑过渡
              （「Creative thinking」→「Creative components!」那个位移）。纯 CSS 无法对 <code>auto</code> 宽度做过渡，
              这里就<strong>不做宽度动画</strong> —— 需要的话用 <code>mainClassName</code> 自己加，或把轮换词放进固定宽度的容器。</li>
            <li><code>prefers-reduced-motion: reduce</code> 时<strong>保留轮换但去掉动画</strong>（直接换文本）——
              轮换本身是内容，不该整个停掉。</li>
            <li>无障碍：容器里有一个只在视觉上隐藏的 <code>&lt;span&gt;</code> 承载当前文本，
              动画层是 <code>aria-hidden</code>，这样读屏不会念到一堆被拆开的单字。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { RotatingText } from '@/components/motion'</code></CardDescription>
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
