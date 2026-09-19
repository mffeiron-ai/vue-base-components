<script setup lang="ts">
/**
 * Rotating Text —— 一串词轮流上场：旧的字符向上飞出，新的字符从下方弹上来（弹簧手感）
 *
 * 移植自 React Bits 的 Rotating Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/rotating-text
 * 原版用 motion（framer-motion）的 `AnimatePresence` + 每个字符一个 `motion.span`：
 *
 *   · 按 `splitBy` 把当前文本拆成 词 → 字符（`characters` 模式按空格切词，词内按**字素**切）
 *   · 每个字符的 `transition` = 弹簧参数 + `delay = getStaggerDelay(全局字符序号, 总字符数)`
 *     —— `staggerFrom` 决定错开从哪开始（first / last / center / random / 指定序号）
 *   · `AnimatePresence mode="wait"`：**等上一段全部退场完，下一段才入场**（不是交叉淡入）
 *   · 入/出场状态默认是 `{ y: '100%', opacity: 0 } → { y: 0, opacity: 1 }` 与 `{ y: '-120%', opacity: 0 }`
 *     （`translateY` 的百分比是**相对字符自身高度**，所以字是从下面「钻」上来的）
 *
 * 本实现不引动画库：
 *   · 弹簧 → 解析解采样成 `linear()` 缓动（见 `../spring-ease.ts`），交给 **WAAPI** 跑
 *   · 退场完成用 `Animation.finished` 等（对应 `mode="wait"`）
 *   · 容器宽度不做 motion 的 `layout` 过渡（那是布局动画，纯 CSS 无法等价实现）—— 见文档「注意点」
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { springDuration, springEasing } from '../spring-ease'

/** 一个「入/出场状态」：只支持这几个常用属性（上游是 motion 的 Target，属性可以更多） */
export interface RotatingTextTarget {
  x?: string | number
  y?: string | number
  scale?: number
  rotate?: number
  opacity?: number
}

/** 错开方向：从第一个 / 最后一个 / 中间 / 随机一个 / 指定序号开始 */
export type RotatingTextStaggerFrom = 'first' | 'last' | 'center' | 'random' | number

const props = withDefaults(
  defineProps<{
    /** 要轮换的文本（至少 2 条才有轮换效果） */
    texts?: string[]
    /** 每段停留多久（毫秒） */
    rotationInterval?: number
    /** 相邻字符错开的时长（秒） */
    staggerDuration?: number
    /** 错开从哪里开始 */
    staggerFrom?: RotatingTextStaggerFrom
    /** 到最后一段后是否回到第一段 */
    loop?: boolean
    /** 是否自动轮换（关掉就只靠 next() / previous() 手动切） */
    auto?: boolean
    /** 拆分方式：`characters`（默认）/ `words` / `lines` / 任意分隔符 */
    splitBy?: string
    /** 入场起点 */
    initial?: RotatingTextTarget
    /** 入场终点（也是静止态） */
    animate?: RotatingTextTarget
    /** 出场终点 */
    exit?: RotatingTextTarget
    /** 弹簧劲度系数（motion 的 `stiffness`） */
    stiffness?: number
    /** 弹簧阻尼（motion 的 `damping`） */
    damping?: number
    /** 弹簧质量（motion 的 `mass`） */
    mass?: number
    /** 裁掉容器外的字符（默认关，跟上游一样靠外层容器裁；打开后字符会「从边缘钻出来」） */
    clip?: boolean
    /** 外层容器类名（Vue 里直接写 class 也会透传到根元素） */
    mainClassName?: string
    /** 每个「词」容器的类名 */
    splitLevelClassName?: string
    /** 每个字符的类名 */
    elementLevelClassName?: string
  }>(),
  {
    texts: () => [],
    rotationInterval: 2000,
    staggerDuration: 0,
    staggerFrom: 'first',
    loop: true,
    auto: true,
    splitBy: 'characters',
    initial: () => ({ y: '100%', opacity: 0 }),
    animate: () => ({ y: '0%', opacity: 1 }),
    exit: () => ({ y: '-120%', opacity: 0 }),
    stiffness: 300,
    damping: 25,
    mass: 1,
    clip: false,
    mainClassName: '',
    splitLevelClassName: '',
    elementLevelClassName: '',
  },
)

const rootRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)

/* ── 拆字 ───────────────────────────────────────────────── */

/** 按「字素」切（emoji / 组合字符不会被切碎），上游用 `Intl.Segmenter` */
type SegmenterCtor = new (
  locale?: string,
  options?: { granularity?: string },
) => { segment: (input: string) => Iterable<{ segment: string }> }

function splitIntoCharacters(text: string): string[] {
  const Segmenter = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter
  if (Segmenter) {
    return Array.from(new Segmenter('en', { granularity: 'grapheme' }).segment(text), (s) => s.segment)
  }
  return Array.from(text)
}

interface WordGroup {
  characters: string[]
  needsSpace: boolean
}

const groups = computed<WordGroup[]>(() => {
  const current = String(props.texts?.[currentIndex.value] ?? '')
  const splitBy = props.splitBy
  if (splitBy === 'characters') {
    const words = current.split(' ')
    return words.map((word, i) => ({
      characters: splitIntoCharacters(word),
      needsSpace: i !== words.length - 1,
    }))
  }
  if (splitBy === 'words') {
    const words = current.split(' ')
    return words.map((word, i) => ({ characters: [word], needsSpace: i !== words.length - 1 }))
  }
  if (splitBy === 'lines') {
    const lines = current.split('\n')
    return lines.map((line, i) => ({ characters: [line], needsSpace: i !== lines.length - 1 }))
  }
  const parts = current.split(splitBy)
  return parts.map((part, i) => ({ characters: [part], needsSpace: i !== parts.length - 1 }))
})

const currentText = computed(() => String(props.texts?.[currentIndex.value] ?? ''))
const totalChars = computed(() => groups.value.reduce((sum, g) => sum + g.characters.length, 0))

/* ── 弹簧 / 错开 ────────────────────────────────────────── */

const springOptions = computed(() => ({
  stiffness: Number(props.stiffness) || 300,
  damping: Number(props.damping) || 25,
  mass: Number(props.mass) || 1,
}))

/** 错开延时（秒）—— 与上游 `getStaggerDelay` 一致；`random` 每次调用都重新掷一次骰子 */
function getStaggerDelay(index: number, total: number) {
  const step = Math.max(0, Number(props.staggerDuration) || 0)
  const from = props.staggerFrom
  if (from === 'first') return index * step
  if (from === 'last') return (total - 1 - index) * step
  if (from === 'center') return Math.abs(Math.floor(total / 2) - index) * step
  if (from === 'random') return Math.abs(Math.floor(Math.random() * total) - index) * step
  const anchor = typeof from === 'number' ? from : 0
  return Math.abs(anchor - index) * step
}

function transformOf(target: RotatingTextTarget) {
  const parts: string[] = []
  if (target.x !== undefined) parts.push(`translateX(${typeof target.x === 'number' ? `${target.x}px` : target.x})`)
  if (target.y !== undefined) parts.push(`translateY(${typeof target.y === 'number' ? `${target.y}px` : target.y})`)
  if (target.scale !== undefined) parts.push(`scale(${target.scale})`)
  if (target.rotate !== undefined) parts.push(`rotate(${target.rotate}deg)`)
  return parts.length ? parts.join(' ') : 'none'
}

const opacityOf = (target: RotatingTextTarget) => String(target.opacity ?? 1)

function keyframesOf(from: RotatingTextTarget, to: RotatingTextTarget): Keyframe[] {
  return [
    { transform: transformOf(from), opacity: opacityOf(from) },
    { transform: transformOf(to), opacity: opacityOf(to) },
  ]
}

function charEls() {
  const stage = stageRef.value
  if (!stage) return [] as HTMLElement[]
  return Array.from(stage.querySelectorAll<HTMLElement>('.rotating-text__element'))
}

/* ── 动画 ───────────────────────────────────────────────── */

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 直接落到静止态（首次挂载 / 减少动效时用） */
function settle() {
  const target = props.animate
  for (const el of charEls()) {
    el.style.transform = transformOf(target)
    el.style.opacity = opacityOf(target)
  }
}

/** 入场：`initial → animate`，逐字符按 `staggerFrom` 错开 */
function playEnter() {
  const els = charEls()
  const total = els.length
  if (!total) return
  const { duration, easing } = timing()
  els.forEach((el, index) => {
    const animation = el.animate(keyframesOf(props.initial, props.animate), {
      duration,
      delay: getStaggerDelay(index, total) * 1000,
      easing,
      fill: 'both',
    })
    animation.id = 'enter'
  })
}

/** 出场：`animate → exit`；返回「最后一个字符演完」的 Promise（对应 `mode="wait"`） */
function playExit(): Promise<unknown> {
  const els = charEls()
  const total = els.length
  if (!total) return Promise.resolve()
  const { duration, easing } = timing()
  const running = els.map((el, index) =>
    el.animate(keyframesOf(props.animate, props.exit), {
      duration,
      delay: getStaggerDelay(index, total) * 1000,
      easing,
      fill: 'both',
    }).finished.catch(() => undefined),
  )
  return Promise.all(running)
}

function timing() {
  const options = springOptions.value
  return { duration: springDuration(options) * 1000, easing: springEasing(options) }
}

/* ── 切换 ───────────────────────────────────────────────── */

let busy = false

async function goTo(index: number) {
  const count = props.texts?.length ?? 0
  if (count < 1 || busy) return
  const target = ((index % count) + count) % count
  if (target === currentIndex.value) return

  busy = true
  try {
    if (!reduceMotion()) {
      await playExit() // 等退场全部结束，下一段才进来
    }
    currentIndex.value = target
    await nextTick()
    if (reduceMotion()) settle()
    else playEnter()
  } finally {
    busy = false
  }
}

function next() {
  const count = props.texts?.length ?? 0
  if (count < 2) return
  const i = currentIndex.value
  const target = i === count - 1 ? (props.loop ? 0 : i) : i + 1
  void goTo(target)
}

function previous() {
  const count = props.texts?.length ?? 0
  if (count < 2) return
  const i = currentIndex.value
  const target = i === 0 ? (props.loop ? count - 1 : i) : i - 1
  void goTo(target)
}

function jumpTo(index: number) {
  const count = props.texts?.length ?? 0
  if (!count) return
  void goTo(Math.max(0, Math.min(index, count - 1)))
}

function reset() {
  void goTo(0)
}

/* ── 定时器 ─────────────────────────────────────────────── */

let timer = 0

function restartTimer() {
  if (timer) window.clearInterval(timer)
  timer = 0
  if (!props.auto || (props.texts?.length ?? 0) < 2) return
  timer = window.setInterval(() => next(), Math.max(100, Number(props.rotationInterval) || 2000))
}

onMounted(async () => {
  await nextTick()
  settle() // `animatePresenceInitial = false`：首屏不播入场动画
  restartTimer()
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
  timer = 0
})

watch(
  [() => props.auto, () => props.rotationInterval, () => props.texts?.length],
  () => restartTimer(),
)

// 文案列表变了：索引兜回合法范围
watch(
  () => props.texts,
  (list) => {
    if (!list?.length) return
    if (currentIndex.value > list.length - 1) currentIndex.value = 0
  },
)

defineExpose({
  next,
  previous,
  jumpTo,
  reset,
  /** 当前序号与文本（探针 / 外部读数） */
  stats: () => ({
    index: currentIndex.value,
    count: props.texts?.length ?? 0,
    text: currentText.value,
    chars: totalChars.value,
    busy,
  }),
})
</script>

<template>
  <span ref="rootRef" class="rotating-text" :class="mainClassName">
    <span class="rotating-text__sr">{{ currentText }}</span>
    <span
      :key="currentIndex"
      ref="stageRef"
      class="rotating-text__stage"
      :class="[
        splitBy === 'lines' ? 'rotating-text__stage--lines' : '',
        clip ? 'rotating-text__stage--clip' : '',
      ]"
      aria-hidden="true"
    >
      <span
        v-for="(group, wordIndex) in groups"
        :key="wordIndex"
        class="rotating-text__word"
        :class="splitLevelClassName"
      >
        <span
          v-for="(char, charIndex) in group.characters"
          :key="charIndex"
          class="rotating-text__element"
          :class="elementLevelClassName"
        >{{ char }}</span>
        <span v-if="group.needsSpace" class="rotating-text__space"> </span>
      </span>
    </span>
  </span>
</template>

<style scoped>
.rotating-text {
  display: inline-flex;
  flex-wrap: wrap;
  white-space: pre-wrap;
  position: relative;
}

/* 给读屏用的当前文本（视觉上藏起来） */
.rotating-text__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}

.rotating-text__stage {
  display: inline-flex;
  flex-wrap: wrap;
  white-space: pre-wrap;
  position: relative;
}

.rotating-text__stage--lines {
  flex-direction: column;
  width: 100%;
}

.rotating-text__stage--clip {
  overflow: hidden;
}

.rotating-text__word {
  display: inline-flex;
}

.rotating-text__element {
  display: inline-block;
  will-change: transform, opacity;
}

.rotating-text__space {
  white-space: pre;
}
</style>
