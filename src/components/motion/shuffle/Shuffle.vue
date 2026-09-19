<script setup lang="ts">
/**
 * Shuffle —— 洗牌机 / 老虎机：每个字符是一条「滚轮」，滚动几格乱码后停在真字上
 *
 * 移植自 React Bits 的 Shuffle（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/shuffle
 * 原版用 gsap + SplitText + ScrollTrigger；这里全部自己来：
 *   · 切分：按「词（或单个 CJK 字）」分块，块内每个字符是一个滚轮（换行只发生在块之间）
 *   · 滚动：WAAPI 的 transform（**不是** GSAP timeline），每格宽度/高度在挂载时实测
 *   · 触发：IntersectionObserver（threshold + rootMargin，与本站其它动效一致）
 *
 * 每个滚轮的结构（与上游一致）：
 *   [真字副本, N 个乱码, 真字] —— 左右滚动方向上再把顺序旋转成 [真字, N 个乱码, 真字副本]，
 *   这样「起始位置」看到的一定是真正的字（副本），滚过乱码后正好停在真字上。
 *
 * 节奏（与上游一致）：
 *   evenodd（默认）—— 奇数位从 0 开始、偶数位从 oddTotal × 0.7 开始，各自内部再按 stagger 错峰
 *   random        —— 每条滚轮随机延迟 0 ~ maxDelay
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { resolveEase } from '../gsap-ease'

export type ShuffleDirection = 'left' | 'right' | 'up' | 'down'
export type ShuffleAnimationMode = 'evenodd' | 'random'
export type ShuffleTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'

const props = withDefaults(
  defineProps<{
    text?: string
    /** 滚轮往哪边滚 */
    shuffleDirection?: ShuffleDirection
    /** 单条滚轮滚动的时长（秒） */
    duration?: number
    /** animationMode='random' 时的最大随机延迟（秒） */
    maxDelay?: number
    /** 缓动：CSS 缓动名，或 GSAP 常见名 */
    ease?: string
    /** 进入视口的比例阈值（0–1） */
    threshold?: number
    /** 触发的 rootMargin（`-100px` 这类，负数=更晚触发） */
    rootMargin?: string
    /** 渲染成什么标签 */
    tag?: ShuffleTag
    /** 对齐 */
    textAlign?: 'left' | 'center' | 'right'
    /** 中途要滚过几个乱码格 */
    shuffleTimes?: number
    /** 节奏模式 */
    animationMode?: ShuffleAnimationMode
    /** 循环播放 */
    loop?: boolean
    /** 循环之间的停顿（秒） */
    loopDelay?: number
    /** evenodd 模式下同一组内部的错峰（秒） */
    stagger?: number
    /** 乱码字符集；留空则中间格用真字本身（观感是「字滑进来」） */
    scrambleCharset?: string
    /** 起始文字颜色（支持 `--color-*` 变量名，播放时解析成真实颜色） */
    colorFrom?: string
    /** 结束文字颜色 */
    colorTo?: string
    /** 只自动触发一次 */
    triggerOnce?: boolean
    /** 用户偏好减少动效时直接落位 */
    respectReducedMotion?: boolean
    /** 播放结束后悬停可重播 */
    triggerOnHover?: boolean
  }>(),
  {
    text: '',
    shuffleDirection: 'right',
    duration: 0.35,
    maxDelay: 0,
    ease: 'power3.out',
    threshold: 0.1,
    rootMargin: '-100px',
    tag: 'p',
    textAlign: 'center',
    shuffleTimes: 1,
    animationMode: 'evenodd',
    loop: false,
    loopDelay: 0,
    stagger: 0.03,
    scrambleCharset: '',
    triggerOnce: true,
    respectReducedMotion: true,
    triggerOnHover: true,
  },
)

const emit = defineEmits<{ complete: [] }>()

const rootEl = ref<HTMLElement | null>(null)

/* ── 切分：词（含单个 CJK 字）为块，字符为滚轮 ─────────────── */

/** CJK 没有空格，整句会被当成一个词 → 这里让每个 CJK 字自己成块，换行才不会失效 */
const CJK_RE = /[\u2e80-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/

function splitCjk(chunk: string): string[] {
  const parts: string[] = []
  let buffer = ''
  for (const ch of Array.from(chunk)) {
    if (CJK_RE.test(ch)) {
      if (buffer) {
        parts.push(buffer)
        buffer = ''
      }
      parts.push(ch)
    } else buffer += ch
  }
  if (buffer) parts.push(buffer)
  return parts.length ? parts : ['']
}

interface RenderUnit {
  spaceAfter: boolean
  chars: { char: string; index: number }[]
}

const layout = computed<RenderUnit[]>(() => {
  const text = String(props.text ?? '')
  const chunks = text.split(' ')
  const out: RenderUnit[] = []
  let index = 0
  chunks.forEach((chunk, chunkIndex) => {
    const parts = splitCjk(chunk)
    parts.forEach((part, partIndex) => {
      out.push({
        spaceAfter: partIndex === parts.length - 1 && chunkIndex < chunks.length - 1,
        chars: Array.from(part).map(char => ({ char, index: index++ })),
      })
    })
  })
  return out
})

const chars = computed(() => layout.value.flatMap(unit => unit.chars.map(c => c.char)))
const charCount = computed(() => chars.value.length)

/* ── 尺寸实测 ───────────────────────────────────────────── */

const phase = ref<'measuring' | 'ready'>('measuring')
const metrics = ref<{ w: number; h: number }[]>([])

const vertical = computed(() => props.shuffleDirection === 'up' || props.shuffleDirection === 'down')
const rolls = computed(() => Math.max(1, Math.floor(Number(props.shuffleTimes) || 1)))
/** 一格的高度：竖直方向上所有格必须等高，取实测最大值 */
const cellHeight = computed(() => Math.max(1, ...metrics.value.map(m => m.h), 1))

function measure() {
  const root = rootEl.value
  if (!root) return
  const els = Array.from(root.querySelectorAll<HTMLElement>('.shuffle-measure-char'))
  metrics.value = els.map((el) => {
    const rect = el.getBoundingClientRect()
    return { w: Math.max(1, rect.width), h: Math.max(1, rect.height) }
  })
  phase.value = 'ready'
}

/* ── 每格的文字（乱码）──────────────────────────────────── */

const cellTexts = ref<string[][]>([])

/** 抽一批乱码（只给中间格用）；charset 为空时中间格直接用真字本身 */
function rollScrambleTexts(): string[][] {
  const set = props.scrambleCharset
  return chars.value.map(real =>
    Array.from({ length: rolls.value }, () => (set ? set.charAt(Math.floor(Math.random() * set.length)) || '' : real)),
  )
}

/** 每次播放 / 每次循环都重新抽一次乱码（上游 randomizeScrambles 的等价物） */
function randomizeScrambles() {
  cellTexts.value = rollScrambleTexts()
}

/** 一条滚轮的全部格子；right / down 需要把真字挪到最前面 */
function cellsFor(index: number): { text: string; orig: boolean }[] {
  const real = chars.value[index] ?? ''
  const middle = cellTexts.value[index] ?? Array.from({ length: rolls.value }, () => real)
  const list = [
    { text: real, orig: false },
    ...middle.map(text => ({ text, orig: false })),
    { text: real, orig: true },
  ]
  const rotate = props.shuffleDirection === 'right' || props.shuffleDirection === 'down'
  return rotate ? [list[list.length - 1]!, ...list.slice(1, -1), list[0]!] : list
}

/* ── 播放 ───────────────────────────────────────────────── */

const settled = ref(false)
let animations: Animation[] = []
let viewObserver: IntersectionObserver | null = null
let hoverHandler: (() => void) | null = null
let completeTimer: number | null = null
let loopTimer: number | null = null
let playing = false
let themeObserver: MutationObserver | null = null

/** `--color-*` 变量名要在播放时解析成真实颜色（WAAPI 没法在 var() 之间插值） */
function resolveColor(value?: string) {
  if (!value) return undefined
  if (!value.startsWith('--')) return value
  return getComputedStyle(document.documentElement).getPropertyValue(value).trim() || undefined
}

const durationMs = computed(() => Math.max(0.01, Number(props.duration) || 0.35) * 1000)
const easeCss = computed(() => resolveEase(props.ease, 'ease-out'))

function stripEls(): HTMLElement[] {
  const root = rootEl.value
  return root ? Array.from(root.querySelectorAll<HTMLElement>('.shuffle-strip')) : []
}

/** 每条滚轮的延迟（毫秒）：与上游 evenodd / random 的算法逐行一致 */
function computeDelays(count: number): number[] {
  if (props.animationMode === 'random') {
    return Array.from({ length: count }, () => Math.random() * Math.max(0, Number(props.maxDelay) || 0) * 1000)
  }
  const stag = Math.max(0, Number(props.stagger) || 0) * 1000
  const odd: number[] = []
  const even: number[] = []
  for (let i = 0; i < count; i++) (i % 2 === 1 ? odd : even).push(i)
  const oddTotal = durationMs.value + Math.max(0, odd.length - 1) * stag
  const evenStart = odd.length ? oddTotal * 0.7 : 0
  const out = new Array<number>(count).fill(0)
  odd.forEach((i, k) => { out[i] = k * stag })
  even.forEach((i, k) => { out[i] = evenStart + k * stag })
  return out
}

function stopAnimations() {
  animations.forEach(a => a.cancel())
  animations = []
  if (completeTimer !== null) {
    window.clearTimeout(completeTimer)
    completeTimer = null
  }
}

/** 播完落成「静态」结构：只留真字、清掉 transform（上游 cleanupToStill 的等价物） */
function settle() {
  stopAnimations()
  animations = []
  playing = false
  settled.value = true
  applySettledColor()
}

function applySettledColor() {
  const root = rootEl.value
  if (!root) return
  const to = resolveColor(props.colorTo)
  root.querySelectorAll<HTMLElement>('.shuffle-wrap').forEach((el) => {
    el.style.color = to ?? ''
  })
}

function armHover() {
  removeHover()
  const root = rootEl.value
  if (!props.triggerOnHover || !root) return
  hoverHandler = () => {
    if (playing) return
    play()
  }
  root.addEventListener('mouseenter', hoverHandler)
}

function removeHover() {
  if (hoverHandler && rootEl.value) rootEl.value.removeEventListener('mouseenter', hoverHandler)
  hoverHandler = null
}

function play() {
  if (phase.value !== 'ready') return
  stopAnimations()
  if (loopTimer !== null) {
    window.clearTimeout(loopTimer)
    loopTimer = null
  }
  settled.value = false
  nextTick(() => {
    const strips = stripEls()
    if (!strips.length) return

    if (props.respectReducedMotion && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      settle()
      emit('complete')
      return
    }

    randomizeScrambles()
    playing = true
    const count = strips.length
    const delays = computeDelays(count)
    const colorFrom = resolveColor(props.colorFrom)
    const colorTo = resolveColor(props.colorTo)
    const dir = props.shuffleDirection
    const isVertical = vertical.value

    strips.forEach((el, i) => {
      const index = Number(el.dataset.i ?? 0)
      const metric = metrics.value[index] ?? { w: 10, h: 16 }
      const cell = isVertical ? cellHeight.value : metric.w
      const steps = rolls.value + 1
      const start = (dir === 'right' || dir === 'down') ? -steps * cell : 0
      const final = (dir === 'left' || dir === 'up') ? -steps * cell : 0
      const from = isVertical ? `translate3d(0, ${start}px, 0)` : `translate3d(${start}px, 0, 0)`
      const to = isVertical ? `translate3d(0, ${final}px, 0)` : `translate3d(${final}px, 0, 0)`

      const frames: Keyframe[] = [
        { transform: from, ...(colorFrom ? { color: colorFrom } : {}) },
        { transform: to, ...(colorTo ? { color: colorTo } : {}) },
      ]
      animations.push(
        el.animate(frames, {
          duration: durationMs.value,
          delay: delays[i] ?? 0,
          easing: easeCss.value,
          fill: 'both',
        }),
      )
    })

    // 完成用定时器报：动画的 finished 在后台标签页里可能一直不 resolve
    const total = Math.max(...delays) + durationMs.value
    completeTimer = window.setTimeout(() => {
      completeTimer = null
      emit('complete')
      if (props.loop) {
        loopTimer = window.setTimeout(() => {
          loopTimer = null
          play()
        }, Math.max(0, Number(props.loopDelay) || 0) * 1000)
      } else {
        settle()
        armHover()
      }
    }, total + 16)
  })
}

function start() {
  const root = rootEl.value
  if (!root) return
  spotObserver()
  viewObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return
      play()
      if (props.triggerOnce) spotObserver()
    },
    { threshold: Math.min(1, Math.max(0, Number(props.threshold) || 0)), rootMargin: props.rootMargin || '0px' },
  )
  viewObserver.observe(root)
}

function spotObserver() {
  viewObserver?.disconnect()
  viewObserver = null
}

/* ── 生命周期 ───────────────────────────────────────────── */

onMounted(async () => {
  await nextTick()
  // 字体是异步的：字宽会影响每格尺寸，就绪后再量（加超时兜底，别把页面卡死）
  await Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise(resolve => window.setTimeout(resolve, 1200)),
  ]).catch(() => {})
  await nextTick()
  measure()
  await nextTick()
  randomizeScrambles()
  start()
  // 主题切换后，落位状态的颜色要跟着重算（变量名在播放时已经被解析成真实颜色了）
  themeObserver = new MutationObserver(() => {
    if (settled.value) applySettledColor()
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] })
})

onBeforeUnmount(() => {
  playing = false
  stopAnimations()
  if (loopTimer !== null) window.clearTimeout(loopTimer)
  spotObserver()
  removeHover()
  themeObserver?.disconnect()
  themeObserver = null
})

// 文案 / 方向 / 格子数变了 → 重新测量、重新播
watch([layout, () => props.shuffleDirection, () => props.shuffleTimes, () => props.scrambleCharset], async () => {
  phase.value = 'measuring'
  settled.value = false
  await nextTick()
  measure()
  await nextTick()
  randomizeScrambles()
  start()
})

// 动画参数变了 → 重新播一遍（DOM 不用动、也不用重新测量）
watch(
  [
    () => props.animationMode,
    () => props.duration,
    () => props.stagger,
    () => props.maxDelay,
    () => props.ease,
    () => props.loop,
    () => props.loopDelay,
    () => props.colorFrom,
    () => props.colorTo,
    () => props.triggerOnce,
    () => props.triggerOnHover,
    () => props.respectReducedMotion,
  ],
  () => {
    if (phase.value === 'ready') play()
  },
)

defineExpose({ play, replay: play })
</script>

<template>
  <component
    :is="tag"
    ref="rootEl"
    class="shuffle"
    :class="phase === 'measuring' ? 'shuffle--measuring' : ''"
    :style="{ textAlign }"
  >
    <template v-for="(unit, unitIndex) in layout" :key="`u-${unitIndex}`">
      <span class="shuffle-unit">
        <template v-for="ch in unit.chars" :key="`c-${ch.index}`">
          <!-- 测量阶段：只渲染一个朴素字符，拿它的真实宽高 -->
          <span
            v-if="phase === 'measuring'"
            class="shuffle-wrap"
          >
            <span
              class="shuffle-measure-char"
              :data-i="ch.index"
            >{{ ch.char }}</span>
          </span>
          <!-- 就绪：滚轮 -->
          <span
            v-else
            class="shuffle-wrap"
            :style="{
              width: `${metrics[ch.index]?.w ?? 10}px`,
              height: vertical ? `${cellHeight}px` : undefined,
            }"
          >
            <span
              v-if="settled"
              class="shuffle-strip shuffle-strip--still"
            >
              <span class="shuffle-cell">{{ ch.char }}</span>
            </span>
            <span
              v-else
              class="shuffle-strip"
              :class="vertical ? 'shuffle-strip--vertical' : 'shuffle-strip--horizontal'"
              :data-i="ch.index"
            >
              <span
                v-for="(cell, cellIndex) in cellsFor(ch.index)"
                :key="`k-${cellIndex}`"
                class="shuffle-cell"
                :aria-hidden="cell.orig ? undefined : 'true'"
                :style="{ width: `${metrics[ch.index]?.w ?? 10}px`, ...(vertical ? { height: `${cellHeight}px` } : {}) }"
              >{{ cell.text || '\u00A0' }}</span>
            </span>
          </span>
        </template>
      </span>
      <span v-if="unit.spaceAfter" class="shuffle-space">{{ ' ' }}</span>
    </template>
  </component>
</template>

<style scoped>
.shuffle {
  display: inline-block;
  white-space: normal;
  word-wrap: break-word;
  /* 用 1.2 而不是上游的 1：滚轮是 overflow:hidden 的窗口，行高太紧会把 g/j/p 的降部裁掉 */
  line-height: 1.2;
}

/* 测量阶段先别露出来，避免看到「未洗牌」的一帧（与上游 visibility: hidden 同一个目的） */
.shuffle--measuring {
  visibility: hidden;
}

/* 一个「词」（或单个 CJK 字）：换行只发生在它之间 */
.shuffle-unit {
  display: inline-block;
  white-space: pre;
}

.shuffle-space {
  white-space: pre;
}

/* 一格宽/高的窗口，把滚轮裁出来 */
.shuffle-wrap {
  display: inline-block;
  overflow: hidden;
  vertical-align: baseline;
}

.shuffle-measure-char {
  display: inline-block;
  white-space: pre;
}

.shuffle-strip {
  display: inline-flex;
  will-change: transform;
}

.shuffle-strip--horizontal {
  flex-direction: row;
  white-space: nowrap;
}

.shuffle-strip--vertical {
  flex-direction: column;
}

.shuffle-strip--still {
  transform: none;
  will-change: auto;
}

.shuffle-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: none;
  white-space: pre;
}
</style>
