<script setup lang="ts">
/**
 * Stroke Text —— 文字先「描边写出来」，再灌进填充色
 *
 * 移植自 React Bits 的 Stroke Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/stroke-text
 * 原版用 GSAP + ScrollTrigger 做三件事；这里等价替换成浏览器自带能力，不引依赖：
 *   · 描边逐字写出来 → WAAPI 动 `strokeDashoffset`（每个字各有一份 dash）
 *   · 填充灌进去（wipe / fade / 无）→ WAAPI 动 `clip-path` / `opacity`
 *   · scroll 触发 → IntersectionObserver（约当 ScrollTrigger 的 `top 82%`，只触发一次）
 * `ease` 因此改成接 CSS 缓动；为兼容原版文档，GSAP 那几个常见名字也做了映射。
 *
 * 原理：
 * 1. 两层 `<text>`：一层只有描边（`fill: none`），一层只有填充；每层按字符切成 `<tspan>`；
 * 2. 先用描边层 `getBBox()` 量出真实包围盒当 viewBox，再让 svg 用 `preserveAspectRatio`
 *    按容器等比缩放 —— 所以字号写 128 也不会溢出；
 * 3. 描边层每个 tspan 设 `stroke-dasharray = dash`、`stroke-dashoffset = dash`（等于没画上），
 *    再把 offset 动到 0，就是「一笔一笔写出来」；字与字之间按 `stagger` 错峰，`reverse` 从最后一个字倒着来。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { resolveEase } from '../gsap-ease'

export type StrokeTextTrigger = 'mount' | 'hover' | 'scroll' | 'loop'
export type StrokeTextFillMode = 'wipe' | 'fade' | 'none'

const props = withDefaults(
  defineProps<{
    /** 要描的文案 */
    text?: string
    /** 描边颜色：任意 CSS 颜色，或 `--` 开头的变量名（默认跟随主题） */
    strokeColor?: string
    /** 填充颜色：同上 */
    fillColor?: string
    /** 描边宽度 */
    strokeWidth?: number
    /** 每个字的描边写多久（秒） */
    drawDuration?: number
    /** 描边写完后再等多久开始灌填充（秒） */
    fillDelay?: number
    /** 相邻字开始写的间隔（秒） */
    stagger?: number
    /** 缓动：CSS 缓动字符串，或 GSAP 常见名字（power2.out 之类，内部有映射） */
    ease?: string
    /** 何时开始：挂载 / 悬停 / 进入视口 / 循环播放 */
    trigger?: StrokeTextTrigger
    /** 填充方式：从左往右扫 / 整体淡入 / 不填充 */
    fillMode?: StrokeTextFillMode
    /** 字号（px） */
    fontSize?: number | string
    /** 字重 */
    fontWeight?: number | string
    /** 字距（px） */
    letterSpacing?: number | string
    /** 错峰方向反向：从最后一个字写到第一个 */
    reverse?: boolean
  }>(),
  {
    text: 'Draw Attention',
    strokeColor: '--color-primary',
    fillColor: '--color-foreground',
    strokeWidth: 1.4,
    drawDuration: 1.6,
    fillDelay: 0.2,
    stagger: 0.05,
    ease: 'power2.out',
    trigger: 'mount',
    fillMode: 'wipe',
    fontSize: 128,
    fontWeight: 800,
    letterSpacing: -4,
    reverse: false,
  },
)

const rootEl = ref<HTMLSpanElement | null>(null)
const strokeTextEl = ref<SVGTextElement | null>(null)
const fillTextEl = ref<SVGTextElement | null>(null)
const strokeChars = ref<SVGTSpanElement[]>([])

function setStrokeChar(el: Element | null, index: number) {
  if (el) strokeChars.value[index] = el as SVGTSpanElement
}

const characters = computed(() => Array.from(String(props.text ?? '')))
const numericFontSize = computed(() => {
  const raw = props.fontSize
  return typeof raw === 'number' ? raw : parseFloat(String(raw)) || 128
})
const dash = computed(() => Math.max(numericFontSize.value * 7, 200))
const easeCss = computed(() => resolveEase(props.ease))

const fontStyle = computed(() => ({
  fontSize: typeof props.fontSize === 'number' ? `${props.fontSize}px` : String(props.fontSize),
  fontWeight: String(props.fontWeight),
  letterSpacing: typeof props.letterSpacing === 'number' ? `${props.letterSpacing}px` : String(props.letterSpacing),
}))

/**
 * 颜色写进 CSS（不是 SVG 属性）—— 这样 `--` 变量名可以直接包成 `var()`，
 * 切主题时由 CSS 自己更新，组件不用监听主题变化。
 */
function colorCss(value: string, fallback: string) {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  return raw.startsWith('--') ? `var(${raw}, ${fallback})` : raw
}
const strokeCss = computed(() => colorCss(props.strokeColor, '#A78BFA'))
const fillCss = computed(() => colorCss(props.fillColor, '#F8FAFC'))

/** 量出来的包围盒：viewBox 用它是为了让长文案等比缩进容器 */
const box = ref<{ x: number; y: number; width: number; height: number } | null>(null)
const viewBox = computed(() => {
  const b = box.value
  return b ? `${b.x} ${b.y} ${b.width} ${b.height}` : `0 ${-numericFontSize.value} 600 ${numericFontSize.value * 1.3}`
})

function measure() {
  const node = strokeTextEl.value
  if (!node) return
  try {
    const bbox = node.getBBox()
    if (bbox && bbox.width) {
      box.value = { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height }
    }
  } catch {
    /* getBBox 在元素未布局时会抛，忽略即可 */
  }
}

/* ── 播放 ───────────────────────────────────────────────── */

let animations: Animation[] = []
let replayTimer: number | null = null
let viewObserver: IntersectionObserver | null = null
let cancelled = false
let prefersReduced = false

function fillEnabled() {
  return props.fillMode !== 'none'
}
function wipeEnabled() {
  return fillEnabled() && props.fillMode === 'wipe'
}

function stopAnimations() {
  animations.forEach(a => a.cancel())
  animations = []
}

/** 摆回「还没写」的状态 */
function setStart() {
  stopAnimations()
  const dashValue = dash.value
  strokeChars.value.forEach((el) => {
    if (!el) return
    el.style.strokeDasharray = `${dashValue}`
    el.style.strokeDashoffset = `${dashValue}`
  })
  const fill = fillTextEl.value
  if (fill) {
    fill.style.opacity = wipeEnabled() ? '1' : '0'
    fill.style.clipPath = wipeEnabled() ? 'inset(0 100% 0 0)' : 'none'
  }
}

/** 直接给最终态（减少动态效果 / 填充关闭时） */
function settle() {
  stopAnimations()
  strokeChars.value.forEach((el) => {
    if (!el) return
    el.style.strokeDasharray = `${dash.value}`
    el.style.strokeDashoffset = '0'
  })
  const fill = fillTextEl.value
  if (fill) {
    fill.style.opacity = fillEnabled() ? '1' : '0'
    fill.style.clipPath = 'none'
  }
}

function play() {
  if (cancelled) return
  if (prefersReduced) {
    settle()
    return
  }
  setStart()

  const chars = strokeChars.value.filter(Boolean)
  if (!chars.length) return

  const drawMs = Math.max(0.1, Number(props.drawDuration) || 1.6) * 1000
  const staggerMs = Math.max(0, Number(props.stagger) || 0) * 1000
  const fillDelayMs = Math.max(0, Number(props.fillDelay) || 0) * 1000
  const last = chars.length - 1

  // 描边：逐字把 dashoffset 推到 0
  chars.forEach((el, index) => {
    const order = props.reverse ? last - index : index
    animations.push(
      el.animate(
        [{ strokeDashoffset: `${dash.value}` }, { strokeDashoffset: '0' }],
        { duration: drawMs, delay: order * staggerMs, easing: easeCss.value, fill: 'both' },
      ),
    )
  })

  const drawEnd = drawMs + last * staggerMs
  const fill = fillTextEl.value

  if (fill && wipeEnabled()) {
    // 填充：从左往右扫（用 clip-path，避开 SVG 几何属性在各浏览器上的差异）
    const wipeMs = Math.max(400, drawMs * 0.5)
    fill.style.opacity = '1'
    fill.style.clipPath = 'inset(0 100% 0 0)'
    const wipe = fill.animate(
      [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
      { duration: wipeMs, delay: drawEnd + fillDelayMs, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'both' },
    )
    animations.push(wipe)
    wipe.finished
      .then(() => {
        if (animations.includes(wipe)) fill.style.clipPath = 'none'
      })
      .catch(() => {})
  } else if (fill && fillEnabled()) {
    const fadeMs = Math.max(400, drawMs * 0.5)
    const fade = fill.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: fadeMs, delay: drawEnd + fillDelayMs, easing: 'ease-out', fill: 'both' },
    )
    animations.push(fade)
    fade.finished
      .then(() => {
        if (animations.includes(fade)) fill.style.opacity = '1'
      })
      .catch(() => {})
  }

  if (props.trigger === 'loop') {
    const total = drawEnd + fillDelayMs + Math.max(400, drawMs * 0.5)
    if (replayTimer !== null) window.clearTimeout(replayTimer)
    // 用定时器而不是动画结束事件：循环间隔可控，后台标签页也能继续推进
    replayTimer = window.setTimeout(() => {
      replayTimer = null
      play()
    }, total + 900)
  }
}

function applyTrigger() {
  stopAnimations()
  viewObserver?.disconnect()
  viewObserver = null
  if (replayTimer !== null) {
    window.clearTimeout(replayTimer)
    replayTimer = null
  }

  const root = rootEl.value
  if (!root) return

  if (props.trigger === 'hover') {
    settle()
    root.addEventListener('pointerenter', play)
    return
  }

  if (props.trigger === 'scroll') {
    setStart()
    viewObserver = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          play()
          viewObserver?.disconnect()
          viewObserver = null
        }
      },
      // 约当 ScrollTrigger 的 top 82%：露出到视口下方 18% 以内就开始
      { rootMargin: '0px 0px -18% 0px', threshold: 0 },
    )
    viewObserver.observe(root)
    return
  }

  play()
}

function cleanupHoverListener() {
  rootEl.value?.removeEventListener('pointerenter', play)
}

/* ── 生命周期 ───────────────────────────────────────────── */

onMounted(async () => {
  prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  await nextTick()
  measure()
  // 字体是异步的：就位后重新量一次，否则 viewBox 会按兜底字体算
  if (document.fonts?.ready) document.fonts.ready.then(() => { measure() }).catch(() => {})
  applyTrigger()
})

onBeforeUnmount(() => {
  cancelled = true
  cleanupHoverListener()
  stopAnimations()
  viewObserver?.disconnect()
  viewObserver = null
  if (replayTimer !== null) window.clearTimeout(replayTimer)
})

// 文案 / 字号 / 字重 / 字距变了要重新量；播放相关的变了就按新触发重来
watch([characters, numericFontSize, () => props.fontWeight, () => props.letterSpacing], async () => {
  await nextTick()
  measure()
})
watch(
  [() => props.trigger, () => props.fillMode, () => props.reverse, () => props.drawDuration, () => props.stagger, () => props.fillDelay],
  async () => {
    await nextTick()
    cleanupHoverListener()
    applyTrigger()
  },
)

defineExpose({ play, replay: play })
</script>

<template>
  <span
    ref="rootEl"
    class="stroke-text"
    :class="trigger === 'hover' && 'stroke-text--hover'"
    :style="{ '--stroke-text-height': `${Math.round(numericFontSize * 1.3)}px` }"
    role="img"
    :aria-label="String(text ?? '')"
  >
    <svg class="stroke-text__svg" :viewBox="viewBox" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <text
        ref="strokeTextEl"
        class="stroke-text__stroke"
        x="0"
        y="0"
        fill="none"
        :stroke-width="strokeWidth"
        stroke-linejoin="round"
        stroke-linecap="round"
        :style="{ ...fontStyle, stroke: strokeCss }"
      >
        <tspan v-for="(char, index) in characters" :key="`s-${index}`" :ref="el => setStrokeChar(el, index)">{{ char }}</tspan>
      </text>

      <text
        ref="fillTextEl"
        class="stroke-text__fill"
        x="0"
        y="0"
        stroke="none"
        :style="{ ...fontStyle, fill: fillCss }"
      >
        <tspan v-for="(char, index) in characters" :key="`f-${index}`">{{ char }}</tspan>
      </text>
    </svg>
  </span>
</template>

<style scoped>
.stroke-text {
  display: block;
  width: 100%;
  line-height: 0;
}

.stroke-text--hover {
  cursor: pointer;
}

.stroke-text__svg {
  display: block;
  width: 100%;
  height: var(--stroke-text-height, 160px);
}

.stroke-text__stroke,
.stroke-text__fill {
  user-select: none;
}

/* 填充层的初始透明写在样式表里，不要写进模板的 :style —— 那样 Vue 重渲染会
   把我们用脚本设的 opacity 覆盖回去（动画看着“没填充”就是这么来的） */
.stroke-text__fill {
  opacity: 0;
}
</style>
