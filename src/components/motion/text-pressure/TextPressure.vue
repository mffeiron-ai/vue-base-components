<script setup lang="ts">
/**
 * Text Pressure —— 光标「挤压」文字：字符离光标越近，可变字体就越宽、越粗、越斜
 *
 * 移植自 React Bits 的 Text Pressure（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/text-pressure
 * 原版注明是移植自 Juan Fuentes 的 CodePen：https://codepen.io/JuanFuentes/full/rgXKGQ
 *
 * 原理：每个字符包一个 span，逐帧按「字符中心到光标的距离」写
 * `font-variation-settings: 'wght' …, 'wdth' …, 'ital' …`（所以**必须用可变字体**）。
 * 与上游的差别：
 *   · 上游用常驻 rAF 逐帧刷；这里只在「光标还在移动 / 还没收敛」时跑 rAF，停下来就停（省电，后台标签页也不会白跑）
 *   · 用 ResizeObserver 代替 debounce 的 window.resize
 *   · 颜色参数接受 `--color-*` 变量名，默认跟着当前主题
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface TextPressurePoint {
  x: number
  y: number
}

const props = withDefaults(
  defineProps<{
    /** 展示的文案（会强制大写，与上游一致） */
    text?: string
    /** 可变字体族名 */
    fontFamily?: string
    /**
     * 可变字体样式表地址；**留空就不注入任何外部样式表**（默认如此）。
     * 需要轴效果时由使用方自己加载字体（例如 `import '@fontsource-variable/roboto-flex/standard.css'`），
     * 或传一个 URL 让组件注入。
     */
    fontUrl?: string
    /** 变宽轴 */
    width?: boolean
    /** 变粗轴 */
    weight?: boolean
    /** 斜体轴 */
    italic?: boolean
    /** 按距离改透明度 */
    alpha?: boolean
    /** 字符用 flex 均匀分布（撑满整行） */
    flex?: boolean
    /** 描边副本 */
    stroke?: boolean
    /** 纵向拉伸填满容器高度 */
    scale?: boolean
    /** 文字颜色；传 `--color-*` 变量名跟随主题 */
    textColor?: string
    /** 描边颜色；传 `--color-*` 变量名跟随主题 */
    strokeColor?: string
    /** 描边宽度（px） */
    strokeWidth?: number
    /** 最小字号（避免窄容器里字号过小） */
    minFontSize?: number
  }>(),
  {
    text: 'Compressa',
    // Fontsource 的可变包注册的族名带 Variable 后缀（本地自托管版本用这个名）；
    // 用 Google Fonts 的 CSS 时族名是 'Roboto Flex'
    fontFamily: 'Roboto Flex Variable',
    // 默认不注入外部样式表：字体由使用方本地加载（文档站已 self-host Roboto Flex）
    fontUrl: '',
    width: true,
    weight: true,
    italic: true,
    alpha: false,
    flex: true,
    stroke: false,
    scale: false,
    // 上游默认是 #FFFFFF / #FF0000；这里换成主题 token
    textColor: '--color-foreground',
    strokeColor: '--color-primary',
    strokeWidth: 2,
    minFontSize: 24,
  },
)

const containerRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)

const chars = computed(() => Array.from(String(props.text ?? '')))

const fontSize = ref(props.minFontSize)
const scaleY = ref(1)
const lineHeight = ref(1)

/* ── 与上游一致的两个函数 ───────────────────────────────── */

const distance = (a: TextPressurePoint, b: TextPressurePoint) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)

/** 距离越近 → 越取 maxVal（再取 minVal 兜底），逐字与上游一致（含那个 `+ minVal` 的写法） */
function getAttr(d: number, maxDist: number, minVal: number, maxVal: number) {
  const val = maxVal - Math.abs((maxVal * d) / Math.max(1, maxDist))
  return Math.max(minVal, val + minVal)
}

/* ── 光标状态 ───────────────────────────────────────────── */

const mouse = { x: 0, y: 0 }
const cursor = { x: 0, y: 0 }
let rafId: number | null = null

function charSpans(): HTMLElement[] {
  const title = titleRef.value
  return title ? Array.from(title.querySelectorAll<HTMLElement>('.text-pressure__char')) : []
}

function tick() {
  rafId = null
  // 平滑跟随光标（上游是除以 15）
  mouse.x += (cursor.x - mouse.x) / 15
  mouse.y += (cursor.y - mouse.y) / 15

  const title = titleRef.value
  if (title) {
    const titleRect = title.getBoundingClientRect()
    const maxDist = titleRect.width / 2

    charSpans().forEach((span) => {
      const rect = span.getBoundingClientRect()
      const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
      const d = distance(mouse, center)

      const wdth = props.width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100
      const wght = props.weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400
      const italVal = props.italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : '0'
      const alphaVal = props.alpha ? getAttr(d, maxDist, 0, 1).toFixed(2) : '1'
      // Roboto Flex 没有 `ital` 轴，倾斜是 `slnt`（-10 ~ 0）；两个都写，
      // 字体没有哪个轴就自动忽略哪个，这样换任何可变字体都有斜的效果
      const slntVal = props.italic ? (-10 * getAttr(d, maxDist, 0, 1)).toFixed(2) : '0'

      const next = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}, 'slnt' ${slntVal}`
      if (span.style.fontVariationSettings !== next) span.style.fontVariationSettings = next
      if (props.alpha && span.style.opacity !== alphaVal) span.style.opacity = alphaVal
      if (!props.alpha && span.style.opacity) span.style.opacity = ''
    })
  }

  // 光标还在动（或还没追上）就继续；追上了就停，等下一次 pointermove 再启动
  const settled = Math.abs(cursor.x - mouse.x) < 0.5 && Math.abs(cursor.y - mouse.y) < 0.5
  if (!settled) rafId = window.requestAnimationFrame(tick)
}

function startTick() {
  if (rafId === null) rafId = window.requestAnimationFrame(tick)
}

function onPointerMove(event: PointerEvent) {
  cursor.x = event.clientX
  cursor.y = event.clientY
  startTick()
}

function onTouchMove(event: TouchEvent) {
  const touch = event.touches[0]
  if (!touch) return
  cursor.x = touch.clientX
  cursor.y = touch.clientY
  startTick()
}

/* ── 尺寸 ───────────────────────────────────────────────── */

function setSize() {
  const container = containerRef.value
  const title = titleRef.value
  if (!container || !title) return

  const { width: cw, height: ch } = container.getBoundingClientRect()
  // 每个字符大约占半个容器宽（大写字母平均宽度 ≈ 0.5em），于是整行刚好铺满
  fontSize.value = Math.max(props.minFontSize, cw / Math.max(1, chars.value.length / 2))
  // 先复位再测量，避免上次的缩放干扰
  scaleY.value = 1
  lineHeight.value = 1
  if (!props.scale) return
  nextTick(() => {
    const rect = title.getBoundingClientRect()
    if (rect.height <= 0) return
    const ratio = ch / rect.height
    scaleY.value = ratio
    lineHeight.value = ratio
  })
}

let resizeObserver: ResizeObserver | null = null
let resizeTimer: number | null = null

function queueSetSize() {
  if (resizeTimer !== null) window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    resizeTimer = null
    setSize()
    startTick()
  }, 100)
}

/* ── 样式 ───────────────────────────────────────────────── */

/** `--color-x` → `var(--color-x, 兜底)`；普通色值原样用 */
function colorCss(value: string | undefined, fallback: string) {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  return raw.startsWith('--') ? `var(${raw}, ${fallback})` : raw
}

const titleStyle = computed<Record<string, string>>(() => {
  const fill = colorCss(props.textColor, 'inherit')
  return {
    fontFamily: props.fontFamily,
    fontSize: `${fontSize.value}px`,
    lineHeight: String(lineHeight.value),
    transform: `scale(1, ${scaleY.value})`,
    color: fill,
    '--tp-text-fill': fill,
    '--tp-stroke-color': colorCss(props.strokeColor, 'currentColor'),
    '--tp-stroke-width': `${Math.max(0, Number(props.strokeWidth) || 0)}px`,
  }
})

/* ── 字体 ───────────────────────────────────────────────── */

let fontLink: HTMLLinkElement | null = null

function ensureFontLink() {
  const href = String(props.fontUrl ?? '').trim()
  if (!href || typeof document === 'undefined') return
  // 同一个地址只挂一次
  const existing = document.head.querySelector<HTMLLinkElement>(`link[data-text-pressure-font="${href}"]`)
  if (existing) {
    fontLink = existing
    return
  }
  fontLink?.remove()
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  // 直接挂 rel=stylesheet 会**阻塞首屏渲染**（外站字体 CSS 慢时会白屏），
  // 所以先用 media="print" 非阻塞加载，到位后再切回 all
  link.media = 'print'
  link.addEventListener('load', () => {
    link.media = 'all'
    setSize()
    startTick()
  })
  link.setAttribute('data-text-pressure-font', href)
  document.head.appendChild(link)
  fontLink = link
}

/* ── 生命周期 ───────────────────────────────────────────── */

onMounted(async () => {
  ensureFontLink()

  const container = containerRef.value
  if (container) {
    // 初始把光标放在容器中心（与上游一致）
    const rect = container.getBoundingClientRect()
    mouse.x = rect.left + rect.width / 2
    mouse.y = rect.top + rect.height / 2
    cursor.x = mouse.x
    cursor.y = mouse.y
  }

  setSize()

  // 字体是异步的：加载完再量一次，否则字号是按兜底字体的宽度算的
  await Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise(resolve => window.setTimeout(resolve, 1500)),
  ]).catch(() => {})
  setSize()
  tick()

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  if (container && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(queueSetSize)
    resizeObserver.observe(container)
  }
})

onBeforeUnmount(() => {
  if (rafId !== null) window.cancelAnimationFrame(rafId)
  rafId = null
  if (resizeTimer !== null) window.clearTimeout(resizeTimer)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('touchmove', onTouchMove)
  resizeObserver?.disconnect()
  resizeObserver = null
})

// 影响尺寸 / 布局的参数变了 → 重算字号与缩放（否则「换个文案字号还是旧的」）
watch(
  [chars, () => props.minFontSize, () => props.scale, () => props.flex, () => props.fontFamily],
  async () => {
    await nextTick()
    setSize()
    startTick()
  },
)

watch(
  () => props.fontUrl,
  () => {
    ensureFontLink()
    setSize()
    startTick()
  },
)

// 轴的开关 / 描边开关变了 → 立刻按新规则重刷一遍
watch(
  [() => props.width, () => props.weight, () => props.italic, () => props.alpha],
  () => startTick(),
)

defineExpose({ refresh: queueSetSize })
</script>

<template>
  <div ref="containerRef" class="text-pressure">
    <h1
      ref="titleRef"
      class="text-pressure__title"
      :class="{
        'text-pressure__title--flex': flex,
        'text-pressure__title--stroke': stroke,
      }"
      :style="titleStyle"
    >
      <span
        v-for="(char, index) in chars"
        :key="`${index}-${char}`"
        class="text-pressure__char"
        :data-char="char"
      >{{ char }}</span>
    </h1>
  </div>
</template>

<style scoped>
.text-pressure {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.text-pressure__title {
  margin: 0;
  width: 100%;
  font-weight: 100;
  text-transform: uppercase;
  text-align: center;
  white-space: nowrap;
  user-select: none;
  transform-origin: center top;
}

.text-pressure__title--flex {
  display: flex;
  justify-content: space-between;
}

.text-pressure__char {
  display: inline-block;
}

/* 描边模式：真字 + 一层描边副本（-webkit-text-stroke 会同时描边字形内部，所以用 ::after 叠一层） */
.text-pressure__title--stroke .text-pressure__char {
  position: relative;
  color: var(--tp-text-fill, currentColor);
}

.text-pressure__title--stroke .text-pressure__char::after {
  content: attr(data-char);
  position: absolute;
  left: 0;
  top: 0;
  color: transparent;
  z-index: -1;
  -webkit-text-stroke-width: var(--tp-stroke-width, 2px);
  -webkit-text-stroke-color: var(--tp-stroke-color, currentColor);
}
</style>
