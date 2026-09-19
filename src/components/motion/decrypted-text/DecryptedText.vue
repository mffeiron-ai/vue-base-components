<script setup lang="ts">
/**
 * Decrypted Text —— 解密文字：字符先是一串随机乱码，再一个接一个「解」回真实文字
 *
 * 移植自 React Bits 的 Decrypted Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/decrypted-text
 * 原版只借 motion 的 `motion.span` 当普通 span 用（没有任何动画值），
 * 所以这里就是 **Vue + setInterval**，不引依赖。
 *
 * 状态机（与上游逐条对齐）：
 *   · 每 `speed` ms 走一拍，一拍里按 (sequential, direction) 分四种走法：
 *     顺序·正放 → 按 revealDirection 的顺序点亮下一个字符（点亮即显示真字，其余是随机字符）
 *     顺序·倒放 → 按相反顺序把已点亮的字符逐个熄掉，全部熄掉即结束
 *     非顺序·正放 → 连续 `maxIterations` 拍全是乱码，最后一拍直接显示真字
 *     非顺序·倒放 → 从「全部点亮」开始，每拍随机熄掉 ceil(len / maxIterations) 个
 *   · `shuffleText()` 负责生成乱码：空格原样、已点亮的用真字、其余取随机字符
 *   · `triggerDecrypt / triggerReverse` 决定 direction 与初始点亮集合
 *   · `animateOn === 'click'` 时初始是「已加密」，其余模式初始是明文
 *
 * 与上游的两处差异（都写进文档了）：
 *   1. `revealDirection="center"` 在**正放**时也真的从中间向两边点亮：
 *      上游正放走的是 `getNextIndex()`，它的 center 分支实际是「第一个没点亮的」＝等同于 start；
 *      这里统一用 `computeOrder()`（中间 → 左 → 右 交替）取下一个下标。
 *   2. 无障碍：隐藏给读屏的那份永远是**真实文字**（上游给的是当前乱码），
 *      否则读屏用户会听到一串随机字符。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export type DecryptedTextRevealDirection = 'start' | 'end' | 'center'
export type DecryptedTextAnimateOn = 'view' | 'hover' | 'inViewHover' | 'click'
export type DecryptedTextClickMode = 'once' | 'toggle'

const props = withDefaults(
  defineProps<{
    /** 要解密的文字 */
    text?: string
    /** 每一拍之间的间隔（毫秒） */
    speed?: number
    /** 非顺序模式下的最大随机拍数 */
    maxIterations?: number
    /** 顺序模式：一个字符一个字符地解 */
    sequential?: boolean
    /** 顺序模式从哪边开始解 */
    revealDirection?: DecryptedTextRevealDirection
    /** 只用文字里已有的字符来乱码（而不是整张 characters 表） */
    useOriginalCharsOnly?: boolean
    /** 乱码字符表 */
    characters?: string
    /** 已解出字符的类名 */
    className?: string
    /** 根元素类名（Vue 里直接写 class 也一样透传到根元素） */
    parentClassName?: string
    /** 还是乱码的字符的类名 */
    encryptedClassName?: string
    /** 何时开始解密 */
    animateOn?: DecryptedTextAnimateOn
    /** 点击行为（animateOn === 'click' 时生效） */
    clickMode?: DecryptedTextClickMode
  }>(),
  {
    text: '',
    speed: 50,
    maxIterations: 10,
    sequential: false,
    revealDirection: 'start',
    useOriginalCharsOnly: false,
    characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
    className: '',
    parentClassName: '',
    encryptedClassName: '',
    animateOn: 'hover',
    clickMode: 'once',
  },
)

const rootRef = ref<HTMLElement | null>(null)

const displayText = ref(props.text)
const revealedIndices = ref<Set<number>>(new Set())
const isAnimating = ref(false)
const isDecrypted = ref(props.animateOn !== 'click')
const direction = ref<'forward' | 'reverse'>('forward')

let order: number[] = []
let pointer = 0
let currentIteration = 0
let timer: number | null = null
let hasAnimated = false
let observer: IntersectionObserver | null = null

/* ── 乱码 ─────────────────────────────────────────────── */

const availableChars = computed<string[]>(() => {
  const source = String(props.characters ?? '')
  if (props.useOriginalCharsOnly) {
    const unique = Array.from(new Set(Array.from(props.text ?? ''))).filter(char => char !== ' ')
    if (unique.length) return unique
  }
  const list = Array.from(source)
  // 兜底：字符表为空时至少还能乱码（否则会抽出 undefined）
  return list.length ? list : ['#', '%', '@']
})

function randomChar() {
  const list = availableChars.value
  return list[Math.floor(Math.random() * list.length)]
}

/** 生成当前这一拍的显示内容：空格原样 / 已点亮用真字 / 其余随机 */
function shuffleText(revealed: Set<number>) {
  const source = Array.from(String(props.text ?? ''))
  return source
    .map((char, i) => {
      if (char === ' ') return ' '
      if (revealed.has(i)) return char
      return randomChar()
    })
    .join('')
}

const length = computed(() => Array.from(String(props.text ?? '')).length)

/** 顺序模式的下标顺序：start 从左到右、end 从右到左、center 从中间向两边交替 */
function computeOrder(): number[] {
  const len = length.value
  const result: number[] = []
  if (len <= 0) return result
  if (props.revealDirection === 'start') {
    for (let i = 0; i < len; i += 1) result.push(i)
    return result
  }
  if (props.revealDirection === 'end') {
    for (let i = len - 1; i >= 0; i -= 1) result.push(i)
    return result
  }
  const middle = Math.floor(len / 2)
  let offset = 0
  while (result.length < len) {
    const idx = offset % 2 === 0 ? middle + offset / 2 : middle - Math.ceil(offset / 2)
    if (idx >= 0 && idx < len) result.push(idx)
    offset += 1
  }
  return result.slice(0, len)
}

function allIndices() {
  const set = new Set<number>()
  for (let i = 0; i < length.value; i += 1) set.add(i)
  return set
}

function removeRandomIndices(set: Set<number>, count: number) {
  const arr = Array.from(set)
  for (let i = 0; i < count && arr.length > 0; i += 1) {
    arr.splice(Math.floor(Math.random() * arr.length), 1)
  }
  return new Set(arr)
}

/* ── 一拍 ─────────────────────────────────────────────── */

function tick() {
  if (props.sequential) {
    if (direction.value === 'forward') {
      if (revealedIndices.value.size < length.value) {
        const nextIndex = order[revealedIndices.value.size]
        const next = new Set(revealedIndices.value)
        next.add(nextIndex)
        revealedIndices.value = next
        displayText.value = shuffleText(next)
      } else {
        stopTimer()
        isAnimating.value = false
        isDecrypted.value = true
        displayText.value = props.text
      }
      return
    }
    // 倒放：按相反顺序熄掉
    if (pointer < order.length) {
      const next = new Set(revealedIndices.value)
      next.delete(order[pointer])
      pointer += 1
      revealedIndices.value = next
      displayText.value = shuffleText(next)
      if (next.size === 0) {
        stopTimer()
        isAnimating.value = false
        isDecrypted.value = false
      }
    } else {
      stopTimer()
      isAnimating.value = false
      isDecrypted.value = false
    }
    return
  }

  // 非顺序
  if (direction.value === 'forward') {
    displayText.value = shuffleText(revealedIndices.value)
    currentIteration += 1
    if (currentIteration >= Math.max(1, props.maxIterations)) {
      stopTimer()
      isAnimating.value = false
      displayText.value = props.text
      isDecrypted.value = true
    }
    return
  }

  let current = revealedIndices.value
  if (current.size === 0) current = allIndices()
  const removeCount = Math.max(1, Math.ceil(length.value / Math.max(1, props.maxIterations)))
  const next = removeRandomIndices(current, removeCount)
  revealedIndices.value = next
  displayText.value = shuffleText(next)
  currentIteration += 1
  if (next.size === 0 || currentIteration >= Math.max(1, props.maxIterations)) {
    stopTimer()
    isAnimating.value = false
    isDecrypted.value = false
    displayText.value = shuffleText(new Set())
  }
}

/* ── 定时器 ───────────────────────────────────────────── */

function stopTimer() {
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  stopTimer()
  currentIteration = 0
  timer = window.setInterval(tick, Math.max(1, Number(props.speed) || 50))
}

/* ── 触发 ─────────────────────────────────────────────── */

function encryptInstantly() {
  const empty = new Set<number>()
  revealedIndices.value = empty
  displayText.value = shuffleText(empty)
  isDecrypted.value = false
}

function triggerDecrypt() {
  order = computeOrder()
  pointer = 0
  revealedIndices.value = new Set()
  direction.value = 'forward'
  isAnimating.value = true
}

function triggerReverse() {
  order = computeOrder().slice().reverse()
  pointer = 0
  const all = allIndices()
  revealedIndices.value = all
  displayText.value = shuffleText(all)
  direction.value = 'reverse'
  isAnimating.value = true
}

function resetToPlainText() {
  stopTimer()
  isAnimating.value = false
  revealedIndices.value = new Set()
  displayText.value = props.text
  isDecrypted.value = true
  direction.value = 'forward'
}

const hoverEnabled = computed(() => props.animateOn === 'hover' || props.animateOn === 'inViewHover')

function onMouseEnter() {
  if (hoverEnabled.value) triggerDecrypt()
}

function onMouseLeave() {
  if (hoverEnabled.value) resetToPlainText()
}

function onClick() {
  if (props.animateOn !== 'click') return
  if (props.clickMode === 'once') {
    if (isDecrypted.value) return
    direction.value = 'forward'
    triggerDecrypt()
    return
  }
  if (isDecrypted.value) {
    direction.value = 'reverse'
    triggerReverse()
  } else {
    direction.value = 'forward'
    triggerDecrypt()
  }
}

/* ── 渲染 ─────────────────────────────────────────────── */

const chars = computed(() => {
  const done = !isAnimating.value && isDecrypted.value
  return Array.from(displayText.value).map((char, index) => ({
    char,
    revealed: done || revealedIndices.value.has(index),
  }))
})

/* ── 生命周期 ─────────────────────────────────────────── */

function observe() {
  observer?.disconnect()
  observer = null
  if (props.animateOn !== 'view' && props.animateOn !== 'inViewHover') return
  if (typeof IntersectionObserver === 'undefined' || !rootRef.value) return
  observer = new IntersectionObserver(
    entries => {
      if (hasAnimated) return
      if (entries.some(entry => entry.isIntersecting)) {
        hasAnimated = true
        triggerDecrypt()
        observer?.disconnect()
        observer = null
      }
    },
    { threshold: 0.1 },
  )
  observer.observe(rootRef.value)
}

function reset() {
  stopTimer()
  isAnimating.value = false
  revealedIndices.value = new Set()
  if (props.animateOn === 'click') encryptInstantly()
  else {
    displayText.value = props.text
    isDecrypted.value = true
  }
}

onMounted(() => {
  reset()
  observe()
})

watch(isAnimating, value => {
  if (value) startTimer()
  else stopTimer()
})

// 文案或触发方式变了：停掉、回到初始状态、重新挂观察器
// （animateOn 也要跟着重置：切换成 click 时要立刻变成「已加密」，
//   切换成 view / inViewHover 时要重新观察 —— 上游的 effect 依赖里就有 animateOn）
watch(
  [() => props.text, () => props.animateOn],
  () => {
    hasAnimated = false
    reset()
    observe()
  },
)

// 速度变了：正在跑就用新速度重开计时器
watch(
  () => props.speed,
  () => {
    if (isAnimating.value) startTimer()
  },
)

onBeforeUnmount(() => {
  stopTimer()
  observer?.disconnect()
  observer = null
})

defineExpose({
  /** 手动解密（顺序/非顺序都走正向） */
  decrypt: (): void => {
    direction.value = 'forward'
    triggerDecrypt()
  },
  /** 手动「反解密」（把文字重新打回乱码） */
  reverse: (): void => {
    direction.value = 'reverse'
    triggerReverse()
  },
  /** 立刻恢复成明文（hover 离开时的效果） */
  reset: (): void => resetToPlainText(),
  /** 当前是不是明文状态 */
  isDecrypted,
})
</script>

<template>
  <span
    ref="rootRef"
    class="decrypted-text"
    :class="parentClassName"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
  >
    <!-- 给读屏的永远是真实文字（上游给的是当前乱码，这里改掉了） -->
    <span class="decrypted-text__sr">{{ text }}</span>
    <span aria-hidden="true">
      <span
        v-for="(item, index) in chars"
        :key="index"
        :class="item.revealed ? className : encryptedClassName"
      >{{ item.char }}</span>
    </span>
  </span>
</template>

<style scoped>
.decrypted-text {
  display: inline-block;
  /* 乱码与真字宽度不同，pre-wrap 至少保住空白与换行的手感 */
  white-space: pre-wrap;
}

/* 视觉隐藏但仍给读屏 */
.decrypted-text__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
  visibility: hidden;
}
</style>
