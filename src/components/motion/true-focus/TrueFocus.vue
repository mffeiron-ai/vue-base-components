<script setup lang="ts">
/**
 * True Focus —— 真聚焦：一排词里只有一个清晰，其余全糊，四角括号跟着当前词走
 *
 * 移植自 React Bits 的 True Focus（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/true-focus
 * 原版用 motion 做两件事：① 逐词 `filter: blur()` 的过渡（本来 CSS 就够）
 * ② 把四角括号（focus-frame）的 x/y/width/height **补间**到当前词的矩形。
 * 这里换成**纯 CSS 过渡**：方框用 `translate()` + `width/height`，配合
 * `transition: transform / width / height / opacity`，观感与上游一致，且零依赖。
 *
 * 两种模式：
 *   · `manualMode: false`（默认）—— 定时器每 `animationDuration + pauseBetweenAnimations` 秒切到下一个词
 *   · `manualMode: true` —— 悬停哪个词就聚焦哪个（上游的行为是「移开也不回退」，这里保持一致）
 *
 * 相对上游的改动：
 *   1. 颜色默认取主题 token（`--color-primary`），也可以传任意 CSS 颜色
 *   2. 方框位置除了切词时，还会在 **容器尺寸变化 / 字体加载完成** 时重新量一次（上游不处理，改窗口大小后会错位）
 *   3. `glowColor` 真的用于发光：上游 CSS/JSX 里写的是 `drop-shadow(... var(--border-color))`，
 *      `glowColor` 那个 prop 实际没生效；这里按 prop 的语义用 glowColor，不传则回落到 borderColor
 *   4. 首帧量完之前方框不显示（避免四个角在左上角闪一下）
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 要展示的句子（按 separator 切成词） */
    sentence?: string
    /** 切词用的分隔符 */
    separator?: string
    /** 开成手动模式：悬停哪个词就聚焦哪个（关掉＝定时轮换） */
    manualMode?: boolean
    /** 非当前词的模糊量（px） */
    blurAmount?: number
    /** 四角括号的颜色；传 `--color-*` 变量名会跟随主题 */
    borderColor?: string
    /** 四角括号的辉光色；不传则跟 borderColor 一致 */
    glowColor?: string
    /** 过渡时长（秒），也用于计算自动轮换的间隔 */
    animationDuration?: number
    /** 自动轮换时，两次之间的停顿（秒） */
    pauseBetweenAnimations?: number
  }>(),
  {
    sentence: 'True Focus',
    separator: ' ',
    manualMode: false,
    blurAmount: 5,
    // 上游默认是 'green'；这里换成主题主色
    borderColor: '--color-primary',
    glowColor: '',
    animationDuration: 0.5,
    pauseBetweenAnimations: 1,
  },
)

/* ── 切词（CJK 无空格 → 逐字） ────────────────────────── */

/** CJK（含中日文标点 / 全角符号 / 假名）没有空格，整句会被当成一个词 → 逐字切开 */
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

const words = computed<string[]>(() => {
  const text = String(props.sentence ?? '')
  const separator = props.separator === '' ? ' ' : props.separator
  const out: string[] = []
  for (const chunk of text.split(separator)) {
    if (!chunk) continue
    if (CJK_RE.test(chunk)) out.push(...splitCjk(chunk))
    else out.push(chunk)
  }
  return out
})

/* ── 状态 ─────────────────────────────────────────────── */

const containerRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)
const lastActiveIndex = ref<number | null>(null)
const focusRect = ref({ x: 0, y: 0, width: 0, height: 0 })
/** 首帧量完之前不显示方框 */
const measured = ref(false)

const wordEls: (HTMLElement | null)[] = []
function setWordEl(el: Element | null, index: number) {
  wordEls[index] = (el as HTMLElement | null) ?? null
}

let timer: number | null = null
let resizeObserver: ResizeObserver | null = null
let onWindowResize: (() => void) | null = null

/* ── 颜色 ─────────────────────────────────────────────── */

/** `--color-x` → `var(--color-x, fallback)`，普通色值原样用 */
function colorCss(value: string | undefined, fallback: string) {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  return raw.startsWith('--') ? `var(${raw}, ${fallback})` : raw
}

const rootVars = computed<Record<string, string>>(() => {
  const border = colorCss(props.borderColor, 'currentColor')
  return {
    '--focus-border-color': border,
    '--focus-glow-color': colorCss(props.glowColor || props.borderColor, border),
  }
})

/* ── 量方框 ───────────────────────────────────────────── */

function measure() {
  const container = containerRef.value
  const el = wordEls[currentIndex.value]
  if (!container || !el) return
  const cRect = container.getBoundingClientRect()
  const wRect = el.getBoundingClientRect()
  // 绝对定位子项的包含块是容器的**内边距盒**（border box 往内缩一个边框宽）
  const style = getComputedStyle(container)
  const originX = cRect.left + (parseFloat(style.borderLeftWidth) || 0)
  const originY = cRect.top + (parseFloat(style.borderTopWidth) || 0)
  focusRect.value = {
    x: wRect.left - originX,
    y: wRect.top - originY,
    width: wRect.width,
    height: wRect.height,
  }
  measured.value = true
}

/* ── 自动轮换 ─────────────────────────────────────────── */

function stopAuto() {
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}

function startAuto() {
  stopAuto()
  if (props.manualMode) return
  const period = Math.max(0.05, Number(props.animationDuration) || 0) + Math.max(0, Number(props.pauseBetweenAnimations) || 0)
  timer = window.setInterval(
    () => {
      if (!words.value.length) return
      currentIndex.value = (currentIndex.value + 1) % words.value.length
    },
    period * 1000,
  )
}

/* ── 交互 ─────────────────────────────────────────────── */

function onWordEnter(index: number) {
  if (!props.manualMode) return
  lastActiveIndex.value = index
  currentIndex.value = index
}

function onWordLeave() {
  if (!props.manualMode) return
  // 与上游一致：记的是「进入时那个下标」，所以移开焦点不会回退
  currentIndex.value = lastActiveIndex.value ?? 0
}

/* ── 样式 ─────────────────────────────────────────────── */

const duration = computed(() => Math.max(0.01, Number(props.animationDuration) || 0.5))

function wordStyle(index: number): Record<string, string> {
  const active = index === currentIndex.value
  return {
    filter: active ? 'blur(0px)' : `blur(${Math.max(0, Number(props.blurAmount) || 0)}px)`,
    transition: `filter ${duration.value}s ease`,
  }
}

const frameStyle = computed<Record<string, string>>(() => ({
  transform: `translate(${focusRect.value.x}px, ${focusRect.value.y}px)`,
  width: `${focusRect.value.width}px`,
  height: `${focusRect.value.height}px`,
  opacity: measured.value && currentIndex.value >= 0 ? '1' : '0',
  transition: `transform ${duration.value}s ease, width ${duration.value}s ease, height ${duration.value}s ease, opacity ${duration.value}s ease`,
}))

/* ── 生命周期 ─────────────────────────────────────────── */

function setupObservers() {
  const container = containerRef.value
  if (!container || typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(() => measure())
  resizeObserver.observe(container)
  onWindowResize = () => measure()
  window.addEventListener('resize', onWindowResize)
}

onMounted(() => {
  measure()
  setupObservers()
  startAuto()
  // 字体晚一点就位会让词的宽度变，量到的是错的
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    void document.fonts.ready.then(() => measure())
  }
})

onBeforeUnmount(() => {
  stopAuto()
  resizeObserver?.disconnect()
  resizeObserver = null
  if (onWindowResize) window.removeEventListener('resize', onWindowResize)
  onWindowResize = null
})

watch(currentIndex, () => measure())

// 词变了：夹一下下标、重量一次、重开定时器
watch(words, list => {
  if (!list.length) currentIndex.value = 0
  else if (currentIndex.value >= list.length) currentIndex.value = 0
  void Promise.resolve().then(() => measure())
  startAuto()
})

watch(
  [() => props.manualMode, () => props.animationDuration, () => props.pauseBetweenAnimations],
  () => {
    // 与上游一致：切模式不清空当前焦点，只是停/起定时器
    startAuto()
  },
)

defineExpose({
  /** 当前聚焦的词下标（可读的 ref） */
  currentIndex,
  /** 切好之后的词列表（可读） */
  words,
  /** 手动聚焦某个词（下标超出范围会被忽略） */
  focus: (index: number) => {
    if (index >= 0 && index < words.value.length) currentIndex.value = index
  },
  /** 重新量一次方框（比如外部改了字号 / 字体之后） */
  remeasure: () => measure(),
})
</script>

<template>
  <div ref="containerRef" class="focus-container" :style="rootVars">
    <span
      v-for="(word, index) in words"
      :key="`${index}-${word}`"
      :ref="el => setWordEl(el, index)"
      class="focus-word"
      :class="index === currentIndex ? 'focus-word--active' : ''"
      :style="wordStyle(index)"
      @mouseenter="onWordEnter(index)"
      @mouseleave="onWordLeave"
    >{{ word }}</span>

    <div class="focus-frame" :style="frameStyle">
      <span class="corner corner--tl" />
      <span class="corner corner--tr" />
      <span class="corner corner--bl" />
      <span class="corner corner--br" />
    </div>
  </div>
</template>

<style scoped>
.focus-container {
  position: relative;
  display: flex;
  gap: 1em;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  outline: none;
  user-select: none;
}

.focus-word {
  position: relative;
  font-size: 3rem;
  font-weight: 900;
  cursor: pointer;
  outline: none;
  user-select: none;
}

/* 四角括号的框：x/y/width/height 都是量出来的（内联样式），这里只负责定位与外观 */
.focus-frame {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  border: none;
}

.corner {
  position: absolute;
  width: 1rem;
  height: 1rem;
  border: 3px solid var(--focus-border-color, currentColor);
  border-radius: 3px;
  filter: drop-shadow(0 0 4px var(--focus-glow-color, currentColor));
}

.corner--tl {
  top: -10px;
  left: -10px;
  border-right-width: 0;
  border-bottom-width: 0;
}

.corner--tr {
  top: -10px;
  right: -10px;
  border-left-width: 0;
  border-bottom-width: 0;
}

.corner--bl {
  bottom: -10px;
  left: -10px;
  border-right-width: 0;
  border-top-width: 0;
}

.corner--br {
  bottom: -10px;
  right: -10px;
  border-left-width: 0;
  border-top-width: 0;
}

/* 装饰性动画：系统要求减少动效时直接切过去，不做过渡 */
@media (prefers-reduced-motion: reduce) {
  .focus-word,
  .focus-frame {
    transition: none !important;
  }
}
</style>
