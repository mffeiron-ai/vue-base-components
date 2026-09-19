<script setup lang="ts">
/**
 * Blur Text —— 逐词 / 逐字「从模糊到清晰」入场
 *
 * 移植自 React Bits 的 Blur Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/blur-text
 * 原版依赖 motion/react：把 `animationFrom` + `animationTo[]` 拼成 keyframes，
 * 用 `times` 均分（默认 3 档 → [0, 0.5, 1]），每个单位再按 index 错峰。
 *
 * 这里不用 motion / GSAP —— **motion 的 `times` 就是 WAAPI 的 `keyframe.offset`**，
 * 所以能一对一翻译：keyframes 交给 `el.animate()`，错峰就是每条动画的 `delay`，
 * `stepDuration × 档间隔数` 就是总时长；触发仍然用 IntersectionObserver（只触发一次）。
 *
 * 结构：外层 `<p>` 是 `display: flex; flex-wrap: wrap`（上游如此，对齐走 justify-content），
 * 每个单位是 `inline-block`，词与词之间的空隙用单位自带的 `\u00A0` 顶着，所以换行只发生在单位之间。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { resolveEase } from '../gsap-ease'

/** 起始 / 中间 / 结束的属性表：支持 opacity / x / y / scale / rotate / blur / filter */
export type BlurTextVars = Record<string, string | number>
export type BlurTextAnimateBy = 'words' | 'letters'
export type BlurTextDirection = 'top' | 'bottom'
export type BlurTextEasing = string | ((t: number) => number)

const props = withDefaults(
  defineProps<{
    text?: string
    /** 每个单位之间的入场间隔（毫秒） */
    delay?: number
    /** 按什么切分：整词 / 单字 */
    animateBy?: BlurTextAnimateBy
    /** 从哪个方向「飞进来」 */
    direction?: BlurTextDirection
    /** 单档时长（秒）；总时长 = stepDuration × (档数 - 1) */
    stepDuration?: number
    /** 进入视口的比例阈值（0–1） */
    threshold?: number
    /** 触发的 rootMargin */
    rootMargin?: string
    /** 起始属性（不传按 direction 推） */
    animationFrom?: BlurTextVars
    /** 中间 + 结束属性（数组，最后一项是终态） */
    animationTo?: BlurTextVars[]
    /** 缓动：CSS 缓动名（或 GSAP 常见名），也可以传函数（内部采样成关键帧） */
    easing?: BlurTextEasing
    /** 渲染成什么标签 */
    tag?: 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'div'
    /**
     * 扩展（上游没有）：外层是 flex，所以对齐映射到 justify-content
     */
    textAlign?: 'left' | 'center' | 'right'
  }>(),
  {
    text: '',
    delay: 200,
    animateBy: 'words',
    direction: 'top',
    stepDuration: 0.35,
    threshold: 0.1,
    rootMargin: '0px',
    easing: 'linear',
    tag: 'p',
    textAlign: 'center',
  },
)

const emit = defineEmits<{ complete: [] }>()

const rootEl = ref<HTMLElement | null>(null)

/* ── 切分 ───────────────────────────────────────────────── */

const elements = computed<string[]>(() =>
  props.animateBy === 'words' ? String(props.text ?? '').split(' ') : Array.from(String(props.text ?? '')),
)

/* ── 关键帧 ─────────────────────────────────────────────── */

/** 与上游一致：方向决定起始位移的符号 */
const defaultFrom = computed<BlurTextVars>(() =>
  props.direction === 'top'
    ? { filter: 'blur(10px)', opacity: 0, y: -50 }
    : { filter: 'blur(10px)', opacity: 0, y: 50 },
)

/** 与上游一致：先「过冲」到半模糊半透明、再落位到清晰 */
const defaultTo = computed<BlurTextVars[]>(() => [
  { filter: 'blur(5px)', opacity: 0.5, y: props.direction === 'top' ? 5 : -5 },
  { filter: 'blur(0px)', opacity: 1, y: 0 },
])

/** 某个属性缺失时的兜底值（等价于「不参与动画」） */
const VAR_FALLBACK: BlurTextVars = { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: 'blur(0px)' }

const VAR_KEYS = ['opacity', 'x', 'y', 'scale', 'rotate', 'blur', 'filter'] as const

/** [起始, …中间, 结束]，每档都把缺的属性补齐，方便逐帧插值 */
const stops = computed<BlurTextVars[]>(() => {
  const chain: BlurTextVars[] = [props.animationFrom ?? defaultFrom.value, ...(props.animationTo ?? defaultTo.value)]
  if (!chain.length) chain.push({})
  const keys = new Set<string>()
  chain.forEach(step => Object.keys(step).forEach(k => keys.add(k)))
  VAR_KEYS.forEach(k => { if (chain.some(step => k in step)) keys.add(k) })
  return chain.map((step, index) => {
    const out: BlurTextVars = {}
    keys.forEach((k) => {
      if (k in step) out[k] = step[k]!
      else out[k] = chain[index - 1]?.[k] ?? VAR_FALLBACK[k] ?? 0
    })
    return out
  })
})

/** 把一档属性变成 CSS 帧 */
function toFrame(step: BlurTextVars) {
  const x = Number(step.x ?? 0)
  const y = Number(step.y ?? 0)
  const scale = Number(step.scale ?? 1)
  const rotate = Number(step.rotate ?? 0)
  const filter = step.filter !== undefined
    ? String(step.filter)
    : step.blur !== undefined
      ? (Number(step.blur) ? `blur(${Number(step.blur)}px)` : 'blur(0px)')
      : 'blur(0px)'
  return {
    opacity: String(step.opacity ?? 1),
    transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`,
    filter,
  }
}

/** 数值直接插值；字符串则按「数字部分可变、前后缀需一致」插值（blur(10px) → blur(5px)） */
function mixValue(a: string | number, b: string | number, t: number): string | number {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t
  const sa = String(a)
  const sb = String(b)
  const na = Number.parseFloat(sa)
  const nb = Number.parseFloat(sb)
  const shapeA = sa.replace(/[\d.\-]+/g, '#')
  const shapeB = sb.replace(/[\d.\-]+/g, '#')
  if (Number.isFinite(na) && Number.isFinite(nb) && shapeA === shapeB) {
    return sa.replace(/[\d.\-]+/, String(Number((na + (nb - na) * t).toFixed(4))))
  }
  return t < 1 ? a : b
}

/**
 * 缓动是函数时（上游默认就是 `t => t`）没法直接交给 WAAPI，
 * 所以按函数把关键帧采样出来 —— 等价于「用该缓动曲线播放」。
 * 注意：motion 的 `ease` 作用于**整条时间轴**（时间 → 进度），不是逐段生效，
 * 所以这里先把全局 t 映射成进度，再在相邻两档之间插值。
 */
function sampleKeyframes(stepList: BlurTextVars[], ease: (t: number) => number, samples = 12) {
  const span = stepList.length - 1
  const frames: (ReturnType<typeof toFrame> & { offset: number })[] = []
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const pos = Math.min(1, Math.max(0, ease(t))) * span
    const seg = Math.min(Math.floor(pos), span - 1)
    const local = pos - seg
    const from = stepList[seg]
    const to = stepList[seg + 1] ?? from
    const mixed: BlurTextVars = {}
    Object.keys(from).forEach((k) => { mixed[k] = mixValue(from[k]!, to[k] ?? from[k]!, local) })
    frames.push({ ...toFrame(mixed), offset: t })
  }
  return frames
}

/** 关键帧 + WAAPI 的 easing（两者二选一：函数缓动走「采样 + linear」） */
const keyframePlan = computed(() => {
  const stepList = stops.value
  if (typeof props.easing === 'function') {
    return { frames: sampleKeyframes(stepList, props.easing), easing: 'linear', offsets: true }
  }
  return {
    // 显式写 offset：WAAPI 不写就是均分，与上游的 `times` 均分等价，但写出来更清楚
    frames: stepList.map((step, index) => ({
      ...toFrame(step),
      offset: stepList.length > 1 ? index / (stepList.length - 1) : 0,
    })),
    easing: resolveEase(props.easing, 'linear'),
    offsets: false,
  }
})

const totalDuration = computed(() => Math.max(0.01, Number(props.stepDuration) || 0.35) * 1000 * (stops.value.length - 1))

const justify = computed(() =>
  props.textAlign === 'left' ? 'flex-start' : props.textAlign === 'right' ? 'flex-end' : 'center',
)

/* ── 播放 ───────────────────────────────────────────────── */

let animations: Animation[] = []
let viewObserver: IntersectionObserver | null = null
let completeTimer: number | null = null
let hasPlayed = false

function units(): HTMLElement[] {
  const root = rootEl.value
  return root ? Array.from(root.querySelectorAll<HTMLElement>('.blur-text__unit')) : []
}

function stopAnimations() {
  animations.forEach(a => a.cancel())
  animations = []
  if (completeTimer !== null) {
    window.clearTimeout(completeTimer)
    completeTimer = null
  }
}

/** 直接落到终态（首帧与终态是同一套 CSS，所以只需末档） */
function settle() {
  stopAnimations()
  hasPlayed = true
  const last = keyframePlan.value.frames[keyframePlan.value.frames.length - 1]
  units().forEach((el) => {
    el.style.opacity = String(last.opacity)
    el.style.transform = String(last.transform)
    el.style.filter = String(last.filter)
  })
}

function play() {
  const list = units()
  if (!list.length) return

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    settle()
    emit('complete')
    return
  }

  stopAnimations()
  hasPlayed = true
  const plan = keyframePlan.value
  const duration = totalDuration.value
  const stagger = Math.max(0, Number(props.delay) || 0)

  list.forEach((el, index) => {
    animations.push(
      el.animate(plan.frames as Keyframe[], {
        duration,
        delay: index * stagger,
        easing: plan.easing,
        fill: 'both',
      }),
    )
  })

  // 用定时器报完成：动画的 finished 在后台标签页里可能一直不 resolve
  completeTimer = window.setTimeout(() => {
    completeTimer = null
    emit('complete')
  }, (list.length - 1) * stagger + duration + 16)
}

function start() {
  const root = rootEl.value
  if (!root) return
  stopAnimations()
  viewObserver?.disconnect()
  viewObserver = null

  viewObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return
      play()
      // 与上游一致：只触发一次
      viewObserver?.disconnect()
      viewObserver = null
    },
    { threshold: Math.min(1, Math.max(0, Number(props.threshold) || 0)), rootMargin: props.rootMargin || '0px' },
  )
  viewObserver.observe(root)
}

/* ── 生命周期 ───────────────────────────────────────────── */

onMounted(async () => {
  await nextTick()
  start()
})

onBeforeUnmount(() => {
  stopAnimations()
  viewObserver?.disconnect()
  viewObserver = null
})

// 文案 / 切分方式变了 → 重建单位、重新触发
watch([elements, () => props.animateBy, () => props.tag], async () => {
  await nextTick()
  start()
})

// 动画参数变了 → 重播（不动 DOM）
watch(
  [() => props.delay, () => props.stepDuration, () => props.easing, () => props.direction, () => props.animationFrom, () => props.animationTo, () => props.threshold, () => props.rootMargin],
  () => start(),
)

defineExpose({ play, replay: play })
</script>

<template>
  <component
    :is="tag"
    ref="rootEl"
    class="blur-text"
    :style="{ justifyContent: justify }"
  >
    <span
      v-for="(segment, index) in elements"
      :key="index"
      class="blur-text__unit"
    >{{ segment === ' ' ? '\u00A0' : segment }}{{ animateBy === 'words' && index < elements.length - 1 ? '\u00A0' : '' }}</span>
  </component>
</template>

<style scoped>
/* 上游就是 flex + wrap：单位是 inline-block，换行只发生在单位之间 */
.blur-text {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  will-change: transform, opacity;
}

.blur-text__unit {
  display: inline-block;
  white-space: pre;
  will-change: transform, filter, opacity;
}
</style>
