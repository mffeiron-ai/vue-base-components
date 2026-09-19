<script setup lang="ts">
/**
 * ScrollFloat 文档页（路由 /motion/scroll-float）
 * 移植自 React Bits 的 Scroll Float（MIT）：原版用 gsap ScrollTrigger 的 scrub，这里自己算滚动进度映射。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ScrollFloat } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

const TEXT_PRESETS = [
  { label: '上游示例', value: 'React Bits' },
  { label: '中文', value: '滚动浮起文字' },
  { label: '中英混排', value: 'Scroll 滚动 Float 浮起' },
  { label: '长句（看折行）', value: 'Scroll down and the letters float up one by one' },
]

const EASE_PRESETS = [
  { label: 'back.inOut(2)（上游默认）', value: 'back.inOut(2)' },
  { label: 'power2.out', value: 'power2.out' },
  { label: 'power4.out', value: 'power4.out' },
  { label: 'sine.inOut', value: 'sine.inOut' },
  { label: 'circ.out', value: 'circ.out' },
  { label: 'linear', value: 'linear' },
]

const RANGE_PRESETS = [
  {
    label: '上游默认（区间最长）',
    scrollStart: 'center bottom+=50%',
    scrollEnd: 'bottom bottom-=40%',
  },
  {
    label: '更早开始',
    scrollStart: 'top bottom+=20%',
    scrollEnd: 'bottom center',
  },
  {
    label: '区间很短（一点就到底）',
    scrollStart: 'center center+=20%',
    scrollEnd: 'bottom center',
  },
]

const float = reactive({
  text: TEXT_PRESETS[0].value,
  textLabel: TEXT_PRESETS[0].label,
  mode: 'box' as 'box' | 'page',
  ease: 'back.inOut(2)',
  easeLabel: EASE_PRESETS[0].label,
  rangeLabel: RANGE_PRESETS[0].label,
  scrollStart: RANGE_PRESETS[0].scrollStart,
  scrollEnd: RANGE_PRESETS[0].scrollEnd,
  animationDuration: 1,
  stagger: 0.03,
})

const boxEl = ref<HTMLElement | null>(null)
const compRef = ref<{ update?: () => void; progress?: () => number | null } | null>(null)
const progress = ref(0)

function pickText(preset: (typeof TEXT_PRESETS)[number]) {
  float.textLabel = preset.label
  float.text = preset.value
}

function pickEase(preset: (typeof EASE_PRESETS)[number]) {
  float.easeLabel = preset.label
  float.ease = preset.value
}

function pickRange(preset: (typeof RANGE_PRESETS)[number]) {
  float.rangeLabel = preset.label
  float.scrollStart = preset.scrollStart
  float.scrollEnd = preset.scrollEnd
}

function onSlider(key: 'animationDuration' | 'stagger', value: number[] | undefined) {
  const v = value?.[0]
  if (typeof v === 'number') float[key] = v
}

/** 读一次进度：容器滚动 / 页面滚动都算 */
function syncProgress() {
  const p = compRef.value?.progress?.()
  progress.value = typeof p === 'number' ? p : 0
}

function scrollToStart() {
  if (float.mode === 'box') boxEl.value?.scrollTo({ top: 0, behavior: 'smooth' })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToEnd() {
  const el = float.mode === 'box' ? boxEl.value : null
  if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  else window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
}

onMounted(() => {
  boxEl.value?.addEventListener('scroll', syncProgress, { passive: true })
  window.addEventListener('scroll', syncProgress, { passive: true })
  // 首帧布局稳定后再读一次（挂载那一刻量到的几何还没落定，读数会飘）
  window.requestAnimationFrame(() => syncProgress())
})

onBeforeUnmount(() => {
  boxEl.value?.removeEventListener('scroll', syncProgress)
  window.removeEventListener('scroll', syncProgress)
})

const usageSnippet = computed(
  () => `<ScrollFloat
  text="${float.text.slice(0, 24)}"
  :animation-duration="${float.animationDuration}"
  ease="${float.ease}"
  scroll-start="${float.scrollStart}"
  scroll-end="${float.scrollEnd}"
  :stagger="${float.stagger}"
${float.mode === 'box' ? '  :scroll-container="boxEl"   <!-- 不传则用页面滚动 -->\n' : ''}/>`,
)

const PROPS = [
  { name: 'text', type: 'string', def: "''", desc: '要展示的文字（逐字切开；空格会换成不换行空格）；也可以用默认插槽，插槽内容不切' },
  { name: 'scrollContainer', type: 'HTMLElement | null', def: 'null（= window）', desc: '滚动容器；不传就用页面滚动。传模板 ref 即可（上游是 scrollContainerRef）' },
  { name: 'animationDuration', type: 'number', def: '1', desc: '一个字符从起点走到终点所占的时间线长度（秒）' },
  { name: 'ease', type: 'string', def: "'back.inOut(2)'", desc: '缓动（GSAP 写法）：back / power1-4 / sine / expo / circ 的 in·out·inOut 都支持，见 gsap-ease.ts' },
  { name: 'scrollStart', type: 'string', def: "'center bottom+=50%'", desc: '区间起点，GSAP 的「触发器位置 容器位置」写法' },
  { name: 'scrollEnd', type: 'string', def: "'bottom bottom-=40%'", desc: '区间终点（写法同上）；两点之间就是整个滚动区间' },
  { name: 'stagger', type: 'number', def: '0.03', desc: '相邻字符错开的时间线长度（秒），越大越「波浪」' },
  { name: 'containerClassName', type: 'string', def: "''", desc: '外层类名（Vue 里直接写 class 也会透传到根元素）' },
  { name: 'textClassName', type: 'string', def: "''", desc: '文字层类名' },
]

const EXPOSED = [
  { name: 'update()', desc: '按当前滚动位置立刻重算一次（外部改了布局后可以调）' },
  { name: 'progress()', desc: '读当前滚动进度（0~1）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">滚动浮起 ScrollFloat</h1>
    <p class="mt-3 text-muted-foreground">
      文字逐字从下方<strong>浮</strong>上来（初始是<strong>压扁 + 透明 + 缩到 0.7 宽</strong>），
      而且是<strong>滚动驱动的 scrub</strong> —— 进度完全跟着滚动条走，往回滚动画也跟着倒放。
      <strong>移植自 React Bits</strong>（MIT）：原版用 gsap 的 ScrollTrigger，这里自己算
      「滚动位置 → 进度 → 逐字缓动值」这套映射，零依赖；<code>ease</code> 直接用 GSAP 的写法。
    </p>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">示例</h2>
        <CardDescription>
          滚动进度 <span class="font-mono">{{ Math.round(progress * 100) }}%</span>
          · 当前是「{{ float.mode === 'box' ? '容器内滚动' : '页面滚动（往下滚页面）' }}」
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div
          ref="boxEl"
          class="rounded-xl border border-border bg-background"
          :class="float.mode === 'box' ? 'h-[480px] overflow-y-auto' : 'overflow-hidden'"
        >
          <div v-if="float.mode === 'box'" class="h-[720px]" aria-hidden="true" />
          <!-- 页面滚动模式下也要让文字起点在「1.5 屏以下」，否则一进页面就已经滑过整段区间了 -->
          <div v-if="float.mode === 'page'" class="h-[150vh]" aria-hidden="true" />
          <div class="px-6 pb-56 pt-6">
            <ScrollFloat
              ref="compRef"
              :text="float.text"
              :scroll-container="float.mode === 'box' ? boxEl : null"
              :animation-duration="float.animationDuration"
              :ease="float.ease"
              :scroll-start="float.scrollStart"
              :scroll-end="float.scrollEnd"
              :stagger="float.stagger"
            />
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="scrollToStart">滚回起点</Button>
          <Button variant="outline" size="sm" @click="scrollToEnd">滚到终点</Button>
          <span class="text-xs text-muted-foreground">
            {{ float.mode === 'box' ? '上面的框自己可以滚（不传 scrollContainer 时就用页面滚动）' : '切到页面滚动后，需要滚整个页面' }}
          </span>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-semibold">文案</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="t in TEXT_PRESETS"
                :key="t.label"
                :variant="float.textLabel === t.label ? 'default' : 'outline'"
                size="sm"
                @click="pickText(t)"
              >{{ t.label }}</Button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-semibold">滚动来源</p>
            <div class="flex flex-wrap gap-2">
              <Button
                :variant="float.mode === 'box' ? 'default' : 'outline'"
                size="sm"
                @click="float.mode = 'box'"
              >容器内滚动</Button>
              <Button
                :variant="float.mode === 'page' ? 'default' : 'outline'"
                size="sm"
                @click="float.mode = 'page'"
              >页面滚动（window）</Button>
            </div>
          </div>

          <div class="space-y-2 sm:col-span-2">
            <p class="text-sm font-semibold">缓动（<code>ease</code>，GSAP 写法）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="e in EASE_PRESETS"
                :key="e.value"
                :variant="float.easeLabel === e.label ? 'default' : 'outline'"
                size="sm"
                @click="pickEase(e)"
              >{{ e.label }}</Button>
            </div>
          </div>

          <div class="space-y-2 sm:col-span-2">
            <p class="text-sm font-semibold">滚动区间（<code>scrollStart</code> / <code>scrollEnd</code>）</p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="r in RANGE_PRESETS"
                :key="r.label"
                :variant="float.rangeLabel === r.label ? 'default' : 'outline'"
                size="sm"
                @click="pickRange(r)"
              >{{ r.label }}</Button>
            </div>
            <p class="text-xs text-muted-foreground">
              <code>{{ float.scrollStart }}</code> → <code>{{ float.scrollEnd }}</code>
            </p>
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-border p-4">
          <p class="text-sm font-semibold">参数</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">单字时长</span>
                <span class="text-xs font-medium tabular-nums">{{ float.animationDuration }}s</span>
              </div>
              <Slider
                :model-value="[float.animationDuration]"
                :min="0.2"
                :max="4"
                :step="0.1"
                @update:model-value="v => onSlider('animationDuration', v)"
              />
            </div>
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-muted-foreground">逐字错开</span>
                <span class="text-xs font-medium tabular-nums">{{ float.stagger.toFixed(2) }}s</span>
              </div>
              <Slider
                :model-value="[float.stagger]"
                :min="0"
                :max="0.12"
                :step="0.01"
                @update:model-value="v => onSlider('stagger', v)"
              />
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            时间线总长 = 单字时长 + 逐字错开 ×（字数 − 1） —— 滚动区间始终映射到这条时间线上，
            所以「单字时长」与「逐字错开」是<strong>相对</strong>的：调大单字时长＝每个字在同样的滚动距离里走得更慢、错开更不明显。
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">用法</p>
          <pre class="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed"><code>{{ usageSnippet }}</code></pre>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold">实现上的注意点</p>
          <ul class="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li><strong>不是「播一段动画」，而是 scrub</strong>：进度 = <code>(scrollTop − start) / (end − start)</code>，往回滚会倒着走。所以这里的 <code>ease</code> 必须是**函数**（逐帧算值），不能像其它动效那样换成一个 CSS 缓动 —— <code>gsap-ease.ts</code> 里新加了 <code>resolveEaseFn()</code>，按 GSAP 公式实现 back / power1-4 / sine / expo / circ 的 in·out·inOut。</li>
            <li><strong><code>scrollStart</code> / <code>scrollEnd</code> 是 GSAP 的字符串写法</strong>：<code>"触发器位置 容器位置"</code>，位置可以是 <code>top / center / bottom / 50% / 120px</code>，第二个还支持 <code>+=50% / -=40%</code>（百分比按滚动容器高度算）。默认区间 <code>center bottom+=50% → bottom bottom-=40%</code> 换算过来就是「元素中线到容器底下方半屏」到「元素底边到容器底上方 0.4 屏」。</li>
            <li>逐字错开是**时间线上的偏移**：<code>local = clamp((progress × total − i × stagger) / duration)</code>，<code>total = duration + stagger × (n − 1)</code>。所以 <code>stagger</code> 越大，同样进度下前后字的差距越明显（像波浪）。</li>
            <li>应用的值：<code>opacity</code>（夹在 0~1）、<code>translateY(120% → 0%)</code>、<code>scale(0.7 → 1, 2.3 → 1)</code>，<code>transform-origin: 50% 0%</code> —— 从顶部缩放，视觉上就是「字被从下面拉上来」。<strong>过冲不夹</strong>：<code>back</code> 缓动会先「回拉」（值到 −0.06，字先往下沉一点）再冲过 1，这才是它的手感。</li>
            <li>外层 <code>overflow: hidden</code> 负责裁掉还没浮上来的字（初始 <code>translateY(120%)</code> 正好在框外）。</li>
            <li><strong>示例里的几何是算过的</strong>：默认区间要求「元素中线到底部下方半屏」→「元素底边到下方 0.6 屏」，想让进度能在固定高度的框里走到 100%，框的底部留白得 ≥ <code>0.4 × 框高 + 顶部留白</code>（示例是 480 高的框 + 224 的底部留白）。放在真实页面里用 window 滚动时没这个问题。</li>
            <li>滚动监听挂在**滚动容器**（或 window）上，用 <code>requestAnimationFrame</code> 节流；另外监听 window resize 与 <code>document.fonts.ready</code>（字体到位后行高变了要重算）。</li>
            <li>没有找到高度为 0 / 区间为 0 的情况会直接跳过（<code>progress()</code> 返回 null），不会出现 NaN 样式。</li>
            <li><code>prefers-reduced-motion: reduce</code> 时**完全不参与**：不写初始的隐藏态、不挂监听，文字保持原样可见。</li>
            <li>字号字重来自上游 CSS（<code>clamp(1.6rem, 8vw, 10rem)</code> / <code>900</code>，无层样式）：要改得用 <code>text-4xl!</code> 这类 important 写法。</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription><code>import { ScrollFloat } from '@/components/motion'</code></CardDescription>
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
