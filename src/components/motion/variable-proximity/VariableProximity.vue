<script setup lang="ts">
/**
 * Variable Proximity —— 光标靠近时，字符的可变字体轴被「吸」过去（变粗、变宽…）
 *
 * 移植自 React Bits 的 Variable Proximity（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/variable-proximity
 * 上游用 motion 起一个常驻 rAF，逐帧按「字符中心到光标的距离」写
 * `font-variation-settings`（所以**必须用可变字体**），距离超过 `radius` 就恢复起始轴值。
 *
 * 与上游的差别：
 *   · **不挂常驻 rAF**：只在光标移动（rAF 节流）时重算一次 —— 上游那个循环靠「位置没变就跳过」
 *     省事，但每帧仍在跑；这里鼠标停住就彻底不干活（对齐 TextPressure 的做法）
 *   · **避免 layout thrashing**：先把所有字符的矩形读完，再统一写样式
 *     （上游是「读一个、写一个」交错，N 个字符会触发 N 次强制重排）
 *   · 不需要传容器：上游要求 `containerRef` 只为换算相对坐标，而**距离与坐标原点无关**，这里直接量
 *   · 默认轴组合换成 **`wght` + `wdth`**：文档站自托管的是 Fontsource 的 Roboto Flex `standard`
 *     子集（含 wght / wdth / slnt），上游默认的 `opsz` 不一定在这个子集里
 *   · 中日韩逐字成「词」：中文没有空格，否则整段会被 `white-space: nowrap` 挡住不能换行
 *   · 不远程加载字体（上游 `@import` 了 Google Fonts），字体族由 `fontFamily` 指定
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export type VariableProximityFalloff = 'linear' | 'exponential' | 'gaussian'

const props = withDefaults(
  defineProps<{
    /** 展示的文案 */
    label?: string
    /** 静止时（距离 ≥ radius）的轴值，写法同 `font-variation-settings`，如 `"'wght' 400, 'wdth' 100"` */
    fromFontVariationSettings?: string
    /** 光标贴着字符时的轴值（写法同上） */
    toFontVariationSettings?: string
    /** 影响半径（px） */
    radius?: number
    /** 距离衰减曲线 */
    falloff?: VariableProximityFalloff
    /** 可变字体族名 */
    fontFamily?: string
    /** 外层类名（Vue 里直接写 class 也会透传到根元素） */
    mainClassName?: string
  }>(),
  {
    label: 'Hover me!',
    fromFontVariationSettings: "'wght' 400, 'wdth' 100",
    toFontVariationSettings: "'wght' 900, 'wdth' 125",
    radius: 100,
    falloff: 'linear',
    fontFamily: "'Roboto Flex Variable', 'Roboto Flex', system-ui, sans-serif",
    mainClassName: '',
  },
)

const rootRef = ref<HTMLElement | null>(null)

/* ── 拆词 / 拆字 ────────────────────────────────────────── */

/** 中日韩表意文字 / 假名 / 谚文：这些字之间没有空格，每个字都能独立换行 */
const CJK_CHAR = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/

interface WordGroup {
  /** 这一组里的字符（英文是一个整词，中文是单个字） */
  text: string
  /** 后面要不要补一个空格 */
  space: boolean
}

/**
 * 先按空格切词（保留空格位置），再把词里的 CJK 拆成单字 ——
 * 因为单词要用 `white-space: nowrap` 包起来防止词内断行，而中文必须能逐字换行。
 */
function splitWords(label: string): WordGroup[] {
  const out: WordGroup[] = []
  const chunks = String(label ?? '').split(' ')
  chunks.forEach((chunk, index) => {
    const isLastChunk = index === chunks.length - 1
    if (!chunk) {
      if (out.length) out[out.length - 1].space = true // 连续空格：并到前一个词上
      return
    }
    const pieces: string[] = []
    let buffer = ''
    for (const char of Array.from(chunk)) {
      if (CJK_CHAR.test(char)) {
        if (buffer) {
          pieces.push(buffer)
          buffer = ''
        }
        pieces.push(char)
      } else {
        buffer += char
      }
    }
    if (buffer) pieces.push(buffer)
    pieces.forEach((text, i) => {
      out.push({ text, space: !isLastChunk && i === pieces.length - 1 })
    })
  })
  return out
}

interface LetterGroup {
  space: boolean
  letters: { char: string; index: number }[]
}

/** 顺手给每个字符编一个**跨词累加**的全局序号（`:ref` 要用它当下标） */
const groups = computed<LetterGroup[]>(() => {
  let cursor = 0
  return splitWords(props.label).map((word) => ({
    space: word.space,
    letters: Array.from(word.text).map((char) => ({ char, index: cursor++ })),
  }))
})

const letterCount = computed(() => groups.value.reduce((sum, group) => sum + group.letters.length, 0))

const letterEls: (HTMLElement | null)[] = []
function setLetterEl(el: Element | null, index: number) {
  letterEls[index] = (el as HTMLElement | null) ?? null
}

/* ── 轴值 ───────────────────────────────────────────────── */

function parseSettings(value: string) {
  const map = new Map<string, number>()
  for (const part of String(value ?? '').split(',')) {
    const piece = part.trim()
    if (!piece) continue
    const [name, raw] = piece.split(/\s+/)
    const num = Number.parseFloat(raw)
    if (name && Number.isFinite(num)) map.set(name.replace(/['"]/g, ''), num)
  }
  return map
}

/** 以 `from` 里的轴为准逐轴配对（`to` 里没有的轴就保持不动，与上游一致） */
const axes = computed(() => {
  const from = parseSettings(props.fromFontVariationSettings)
  const to = parseSettings(props.toFontVariationSettings)
  return Array.from(from.entries()).map(([axis, fromValue]) => ({
    axis,
    fromValue,
    toValue: to.get(axis) ?? fromValue,
  }))
})

/** `"'wght' 400, 'wdth' 100"` 这种起始值（静止态） */
const fromSettingsString = computed(() =>
  axes.value.map((a) => `'${a.axis}' ${round(a.fromValue)}`).join(', '),
)

const round = (value: number) => Math.round(value * 100) / 100

function falloffAt(distance: number) {
  const radius = Math.max(1, Number(props.radius) || 0)
  const norm = Math.min(Math.max(1 - distance / radius, 0), 1)
  switch (props.falloff) {
    case 'exponential':
      return norm ** 2
    case 'gaussian':
      return Math.exp(-((distance / (radius / 2)) ** 2) / 2)
    case 'linear':
    default:
      return norm
  }
}

/* ── 应用 ───────────────────────────────────────────────── */

/** 鼠标在视口里的位置（上次 mousemove / touchmove 记下来的） */
const pointer = { x: Number.NaN, y: Number.NaN }
let rafId = 0

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function apply() {
  const list = letterEls.filter((el): el is HTMLElement => !!el)
  if (!list.length) return
  const radius = Math.max(1, Number(props.radius) || 0)
  const pointerKnown = Number.isFinite(pointer.x) && Number.isFinite(pointer.y)

  if (!pointerKnown || reduceMotion()) {
    const fallback = fromSettingsString.value
    for (const el of list) {
      if (el.style.fontVariationSettings !== fallback) el.style.fontVariationSettings = fallback
    }
    return
  }

  // ① 先把所有矩形读完（这一轮不写任何样式 → 浏览器只会做一次 layout）
  const centers: { x: number; y: number }[] = []
  for (const el of list) {
    const rect = el.getBoundingClientRect()
    centers.push({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }

  // ② 再统一写回去
  const axisList = axes.value
  for (let i = 0; i < list.length; i += 1) {
    const el = list[i]
    const center = centers[i]
    const distance = Math.hypot(pointer.x - center.x, pointer.y - center.y)
    let next: string
    if (distance >= radius || !axisList.length) {
      next = fromSettingsString.value
    } else {
      const k = falloffAt(distance)
      next = axisList
        .map(({ axis, fromValue, toValue }) => `'${axis}' ${round(fromValue + (toValue - fromValue) * k)}`)
        .join(', ')
    }
    if (el.style.fontVariationSettings !== next) el.style.fontVariationSettings = next
  }
}

function schedule() {
  if (rafId) return
  rafId = window.requestAnimationFrame(() => {
    rafId = 0
    apply()
  })
}

function onMouseMove(event: MouseEvent) {
  pointer.x = event.clientX
  pointer.y = event.clientY
  schedule()
}

function onTouchMove(event: TouchEvent) {
  const touch = event.touches[0]
  if (!touch) return
  pointer.x = touch.clientX
  pointer.y = touch.clientY
  schedule()
}

/* ── 生命周期 ───────────────────────────────────────────── */

let resizeObserver: ResizeObserver | null = null
let motionQuery: MediaQueryList | null = null

/** 系统里「减少动效」被切开关时也要马上生效（按需重算的模型下，没人会主动叫我们） */
function onMotionPreferenceChange() {
  apply()
}

onMounted(async () => {
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  if (typeof window.matchMedia === 'function') {
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionQuery.addEventListener('change', onMotionPreferenceChange)
  }
  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    // 布局 / 字体变了 → 字符位置变了，需要按当前光标重算一次
    resizeObserver = new ResizeObserver(() => {
      if (Number.isFinite(pointer.x)) schedule()
    })
    resizeObserver.observe(rootRef.value)
  }
  // 挂载这一轮 `:ref` 回调已经跑过了，**千万不能在这里清空 letterEls** ——
  // 清了就再也没人填回来（DOM 不会再 patch），表现是「字符数对、但一个轴值都没写」
  await nextTick()
  apply()
  if (document.fonts?.ready) {
    void document.fonts.ready.then(() => {
      apply()
    })
  }
})

onBeforeUnmount(() => {
  if (rafId) window.cancelAnimationFrame(rafId)
  rafId = 0
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('touchmove', onTouchMove)
  motionQuery?.removeEventListener('change', onMotionPreferenceChange)
  motionQuery = null
  resizeObserver?.disconnect()
  resizeObserver = null
})

// 文案变了：字符序号会重排，要在 patch **之前**清空引用，patch 时 `:ref` 回调会把新元素填回来
// （Vue 默认的 pre-flush watch 正好在这个时机）
watch(
  () => props.label,
  async () => {
    letterEls.length = 0
    await nextTick()
    apply()
  },
)

// 其余参数变化不影响元素引用，直接按当前光标重算就行（清空反而会把引用弄丢）
watch(
  [
    () => props.fromFontVariationSettings,
    () => props.toFontVariationSettings,
    () => props.radius,
    () => props.falloff,
  ],
  () => apply(),
)

defineExpose({
  /** 按当前光标位置重算一次（布局变化后可以手动调） */
  update: apply,
  /** 读数：字符数、每个字符当前的轴值（探针用） */
  stats: () => ({
    letters: letterCount.value,
    settings: letterEls.filter(Boolean).map((el) => el?.style.fontVariationSettings ?? ''),
    axes: axes.value,
    reduceMotion: reduceMotion(),
  }),
})
</script>

<template>
  <span ref="rootRef" class="variable-proximity" :class="mainClassName" :style="{ fontFamily }">
    <span v-for="(group, wordIndex) in groups" :key="wordIndex" class="variable-proximity__word">
      <span
        v-for="letter in group.letters"
        :key="letter.index"
        :ref="el => setLetterEl(el, letter.index)"
        class="variable-proximity__letter"
        aria-hidden="true"
      >{{ letter.char }}</span>
      <span v-if="group.space" class="variable-proximity__space">&nbsp;</span>
    </span>
    <span class="variable-proximity__sr">{{ label }}</span>
  </span>
</template>

<style scoped>
.variable-proximity {
  display: inline;
}

.variable-proximity__word {
  display: inline-block;
  white-space: nowrap;
}

.variable-proximity__letter {
  display: inline-block;
}

.variable-proximity__space {
  display: inline-block;
}

/* 视觉上藏起来，只给读屏用 */
.variable-proximity__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
