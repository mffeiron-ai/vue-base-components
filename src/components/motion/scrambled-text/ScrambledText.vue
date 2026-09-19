<script setup lang="ts">
/**
 * Scrambled Text —— 鼠标扫过时，附近的字符炸成随机字符，再逐个「变回来」
 *
 * 移植自 React Bits 的 Scrambled Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/scrambled-text
 * 原版用 gsap 的 SplitText（逐字符拆分） + ScrambleTextPlugin（乱码补间）：
 *
 *   · 逐字符拆成 `display: inline-block` 的元素，把原字符存进 `data-content`
 *   · 容器上监听 `pointermove`，对**每个**字符算鼠标到它中心的距离：
 *     距离 < `radius` 就启动一个乱码补间，**`overwrite: true` 意味着每次移动都重新开始**
 *     `duration = duration × (1 − dist / radius)`（越近乱得越久，边缘几乎是瞬间恢复）
 *   · 补间内部（照抄 ScrambleTextPlugin 的 `render`，单字符下面这些都退化了）：
 *     `l = 1`、`i = ~~(ratio × l + 0.5)` → **`ratio < 0.5` 显示随机字符、`≥ 0.5` 显示真字符**；
 *     随机字符每 `0.05 / speed` 秒换一次（`data.speed = 0.05 / speed`），`ratio === 0` 时显示原文
 *
 * 所以这里不需要 gsap：逐字符拆 + 每帧算进度 + 按上面两条规则写文本节点就够了。
 * 与上游的差异（有意为之）：
 *   · `text` 支持字符串（逐字拆，中日韩天然逐字）；插槽内容不拆
 *   · 去掉上游 CSS 里的 `margin: 7vw` / `max-width` / 写死的白色（颜色跟随继承，便于放进任何主题）
 *   · `prefers-reduced-motion: reduce` 时完全不参与（不挂指针监听、不启动循环）
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 要展示的文字（逐字拆开）；也可以用默认插槽（插槽内容不拆，不会有效果） */
    text?: string
    /** 鼠标影响半径（px）：字符中心离指针多近才会被「炸」 */
    radius?: number
    /** 乱码时长（秒）；实际时长 = 本值 × (1 − 距离/半径) */
    duration?: number
    /** 乱码刷新速度：越大闪得越快（对应 GSAP 的 `speed`） */
    speed?: number
    /** 用来当乱码的字符 */
    scrambleChars?: string
    /** 外层容器的类名（Vue 里直接写 class 也会透传到根元素） */
    containerClassName?: string
    /** 文字层的类名 */
    textClassName?: string
  }>(),
  {
    text: '',
    radius: 100,
    duration: 1.2,
    speed: 0.5,
    scrambleChars: '.:',
    containerClassName: '',
    textClassName: '',
  },
)

const rootRef = ref<HTMLElement | null>(null)

/** 逐字符切开（空格也保留成独立的字符，这样它也会被乱码「点亮」） */
const chars = computed(() => Array.from(String(props.text ?? '')))

interface CharState {
  el: HTMLElement | null
  node: Text | null
  /** 真实字符 */
  target: string
  /** 本次乱码的起始时间（performance.now()） */
  started: number
  /** 本次乱码时长（ms）；0 = 空闲（显示真字符） */
  duration: number
  /** 当前显示的乱码字符 */
  scramble: string
  /** 上次换乱码字符的时间 */
  lastSwitch: number
}

const states: CharState[] = []

function setCharEl(el: Element | null, index: number) {
  const state = states[index]
  if (!state) return
  const element = (el as HTMLElement | null) ?? null
  state.el = element
  state.node = element && element.firstChild?.nodeType === 3 ? (element.firstChild as Text) : null
}

/* ── 乱码 ───────────────────────────────────────────────── */

/** 只改文本节点的值：比 textContent / innerHTML 都省（每帧可能几百次） */
function setCharText(state: CharState, value: string) {
  if (state.node && state.node.nodeValue !== value) state.node.nodeValue = value
}

function scrambleSet() {
  const raw = String(props.scrambleChars ?? '')
  return raw.length ? Array.from(raw) : ['.', ':']
}

function randomScramble() {
  const set = scrambleSet()
  return set[Math.floor(Math.random() * set.length)]
}

/** 换乱码字符的间隔（ms）—— GSAP 里是 `data.speed = 0.05 / speed` 秒 */
function switchInterval() {
  const speed = Math.max(0.05, Number(props.speed) || 0)
  return (0.05 / speed) * 1000
}

let rafId = 0

function ensureLoop() {
  if (rafId) return
  rafId = window.requestAnimationFrame(tick)
}

function tick() {
  rafId = 0
  const now = performance.now()
  const interval = switchInterval()
  let busy = false

  for (const state of states) {
    if (!state.el || state.duration <= 0) continue
    // GSAP：`i = ~~(ratio * l + 0.5)`，单字符时就是「过半即显真字符」
    const progress = (now - state.started) / state.duration
    if (progress >= 1) {
      setCharText(state, state.target)
      state.duration = 0
      continue
    }
    busy = true
    if (progress < 0.5) {
      // GSAP：每过 `0.05 / speed` 秒换一批随机字符（`timeDif > speed` 时换），`ratio === 0` 时先显示原文
      if (now - state.lastSwitch >= interval) {
        state.lastSwitch = now
        state.scramble = randomScramble()
      }
      setCharText(state, progress === 0 ? state.target : state.scramble)
    } else {
      setCharText(state, state.target)
    }
  }

  if (busy) ensureLoop()
}

/** 把所有字符复位成真字符（参数变化 / 文案变化时用） */
function resetAll() {
  for (const state of states) {
    state.duration = 0
    state.lastSwitch = 0
    state.scramble = ''
    if (state.el) setCharText(state, state.target)
  }
}

/* ── 指针 ───────────────────────────────────────────────── */

function onPointerMove(event: PointerEvent) {
  const radius = Math.max(1, Number(props.radius) || 0)
  const duration = Math.max(0, Number(props.duration) || 0)
  const now = performance.now()
  let touched = false

  // 先把所有矩形读完（这一轮没有任何 DOM 写入，浏览器只会做一次 layout），再统一改状态
  for (const state of states) {
    const el = state.el
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    const dist = Math.hypot(dx, dy)
    if (dist >= radius) continue
    // 对应 GSAP 的 `overwrite: true` —— 每次移动都从头开始，越近的字符乱得越久
    state.started = now
    state.duration = duration * (1 - dist / radius) * 1000
    state.lastSwitch = 0
    touched = true
  }

  if (touched) ensureLoop()
}

/* ── 生命周期 ───────────────────────────────────────────── */

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 让 `states` 与当前文案对齐。
 * 必须在 **DOM patch 之前**跑（Vue 默认的 pre-flush watch 正好是），因为 `:ref` 回调是 patch 时触发的，
 * 那一刻 states 数组就得已经就位（长度与 index 都对），否则回调没有落点 —— 第一版在这里踩过坑：
 * 在 `await nextTick()` 之后才建数组，结果 ref 回调早就跑完了，所有 state 的 el 都是 null。
 */
function prepareStates() {
  const list = chars.value
  if (states.length > list.length) states.length = list.length
  for (let i = 0; i < list.length; i += 1) {
    const existing = states[i]
    if (existing) {
      existing.target = list[i]
      existing.duration = 0
      existing.scramble = ''
    } else {
      states[i] = {
        el: null,
        node: null,
        target: list[i],
        started: 0,
        duration: 0,
        scramble: '',
        lastSwitch: 0,
      }
    }
  }
}

function stopLoop() {
  if (rafId) window.cancelAnimationFrame(rafId)
  rafId = 0
}

// 顶层先跑一次：挂载时那一轮 `:ref` 回调需要 states 已经在
prepareStates()

watch(
  () => props.text,
  () => {
    stopLoop()
    prepareStates()
  },
)

watch(
  [() => props.radius, () => props.duration, () => props.speed, () => props.scrambleChars],
  () => {
    stopLoop()
    resetAll()
  },
)

onMounted(() => {
  if (reduceMotion()) return // 减少动效：不参与，文字保持原样
  rootRef.value?.addEventListener('pointermove', onPointerMove)
})

onBeforeUnmount(() => {
  stopLoop()
  rootRef.value?.removeEventListener('pointermove', onPointerMove)
})

defineExpose({
  /** 手动让若干字符「炸」一下；不传 index 就是整段（外部按钮 / 探针用） */
  scramble: (index?: number, ms = 600) => {
    const now = performance.now()
    const targets = index === undefined
      ? states
      : [states[index]].filter((s): s is CharState => !!s)
    for (const state of targets) {
      state.started = now
      state.duration = ms
      state.lastSwitch = 0
    }
    if (targets.length) ensureLoop()
    return targets.length
  },
  /** 当前状态读数：有多少字符正在乱码、各字符当前文本 */
  stats: () => ({
    chars: states.length,
    scrambling: states.filter((s) => s.duration > 0).length,
    texts: states.map((s) => s.el?.textContent ?? ''),
  }),
})
</script>

<template>
  <div ref="rootRef" class="scrambled-text" :class="containerClassName">
    <p class="scrambled-text__text" :class="textClassName">
      <template v-if="$slots.default">
        <slot />
      </template>
      <template v-else>
        <span
          v-for="(ch, index) in chars"
          :key="`${index}-${ch}`"
          :ref="el => setCharEl(el, index)"
          :class="ch.trim() ? 'scrambled-text__char' : 'scrambled-text__space'"
        >{{ ch }}</span>
      </template>
    </p>
  </div>
</template>

<style scoped>
.scrambled-text {
  max-width: 800px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: clamp(14px, 4vw, 32px);
  line-height: 1.5;
}

.scrambled-text__text {
  margin: 0;
}

.scrambled-text__char {
  display: inline-block;
  will-change: transform;
}

/* 空格不用 inline-block：否则宽度会被折掉、长句也没法换行 */
.scrambled-text__space {
  display: inline;
}
</style>
