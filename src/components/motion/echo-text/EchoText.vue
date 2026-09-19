<script setup lang="ts">
/**
 * Echo Text —— 前面一份清晰正文，后面一叠「回声」副本跟着指针拖尾
 *
 * 移植自 React Bits 的 Echo Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/echo-text
 * 原版就是纯 DOM + rAF、零依赖，这里 1:1 搬逻辑，颜色改成默认跟随主题。
 *
 * 原理：
 * 1. 结构：`echoes` 份绝对定位的副本（越靠后越深、越淡、越糊）+ 一份相对定位的正文；
 * 2. 入场（`mode` 含 entrance）：每份副本按 `direction` 方向先错开 `offset × (index + 0.35)`，
 *    `duration` 内用缓动收敛回原位 —— 就是「回声从一侧追上来」；
 * 3. 指针（`mode` 含 pointer，且设备支持 hover）：从元素中心指向光标的向量 × 距离比例 → 目标偏移，
 *    正本跟得紧、越深的副本越迟钝（`lag` 控制迟钝程度），于是拖出回声带；
 * 4. 副本的透明度 = `activity × fade^index`，activity 由「副本间最大分离度 / 目标移动速度」推出 ——
 *    只有真的被拉开时才显形，静止时是干净的正文；
 * 5. 每帧只改 transform / opacity / filter，跑完（回到静止且入场结束）就停掉 rAF，指针再动时重启。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export type EchoTextDirection = 'right' | 'left' | 'up' | 'down' | 'diagonal'
export type EchoTextMode = 'entrance' | 'pointer' | 'both'
export type EchoTextEase = 'linear' | 'ease-out' | 'ease-in-out' | 'snappy'

const DIRECTIONS: Record<EchoTextDirection, { x: number; y: number }> = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  diagonal: { x: 0.72, y: 0.72 },
}

const EASINGS: Record<EchoTextEase, (t: number) => number> = {
  linear: t => t,
  'ease-out': t => 1 - Math.pow(1 - t, 3),
  'ease-in-out': t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  snappy: t => 1 - Math.pow(1 - t, 5),
}

const props = withDefaults(
  defineProps<{
    /** 文案 */
    text?: string
    /** 后面放几份回声副本 */
    echoes?: number
    /** 越深的副本追目标越慢，0.02–0.5 */
    lag?: number
    /** 入场的错开距离 / 指针拖尾的幅度（px） */
    offset?: number
    /** 入场从哪个方向追上来 */
    direction?: EchoTextDirection
    /** 相邻副本的透明度衰减系数 */
    fade?: number
    /** 最深那份副本的模糊（px） */
    blur?: number
    /** 副本的色偏：任意 CSS 颜色、`--` 变量名，或 false 关闭 */
    tint?: string | false
    /** 跑入场 / 跑指针拖尾 / 都跑 */
    mode?: EchoTextMode
    /** 光标在多远（px）内能把文字拉到最大偏移，越大越早反应、到位越慢 */
    cursorRadius?: number
    /** 入场收敛时长（毫秒） */
    duration?: number
    /** 入场缓动 */
    ease?: EchoTextEase
    /** 字号 */
    fontSize?: number | string
    /** 字重 */
    fontWeight?: number | string
    /** 正文颜色：任意 CSS 颜色，或 `--` 开头的变量名（默认跟随主题） */
    color?: string
  }>(),
  {
    text: 'Motion Echo',
    echoes: 12,
    lag: 0.24,
    offset: 36,
    direction: 'right',
    fade: 0.72,
    blur: 3,
    tint: '--color-primary',
    mode: 'both',
    cursorRadius: 320,
    duration: 900,
    ease: 'ease-out',
    fontSize: 'clamp(3rem, 9vw, 7rem)',
    fontWeight: 800,
    color: '--color-foreground',
  },
)

const rootEl = ref<HTMLSpanElement | null>(null)
const frontEl = ref<HTMLSpanElement | null>(null)
const echoEls = ref<HTMLSpanElement[]>([])

function setEchoEl(el: Element | null, index: number) {
  if (el) echoEls.value[index] = el as HTMLSpanElement
}

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b)

/** 颜色支持 `--` 变量名：包成 var() 交给 CSS，切主题由 CSS 自己更新 */
function colorCss(value: string, fallback: string) {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  return raw.startsWith('--') ? `var(${raw}, ${fallback})` : raw
}

const prefersReduced = ref(false)
/** 减少动态效果时不留副本，只显示正文 */
const echoCount = computed(() => (prefersReduced.value ? 0 : clamp(Math.round(Number(props.echoes) || 0), 0, 24)))
/** 渲染顺序反过来：更深的先画，正文最后画（叠在最上面） */
const echoIndexes = computed(() => Array.from({ length: echoCount.value }, (_, i) => echoCount.value - i))

const rootStyle = computed(() => ({
  color: colorCss(props.color, 'currentColor'),
  fontSize: typeof props.fontSize === 'number' ? `${props.fontSize}px` : String(props.fontSize),
  fontWeight: String(props.fontWeight),
}))

function echoStyle(index: number) {
  const base = colorCss(props.color, 'currentColor')
  const tint = props.tint === false ? '' : colorCss(String(props.tint), '')
  const depth = echoCount.value ? Math.min(72, 18 + index * 5) : 0
  return {
    color: tint ? `color-mix(in srgb, ${tint} ${depth}%, ${base})` : base,
    opacity: 0,
  }
}

/* ── 运行时状态（每帧都在改，不需要响应式） ──────────────── */

type Position = { x: number; y: number }

let positions: Position[] = []
let targetX = 0
let targetY = 0
let lastTargetX = 0
let lastTargetY = 0
let activity = 0
let startTime = 0
let rafId: number | null = null
let cancelled = false
let canHover = false

function setupState() {
  const vector = DIRECTIONS[props.direction] ?? DIRECTIONS.right
  const entranceEnabled = props.mode !== 'pointer'
  const offset = clamp(Number(props.offset) || 0, 0, 120)
  positions = Array.from({ length: echoCount.value + 1 }, (_, index) => {
    const amount = entranceEnabled ? offset * (index + 0.35) : 0
    return { x: vector.x * amount, y: vector.y * amount }
  })
  targetX = 0
  targetY = 0
  lastTargetX = 0
  lastTargetY = 0
  activity = entranceEnabled ? 1 : 0
  startTime = performance.now()
}

function setEchoOpacity() {
  const fade = clamp(Number(props.fade) || 0.72, 0.1, 0.95)
  for (let index = 1; index <= echoCount.value; index += 1) {
    const el = echoEls.value[index]
    if (el) el.style.opacity = String(Math.pow(fade, index) * activity)
  }
}

/** 画一帧：推位置、写 transform、算 activity、顺手调度下一帧 */
function frame(now: number) {
  if (cancelled) return
  const vector = DIRECTIONS[props.direction] ?? DIRECTIONS.right
  const offset = clamp(Number(props.offset) || 0, 0, 120)
  const lag = clamp(Number(props.lag) || 0.24, 0.02, 0.5)
  const blur = clamp(Number(props.blur) || 0, 0, 16)
  const duration = Math.max(0, Number(props.duration) || 0)
  const easeFn = EASINGS[props.ease] ?? EASINGS['ease-out']
  const entranceEnabled = props.mode !== 'pointer'

  const elapsed = now - startTime
  const entranceProgress = duration > 0 ? clamp(elapsed / duration, 0, 1) : 1
  const entranceRest = entranceEnabled ? 1 - easeFn(entranceProgress) : 0

  const targetVelocity = Math.hypot(targetX - lastTargetX, targetY - lastTargetY)
  lastTargetX = targetX
  lastTargetY = targetY

  let maxSeparation = 0

  for (let index = 0; index <= echoCount.value; index += 1) {
    const el = index === 0 ? frontEl.value : echoEls.value[index]
    const current = positions[index]
    if (!el || !current) continue

    const entranceAmount = entranceRest * offset * (index + 0.35)
    const desiredX = targetX + vector.x * entranceAmount
    const desiredY = targetY + vector.y * entranceAmount
    // 越深的副本 lerp 系数越小 → 追得越慢，回声才拉得开
    const lerp = clamp(0.34 / (1 + index * lag * 4.2), 0.018, 0.36)

    current.x += (desiredX - current.x) * lerp
    current.y += (desiredY - current.y) * lerp

    el.style.transform = `translate3d(${current.x.toFixed(3)}px, ${current.y.toFixed(3)}px, 0)`

    if (index > 0) {
      const front = positions[0]
      const separation = front ? Math.hypot(current.x - front.x, current.y - front.y) : 0
      maxSeparation = Math.max(maxSeparation, separation)
      const depth = echoCount.value ? index / echoCount.value : 0
      el.style.filter = blur > 0 ? `blur(${(blur * depth).toFixed(2)}px)` : 'none'
    }
  }

  const separationActivity = offset > 0 ? clamp(maxSeparation / (offset * 2.25), 0, 1) : 0
  const targetActivity = offset > 0 ? clamp(targetVelocity / (offset * 0.35), 0, 1) : 0
  const nextActivity = Math.max(entranceRest, separationActivity, targetActivity)
  activity += (nextActivity - activity) * 0.18
  setEchoOpacity()

  const stillMoving =
    activity > 0.002 || Math.abs(targetX) > 0.01 || Math.abs(targetY) > 0.01 || entranceProgress < 1

  if (stillMoving) {
    rafId = window.requestAnimationFrame(frame)
  } else {
    rafId = null
  }
}

function ensureLoop() {
  if (cancelled || prefersReduced.value) return
  if (rafId !== null) return
  rafId = window.requestAnimationFrame(frame)
}

/* ── 指针 ───────────────────────────────────────────────── */

function onPointerMove(event: PointerEvent) {
  const root = rootEl.value
  if (!root || props.mode === 'entrance') return
  const rect = root.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  const offset = clamp(Number(props.offset) || 0, 0, 120)
  const radius = clamp(Number(props.cursorRadius) || 320, 40, 1200)
  const deltaX = event.clientX - (rect.left + rect.width / 2)
  const deltaY = event.clientY - (rect.top + rect.height / 2)
  const distance = Math.hypot(deltaX, deltaY)
  const reach = distance > 0 ? clamp(distance / radius, 0, 1) : 0
  const dirX = distance > 0 ? deltaX / distance : 0
  const dirY = distance > 0 ? deltaY / distance : 0

  targetX = dirX * reach * offset
  // 纵向压一点：屏幕横向上「扫」的感觉更对
  targetY = dirY * reach * offset * 0.72
  ensureLoop()
}

function onPointerLeave() {
  targetX = 0
  targetY = 0
  ensureLoop()
}

/* ── 生命周期 ───────────────────────────────────────────── */

function start() {
  cancelAnimationFrameIfNeeded()
  const root = rootEl.value
  if (!root) return

  if (prefersReduced.value) {
    // 只留正文：副本收掉，正文复位
    if (frontEl.value) frontEl.value.style.transform = 'none'
    echoEls.value.forEach((el) => { if (el) el.style.opacity = '0' })
    return
  }

  setupState()
  // 先同步画一帧：后台标签页里 rAF 不跑，至少也有个正确的静态起始态
  frame(performance.now())
  // 指针监听：支持 hover 的设备才挂
  if (props.mode !== 'entrance') {
    canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false
    if (canHover) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('pointerleave', onPointerLeave)
    }
  }
}

function cancelAnimationFrameIfNeeded() {
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId)
    rafId = null
  }
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerleave', onPointerLeave)
}

onMounted(() => {
  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  prefersReduced.value = media?.matches ?? false
  media?.addEventListener?.('change', onReducedMotionChange)
  start()
})

function onReducedMotionChange(event: MediaQueryListEvent) {
  prefersReduced.value = event.matches
  cancelAnimationFrameIfNeeded()
  start()
}

onBeforeUnmount(() => {
  cancelled = true
  cancelAnimationFrameIfNeeded()
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.removeEventListener?.('change', onReducedMotionChange)
})

// 影响运动本身的参数变了就重来一遍（颜色 / 字号只影响样式，交给 CSS）
watch(
  [
    echoCount,
    () => props.lag,
    () => props.offset,
    () => props.direction,
    () => props.blur,
    () => props.fade,
    () => props.mode,
    () => props.cursorRadius,
    () => props.duration,
    () => props.ease,
  ],
  () => start(),
)

defineExpose({ replay: start })
</script>

<template>
  <span ref="rootEl" class="echo-text" :style="rootStyle">
    <!-- 副本从深到浅先画，正文最后画、叠在最上面 -->
    <span
      v-for="index in echoIndexes"
      :key="index"
      :ref="el => setEchoEl(el, index)"
      class="echo-text__echo"
      :data-echo-index="index"
      :style="echoStyle(index)"
      aria-hidden="true"
    >{{ text }}</span>

    <span ref="frontEl" class="echo-text__echo echo-text__echo--front">{{ text }}</span>
  </span>
</template>

<style scoped>
.echo-text {
  position: relative;
  display: inline-block;
  white-space: nowrap;
  line-height: 0.9;
  letter-spacing: -0.04em;
  user-select: none;
  contain: layout style;
  font-kerning: normal;
  text-rendering: geometricPrecision;
}

.echo-text__echo {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
  transform-origin: 50% 50%;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* 正文：相对定位撑出尺寸、压在最上层，只有一点极轻的立体感 */
.echo-text__echo--front {
  position: relative;
  z-index: 2;
  opacity: 1;
  filter: none;
  text-shadow: 0 0.035em 0 rgba(255, 255, 255, 0.04);
  will-change: transform;
}
</style>
