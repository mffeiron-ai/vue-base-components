<script setup lang="ts">
/**
 * Fold Text —— 文字像折页一样，一块一块沿铰链翻开落位
 *
 * 移植自 React Bits 的 Fold Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/fold-text
 * 原版用 GSAP + ScrollTrigger；这里等价换成 WAAPI + IntersectionObserver，不引依赖。
 *
 * 原理：
 * 1. 按 `splitBy` 把文案切成段（字 / 词 / 行），每段是「段容器 + 折片」两层：
 *    · 段容器负责 `perspective`（近大远小的强度，`perspective` prop）
 *    · 折片负责 `transform-origin`（铰链在哪条边）和旋转
 * 2. 折片一开始被转到「贴在铰链那侧」的角度（top 铰链就绕上边 -92°），同时透明；
 *    动画把它转回 0°、淡入，并让折痕阴影淡掉 —— 看起来就是一张折起的纸落平；
 * 3. 折痕阴影是折片内一层真实元素（不是 ::after）—— 因为要单独动它的 opacity，
 *    WAAPI 动不了伪元素；
 * 4. 相邻段按 `stagger` 错峰，`trigger` 决定谁来播放（挂载 / 悬停 / 进视口 / 循环）。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { resolveEase } from '../gsap-ease'

export type FoldTextSplitBy = 'char' | 'word' | 'line'
export type FoldTextHinge = 'top' | 'bottom' | 'left' | 'right'
export type FoldTextTrigger = 'mount' | 'hover' | 'scroll' | 'loop'

/** 每个铰链：转轴原点 + 折起的角度（92° 略过 90°，纸才不会「穿」过去） */
const HINGE_CONFIG: Record<FoldTextHinge, { origin: string; rotateX: number; rotateY: number }> = {
  top: { origin: '50% 0%', rotateX: -92, rotateY: 0 },
  bottom: { origin: '50% 100%', rotateX: 92, rotateY: 0 },
  left: { origin: '0% 50%', rotateX: 0, rotateY: 92 },
  right: { origin: '100% 50%', rotateX: 0, rotateY: -92 },
}

const props = withDefaults(
  defineProps<{
    /** 文案；`splitBy="line"` 时用 `\n` 分行 */
    text?: string
    /** 按什么切段 */
    splitBy?: FoldTextSplitBy
    /** 铰链在哪条边 */
    hinge?: FoldTextHinge
    /** 每块翻开的时长（秒） */
    duration?: number
    /** 相邻块开始的间隔（秒） */
    stagger?: number
    /** 缓动：CSS 缓动，或 GSAP 常见名字（power3.out 之类，内部有映射） */
    ease?: string
    /** 每块父级的 perspective（px），越小越「近大远小」 */
    perspective?: number
    /** 折起时的折痕阴影强度，0–1 */
    creaseShading?: number
    /** 何时播放 */
    trigger?: FoldTextTrigger
    /** 字号 */
    fontSize?: number | string
    /** 字重 */
    fontWeight?: number | string
    /** 文字颜色：任意 CSS 颜色，或 `--` 开头的变量名（默认跟随主题） */
    color?: string
  }>(),
  {
    text: 'Design unfolds',
    splitBy: 'char',
    hinge: 'top',
    duration: 0.65,
    stagger: 0.045,
    ease: 'power3.out',
    perspective: 700,
    creaseShading: 0.55,
    trigger: 'mount',
    fontSize: 80,
    fontWeight: 800,
    color: '--color-foreground',
  },
)

const rootEl = ref<HTMLSpanElement | null>(null)

const hingeConfig = computed(() => HINGE_CONFIG[props.hinge] ?? HINGE_CONFIG.top)
const safeCrease = computed(() => Math.min(1, Math.max(0, Number(props.creaseShading) || 0)))
const safePerspective = computed(() => Math.max(120, Number(props.perspective) || 700))
const easeCss = computed(() => resolveEase(props.ease))

/** 颜色支持 `--` 变量名：包成 var() 交给 CSS，切主题时由 CSS 自己更新 */
const colorCss = computed(() => {
  const raw = String(props.color ?? '').trim()
  if (!raw) return 'currentColor'
  return raw.startsWith('--') ? `var(${raw}, currentColor)` : raw
})

const rootStyle = computed(() => ({
  '--fold-text-color': colorCss.value,
  '--fold-text-font-size': typeof props.fontSize === 'number' ? `${props.fontSize}px` : String(props.fontSize),
  '--fold-text-font-weight': String(props.fontWeight),
}))

type Part = { type: 'segment' | 'space' | 'break'; content: string; block?: boolean }

/** 按 splitBy 把文案切成渲染用的片段 */
const parts = computed<Part[]>(() => {
  const text = String(props.text ?? '')
  if (props.splitBy === 'line') {
    return text
      .split('\n')
      .map(line => ({ type: 'segment' as const, content: line || '\u00A0', block: true }))
  }
  if (props.splitBy === 'word') {
    return text
      .split(/(\s+)/)
      .filter(part => part !== '')
      .map(part =>
        /^\s+$/.test(part)
          ? { type: 'space' as const, content: part.replace(/ /g, '\u00A0') }
          : { type: 'segment' as const, content: part },
      )
  }
  return Array.from(text).map(char =>
    char === '\n'
      ? { type: 'break' as const, content: '' }
      : { type: 'segment' as const, content: char === ' ' ? '\u00A0' : char },
  )
})

/* ── 播放 ───────────────────────────────────────────────── */

let animations: Animation[] = []
let replayTimer: number | null = null
let viewObserver: IntersectionObserver | null = null
let cancelled = false
let prefersReduced = false

function pieces(): HTMLElement[] {
  const root = rootEl.value
  return root ? Array.from(root.querySelectorAll<HTMLElement>('.fold-text-piece')) : []
}
function creases(): HTMLElement[] {
  const root = rootEl.value
  return root ? Array.from(root.querySelectorAll<HTMLElement>('.fold-text-crease')) : []
}

function stopAnimations() {
  animations.forEach(a => a.cancel())
  animations = []
  // 取消后回到元素自身的样式（folded 由 setFolded 摆）
}

function timing(activeDuration: number, activeStagger: number, index: number) {
  return {
    duration: activeDuration,
    delay: index * activeStagger,
    easing: easeCss.value,
    fill: 'both' as const,
  }
}

/** 摆到「折起」的起始态 */
function setFolded() {
  stopAnimations()
  const config = hingeConfig.value
  const crease = prefersReduced ? 0 : safeCrease.value
  pieces().forEach((el) => {
    el.style.opacity = '0'
    el.style.transform = `rotateX(${config.rotateX}deg) rotateY(${config.rotateY}deg)`
  })
  creases().forEach((el) => {
    el.style.opacity = String(crease)
  })
}

/** 直接给最终态 */
function settle() {
  stopAnimations()
  pieces().forEach((el) => {
    el.style.opacity = '1'
    el.style.transform = 'rotateX(0deg) rotateY(0deg)'
  })
  creases().forEach((el) => {
    el.style.opacity = '0'
  })
}

function play() {
  if (cancelled) return
  const list = pieces()
  if (!list.length) return

  if (prefersReduced) {
    settle()
    return
  }

  stopAnimations()
  const config = hingeConfig.value
  const crease = safeCrease.value
  const activeDuration = Math.max(0.05, Number(props.duration) || 0.65) * 1000
  const activeStagger = Math.max(0, Number(props.stagger) || 0) * 1000

  list.forEach((el, index) => {
    animations.push(
      el.animate(
        [
          { opacity: 0, transform: `rotateX(${config.rotateX}deg) rotateY(${config.rotateY}deg)` },
          { opacity: 1, transform: 'rotateX(0deg) rotateY(0deg)' },
        ],
        timing(activeDuration, activeStagger, index),
      ),
    )
  })

  creases().forEach((el, index) => {
    animations.push(
      el.animate([{ opacity: crease }, { opacity: 0 }], timing(activeDuration, activeStagger, index)),
    )
  })

  if (props.trigger === 'loop') {
    const total = activeDuration + Math.max(0, list.length - 1) * activeStagger
    if (replayTimer !== null) window.clearTimeout(replayTimer)
    // 定时器循环（后台标签页也能推进）：写完停 0.75s 再来一轮
    replayTimer = window.setTimeout(() => {
      replayTimer = null
      play()
    }, total + 750)
  }
}

function cleanupHover() {
  rootEl.value?.removeEventListener('pointerenter', play)
}

function applyTrigger() {
  cleanupHover()
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
    setFolded()
    viewObserver = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          play()
          viewObserver?.disconnect()
          viewObserver = null
        }
      },
      // 约当 ScrollTrigger 的 top 82%
      { rootMargin: '0px 0px -18% 0px', threshold: 0 },
    )
    viewObserver.observe(root)
    return
  }

  setFolded()
  play()
}

/* ── 生命周期 ───────────────────────────────────────────── */

onMounted(async () => {
  prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  await nextTick()
  applyTrigger()
})

onBeforeUnmount(() => {
  cancelled = true
  cleanupHover()
  stopAnimations()
  viewObserver?.disconnect()
  viewObserver = null
  if (replayTimer !== null) window.clearTimeout(replayTimer)
})

// 文案 / 切法 / 铰链变了，DOM 结构换了 → 重新绑动画
watch(
  [parts, () => props.splitBy, () => props.hinge],
  async () => {
    await nextTick()
    applyTrigger()
  },
)

// 时长 / 缓动 / 折痕 / 触发方式变了 → 重来一遍（不重来就得等下一轮才看得出来）
watch(
  [
    () => props.trigger,
    () => props.duration,
    () => props.stagger,
    () => props.ease,
    () => props.creaseShading,
  ],
  async () => {
    await nextTick()
    applyTrigger()
  },
)

// 颜色 / 字号 / 透视只影响样式，交给 CSS，不用重播
defineExpose({ play, replay: play })
</script>

<template>
  <span ref="rootEl" class="fold-text" :style="rootStyle">
    <!-- 读屏读这一份；视觉层是切碎的，念出来会断 -->
    <span class="fold-text-sr-only">{{ text }}</span>

    <span class="fold-text-visual" aria-hidden="true">
      <template v-for="(part, index) in parts" :key="index">
        <br v-if="part.type === 'break'">
        <span v-else-if="part.type === 'space'" class="fold-text-whitespace">{{ part.content }}</span>
        <span
          v-else
          class="fold-text-segment"
          :class="part.block && 'fold-text-segment--line'"
          :style="{ '--fold-perspective': `${safePerspective}px` }"
        >
          <span
            class="fold-text-piece"
            :data-fold-hinge="hinge"
            :style="{ transformOrigin: hingeConfig.origin }"
          >
            {{ part.content }}
            <span class="fold-text-crease" />
          </span>
        </span>
      </template>
    </span>
  </span>
</template>

<style scoped>
.fold-text {
  display: inline-block;
  color: var(--fold-text-color, currentColor);
  font-size: var(--fold-text-font-size, inherit);
  font-weight: var(--fold-text-font-weight, inherit);
  line-height: 0.95;
  letter-spacing: -0.04em;
  white-space: pre-wrap;
  user-select: text;
}

.fold-text-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.fold-text-visual {
  display: inline;
}

.fold-text-whitespace {
  display: inline;
}

.fold-text-segment {
  display: inline-block;
  line-height: inherit;
  /* 透视挂在段容器上，近大远小才作用到里面的折片 */
  perspective: var(--fold-perspective, 700px);
  transform-style: preserve-3d;
  vertical-align: baseline;
}

.fold-text-segment--line {
  display: block;
}

.fold-text-piece {
  position: relative;
  display: inline-block;
  color: inherit;
  line-height: inherit;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform, opacity;
}

/* 折痕阴影：折起时最重，翻开后淡到 0（要单独动它，所以是真实元素而不是 ::after） */
.fold-text-crease {
  position: absolute;
  inset: -0.08em -0.02em;
  pointer-events: none;
  opacity: 0;
  mix-blend-mode: multiply;
  border-radius: 0.08em;
}

.fold-text-piece[data-fold-hinge='top'] .fold-text-crease {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.58) 0%, rgba(0, 0, 0, 0.22) 42%, rgba(255, 255, 255, 0.26) 100%);
}

.fold-text-piece[data-fold-hinge='bottom'] .fold-text-crease {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.58) 0%, rgba(0, 0, 0, 0.22) 42%, rgba(255, 255, 255, 0.26) 100%);
}

.fold-text-piece[data-fold-hinge='left'] .fold-text-crease {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.58) 0%, rgba(0, 0, 0, 0.22) 42%, rgba(255, 255, 255, 0.26) 100%);
}

.fold-text-piece[data-fold-hinge='right'] .fold-text-crease {
  background: linear-gradient(270deg, rgba(0, 0, 0, 0.58) 0%, rgba(0, 0, 0, 0.22) 42%, rgba(255, 255, 255, 0.26) 100%);
}

@media (prefers-reduced-motion: reduce) {
  .fold-text-piece {
    transform: none !important;
  }

  .fold-text-crease {
    opacity: 0 !important;
  }
}
</style>
