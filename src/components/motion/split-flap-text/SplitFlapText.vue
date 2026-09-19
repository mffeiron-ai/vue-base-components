<script setup lang="ts">
/**
 * Split Flap Text —— 翻页牌（机场出发牌那种一格一格翻字）
 *
 * 移植自 React Bits 的 Split Flap Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/split-flap-text
 * 原版就是纯 CSS 3D + 一个逐格推进的循环，零依赖；这里 1:1 搬逻辑，
 * React hooks → Vue 生命周期，颜色改成默认跟随主题。
 *
 * 原理：
 * 1. 每个字符一格（tile）。一格由「上半 + 下半」两块拼成，字符本身是 `height: 200%`
 *    的绝对定位元素 —— 上格的字符对齐顶部、下格的字符对齐底部，于是同一个字被中缝切开；
 * 2. 翻的时候再叠两块「翼」（front / back）：front 绕**下边**从 0° 转到 -90°，
 *    back 绕**上边**从 90° 转到 0°，配 brightness 变化，就是翻牌的动作；
 * 3. 每次翻翼都换 key（`tick`）让 CSS 动画重头播；
 * 4. 每个字符先想好一串「中间字形 + 目标字形」（`flipsPerChar` 个随机字符再接目标），
 *    逐帧按 `flipDuration` 推进，字符之间再按 `stagger` 错峰开跑。
 *
 * 别名 `words`（短语数组，循环播）与 `text`（单条，优先）二选一；`padTo` 会把所有短语
 * 补齐到固定格数，牌子宽度才不会跳。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type TileState = { current: string; next: string; flipping: boolean; tick: number }
type AnimationPlan = {
  index: number
  from: string
  target: string
  sequence: string[]
  start: number
  step: number
  done: boolean
}
type TileUpdate = { index: number; current: string; next: string; done: boolean }

const props = withDefaults(
  defineProps<{
    /** 循环播放的短语数组 */
    words?: string[]
    /** 单条短语；设了它就不看 words */
    text?: string
    /** 每翻一格用多久（秒） */
    flipDuration?: number
    /** 相邻格开始翻的间隔（秒） */
    stagger?: number
    /** 定格多久后换下一条（毫秒） */
    cycleDelay?: number
    /** 中间字形用哪些字符：`alpha` / `alphanumeric` / `numeric`，或直接给一串字符 */
    charset?: string
    /** 每格翻多少个中间字形再落到目标 */
    flipsPerChar?: number
    /** 牌子底色：任意 CSS 颜色，或 `--` 开头的变量名（默认跟随主题） */
    tileColor?: string
    /** 字形颜色：同上 */
    textColor?: string
    /** 格子圆角：数字按 px 处理 */
    tileRadius?: number | string
    /** 格间距：数字按 px 处理 */
    gap?: number | string
    /** 字号：数字按 px 处理 */
    fontSize?: number | string
    /** 播完最后一条是否回头再来 */
    loop?: boolean
    /** 固定格数：把短语补齐到这么多格，牌子宽度不跳 */
    padTo?: number
  }>(),
  {
    words: () => ['LAUNCH READY', 'SYNC ONLINE', 'SIGNAL LIVE'],
    text: undefined,
    flipDuration: 0.12,
    stagger: 0.06,
    cycleDelay: 2400,
    charset: 'alphanumeric',
    flipsPerChar: 8,
    // 默认跟随主题：牌面用前景色（浅色主题下是深色牌子），字形用背景色
    tileColor: '--color-foreground',
    textColor: '--color-background',
    tileRadius: 8,
    gap: 6,
    fontSize: 52,
    loop: true,
    padTo: 12,
  },
)

const CHARSETS: Record<string, string> = {
  alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  numeric: '0123456789',
}

function toCssUnit(value: number | string) {
  return typeof value === 'number' ? `${value}px` : value
}

/**
 * 颜色支持 `--` 开头的 CSS 变量名（按当前主题解析）或任意 CSS 颜色。
 * 这里必须解析成真实色值：变量名写进自定义属性后再被 `color-mix()` 用是无效的。
 */
function resolveColor(value: string, fallback: string) {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  if (!raw.startsWith('--')) return raw
  const fromTheme = getComputedStyle(document.documentElement).getPropertyValue(raw).trim()
  return fromTheme || fallback
}

/* ── 主题跟随 ───────────────────────────────────────────── */

const themeTick = ref(0)
let themeObserver: MutationObserver | null = null

const cssVars = computed(() => {
  themeTick.value // 依赖它：切主题 / 切风格时重算
  return {
    '--split-flap-tile-color': resolveColor(props.tileColor, '#111827'),
    '--split-flap-text-color': resolveColor(props.textColor, '#f8fafc'),
    '--split-flap-radius': toCssUnit(props.tileRadius),
    '--split-flap-gap': toCssUnit(props.gap),
    '--split-flap-font-size': toCssUnit(props.fontSize),
    '--split-flap-flip-duration': `${Math.max(0.04, Number(props.flipDuration) || 0.12)}s`,
  } as Record<string, string>
})

/* ── 短语与格子 ─────────────────────────────────────────── */

const phrases = computed(() => {
  if (typeof props.text === 'string' && props.text.length) return [props.text]
  const list = Array.isArray(props.words) ? props.words : []
  return list.length ? list.map(w => String(w ?? '')) : ['LAUNCH READY']
})

const width = computed(() => {
  const longest = phrases.value.reduce((max, phrase) => Math.max(max, phrase.length), 1)
  return Math.max(1, Math.ceil(Number(props.padTo) || 0), longest)
})

function normalizePhrase(phrase: string, pad: number) {
  return String(phrase ?? '').padEnd(pad, ' ').slice(0, pad)
}
function createTiles(phrase: string): TileState[] {
  return phrase.split('').map(char => ({ current: char, next: char, flipping: false, tick: 0 }))
}
function sampleChar(charset: string) {
  return charset.charAt(Math.floor(Math.random() * charset.length)) || ' '
}
function activeCharset() {
  const raw = String(props.charset ?? '')
  return CHARSETS[raw] ?? (raw.length ? raw : CHARSETS.alphanumeric)
}
function buildSequence(target: string, flips: number, charset: string) {
  const steps: string[] = []
  for (let i = 0; i < flips; i += 1) steps.push(sampleChar(charset))
  steps.push(target)
  return steps
}

const tiles = ref<TileState[]>([])
const settledText = computed(() => tiles.value.map(tile => tile.current).join('').trimEnd())
/** 空格在牌面上是空白格，用不换行空格撑住格子 */
function displayChar(char: string) {
  return char === ' ' ? '\u00A0' : char
}

/* ── 播放循环 ───────────────────────────────────────────── */

let rafId: number | null = null
let cycleTimer: number | null = null
let currentText = ''
let cancelled = false
let prefersReduced = false

function applyUpdates(updates: TileUpdate[]) {
  // 大部分帧没有格子要更新，直接跳过，别白重建一遍数组
  if (!updates.length) return
  tiles.value = tiles.value.map((tile, index) => {
    const update = updates.find(u => u.index === index)
    if (!update) return tile
    return {
      current: update.current,
      next: update.next,
      // 最后一次更新 = 定格：收掉翻翼，露出的就是目标字
      flipping: !update.done,
      tick: tile.tick + 1,
    }
  })
}

/** 把牌子翻到目标短语，返回这次动画的总时长（ms）；reduced motion 时直接定格并返回 0 */
function animateTo(targetPhrase: string) {
  const flipMs = Math.max(40, (Number(props.flipDuration) || 0.12) * 1000)
  const staggerMs = Math.max(0, (Number(props.stagger) || 0) * 1000)
  const flips = Math.max(0, Math.floor(Number(props.flipsPerChar) || 0))
  const charset = activeCharset()

  if (prefersReduced) {
    currentText = targetPhrase
    tiles.value = createTiles(targetPhrase)
    scheduleNext()
    return 0
  }

  const fromPhrase = normalizePhrase(currentText, width.value)
  const plans = targetPhrase
    .split('')
    .map<AnimationPlan | null>((targetChar, index) => {
      const fromChar = fromPhrase[index] || ' '
      if (fromChar === targetChar) return null
      return {
        index,
        from: fromChar,
        target: targetChar,
        sequence: buildSequence(targetChar, flips, charset),
        start: index * staggerMs,
        step: -1,
        done: false,
      }
    })
    .filter((plan): plan is AnimationPlan => plan !== null)

  if (!plans.length) {
    currentText = targetPhrase
    tiles.value = createTiles(targetPhrase)
    scheduleNext()
    return 0
  }

  const totalDuration = plans.reduce(
    (max, plan) => Math.max(max, plan.start + plan.sequence.length * flipMs),
    0,
  )
  const startedAt = performance.now()

  const stepFrame = (now: number) => {
    if (cancelled) return
    const elapsed = now - startedAt
    const updates: TileUpdate[] = []

    for (const plan of plans) {
      if (plan.done) continue
      const local = elapsed - plan.start
      if (local < 0) continue
      const index = Math.min(plan.sequence.length - 1, Math.floor(local / flipMs))
      if (index === plan.step) continue
      plan.step = index

      if (index >= plan.sequence.length - 1) {
        // 最后一个字形 = 目标：直接定格（不再叠翻翼）
        const settled = plan.sequence[plan.sequence.length - 1]
        updates.push({ index: plan.index, current: settled, next: settled, done: true })
        plan.done = true
      } else {
        updates.push({
          index: plan.index,
          current: plan.sequence[index],
          next: plan.sequence[index + 1],
          done: false,
        })
      }
    }

    applyUpdates(updates)

    if (elapsed < totalDuration) {
      rafId = window.requestAnimationFrame(stepFrame)
    } else {
      rafId = null
      currentText = targetPhrase
      // 全部定格后再排下一次循环（定格时间 = cycleDelay）
      scheduleNext()
    }
  }

  rafId = window.requestAnimationFrame(stepFrame)
  return totalDuration
}

let phraseIndex = 0

function scheduleNext() {
  if (cancelled) return
  const delay = Math.max(400, Number(props.cycleDelay) || 2400)
  if (cycleTimer !== null) window.clearTimeout(cycleTimer)
  cycleTimer = window.setTimeout(() => {
    cycleTimer = null
    if (cancelled) return
    const nextIndex = phraseIndex + 1
    if (nextIndex >= phrases.value.length && !props.loop) return
    phraseIndex = nextIndex % phrases.value.length
    animateTo(normalizePhrase(phrases.value[phraseIndex], width.value))
  }, delay)
}

function restart() {
  cancelled = false
  if (rafId !== null) window.cancelAnimationFrame(rafId)
  if (cycleTimer !== null) window.clearTimeout(cycleTimer)
  rafId = null
  cycleTimer = null
  phraseIndex = 0
  currentText = ''
  // 先摆一块空牌，再翻进第一条短语（不做的话就是“啪”一下全在那了）
  tiles.value = createTiles(normalizePhrase('', width.value))
  animateTo(normalizePhrase(phrases.value[0], width.value))
}

onMounted(() => {
  prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  // 颜色可能写成 `--color-*`：主题 / 风格一变就重算自定义属性
  themeObserver = new MutationObserver(() => {
    themeTick.value += 1
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] })
  if (document.head) themeObserver.observe(document.head, { childList: true, subtree: true, characterData: true })

  restart()
})

onBeforeUnmount(() => {
  cancelled = true
  if (rafId !== null) window.cancelAnimationFrame(rafId)
  if (cycleTimer !== null) window.clearTimeout(cycleTimer)
  themeObserver?.disconnect()
  themeObserver = null
})

// 短语 / 枚举 / 补位格数变了就重来一遍；
// 颜色与各种时长都是每帧现读的，改它们不用重来
watch(
  [phrases, width, () => props.charset, () => props.flipsPerChar, () => props.padTo, () => props.loop],
  () => restart(),
)

defineExpose({ restart })
</script>

<template>
  <div
    class="split-flap-text"
    :style="cssVars"
    role="text"
    :aria-label="settledText || undefined"
  >
    <span
      v-for="(tile, index) in tiles"
      :key="index"
      class="split-flap-text__tile"
      aria-hidden="true"
    >
      <span class="split-flap-text__half split-flap-text__half--top">
        <span class="split-flap-text__char">{{ displayChar(tile.current) }}</span>
      </span>
      <span class="split-flap-text__half split-flap-text__half--bottom">
        <span class="split-flap-text__char">{{ displayChar(tile.flipping ? tile.next : tile.current) }}</span>
      </span>

      <!-- 翻翼只在翻的那一刻存在；key 带 tick → 每翻一格都重建，动画重头播 -->
      <template v-if="tile.flipping">
        <span
          :key="`front-${index}-${tile.tick}`"
          class="split-flap-text__flap split-flap-text__flap--front"
        >
          <span class="split-flap-text__char">{{ displayChar(tile.current) }}</span>
        </span>
        <span
          :key="`back-${index}-${tile.tick}`"
          class="split-flap-text__flap split-flap-text__flap--back"
        >
          <span class="split-flap-text__char">{{ displayChar(tile.next) }}</span>
        </span>
      </template>
    </span>
  </div>
</template>

<style scoped>
.split-flap-text {
  display: inline-flex;
  align-items: center;
  gap: var(--split-flap-gap, 6px);
  color: var(--split-flap-text-color, #f8fafc);
  font-family: 'SFMono-Regular', 'Roboto Mono', 'Cascadia Code', 'Liberation Mono', Menlo, monospace;
  font-size: var(--split-flap-font-size, 52px);
  font-weight: 760;
  line-height: 1;
  letter-spacing: 0.035em;
  white-space: pre;
  user-select: none;
  font-variant-numeric: tabular-nums;
}

.split-flap-text__tile {
  position: relative;
  width: 0.78em;
  height: 1.08em;
  overflow: hidden;
  border-radius: var(--split-flap-radius, 8px);
  /* 牌面：整体底色 + 上沿一点高光，像块塑料片 */
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), transparent 34%),
    var(--split-flap-tile-color, #111827);
  perspective: 420px;
  box-shadow: 0 0.03em 0.08em rgba(0, 0, 0, 0.25);
}

/* 中缝与内阴影：翻牌机的那条横线 */
.split-flap-text__tile::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.2) inset,
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  pointer-events: none;
  z-index: 8;
}

.split-flap-text__tile::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: rgba(0, 0, 0, 0.45);
  z-index: 7;
  pointer-events: none;
}

.split-flap-text__half,
.split-flap-text__flap {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), transparent 34%),
    var(--split-flap-tile-color, #111827);
  backface-visibility: hidden;
}

.split-flap-text__half--top,
.split-flap-text__flap--front {
  top: 0;
}

.split-flap-text__half--bottom,
.split-flap-text__flap--back {
  bottom: 0;
  background:
    linear-gradient(0deg, rgba(255, 255, 255, 0.06), transparent 38%),
    color-mix(in srgb, var(--split-flap-tile-color, #111827) 92%, black);
}

/* 字符是 200% 高的块：上半格对齐顶部、下半格对齐底部，同一个字就被中缝切开 */
.split-flap-text__char {
  position: absolute;
  left: 0;
  width: 100%;
  height: 200%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--split-flap-text-color, #f8fafc);
  text-shadow:
    0 0.025em 0 rgba(255, 255, 255, 0.16),
    0 0.09em 0.16em rgba(0, 0, 0, 0.42);
}

.split-flap-text__half--top .split-flap-text__char,
.split-flap-text__flap--front .split-flap-text__char {
  top: 0;
}

.split-flap-text__half--bottom .split-flap-text__char,
.split-flap-text__flap--back .split-flap-text__char {
  bottom: 0;
}

.split-flap-text__flap {
  z-index: 6;
  will-change: transform, filter;
  transform-style: preserve-3d;
}

.split-flap-text__flap--front {
  transform-origin: center bottom;
  animation: split-flap-front var(--split-flap-flip-duration, 0.12s) cubic-bezier(0.23, 1, 0.32, 1) both;
}

.split-flap-text__flap--back {
  transform-origin: center top;
  transform: rotateX(90deg);
  animation: split-flap-back var(--split-flap-flip-duration, 0.12s) cubic-bezier(0.23, 1, 0.32, 1) both;
}

@keyframes split-flap-front {
  0% {
    transform: rotateX(0deg);
    filter: brightness(1.08);
  }
  100% {
    transform: rotateX(-90deg);
    filter: brightness(0.52);
  }
}

@keyframes split-flap-back {
  0%,
  45% {
    transform: rotateX(90deg);
    filter: brightness(0.58);
  }
  100% {
    transform: rotateX(0deg);
    filter: brightness(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .split-flap-text__flap {
    animation: none !important;
  }
}
</style>
