<script setup lang="ts">
/**
 * Falling Text —— 掉落文字：整段文字按词拆开，触发后「掉下来」弹跳、翻滚，还能用鼠标拖着玩
 *
 * 移植自 React Bits 的 Falling Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/falling-text
 * 原版依赖 **matter-js**：把每个词做成一个矩形刚体（重力 / 弹跳 0.8 / 空气阻力 0.01 / 摩擦 0.2），
 * 四周加四面不可见的静态墙，再用 MouseConstraint 拖拽，最后每帧把 `body.position / angle` 写回 DOM。
 *
 * 本实现**不引 matter-js**，用自研的 `mini-physics.ts`（SAT + 顶点接触 + 冲量解算）
 * 实现同一套效果，常量与 matter-js 对齐，所以 `gravity` / `mouseConstraintStiffness` 的手感一致。
 * 其它差异：
 *   · CJK 没有空格 → 按词切完再把 CJK 拆成单字（否则整句是一个巨大的刚体，掉不下来也翻不动）
 *   · 容器尺寸变化会重新量一次（上游不处理 resize）
 *   · `prefers-reduced-motion: reduce` 时不动，词就留在原位
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  applyMouseSpring,
  createRect,
  pointInBody,
  stepWorld,
  toLocal,
  verticesOf,
  STEP,
  type RectBody,
} from './mini-physics'

export type FallingTextTrigger = 'auto' | 'scroll' | 'click' | 'hover'

const props = withDefaults(
  defineProps<{
    /** 要掉下来的文字 */
    text?: string
    /** 这些词（按前缀匹配）会加上高亮样式 */
    highlightWords?: string[]
    /** 高亮的类名（默认类在组件内定义，也可以传自己的类名） */
    highlightClass?: string
    /** 何时开始掉：自动 / 滚入视口 / 点击 / 悬停 */
    trigger?: FallingTextTrigger
    /** 物理世界画布的背景色（默认透明） */
    backgroundColor?: string
    /** 画出刚体线框（调试用） */
    wireframes?: boolean
    /** 重力倍数 */
    gravity?: number
    /** 鼠标拖拽的弹簧刚度（0~1，越大越跟手） */
    mouseConstraintStiffness?: number
    /** 掉之前的字号 */
    fontSize?: string
    /** 词与词之间的横向间距 */
    wordSpacing?: string
  }>(),
  {
    text: '',
    highlightWords: () => [],
    highlightClass: 'highlighted',
    trigger: 'auto',
    backgroundColor: 'transparent',
    wireframes: false,
    gravity: 1,
    mouseConstraintStiffness: 0.2,
    fontSize: '1rem',
    wordSpacing: '2px',
  },
)

/* ── 切词：按空格分，CJK 再拆成单字 ─────────────────────── */

/** CJK（含中日文标点 / 全角符号 / 假名）没有空格，会被当成一个词 → 拆成单字 */
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

interface Word {
  text: string
  highlight: boolean
}

const words = computed<Word[]>(() => {
  const text = String(props.text ?? '')
  const out: Word[] = []
  for (const chunk of text.split(/\s+/).filter(Boolean)) {
    for (const part of splitCjk(chunk)) {
      out.push({
        text: part,
        highlight: props.highlightWords.some(hw => hw && part.startsWith(hw)),
      })
    }
  }
  return out
})

/* ── 模板引用 / 状态 ───────────────────────────────────── */

const containerRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const wordEls: (HTMLElement | null)[] = []
function setWordEl(el: Element | null, index: number) {
  wordEls[index] = (el as HTMLElement | null) ?? null
}

const started = ref(false)

/** 词块刚体（后面跟着四面墙，拖拽时只遍历前面的词） */
let bodies: RectBody[] = []
let wordCount = 0
let worldWidth = 0
let worldHeight = 0
let raf = 0
let accumulator = 0
let lastFrame = 0
let dragging: { body: RectBody; local: [number, number] } | null = null
let pointer = { x: 0, y: 0 }
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let themeObserver: MutationObserver | null = null
let wireColor = '#3b82f6'
const teardowns: (() => void)[] = []

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 线框颜色要真实色值（canvas 不认 var()），所以从主题变量解析出来并跟着主题更新 */
function resolveWireColor() {
  if (typeof document === 'undefined') return
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()
  wireColor = raw || '#3b82f6'
}

/* ── 画布 ─────────────────────────────────────────────── */

function sizeCanvas() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return
  const dpr = window.devicePixelRatio || 1
  const rect = container.getBoundingClientRect()
  canvas.width = Math.max(1, Math.round(rect.width * dpr))
  canvas.height = Math.max(1, Math.round(rect.height * dpr))
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
}

function drawWireframe() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const width = canvas.width / dpr
  const height = canvas.height / dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  if (!props.wireframes) return
  ctx.strokeStyle = wireColor
  ctx.lineWidth = 1
  for (const b of bodies) {
    ctx.save()
    ctx.translate(b.x, b.y)
    ctx.rotate(b.angle)
    ctx.strokeRect(-b.halfW, -b.halfH, b.halfW * 2, b.halfH * 2)
    ctx.restore()
  }
}

/* ── 渲染 ─────────────────────────────────────────────── */

function render() {
  for (let i = 0; i < wordCount; i += 1) {
    const el = wordEls[i]
    const body = bodies[i]
    if (!el || !body) continue
    el.style.left = `${body.x}px`
    el.style.top = `${body.y}px`
    el.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`
  }
  drawWireframe()
}

/* ── 物理循环 ─────────────────────────────────────────── */

function tick() {
  if (dragging) {
    applyMouseSpring(
      dragging.body,
      dragging.local[0],
      dragging.local[1],
      pointer.x,
      pointer.y,
      props.mouseConstraintStiffness,
    )
  }
  stepWorld(bodies, props.gravity)
  keepInside()
}

/**
 * 兜底：把每个词的四个角夹回容器内。
 * 正常情况根本不会触发（四面墙够厚），但一旦有词真的跑到世界外面，
 * 它就会永远消失 —— 宁可当成“贴边”，也别丢词。
 */
function keepInside() {
  for (let i = 0; i < wordCount; i += 1) {
    const body = bodies[i]
    if (!body) continue
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const v of verticesOf(body)) {
      if (v[0] < minX) minX = v[0]
      if (v[0] > maxX) maxX = v[0]
      if (v[1] < minY) minY = v[1]
      if (v[1] > maxY) maxY = v[1]
    }
    let dx = 0
    let dy = 0
    if (maxX > worldWidth) dx = worldWidth - maxX
    if (minX + dx < 0) dx = -minX
    if (maxY > worldHeight) dy = worldHeight - maxY
    if (minY + dy < 0) dy = -minY
    if (dx) {
      body.x += dx
      body.vx = 0
    }
    if (dy) {
      body.y += dy
      body.vy = 0
    }
  }
}

function frame(now: number) {
  raf = requestAnimationFrame(frame)
  let delta = now - lastFrame
  lastFrame = now
  if (!Number.isFinite(delta) || delta < 0) delta = STEP
  // 标签页切回来时不要一次性补太多步
  if (delta > 120) delta = 120
  accumulator += delta
  let steps = 0
  while (accumulator >= STEP && steps < 5) {
    tick()
    accumulator -= STEP
    steps += 1
  }
  render()
}

/* ── 指针交互（鼠标弹簧拖拽） ──────────────────────────── */

function pointFromEvent(e: PointerEvent | MouseEvent) {
  const container = containerRef.value
  if (!container) return { x: 0, y: 0 }
  const rect = container.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onPointerDown(e: PointerEvent) {
  const container = containerRef.value
  if (!container || !wordCount) return
  const p = pointFromEvent(e)
  pointer = p
  // 从后往前找（后画的在上层）
  for (let i = wordCount - 1; i >= 0; i -= 1) {
    const body = bodies[i]
    if (pointInBody(body, p.x, p.y)) {
      dragging = { body, local: toLocal(body, p.x, p.y) }
      // 合成事件里的 pointerId 不是活跃指针，捕获会抛错 —— 捕获失败不影响拖拽本身
      try {
        container.setPointerCapture?.(e.pointerId)
      } catch {
        /* ignore */
      }
      break
    }
  }
}

function onPointerMove(e: PointerEvent) {
  const p = pointFromEvent(e)
  pointer = p
  if (dragging) e.preventDefault()
}

function onPointerUp() {
  dragging = null
}

/* ── 启动 / 拆除 ──────────────────────────────────────── */

function teardown() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  accumulator = 0
  dragging = null
  resizeObserver?.disconnect()
  resizeObserver = null
  while (teardowns.length) teardowns.pop()?.()
  bodies = []
  wordCount = 0
  // 词块回到普通文档流（否则停掉的词会一直悬在上一轮的位置）
  for (const el of wordEls) {
    if (!el) continue
    el.style.position = ''
    el.style.left = ''
    el.style.top = ''
    el.style.transform = ''
    el.style.willChange = ''
  }
}

async function setup() {
  teardown()
  const container = containerRef.value
  if (!container) return
  if (reduceMotion()) return

  await nextTick()
  const rect = container.getBoundingClientRect()
  // 绝对定位子项的包含块是容器的**内边距盒**（border box 往内缩一个边框宽），
  // 而词块是直接子项、写的是 left/top，所以测量基准也要取内边距盒的左上角
  const style = getComputedStyle(container)
  const originX = rect.left + (parseFloat(style.borderLeftWidth) || 0)
  const originY = rect.top + (parseFloat(style.borderTopWidth) || 0)
  const width = rect.width
  const height = rect.height
  if (width <= 0 || height <= 0) return

  const els = wordEls.slice(0, words.value.length).filter((el): el is HTMLElement => !!el)
  if (!els.length) return

  // 强制重排，保证量到的是「掉下来之前」的排布（teardown 已经把定位清掉）
  void container.offsetHeight

  // ⚠️ 必须**先全部量完**再改成绝对定位：
  // 边量边改的话，第一个词一旦脱离文档流，后面的词会立刻重新排版
  // （内联块塌成 0 宽）—— 实测第 2 个之后的位置全是错的，词会叠在一起。
  const rects = els.map(el => el.getBoundingClientRect())

  bodies = els.map((el, index) => {
    const r = rects[index]
    const body = createRect(r.left - originX + r.width / 2, r.top - originY + r.height / 2, r.width, r.height, {
      vx: (Math.random() - 0.5) * 5,
      vy: 0,
      av: (Math.random() - 0.5) * 0.05,
      restitution: 0.8,
      friction: 0.2,
      frictionAir: 0.01,
    })
    el.style.position = 'absolute'
    el.style.willChange = 'transform'
    return body
  })
  wordCount = bodies.length

  // 四面不可见的静态墙。比上游（matter 里一律 50 厚）**厚得多**：
  // 墙太薄时，词高速扔进墙里一旦越过墙的中线，SAT 的最小分离轴会翻转、
  // 反而把它从世界的**外侧**顶出去（顶到天花板上方就再也回不来了）。
  const boundary = { isStatic: true, restitution: 0, friction: 0.1 }
  const THICK = 400
  const SPAN = 400
  bodies.push(
    createRect(width / 2, height + THICK / 2, width + SPAN, THICK, boundary),
    createRect(-THICK / 2, height / 2, THICK, height + SPAN, boundary),
    createRect(width + THICK / 2, height / 2, THICK, height + SPAN, boundary),
    createRect(width / 2, -THICK / 2, width + SPAN, THICK, boundary),
  )
  worldWidth = width
  worldHeight = height

  sizeCanvas()
  render()

  resizeObserver = new ResizeObserver(() => {
    sizeCanvas()
    drawWireframe()
  })
  resizeObserver.observe(container)

  // 拖拽监听挂在**容器**上（和上游 `Mouse.create(container)` 一致）：
  // 画布是 pointer-events: none 的，点不到；而词块就在容器里，点上去会冒泡上来
  {
    const onDown = (e: PointerEvent) => onPointerDown(e)
    const onMove = (e: PointerEvent) => onPointerMove(e)
    const onUp = () => onPointerUp()
    container.addEventListener('pointerdown', onDown)
    container.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    teardowns.push(() => {
      container.removeEventListener('pointerdown', onDown)
      container.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    })
  }

  lastFrame = performance.now()
  raf = requestAnimationFrame(frame)
}

function start() {
  if (started.value) return
  started.value = true
  void setup()
}

function onTriggerClick() {
  if (props.trigger === 'click') start()
}

function onTriggerHover() {
  if (props.trigger === 'hover') start()
}

function arm() {
  intersectionObserver?.disconnect()
  intersectionObserver = null
  started.value = false
  if (props.trigger === 'auto') start()
  else if (props.trigger === 'scroll' && containerRef.value) {
    intersectionObserver = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          start()
          intersectionObserver?.disconnect()
          intersectionObserver = null
        }
      },
      { threshold: 0.1 },
    )
    intersectionObserver.observe(containerRef.value)
  }
}

onMounted(() => {
  resolveWireColor()
  if (typeof MutationObserver !== 'undefined' && document.documentElement) {
    themeObserver = new MutationObserver(() => {
      resolveWireColor()
      drawWireframe()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] })
  }
  arm()
})

onBeforeUnmount(() => {
  teardown()
  intersectionObserver?.disconnect()
  themeObserver?.disconnect()
  themeObserver = null
})

// 影响排版的参数变了要重新量一次；重力 / 刚度 / 线框颜色都是每步实时读的，不用重建
watch(
  [
    () => props.text,
    () => props.fontSize,
    () => props.wordSpacing,
    () => props.highlightWords.join('\u0001'),
  ],
  () => {
    if (started.value) void setup()
  },
)

watch(
  () => props.trigger,
  () => {
    teardown()
    arm()
  },
)

defineExpose({
  /** 重新掉一次（等价于重新挂载；上游 demo 是用 forceRerender 做的） */
  replay: () => {
    started.value = true
    void setup()
  },
})
</script>

<template>
  <div
    ref="containerRef"
    class="falling-text"
    @click="onTriggerClick"
    @mouseenter="onTriggerHover"
  >
    <div ref="textRef" class="falling-text__text" :style="{ fontSize, lineHeight: 1.4 }">
      <template v-for="(word, index) in words" :key="`${index}-${word.text}`">
        <span
          :ref="el => setWordEl(el, index)"
          class="falling-text__word"
          :class="word.highlight ? highlightClass : ''"
          :style="{ margin: `0 ${wordSpacing}` }"
        >{{ word.text }}</span>
        <template v-if="index < words.length - 1">{{ ' ' }}</template>
      </template>
    </div>
    <canvas ref="canvasRef" class="falling-text__canvas" :style="{ background: backgroundColor }" aria-hidden="true" />
  </div>
</template>

<style scoped>
.falling-text {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  /* 父级没给高度时的兜底，否则 overflow: hidden 会把文字整个裁掉 */
  min-height: 160px;
  padding-top: 2em;
  overflow: hidden;
  cursor: pointer;
  text-align: center;
  /* 拖拽时不要跟着滚页面（指针事件在触摸端需要显式关掉默认手势） */
  touch-action: none;
}

.falling-text__text {
  display: inline-block;
  /* 这里**不能**写 position（它会变成词块的包含块，把词整体推乱）——
     词块要靠 .falling-text 当包含块，所以层级交给画布用 z-index: -1 压下去 */
}

.falling-text__word {
  display: inline-block;
  user-select: none;
}

/* 默认高亮样式（上游是 color: cyan + bold）；传 highlightClass 可以换成自己的类 */
.highlighted {
  color: var(--color-primary, #06b6d4);
  font-weight: 700;
}

.falling-text__canvas {
  position: absolute;
  top: 0;
  left: 0;
  /* -1：画布（背景色 / 线框）压在词块下面，但仍在容器背景之上 */
  z-index: -1;
  pointer-events: none;
}
</style>
