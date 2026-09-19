<script setup lang="ts">
/**
 * ScrollReveal 文档页（路由 /motion/scroll-reveal）
 * 移植自 React Bits 的 Scroll Reveal（MIT）：原版用 gsap ScrollTrigger 的三条 scrub 补间，这里自己算滚动进度。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ScrollReveal } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

const TEXT_PRESETS = [
  {
    label: '上游示例（英文长句）',
    value:
      'When does a man die? When he is hit by a bullet? No! When he suffers a disease? No! When he ate a soup made out of a poisonous mushroom? No! A man dies when he is forgotten!',
  },
  {
    label: '中文（逐字显影）',
    value: '人什么时候会死？是被子弹打中吗？不是！是得了病吗？不是！是喝下毒蘑菇汤吗？不是！人是在被遗忘的时候才死的！',
  },
  { label: '中英混排', value: 'Scroll 滚动 Reveal 揭露：文字逐词显影，整块文字慢慢转正。' },
  { label: '一句话', value: 'A man dies when he is forgotten!' },
]

const RANGE_PRESETS = [
  { label: '上游默认（区间最长）', rotationEnd: 'bottom bottom', wordAnimationEnd: 'bottom bottom' },
  { label: '更早完成（区间更短）', rotationEnd: 'center bottom', wordAnimationEnd: 'center bottom' },
  { label: '更晚完成（拖到最后）', rotationEnd: 'bottom center', wordAnimationEnd: 'bottom center' },
]

const reveal = reactive({
  textLabel: TEXT_PRESETS[0].label,
  text: TEXT_PRESETS[0].value,
  mode: 'box' as 'box' | 'page',
  rangeLabel: RANGE_PRESETS[0].label,
  rotationEnd: RANGE_PRESETS[0].rotationEnd,
  wordAnimationEnd: RANGE_PRESETS[0].wordAnimationEnd,
  enableBlur: true,
  baseOpacity: 0.1,
  baseRotation: 3,
  blurStrength: 4,
  wordStagger: 0.05,
})

const boxEl = ref<HTMLElement | null>(null)
const compRef = ref<{
  update?: () => void
  progress?: () => { rotate: number | null; words: number | null }
} | null>(null)

const rotateProgress = ref(0)
const wordProgress = ref(0)

/** 当前倾角（度）：滚动进度越大越接近 0 */
const currentRotation = computed(() => (1 - rotateProgress.value) * reveal.baseRotation)

function pickText(preset: (typeof TEXT_PRESETS)[number]) {
  reveal.textLabel = preset.label
  reveal.text = preset.value
  scrollToStart()
}

function pickRange(preset: (typeof RANGE_PRESETS)[number]) {
  reveal.rangeLabel = preset.label
  reveal.rotationEnd = preset.rotationEnd
  reveal.wordAnimationEnd = preset.wordAnimationEnd
  scrollToStart()
}

function onSlider(
  key: 'baseOpacity' | 'baseRotation' | 'blurStrength' | 'wordStagger',
  value: number[] | undefined,
) {
  const v = value?.[0]
  if (typeof v === 'number') reveal[key] = v
}

/** 读一次进度：容器滚动 / 页面滚动都算 */
function syncProgress() {
  const p = compRef.value?.progress?.()
  rotateProgress.value = typeof p?.rotate === 'number' ? p.rotate : 0
  wordProgress.value = typeof p?.words === 'number' ? p.words : 0
}

/** 换个参数就得回到起点，否则已经是「播完」的状态，看不出差别 */
function scrollToStart() {
  if (reveal.mode === 'box') boxEl.value?.scrollTo({ top: 0, behavior: 'smooth' })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToEnd() {
  if (reveal.mode === 'box') {
    const el = boxEl.value
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  } else {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
  }
}

function resetAll() {
  reveal.baseOpacity = 0.1
  reveal.baseRotation = 3
  reveal.blurStrength = 4
  reveal.wordStagger = 0.05
  reveal.enableBlur = true
  scrollToStart()
}

onMounted(() => {
  boxEl.value?.addEventListener('scroll', syncProgress, { passive: true })
  window.addEventListener('scroll', syncProgress, { passive: true })
  // 首帧布局稳定后再读一次（挂载那一刻量到的几何还没落定）
  window.requestAnimationFrame(() => syncProgress())
})

onBeforeUnmount(() => {
  boxEl.value?.removeEventListener('scroll', syncProgress)
  window.removeEventListener('scroll', syncProgress)
})

const usageSnippet = computed(
  () => `<ScrollReveal
  :enable-blur="${reveal.enableBlur}"
  :base-opacity="${reveal.baseOpacity}"
  :base-rotation="${reveal.baseRotation}"
  :blur-strength="${reveal.blurStrength}"
  :word-stagger="${reveal.wordStagger}"
${reveal.mode === 'box' ? '  :scroll-container="boxEl"   <!-- 不传则用页面滚动 -->\n' : ''}>
  人是在被遗忘的时候才死的。
</ScrollReveal>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "''", desc: '要展示的文字；也可以用默认插槽（插槽内容不切词）' },
  { name: 'scrollContainer', type: 'HTMLElement | null', def: 'null（= window）', desc: '滚动容器；不传就用页面滚动（上游是 scrollContainerRef）' },
  { name: 'enableBlur', type: 'boolean', def: 'true', desc: '逐词动画时是否叠一层模糊（模糊只加在词上，不影响整块）' },
  { name: 'baseOpacity', type: 'number', def: '0.1', desc: '逐词的初始透明度（0 = 完全隐形，动画前只隐约看得见轮廓）' },
  { name: 'baseRotation', type: 'number', def: '3', desc: '容器初始倾角（度），滚过区间后转到 0（transform-origin: 0% 50%）' },
  { name: 'blurStrength', type: 'number', def: '4', desc: '初始模糊强度（px），随进度线性消到 0' },
  { name: 'wordStagger', type: 'number', def: '0.05', desc: '相邻词错开的时间线长度（秒）—— 上游写死 0.05，这里提成可调' },
  { name: 'rotationEnd', type: 'string', def: "'bottom bottom'", desc: '容器旋转的区间终点（GSAP 位置写法）' },
  { name: 'wordAnimationEnd', type: 'string', def: "'bottom bottom'", desc: '逐词动画的区间终点（写法同上）' },
  { name: 'containerClassName', type: 'string', def: "''", desc: '外层类名（Vue 里直接写 class 也会透传到根元素）' },
  { name: 'textClassName', type: 'string', def: "''", desc: '文字层类名' },
]

const EXPOSED = [
  { name: 'update()', desc: '按当前滚动位置立刻重算一次（外部改了布局后可以调）' },
  { name: 'progress()', desc: '读两条进度：{ rotate, words }（0~1 或 null）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">滚动揭露 ScrollReveal</h1>
    <p class="mt-3 text-muted-foreground">
      文字随滚动<strong>逐词显影</strong>（<strong>透明度 + 模糊</strong>一起走），整块文字还会从一个小小的
      <strong>倾角转正</strong>。和 ScrollFloat 一样是<strong>滚动驱动的 scrub</strong> —— 进度完全跟着滚动条走，
      往回滚动画也跟着倒放。<strong>移植自 React Bits</strong>（MIT）：原版用 gsap 的 ScrollTrigger 挂了三条补间，
      这里自己算「滚动位置 → 两条进度 → 逐词插值」这套映射，零依赖。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>
          容器旋转 <span class="font-mono">{{ Math.round(rotateProgress * 100) }}%</span>
          （当前倾角 <span class="font-mono">{{ currentRotation.toFixed(2) }}°</span>）
          · 逐词 <span class="font-mono">{{ Math.round(wordProgress * 100) }}%</span>
          · {{ reveal.mode === 'box' ? '在下面的框里滚' : '往下滚整个页面' }}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div
          ref="boxEl"
          class="rounded-xl border border-border bg-background"
          :class="reveal.mode === 'box' ? 'h-[400px] overflow-y-auto' : 'overflow-hidden'"
        >
          <!-- 前面留出足够空白：逐词起点是「元素顶边低于容器底 0.2 个容器高」，不留白的话一进页面就已经播完了 -->
          <div v-if="reveal.mode === 'box'" class="h-[900px]" aria-hidden="true" />
          <div v-if="reveal.mode === 'page'" class="h-[150vh]" aria-hidden="true" />

          <div class="px-6 pb-[400px]">
            <ScrollReveal
              ref="compRef"
              :text="reveal.text"
              :scroll-container="reveal.mode === 'box' ? boxEl : null"
              :enable-blur="reveal.enableBlur"
              :base-opacity="reveal.baseOpacity"
              :base-rotation="reveal.baseRotation"
              :blur-strength="reveal.blurStrength"
              :word-stagger="reveal.wordStagger"
              :rotation-end="reveal.rotationEnd"
              :word-animation-end="reveal.wordAnimationEnd"
            />
          </div>

          <div v-if="reveal.mode === 'page'" class="h-[80vh]" aria-hidden="true" />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="scrollToStart">滚回起点</Button>
          <Button variant="outline" size="sm" @click="scrollToEnd">滚到终点</Button>
          <Button variant="outline" size="sm" @click="resetAll">重置参数</Button>
          <span class="text-xs text-muted-foreground">
            {{ reveal.mode === 'box' ? '上面的框自己可以滚（不传 scrollContainer 时就用页面滚动）' : '切到页面滚动后，需要滚整个页面' }}
          </span>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="reveal.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">滚动来源</p>
            <div class="flex flex-wrap gap-2">
              <Button
                :variant="reveal.mode === 'box' ? 'default' : 'outline'"
                size="sm"
                @click="reveal.mode = 'box'; scrollToStart()"
              >容器内滚动</Button>
              <Button
                :variant="reveal.mode === 'page' ? 'default' : 'outline'"
                size="sm"
                @click="reveal.mode = 'page'; scrollToStart()"
              >页面滚动（window）</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">模糊</p>
            <div class="flex flex-wrap gap-2">
              <Button
                :variant="reveal.enableBlur ? 'default' : 'outline'"
                size="sm"
                @click="reveal.enableBlur = !reveal.enableBlur; scrollToStart()"
              >{{ reveal.enableBlur ? 'enableBlur：开' : 'enableBlur：关' }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">动画区间终点（<code>rotationEnd</code> / <code>wordAnimationEnd</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="r in RANGE_PRESETS"
                :key="r.label"
                :variant="reveal.rangeLabel === r.label ? 'default' : 'outline'"
                size="sm"
                @click="pickRange(r)"
              >{{ r.label }}</Button>
            </div>
            <p class="text-xs text-muted-foreground">
              起点固定是 <code>top bottom</code>（旋转）/ <code>top bottom-=20%</code>（逐词）→
              终点 <code>{{ reveal.rotationEnd }}</code>
            </p>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">初始透明度</span>
                <span class="text-xs font-medium tabular-nums">{{ reveal.baseOpacity.toFixed(2) }}</span>
              </div>
              <Slider
                :model-value="[reveal.baseOpacity]"
                :min="0"
                :max="1"
                :step="0.05"
                @update:model-value="v => onSlider('baseOpacity', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">初始倾角</span>
                <span class="text-xs font-medium tabular-nums">{{ reveal.baseRotation.toFixed(1) }}°</span>
              </div>
              <Slider
                :model-value="[reveal.baseRotation]"
                :min="0"
                :max="10"
                :step="0.5"
                @update:model-value="v => onSlider('baseRotation', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">初始模糊</span>
                <span class="text-xs font-medium tabular-nums">{{ reveal.blurStrength }}px</span>
              </div>
              <Slider
                :model-value="[reveal.blurStrength]"
                :min="0"
                :max="15"
                :step="1"
                @update:model-value="v => onSlider('blurStrength', v)"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">逐词错开</span>
                <span class="text-xs font-medium tabular-nums">{{ reveal.wordStagger.toFixed(2) }}s</span>
              </div>
              <Slider
                :model-value="[reveal.wordStagger]"
                :min="0"
                :max="0.2"
                :step="0.01"
                @update:model-value="v => onSlider('wordStagger', v)"
              />
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            逐词这条时间线的总长 = <code>0.5 + 逐词错开 ×（词数 − 1）</code>（0.5s 是 GSAP 补间的默认时长），
            整条线被映射到滚动区间上 —— 所以错开调大后，同样进度下前后词的差距更明显（像一波波亮起来）。
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">用法</p>
          <pre class="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed"><code>{{ usageSnippet }}</code></pre>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">实现上的注意点</p>
          <ul class="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li><strong>三条补间、两条进度</strong>：① 容器旋转一条区间（<code>top bottom</code> → <code>rotationEnd</code>）；②③ 逐词的透明度与模糊<strong>共用同一条</strong>区间与 stagger（<code>top bottom-=20%</code> → <code>wordAnimationEnd</code>）。三条都是 <code>ease: 'none'</code>，所以是纯线性插值 —— 不需要 ScrollFloat 那种缓动函数。</li>
            <li><strong>逐词的区间比旋转更早开始</strong>：起点是 <code>top bottom-=20%</code>（元素顶边到「容器底边往上 20% 容器高」），旋转是 <code>top bottom</code>。所以文字先「显影」，最后那些滚动距离里容器还在慢慢转正。</li>
            <li>区间长度可以直接算：<code>top bottom → bottom bottom</code> 的长度正好是<strong>元素自身的高度</strong>（起终点都减掉同一个视口高，差别只剩元素底边与顶边之差）。<code>top bottom-=20% → bottom bottom</code> 则是 <code>元素高度 − 0.2 × 视口高</code> —— <strong>注意 <code>bottom-=20%</code> 是把起点「拉近」而不是推远</strong>（它是「容器底边再往上 20% 容器高」，比裸 <code>bottom</code> 更靠近元素）。</li>
            <li><strong>所以页面滚动时这个效果会「很快」</strong>：逐词区间只有 <code>元素高度 − 0.2 × 视口高</code>（本例容器 398px 高时是 280px；换成 1249px 的窗口、同样的文字就只剩 110px 的滚动距离了）。上游 demo 就是放在固定高度的容器里滚的 —— 想让动画「经滚」，用 <code>scrollContainer</code> 把视口设小，或者把文案写长（元素越高区间越长）。</li>
            <li>逐词错开是<strong>时间线上的偏移</strong>：<code>local = clamp((progress × total − i × stagger) / 0.5)</code>，<code>total = 0.5 + stagger × (n − 1)</code>。透明度取 <code>baseOpacity + (1 − baseOpacity) × local</code>，模糊取 <code>blurStrength × (1 − local)</code>（像素值线性插值，和 GSAP 处理 filter 字符串的方式一致）。</li>
            <li><strong>逐词 = <code>display: inline-block</code></strong>（上游靠 class 给），模糊/透明度只加在词上；空白保持普通文本节点，换行行为不变。中文按字切（顺带把中文标点粘在前一个字上），英文按空白切词。</li>
            <li><strong>测量时必须先清掉自己的 transform</strong>：容器带 <code>rotate</code> 时 <code>getBoundingClientRect()</code> 会把旋转算进去（元素越高越歪），「顶边碰到容器底边」这类判定就会自己漂移。GSAP 的 ScrollTrigger 也是先临时清掉再测，<code>scroll-trigger.ts</code> 里照做了。</li>
            <li>示例里的留白是算过的：逐词起点要求元素顶边至少低于容器底 <code>0.2 × 容器高</code>，所以前置留白 ≥ <code>0.8 × 容器高</code> 就够（400 高的框给了 900，滚起来更有仪式感）；后置留白只要留出一点就能让进度走到 100%（<code>bottom bottom</code> 需要元素底边在可滚范围内，本例 400 很宽裕）。</li>
            <li>滚动监听挂在<strong>滚动容器</strong>（或 window）上，用 <code>requestAnimationFrame</code> 节流；另外监听 window resize、元素自身尺寸变化（ResizeObserver）与 <code>document.fonts.ready</code>。</li>
            <li><code>progress()</code> 在区间取不到（高度/区间为 0）时返回 <code>null</code>，组件直接跳过写样式，不会写出 NaN。</li>
            <li><code>prefers-reduced-motion: reduce</code> 时<strong>完全不参与</strong>：不写初始的「半透明 + 模糊」态、不挂监听，文字保持原样可见；另外 CSS 里也兜了一层 <code>!important</code>。</li>
            <li>字号字重来自上游 CSS（<code>clamp(1.6rem, 4vw, 3rem)</code> / <code>600</code>，无层样式）：要改得用 <code>text-4xl!</code> 这类 important 写法。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { ScrollReveal } from '@/components/motion'</code></CardDescription>
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
