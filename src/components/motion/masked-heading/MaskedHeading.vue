<script setup lang="ts">
/**
 * Masked Heading —— 媒体（图片/视频）从字母里透出来的标题
 *
 * 移植自 React Bits 的 Masked Heading（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/masked-heading
 * 原版入场动效依赖 GSAP；这里改用 Web Animations API + 内联样式，行为对齐、不引新依赖。
 *
 * 原理（三步，缺一不可）：
 * 1. 真文字铺一层 `color: transparent` 的「量字形」——它的作用只是撑出布局、给出每个词的
 *    offsetLeft 和基线 offsetTop；
 * 2. 用 SVG `<clipPath clipPathUnits="userSpaceOnUse">` 把同样的文字画成裁剪形状，坐标与
 *    量字形一一对齐（字体、字号、字重、字距都从量字形 copy 过来）；
 * 3. 一块媒体层套上这个裁剪 → 媒体只从字母里露出来。
 * 指针视差、慢速漂移改的都是媒体层的 transform，裁剪形状始终不动，所以字是「窗」。
 *
 * 与设计系统的关系：标题字号由 `textScale`（容器宽度的比例）推导，所以本组件会自己写
 * 根节点的 font-size，不跟随全局字号预设。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'

export type MaskedHeadingReveal = 'rise' | 'wipe' | 'fade' | 'none'
export type MaskedHeadingTrigger = 'view' | 'mount' | 'hover'

const props = withDefaults(
  defineProps<{
    /** 标题文案 */
    text?: string
    /** 渲染成什么标签（语义用） */
    tag?: string
    /** 字母后面透出来的媒体类型 */
    mediaType?: 'image' | 'video'
    /** 图片 / 视频地址 */
    src?: string
    /** 视频加载前的封面 */
    poster?: string
    /** 媒体相对标题放大多少（放大出来的余量就是视差的活动范围） */
    fillScale?: number
    /** 指针视差幅度，px；0 = 不动 */
    parallax?: number
    /** 空闲时缓慢漂移的幅度，px；0 = 静止 */
    drift?: number
    brightness?: number
    saturation?: number
    /** 媒体转黑白 */
    grayscale?: boolean
    /** 入场形式：逐词上浮 / 从左扫过 / 整体淡入 / 无 */
    reveal?: MaskedHeadingReveal
    /** 入场时长，秒 */
    duration?: number
    /** 逐词入场的相邻延迟，秒 */
    stagger?: number
    /** 何时入场：进入视口 / 挂载即播 / 悬停 */
    trigger?: MaskedHeadingTrigger
    align?: 'left' | 'center' | 'right'
    weight?: number
    /** 字距，em */
    tracking?: number
    lineHeight?: number
    /** 字号占容器宽度的比例（保证响应式） */
    textScale?: number
  }>(),
  {
    text: 'Designed in the details',
    tag: 'h2',
    mediaType: 'image',
    src: '',
    poster: '',
    fillScale: 1.25,
    parallax: 26,
    drift: 18,
    brightness: 1,
    saturation: 1,
    grayscale: false,
    reveal: 'rise',
    duration: 1.1,
    stagger: 0.09,
    trigger: 'view',
    align: 'center',
    weight: 700,
    tracking: -0.03,
    lineHeight: 1.06,
    textScale: 0.115,
  },
)

const rootEl = ref<HTMLElement | null>(null)
const measureEl = ref<HTMLSpanElement | null>(null)
const revealEl = ref<HTMLSpanElement | null>(null)
const mediaEl = ref<HTMLSpanElement | null>(null)

const wordEls: HTMLSpanElement[] = []
const baseEls: HTMLElement[] = []
const glyphEls: SVGTextElement[] = []

function setWordEl(el: Element | ComponentPublicInstance | null, i: number) {
  if (el) wordEls[i] = el as HTMLSpanElement
}
function setBaseEl(el: Element | ComponentPublicInstance | null, i: number) {
  if (el) baseEls[i] = el as HTMLElement
}
function setGlyphEl(el: Element | ComponentPublicInstance | null, i: number) {
  if (el) glyphEls[i] = el as SVGTextElement
}

/** 同一页面可能有多份，clipPath 的 id 必须唯一 */
const clipId = `mh-${String(useId()).replace(/[^a-zA-Z0-9_-]/g, '')}`

const words = computed(() => String(props.text ?? '').split(/\s+/).filter(Boolean))

const rootStyle = computed(() => ({
  textAlign: props.align,
  fontWeight: props.weight,
  letterSpacing: `${props.tracking}em`,
  lineHeight: props.lineHeight,
}))

function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v
}

/* ── 媒体层位置 ─────────────────────────────────────────── */

// 当前偏移与目标偏移：x/y 是平滑后的实际值，tx/ty 是指针给出的目标值。
// 用普通对象而不是 ref —— 每帧都要改，没必要进响应式系统。
const offset = { x: 0, y: 0, tx: 0, ty: 0 }

function place() {
  const root = rootEl.value
  const media = mediaEl.value
  if (!root || !media) return
  const maxX = Math.max(0, ((props.fillScale - 1) / 2) * root.clientWidth)
  const maxY = Math.max(0, ((props.fillScale - 1) / 2) * root.clientHeight)
  media.style.transform =
    `translate3d(${clamp(offset.x, -maxX, maxX).toFixed(2)}px, ` +
    `${clamp(offset.y, -maxY, maxY).toFixed(2)}px, 0) scale(${props.fillScale})`
  media.style.filter =
    `brightness(${props.brightness}) saturate(${props.saturation})${props.grayscale ? ' grayscale(1)' : ''}`
}

/** 把 SVG 裁剪文字对齐到量字形，并把媒体层位置同步一次 */
function sync() {
  const root = rootEl.value
  const measure = measureEl.value
  if (!root || !measure) return

  root.style.fontSize = `${clamp(root.clientWidth * props.textScale, 20, 200).toFixed(1)}px`

  const cs = window.getComputedStyle(measure)
  for (let i = 0; i < words.value.length; i += 1) {
    const box = wordEls[i]
    const base = baseEls[i]
    const glyph = glyphEls[i]
    if (!box || !base || !glyph) continue
    glyph.setAttribute('x', `${box.offsetLeft}`)
    glyph.setAttribute('y', `${base.offsetTop}`)
    glyph.style.fontFamily = cs.fontFamily
    glyph.style.fontSize = cs.fontSize
    glyph.style.fontWeight = cs.fontWeight
    glyph.style.fontStyle = cs.fontStyle
    glyph.style.letterSpacing = cs.letterSpacing
  }
  place()
}

/* ── 入场动效（原版 GSAP，这里用 WAAPI） ─────────────────── */

let running: Animation[] = []

function stopReveal() {
  running.forEach(a => a.cancel())
  running = []
}

function prefersReduced() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** 逐词上浮的距离：一个字高再多一点 */
function riseDistance() {
  const root = rootEl.value
  const size = root ? parseFloat(window.getComputedStyle(root).fontSize) || 48 : 48
  return size * 1.15
}

function setGlyphY(px: number) {
  for (const g of glyphEls) if (g) g.style.transform = `translateY(${px}px)`
}

/** 停在「结束态」 */
function settle() {
  stopReveal()
  setGlyphY(0)
  const layer = revealEl.value
  if (layer) {
    layer.style.opacity = '1'
    layer.style.transform = 'scale(1)'
    layer.style.clipPath = 'inset(0% 0% 0% 0%)'
  }
}

/** 摆到「起始态」（等入场） */
function rest() {
  const layer = revealEl.value
  if (props.reveal === 'rise') {
    setGlyphY(riseDistance())
  } else if (props.reveal === 'wipe' && layer) {
    layer.style.clipPath = 'inset(0% 100% 0% 0%)'
  } else if (props.reveal === 'fade' && layer) {
    layer.style.opacity = '0'
    layer.style.transform = 'scale(1.08)'
  }
}

/** 播放入场；播完把状态落到内联样式上（避免动画对象长期挂着） */
function play() {
  stopReveal()
  const layer = revealEl.value
  if (!layer) return
  const duration = Math.max(0, props.duration) * 1000
  const stagger = Math.max(0, props.stagger) * 1000

  if (props.reveal === 'rise') {
    layer.style.opacity = '1'
    layer.style.transform = 'scale(1)'
    layer.style.clipPath = 'inset(0% 0% 0% 0%)'
    const distance = riseDistance()
    glyphEls.forEach((g, i) => {
      if (!g) return
      g.style.transform = 'translateY(0px)'
      running.push(
        g.animate(
          [{ transform: `translateY(${distance}px)` }, { transform: 'translateY(0px)' }],
          {
            duration,
            delay: i * stagger,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'both',
          },
        ),
      )
    })
    return
  }

  setGlyphY(0)

  if (props.reveal === 'wipe') {
    const anim = layer.animate(
      [{ clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }],
      { duration, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'both' },
    )
    running.push(anim)
    anim.finished
      .then(() => {
        if (!running.includes(anim)) return
        anim.cancel()
        layer.style.clipPath = 'inset(0% 0% 0% 0%)'
      })
      .catch(() => {})
    return
  }

  const anim = layer.animate(
    [{ opacity: 0, transform: 'scale(1.08)' }, { opacity: 1, transform: 'scale(1)' }],
    { duration, easing: 'ease-out', fill: 'both' },
  )
  running.push(anim)
  anim.finished
    .then(() => {
      if (!running.includes(anim)) return
      anim.cancel()
      layer.style.opacity = '1'
      layer.style.transform = 'scale(1)'
    })
    .catch(() => {})
}

/* ── 生命周期 ───────────────────────────────────────────── */

let raf = 0
let resizeObserver: ResizeObserver | null = null
let viewObserver: IntersectionObserver | null = null
let hoverCleanup: (() => void) | null = null

function onPointerMove(e: PointerEvent) {
  const root = rootEl.value
  if (!root || props.parallax <= 0) return
  const rect = root.getBoundingClientRect()
  const nx = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1
  const ny = ((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1
  offset.tx = clamp(nx, -1, 1) * -props.parallax
  offset.ty = clamp(ny, -1, 1) * -props.parallax
}

function onPointerLeave() {
  offset.tx = 0
  offset.ty = 0
}

/** 指针视差 + 空闲漂移，每帧写一次媒体层 transform */
function startFrameLoop() {
  let last = performance.now()
  let clock = 0
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    clock += dt

    const dx = Math.sin(clock * 0.21) * props.drift
    const dy = Math.cos(clock * 0.17) * props.drift * 0.6
    // 指数平滑：和目标值之间按时间收敛，帧率高低都不影响观感
    const ease = 1 - Math.exp(-dt / 0.18)
    offset.x += (offset.tx + dx - offset.x) * ease
    offset.y += (offset.ty + dy - offset.y) * ease

    place()
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
}

function applyReveal() {
  stopReveal()
  viewObserver?.disconnect()
  viewObserver = null
  hoverCleanup?.()
  hoverCleanup = null

  const root = rootEl.value
  if (!root) return

  if (props.reveal === 'none' || prefersReduced()) {
    settle()
    return
  }

  if (props.trigger === 'hover') {
    settle()
    root.addEventListener('pointerenter', play)
    hoverCleanup = () => root.removeEventListener('pointerenter', play)
    return
  }

  if (props.trigger === 'view') {
    settle()
    rest()
    viewObserver = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          play()
          viewObserver?.disconnect()
          viewObserver = null
        }
      },
      { threshold: 0.25 },
    )
    viewObserver.observe(root)
    return
  }

  play()
}

onMounted(async () => {
  await nextTick()
  const root = rootEl.value
  if (!root) return

  sync()
  resizeObserver = new ResizeObserver(() => sync())
  resizeObserver.observe(root)
  // 字体是异步加载的：字体一就位就得重新对齐裁剪形状，否则字形会错位
  if (document.fonts?.ready) document.fonts.ready.then(sync).catch(() => {})

  root.addEventListener('pointermove', onPointerMove)
  root.addEventListener('pointerleave', onPointerLeave)
  startFrameLoop()
  applyReveal()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  stopReveal()
  hoverCleanup?.()
  viewObserver?.disconnect()
  resizeObserver?.disconnect()
  const root = rootEl.value
  root?.removeEventListener('pointermove', onPointerMove)
  root?.removeEventListener('pointerleave', onPointerLeave)
})

// 文案 / 排版相关变了要重新对齐裁剪形状
watch(
  [words, () => props.tag, () => props.align, () => props.weight, () => props.tracking, () => props.lineHeight, () => props.textScale],
  async () => {
    await nextTick()
    sync()
  },
)

// 入场相关的变了就重播
watch([() => props.reveal, () => props.trigger, () => props.duration, () => props.stagger, words], async () => {
  await nextTick()
  sync()
  applyReveal()
})
</script>

<template>
  <component :is="tag" ref="rootEl" class="masked-heading" :style="rootStyle">
    <!-- 量字形：真文字，透明；只用来撑布局 + 给出每个词的坐标 -->
    <span ref="measureEl" class="masked-heading__measure">
      <span
        v-for="(word, i) in words"
        :key="`${word}-${i}`"
        :ref="el => setWordEl(el, i)"
        class="masked-heading__word"
      >{{ word }}<i :ref="el => setBaseEl(el, i)" class="masked-heading__baseline" /></span>
    </span>

    <!-- 裁剪形状：与量字形逐词对齐的 SVG 文字 -->
    <svg class="masked-heading__defs" aria-hidden="true" focusable="false">
      <defs>
        <clipPath :id="clipId" clipPathUnits="userSpaceOnUse">
          <text v-for="(word, i) in words" :key="`${word}-${i}`" :ref="el => setGlyphEl(el, i)">{{ word }}</text>
        </clipPath>
      </defs>
    </svg>

    <!-- 媒体层：被上面的裁剪形状切成字母 -->
    <span ref="revealEl" class="masked-heading__reveal">
      <span class="masked-heading__clip" :style="{ clipPath: `url(#${clipId})` }">
        <span ref="mediaEl" class="masked-heading__media">
          <video
            v-if="mediaType === 'video'"
            class="masked-heading__source"
            :src="src"
            :poster="poster"
            autoplay
            muted
            loop
            playsinline
          />
          <img v-else class="masked-heading__source" :src="src" alt="" draggable="false" />
        </span>
      </span>
    </span>
  </component>
</template>

<style scoped>
.masked-heading {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
  text-wrap: balance;
  -webkit-font-smoothing: antialiased;
}

.masked-heading__measure {
  color: transparent;
}

.masked-heading__word {
  display: inline-block;
  white-space: pre;
}

.masked-heading__word:not(:last-child)::after {
  content: ' ';
}

.masked-heading__baseline {
  display: inline-block;
  width: 0;
  height: 0;
}

.masked-heading__defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.masked-heading__reveal {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
}

.masked-heading__clip {
  position: absolute;
  inset: 0;
  display: block;
}

.masked-heading__media {
  position: absolute;
  inset: 0;
  display: block;
  will-change: transform, filter;
}

.masked-heading__source {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
