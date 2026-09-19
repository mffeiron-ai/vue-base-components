<script setup lang="ts">
/**
 * Particle Text —— 文字被采样成粒子，从散开状态聚合成字形
 *
 * 移植自 React Bits 的 Particle Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/particle-text
 * 原版就是纯 Canvas 2D、零依赖，这里 1:1 搬逻辑，只是把 React 的 hooks 换成 Vue 的
 * onMounted/watch/onBeforeUnmount。
 *
 * 原理：
 * 1. 离屏画布上把文字画出来（超宽先按比例缩小），按 `density` 步长扫像素，
 *    alpha 够高的点就是「目标位置」，每个点一个粒子；
 * 2. 粒子先散在目标点周围（角度/距离由 seed 与 depth 决定），`gatherDuration` 内
 *    用 easeOutCubic 聚拢回字形，每颗粒子再加 `seed * stagger` 的延迟；
 * 3. 成形后粒子仍有 `idleDrift` 的微弱漂移；指针进入 `repelRadius` 内会被推开
 *    （力 = (1 - d/r)² × pointerRepel），指针位置做了 0.18 的平滑，所以推开是软的；
 * 4. 颜色按粒子 x 位置在 `color` → `highlightColor` 之间插值，`glow` 用 shadowBlur 出光晕。
 *
 * 注意：`fontSize` 支持数字或 CSS 长度（默认 `clamp(3rem, 12vw, 8rem)`，是**视口**宽度相关，
 * 不是容器宽度）；`fontFamily="inherit"` 时等容器字体就位再采样，避免字形错位。
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

export type ParticleTextTrigger = 'mount' | 'hover' | 'click'

const props = withDefaults(
  defineProps<{
    /** 要被采样成粒子的文字 */
    text?: string
    /** 每颗粒子的渲染尺寸（CSS 像素） */
    particleSize?: number
    /** 采样步长：越小粒子越多 */
    density?: number
    /** 主色：任意 CSS 颜色，或 `--` 开头的 CSS 变量名（如 `--color-foreground`，会按当前主题解析） */
    color?: string
    /** 高亮色：按 x 位置在主色与它之间插值；同样支持 `--` 变量名 */
    highlightColor?: string
    /** 起始散开半径 */
    scatter?: number
    /** 聚合用的时长（毫秒） */
    gatherDuration?: number
    /** 每颗粒子的最大延迟（毫秒） */
    stagger?: number
    /** 指针排斥强度 */
    pointerRepel?: number
    /** 指针影响半径（px） */
    repelRadius?: number
    /** 成形后的静止漂移幅度（px），0 = 完全静止 */
    idleDrift?: number
    /** 首次成形后，靠什么再触发一次「散开 → 聚合」 */
    trigger?: ParticleTextTrigger
    /** 采样用的字号：数字或 CSS 长度 */
    fontSize?: number | string
    fontWeight?: number | string
    /** 采样字体，`inherit` = 跟随容器 */
    fontFamily?: string
    /** 用高亮色给粒子加一层柔和光晕 */
    glow?: boolean
  }>(),
  {
    text: 'React Bits',
    particleSize: 2,
    density: 4,
    // 默认跟随主题：`--` 开头的写法会在采样时从当前主题取真实色值，切主题会自动重聚一次
    color: '--color-foreground',
    highlightColor: '--color-primary',
    scatter: 180,
    gatherDuration: 1600,
    stagger: 420,
    pointerRepel: 40,
    repelRadius: 120,
    idleDrift: 0.7,
    trigger: 'mount',
    fontSize: 'clamp(3rem, 12vw, 8rem)',
    fontWeight: 800,
    fontFamily: 'inherit',
    glow: true,
  },
)

interface Particle {
  x: number
  y: number
  startX: number
  startY: number
  targetX: number
  targetY: number
  size: number
  color: string
  seed: number
  depth: number
  delay: number
}

const containerEl = ref<HTMLDivElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

/* ── 小工具 ─────────────────────────────────────────────── */

function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * 颜色支持两种写法：
 * · 普通 CSS 颜色：`#3b82f6` / `rgb(...)` / `oklch(...)` / 具名色
 * · `--` 开头的 CSS 变量名：如 `--color-foreground`、`--color-primary` —— 按当前主题解析，
 *   主题（或风格预设）一换，重新采样时就是新颜色
 */
function resolveColor(value: string, fallback: string): string {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  if (!raw.startsWith('--')) return raw
  const fromTheme = getComputedStyle(document.documentElement).getPropertyValue(raw).trim()
  return fromTheme || fallback
}

/** 颜色选择器/变量都可能给非 hex 值，用 1px canvas 归一化成 [r,g,b]（`currentColor` 之类无效值会返回 null） */
let probeCtx: CanvasRenderingContext2D | null = null
function toRgb(value: string): [number, number, number] | null {
  if (!probeCtx) {
    const probe = document.createElement('canvas')
    probe.width = 1
    probe.height = 1
    probeCtx = probe.getContext('2d', { willReadFrequently: true })
  }
  if (!probeCtx || !value) return null
  probeCtx.clearRect(0, 0, 1, 1)
  probeCtx.fillStyle = '#000000'
  probeCtx.fillStyle = value
  probeCtx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = probeCtx.getImageData(0, 0, 1, 1).data
  return a === 0 ? null : [r, g, b]
}
function mixRgb(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}
function rgbToCss(c: [number, number, number]) {
  return `rgb(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])})`
}

/** fontSize 允许是 CSS 长度（默认 clamp(...)）→ 量出一个 px 数值 */
function resolveFontSize(value: number | string, container: HTMLElement, weight: number | string, family: string) {
  if (typeof value === 'number') return value
  const probe = document.createElement('span')
  probe.textContent = 'M'
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.pointerEvents = 'none'
  probe.style.fontSize = value
  probe.style.fontWeight = String(weight)
  probe.style.fontFamily = family
  container.appendChild(probe)
  const size = parseFloat(window.getComputedStyle(probe).fontSize) || 96
  probe.remove()
  return size
}

/**
 * 字体没就位就采样 → 字形全错，所以等一等。
 * 但**不能无限等**：字体一直在加载（或页面在后台、字体加载被推迟）时
 * `document.fonts.ready` 可能迟迟不 resolve，那整个采样就卡死了。
 * 超时后先拿当前字体采一遍，字体真就绪了再重新采（见 mount 里的字体回调）。
 */
async function waitForFonts(font: string, timeout = 1200) {
  if (!('fonts' in document)) return
  const work = (async () => {
    try {
      await document.fonts.load(font)
    } catch {
      /* 字体加载失败也继续：退回系统兜底字体采样 */
    }
    await document.fonts.ready
  })()
  const deadline = new Promise<void>(resolve => window.setTimeout(resolve, timeout))
  await Promise.race([work, deadline])
}

/* ── 运行时状态（都不需要响应式：每帧都在改） ───────────── */

let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let animationFrame: number | null = null
/** 采样防抖的定时器。这里用 setTimeout 而不是 rAF：rAF 在后台标签页会被冻结，
    那样主题切换 / 容器尺寸变化都不会重新采样 */
let sampleTimer: number | null = null
/** 采样是异步的（等字体）；每次重采样 +1，回来发现对不上就丢弃结果 */
let buildId = 0
let gathering = false
let gatherStart = 0
let reducedMotion = false
let width = 0
let height = 0
let dpr = 1
/** 光晕色用「已解析」的值（canvas 不认 var()） */
let glowColor = '#8b5cf6'
/** 上次解析出的颜色指纹：主题观察器只靠它判断「颜色真的变了没」 */
let lastResolvedColors = ''

const pointer = { active: false, x: 0, y: 0, smoothX: 0, smoothY: 0 }

function drawParticle(target: Particle) {
  if (!ctx) return
  const size = target.size
  ctx.fillStyle = target.color
  // 小于 2px 的用方块：圆点在这个尺寸下几乎看不出圆，方块更快也更实
  if (size <= 2.1) {
    ctx.fillRect(target.x - size / 2, target.y - size / 2, size, size)
    return
  }
  ctx.beginPath()
  ctx.arc(target.x, target.y, size / 2, 0, Math.PI * 2)
  ctx.fill()
}

/* ── 聚合 ───────────────────────────────────────────────── */

function startGather(fromScatter = true) {
  if (!particles.length) return

  const now = performance.now()
  const spread = reducedMotion ? 0 : props.scatter

  particles.forEach((particle) => {
    if (fromScatter) {
      const angle = particle.seed * Math.PI * 2
      const distance = spread * (0.35 + particle.depth * 0.75)
      particle.x = particle.targetX + Math.cos(angle) * distance + (particle.depth - 0.5) * spread * 0.55
      particle.y = particle.targetY + Math.sin(angle) * distance + (particle.seed - 0.5) * spread * 0.55
    }
    particle.startX = particle.x
    particle.startY = particle.y
    particle.delay = reducedMotion ? 0 : particle.seed * props.stagger
  })

  gatherStart = now
  gathering = true
}

/* ── 渲染循环 ───────────────────────────────────────────── */

function paint(now: number) {
  const c = ctx
  if (!c) return

  c.clearRect(0, 0, width, height)

  if (props.glow && !reducedMotion) {
    c.shadowBlur = props.particleSize * 3
    c.shadowColor = glowColor
  } else {
    c.shadowBlur = 0
  }

  // 指针位置平滑：排斥是软的，不会跟着鼠标抖
  pointer.smoothX += (pointer.x - pointer.smoothX) * 0.18
  pointer.smoothY += (pointer.y - pointer.smoothY) * 0.18

  let complete = true

  for (const particle of particles) {
    let baseX = particle.targetX
    let baseY = particle.targetY
    let progress = 1

    if (gathering) {
      const local = (now - gatherStart - particle.delay) / Math.max(1, reducedMotion ? 1 : props.gatherDuration)
      progress = clamp(local, 0, 1)
      const eased = easeOutCubic(progress)
      baseX = particle.startX + (particle.targetX - particle.startX) * eased
      baseY = particle.startY + (particle.targetY - particle.startY) * eased
      if (progress < 1) complete = false
    } else if (!reducedMotion && props.idleDrift > 0) {
      const driftTime = now * 0.001
      baseX += Math.sin(driftTime * 0.9 + particle.seed * 10) * props.idleDrift * particle.depth
      baseY += Math.cos(driftTime * 0.75 + particle.depth * 10) * props.idleDrift * particle.depth
    }

    if (pointer.active && !reducedMotion && props.pointerRepel > 0 && props.repelRadius > 0) {
      const dx = baseX - pointer.smoothX
      const dy = baseY - pointer.smoothY
      const distance = Math.hypot(dx, dy)
      if (distance > 0 && distance < props.repelRadius) {
        const force = Math.pow(1 - distance / props.repelRadius, 2) * props.pointerRepel
        baseX += (dx / distance) * force
        baseY += (dy / distance) * force
      }
    }

    const follow = reducedMotion ? 1 : 0.22
    particle.x += (baseX - particle.x) * follow
    particle.y += (baseY - particle.y) * follow

    c.globalAlpha = clamp(0.35 + progress * 0.65, 0, 1)
    drawParticle(particle)
  }

  c.globalAlpha = 1
  c.shadowBlur = 0

  if (gathering && complete) gathering = false
}

/**
 * rAF 循环：每帧重画。
 * 注意「画一帧」与「调度下一帧」分开：采样结束时会直接先画一帧，
 * 这样后台标签页 / 省电模式把 rAF 节流掉时，画布上至少已经有这一帧的内容。
 */
function frame(now: number) {
  paint(now)
  animationFrame = requestAnimationFrame(frame)
}

function ensureRenderLoop() {
  if (animationFrame === null) animationFrame = requestAnimationFrame(frame)
}

/* ── 采样：文字 → 粒子目标点 ─────────────────────────────── */

async function sampleText() {
  const container = containerEl.value
  const canvas = canvasEl.value
  if (!container || !canvas) return
  ctx ??= canvas.getContext('2d')
  if (!ctx) return

  const currentBuild = ++buildId
  const rect = container.getBoundingClientRect()
  width = Math.floor(rect.width)
  height = Math.floor(rect.height)
  if (width <= 0 || height <= 0) return

  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.max(1, Math.floor(width * dpr))
  canvas.height = Math.max(1, Math.floor(height * dpr))
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const computed = window.getComputedStyle(container)
  const family = props.fontFamily === 'inherit' ? computed.fontFamily || 'sans-serif' : props.fontFamily
  let size = resolveFontSize(props.fontSize, container, props.fontWeight, family)
  let font = `${props.fontWeight} ${size}px ${family}`

  await waitForFonts(font)
  if (currentBuild !== buildId) return

  const offscreen = document.createElement('canvas')
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true })
  if (!offCtx) return

  const content = String(props.text || ' ')
  const maxTextWidth = width * 0.92
  offCtx.font = font
  let metrics = offCtx.measureText(content)
  // 太宽就整体缩小（等比缩放，比循环微调省事且结果一致）
  if (metrics.width > maxTextWidth && metrics.width > 0) {
    size = Math.max(8, size * (maxTextWidth / metrics.width))
    font = `${props.fontWeight} ${size}px ${family}`
    offCtx.font = font
    metrics = offCtx.measureText(content)
  }

  const pad = 10
  offscreen.width = Math.max(1, Math.ceil(metrics.width + pad * 2))
  offscreen.height = Math.max(1, Math.ceil(size * 1.35 + pad * 2))
  offCtx.clearRect(0, 0, offscreen.width, offscreen.height)
  offCtx.font = font
  offCtx.textAlign = 'center'
  offCtx.textBaseline = 'middle'
  offCtx.fillStyle = '#ffffff'
  offCtx.fillText(content, offscreen.width / 2, offscreen.height / 2)

  const baseRgb = toRgb(resolveColor(props.color, '#ffffff'))
  const highlightRgb = toRgb(resolveColor(props.highlightColor, '#8b5cf6'))
  glowColor = resolveColor(props.highlightColor, '#8b5cf6')
  lastResolvedColors = `${props.color}|${props.highlightColor}|${baseRgb?.join(',')}|${highlightRgb?.join(',')}`
  const data = offCtx.getImageData(0, 0, offscreen.width, offscreen.height).data
  const step = Math.max(1, Math.round(props.density))
  const offsetX = (width - offscreen.width) / 2
  const offsetY = (height - offscreen.height) / 2

  const targets: { x: number; y: number; alpha: number }[] = []
  for (let y = 0; y < offscreen.height; y += step) {
    for (let x = 0; x < offscreen.width; x += step) {
      const alpha = data[(y * offscreen.width + x) * 4 + 3] / 255
      if (alpha < 0.32) continue
      targets.push({ x: x + offsetX, y: y + offsetY, alpha })
    }
  }

  const spread = reducedMotion ? 0 : props.scatter
  particles = targets.map((target, index) => {
    const seed = Math.random()
    const depth = 0.45 + (((index * 233 + 97) % 1000) / 1000) * 0.9
    const blend = baseRgb && highlightRgb ? clamp(target.x / Math.max(1, width) + (seed - 0.5) * 0.35, 0, 1) : 0
    const particleColor = baseRgb && highlightRgb
      ? rgbToCss(mixRgb(baseRgb, highlightRgb, blend))
      : resolveColor(props.color, '#ffffff')
    const angle = seed * Math.PI * 2
    const distance = spread * (0.35 + depth * 0.75)
    const startX = target.x + Math.cos(angle) * distance + (seed - 0.5) * spread * 0.45
    const startY = target.y + Math.sin(angle) * distance + (depth - 0.9) * spread * 0.45

    return {
      x: reducedMotion ? target.x : startX,
      y: reducedMotion ? target.y : startY,
      startX,
      startY,
      targetX: target.x,
      targetY: target.y,
      size: Math.max(0.6, props.particleSize * (0.75 + target.alpha * 0.45)),
      color: particleColor,
      seed,
      depth,
      delay: seed * props.stagger,
    }
  })

  pointer.x = width / 2
  pointer.y = height / 2
  pointer.smoothX = pointer.x
  pointer.smoothY = pointer.y

  if (reducedMotion) {
    particles.forEach((particle) => {
      particle.x = particle.targetX
      particle.y = particle.targetY
      particle.startX = particle.targetX
      particle.startY = particle.targetY
      particle.delay = 0
    })
    gathering = false
  } else {
    startGather(false)
  }

  paint(performance.now())
  ensureRenderLoop()
}

/**
 * 尺寸 / 颜色变化都会连发很多次，把采样合并到下一拍。
 * 用定时器而非 rAF：后台标签页里 rAF 不跑，会让重新采样彻底不执行。
 */
function queueSample() {
  if (sampleTimer !== null) window.clearTimeout(sampleTimer)
  sampleTimer = window.setTimeout(() => {
    sampleTimer = null
    void sampleText()
  }, 16)
}

/* ── 指针交互 ───────────────────────────────────────────── */

function setPointer(event: PointerEvent) {
  const canvas = canvasEl.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  pointer.x = event.clientX - rect.left
  pointer.y = event.clientY - rect.top
  pointer.active = true
}

function handlePointerEnter(event: PointerEvent) {
  setPointer(event)
  if (props.trigger === 'hover') startGather(true)
}

function handlePointerLeave() {
  pointer.active = false
}

function handleClick() {
  if (props.trigger === 'click') startGather(true)
}

function handleReducedMotionChange(event: MediaQueryListEvent) {
  reducedMotion = event.matches
  void sampleText()
}

let reduceMotionQuery: MediaQueryList | null = null
let resizeObserver: ResizeObserver | null = null
let themeObserver: MutationObserver | null = null
/** 字体真的就绪后重采一次（前面可能走得是超时兑底那一路），只重采一次 */
let fontsResampled = false

/**
 * 主题 / 风格切换时：颜色确实变了才重采。
 * 不比对指纹的话，页面上任何一处 <style> 注入（HMR、第三方组件）都会让文字重新聚一遍。
 */
function handleThemeMaybeChanged() {
  const next = `${props.color}|${props.highlightColor}|${resolveColor(props.color, '')}|${resolveColor(props.highlightColor, '')}`
  if (next === lastResolvedColors) return
  lastResolvedColors = next
  queueSample()
}

onMounted(() => {
  const container = containerEl.value
  const canvas = canvasEl.value
  if (!container || !canvas) return

  reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  canvas.addEventListener('pointerenter', handlePointerEnter)
  canvas.addEventListener('pointermove', setPointer)
  canvas.addEventListener('pointerleave', handlePointerLeave)
  canvas.addEventListener('click', handleClick)

  reduceMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null
  reduceMotionQuery?.addEventListener('change', handleReducedMotionChange)

  resizeObserver = new ResizeObserver(queueSample)
  resizeObserver.observe(container)

  // 颜色可能写成 `--color-primary`：主题 / 风格一变就得用新色重新采样
  themeObserver = new MutationObserver(handleThemeMaybeChanged)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] })
  if (document.head) themeObserver.observe(document.head, { childList: true, subtree: true, characterData: true })

  void sampleText()
  // 字体后到就重采：可能上次走的是超时兑底（拿兑底字体算的粒子）
  document.fonts?.ready
    .then(() => {
      if (fontsResampled) return
      fontsResampled = true
      queueSample()
    })
    .catch(() => {})
})

onBeforeUnmount(() => {
  // buildId +1：正在等字体的那次采样回来会发现版本对不上，自己退出
  buildId += 1
  resizeObserver?.disconnect()
  resizeObserver = null
  themeObserver?.disconnect()
  themeObserver = null
  reduceMotionQuery?.removeEventListener('change', handleReducedMotionChange)
  const canvas = canvasEl.value
  canvas?.removeEventListener('pointerenter', handlePointerEnter)
  canvas?.removeEventListener('pointermove', setPointer)
  canvas?.removeEventListener('pointerleave', handlePointerLeave)
  canvas?.removeEventListener('click', handleClick)
  if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
  if (sampleTimer !== null) window.clearTimeout(sampleTimer)
  animationFrame = null
  sampleTimer = null
})

// 采样相关的变了就重新采样；聚合相关的（gatherDuration / stagger / drift / repel）每帧现读，不用重来
watch(
  [
    () => props.text,
    () => props.particleSize,
    () => props.density,
    () => props.color,
    () => props.highlightColor,
    () => props.scatter,
    () => props.fontSize,
    () => props.fontWeight,
    () => props.fontFamily,
  ],
  queueSample,
)
</script>

<template>
  <div
    ref="containerEl"
    class="relative block h-full min-h-[240px] w-full touch-none overflow-hidden"
    :aria-label="text"
  >
    <canvas ref="canvasEl" class="absolute inset-0 block size-full" aria-hidden="true" />
    <span class="sr-only">{{ text }}</span>
  </div>
</template>
