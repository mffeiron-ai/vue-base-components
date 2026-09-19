<script setup lang="ts">
/**
 * Split Text —— 把文案切成字符 / 单词 / 行，逐单位错峰入场
 *
 * 移植自 React Bits 的 Split Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/split-text
 * 原版依赖 gsap + gsap/SplitText + ScrollTrigger；这里不用 GSAP：
 *   · 切分自己做（字 / 词 / 行，行是按渲染后的 offsetTop 归组的）
 *   · 逐单位错峰入场 → WAAPI（`delay` 是**每个单位之间**的间隔毫秒）
 *   · 触发 → IntersectionObserver（threshold + rootMargin，只触发一次）
 * 因此 `from` / `to` 支持 GSAP 里最常用的那几个属性：opacity / x / y / scale / rotate / blur。
 *
 * 结构：外层 tag 负责 textAlign 与换行；词是 `inline-block`（词内不断行），
 * 字符在词里再包一层 `inline-block`（这样换行只发生在词之间）。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { resolveEase } from '../gsap-ease'

export type SplitTextType = 'chars' | 'words' | 'lines' | 'words, chars'
export type SplitTextTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
/** 支持的入场/落位属性（GSAP tween vars 的常用子集） */
export interface SplitTextVars {
  opacity?: number
  x?: number
  y?: number
  scale?: number
  rotate?: number
  blur?: number
}

const props = withDefaults(
  defineProps<{
    text?: string
    /** 每个单位之间的入场间隔（毫秒） */
    delay?: number
    /** 每个单位自己的入场时长（秒） */
    duration?: number
    /** 缓动：CSS 缓动，或 GSAP 常见名字（power3.out 之类，内部有映射） */
    ease?: string
    /** 按什么切分 */
    splitType?: SplitTextType
    /** 起始属性 */
    from?: SplitTextVars
    /** 结束属性 */
    to?: SplitTextVars
    /** 进入视口的比例阈值（0–1） */
    threshold?: number
    /** 触发的 rootMargin（`-100px` 这类，跟 ScrollTrigger 的写法一致） */
    rootMargin?: string
    /** 渲染成什么标签 */
    tag?: SplitTextTag
    /** 对齐 */
    textAlign?: 'left' | 'center' | 'right' | 'justify'
  }>(),
  {
    text: '',
    delay: 50,
    duration: 1.25,
    ease: 'power3.out',
    splitType: 'chars',
    from: () => ({ opacity: 0, y: 40 }),
    to: () => ({ opacity: 1, y: 0 }),
    threshold: 0.1,
    rootMargin: '-100px',
    tag: 'p',
    textAlign: 'center',
  },
)

const emit = defineEmits<{ complete: [] }>()

const rootEl = ref<HTMLElement | null>(null)

const withChars = computed(() => props.splitType.includes('chars'))
const wantsLines = computed(() => props.splitType.includes('lines'))
const easeCss = computed(() => resolveEase(props.ease))

type Token = { kind: 'word' | 'space' | 'break'; text: string; chars: string[] }

/** 空格与换行原样留着（它们是排版的一部分，不参与动画） */
const tokens = computed<Token[]>(() => {
  const text = String(props.text ?? '')
  const out: Token[] = []
  // 先按「空白 / 非空白」切，保住原文的空格数量
  for (const part of text.split(/(\s+)/)) {
    if (part === '') continue
    if (/^\s+$/.test(part)) {
      // 必须是普通空格：不换行空格（\u00A0）会让量行时永远量不出折行
      out.push({ kind: 'space', text: ' ', chars: [] })
      continue
    }
    out.push({ kind: 'word', text: part, chars: Array.from(part) })
  }
  return out
})

/** lines 模式：按渲染后的 offsetTop 把词归到同一行 */
const lineGroups = ref<string[][] | null>(null)

function measureLines() {
  const root = rootEl.value
  if (!root) return
  const words = Array.from(root.querySelectorAll<HTMLElement>('.split-text__word'))
  if (!words.length) {
    lineGroups.value = []
    return
  }
  const groups: string[][] = []
  let currentTop: number | null = null
  words.forEach((word) => {
    const top = Math.round(word.offsetTop)
    if (currentTop === null || Math.abs(top - currentTop) > 1) {
      groups.push([word.textContent ?? ''])
      currentTop = top
    } else {
      groups[groups.length - 1].push(word.textContent ?? '')
    }
  })
  lineGroups.value = groups
}

/* ── 动画 ───────────────────────────────────────────────── */

let animations: Animation[] = []
let viewObserver: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let completeTimer: number | null = null
let measured = false
let hasPlayed = false
/** 行归组依赖实际宽度，容器变宽变窄要重切（相当于原版的 autoSplit） */
let lineTimer: number | null = null

function queueMeasureLines() {
  if (!wantsLines.value) return
  if (lineTimer !== null) window.clearTimeout(lineTimer)
  lineTimer = window.setTimeout(async () => {
    lineTimer = null
    // 关键：要先退回扁平结构再量。分行块内部是不换行的，
    // 如果直接在「已分行」的 DOM 上量，宽度变小也量不出新的折行。
    lineGroups.value = null
    await nextTick()
    measureLines()
    // 重切会重建行元素：已经播过就落到终态，否则等它进视口再动
    await nextTick()
    if (hasPlayed) settle()
  }, 120)
}

function frameFrom(vars: SplitTextVars, fallback: SplitTextVars) {
  const merged = { ...fallback, ...vars }
  const x = Number(merged.x ?? 0)
  const y = Number(merged.y ?? 0)
  const scale = Number(merged.scale ?? 1)
  const rotate = Number(merged.rotate ?? 0)
  const blur = Number(merged.blur ?? 0)
  return {
    opacity: String(merged.opacity ?? 1),
    transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`,
    filter: blur ? `blur(${blur}px)` : 'none',
  }
}

function targets(): HTMLElement[] {
  const root = rootEl.value
  if (!root) return []
  // 与上游一致：有字就动字，其次词，最后行
  const chars = Array.from(root.querySelectorAll<HTMLElement>('.split-text__char'))
  if (withChars.value && chars.length) return chars
  const words = Array.from(root.querySelectorAll<HTMLElement>('.split-text__word'))
  if (!withChars.value && !wantsLines.value && words.length) return words
  const lines = Array.from(root.querySelectorAll<HTMLElement>('.split-text__line'))
  if (lines.length) return lines
  return words
}

function stopAnimations() {
  animations.forEach(a => a.cancel())
  animations = []
  if (completeTimer !== null) {
    window.clearTimeout(completeTimer)
    completeTimer = null
  }
}

function settle() {
  stopAnimations()
  hasPlayed = true
  targets().forEach((el) => {
    const end = frameFrom(props.to, { opacity: 1, y: 0 })
    el.style.opacity = end.opacity
    el.style.transform = end.transform
    el.style.filter = end.filter
  })
}

function play() {
  const list = targets()
  if (!list.length) return

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    settle()
    emit('complete')
    return
  }

  stopAnimations()
  hasPlayed = true
  const from = frameFrom(props.from, { opacity: 0, y: 40 })
  const to = frameFrom(props.to, { opacity: 1, y: 0 })
  const duration = Math.max(0.01, Number(props.duration) || 1.25) * 1000
  const stagger = Math.max(0, Number(props.delay) || 0)

  list.forEach((el, index) => {
    animations.push(
      el.animate([from, to], {
        duration,
        delay: index * stagger,
        easing: easeCss.value,
        fill: 'both',
      }),
    )
  })

  // 用定时器报完成：动画的 finished 在后台标签页里可能一直不 resolve
  const total = duration + (list.length - 1) * stagger
  completeTimer = window.setTimeout(() => {
    completeTimer = null
    emit('complete')
  }, total + 16)
}

function start() {
  const root = rootEl.value
  if (!root) return
  stopAnimations()
  viewObserver?.disconnect()
  viewObserver = null

  const run = () => {
    play()
    viewObserver?.disconnect()
    viewObserver = null
  }

  viewObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some(entry => entry.isIntersecting)) run()
    },
    { threshold: Math.min(1, Math.max(0, Number(props.threshold) || 0)), rootMargin: props.rootMargin || '0px' },
  )
  viewObserver.observe(root)
}

/* ── 生命周期 ───────────────────────────────────────────── */

onMounted(async () => {
  await nextTick()
  measured = true
  if (wantsLines.value) measureLines()
  // 字体是异步的：字宽变了行会重排，所以字体就绪后再量一次
  document.fonts?.ready.then(() => { if (wantsLines.value) measureLines() }).catch(() => {})
  // 容器尺寸变了也要重切行
  const root = rootEl.value
  if (root && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(queueMeasureLines)
    resizeObserver.observe(root)
  }
  await nextTick()
  start()
})

onBeforeUnmount(() => {
  stopAnimations()
  viewObserver?.disconnect()
  viewObserver = null
  resizeObserver?.disconnect()
  resizeObserver = null
  if (lineTimer !== null) window.clearTimeout(lineTimer)
})

// 文案 / 切法 / 排版相关变了 → 重新切分、重新触发
watch(
  [tokens, () => props.splitType, () => props.textAlign, () => props.tag],
  async () => {
    if (!measured) return
    lineGroups.value = null
    await nextTick()
    if (wantsLines.value) measureLines()
    await nextTick()
    start()
  },
)

// 动画参数变了 → 重播（不动 DOM）
watch(
  [() => props.delay, () => props.duration, () => props.ease, () => props.threshold, () => props.rootMargin, () => props.from, () => props.to],
  () => start(),
)

const tagName = computed(() => props.tag ?? 'p')
defineExpose({ play, replay: play })
</script>

<template>
  <component
    :is="tagName"
    ref="rootEl"
    class="split-text"
    :style="{ textAlign }"
  >
    <!-- 行模式：量完行之后按行渲染 -->
    <template v-if="wantsLines && lineGroups">
      <span v-for="(line, lineIndex) in lineGroups" :key="`line-${lineIndex}`" class="split-text__line">
        <template v-for="(word, wordIndex) in line" :key="`w-${lineIndex}-${wordIndex}`">
          <span class="split-text__word">{{ word }}</span>
          <!-- 词间空格：内容用插值给，否则空白的文本节点会被模板编译器吃掉（宽度变 0） -->
          <span v-if="wordIndex < line.length - 1" class="split-text__space">{{ ' ' }}</span>
        </template>
      </span>
    </template>

    <!-- 词 / 字模式 -->
    <template v-else>
      <template v-for="(token, index) in tokens" :key="`t-${index}`">
        <br v-if="token.kind === 'break'">
        <template v-else-if="token.kind === 'space'">{{ token.text }}</template>
        <span v-else class="split-text__word">
          <template v-if="withChars">
            <span v-for="(char, charIndex) in token.chars" :key="`c-${index}-${charIndex}`" class="split-text__char">{{ char }}</span>
          </template>
          <template v-else>{{ token.text }}</template>
        </span>
      </template>
    </template>
  </component>
</template>

<style scoped>
.split-text {
  display: inline-block;
  /* 跟 inline-block 的收缩宽度抵消：窄父级里要能折行 */
  max-width: 100%;
  /* 起始态会往下错 40px，裁掉更干净（与上游的 overflow: hidden 一致） */
  overflow: hidden;
  white-space: normal;
  word-wrap: break-word;
  will-change: transform, opacity;
}

.split-text__word {
  display: inline-block;
  /* 词内不断行：换行只发生在词之间 */
  white-space: pre;
}

.split-text__char {
  display: inline-block;
  will-change: transform, opacity;
}

.split-text__line {
  display: block;
  will-change: transform, opacity;
}

/* 词间空格：显式元素 + white-space: pre，否则会被当成可折叠空白丢掉 */
.split-text__space {
  white-space: pre;
}
</style>
