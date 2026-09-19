<script setup lang="ts">
/**
 * Fuzzy Text —— 毛刺文字：把文字光栅化到离屏 canvas，再**逐行（或逐列）**按强度随机错位重绘
 *
 * 移植自 React Bits 的 Fuzzy Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/fuzzy-text
 * 原版是 React + canvas：先把文字画到离屏 canvas，再在 rAF 循环里按 `intensity × fuzzRange` 的
 * 幅度给每一行（horizontal）或每一列（vertical）随机位移。这里逐行照搬这套算法。
 *
 * 与上游的差别：
 *   · 颜色参数接受 `--color-*` 变量名（画布需要真实色值，所以用 getComputedStyle 解析），主题切换后自动重绘
 *   · 支持 devicePixelRatio（上游只有 1x backing store，高分屏上字会糊）
 *   · 挂载后先同步画一帧，后台标签页里 rAF 被冻结也不至于一片空白
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export type FuzzyTextDirection = 'horizontal' | 'vertical' | 'both'

const props = withDefaults(
  defineProps<{
    /** 文案（对应上游的 children） */
    text?: string
    /** 字号：数字按 px，也接受任意 CSS 长度（含 clamp） */
    fontSize?: number | string
    fontWeight?: string | number
    /** `inherit` 表示沿用画布的 computed font-family */
    fontFamily?: string
    /** 文字颜色；传 `--color-*` 变量名会跟随主题 */
    color?: string
    /** 传 2 个以上颜色则用水平渐变（同样支持 `--color-*`） */
    gradient?: string[]
    /** 是否启用悬停加强 */
    enableHover?: boolean
    /** 静止时的毛刺强度 */
    baseIntensity?: number
    /** 悬停时的毛刺强度 */
    hoverIntensity?: number
    /** 最大位移像素 */
    fuzzRange?: number
    /** 帧率上限（降低可省 CPU） */
    fps?: number
    /** 位移方向 */
    direction?: FuzzyTextDirection
    /** 强度切换的过渡帧数（0 = 立即） */
    transitionDuration?: number
    /** 点击时瞬间拉到最大强度 */
    clickEffect?: boolean
    /** 周期性随机强度尖峰（故障感） */
    glitchMode?: boolean
    /** 故障间隔（毫秒） */
    glitchInterval?: number
    /** 每次故障持续（毫秒） */
    glitchDuration?: number
    /** 字符额外间距（px） */
    letterSpacing?: number
  }>(),
  {
    text: '404',
    fontSize: 'clamp(2rem, 8vw, 8rem)',
    fontWeight: 900,
    fontFamily: 'inherit',
    // 上游默认 #fff；这里换成主题 token
    color: '--color-foreground',
    enableHover: true,
    baseIntensity: 0.18,
    hoverIntensity: 0.5,
    fuzzRange: 30,
    fps: 60,
    direction: 'horizontal',
    transitionDuration: 0,
    clickEffect: false,
    glitchMode: false,
    glitchInterval: 2000,
    glitchDuration: 200,
    letterSpacing: 0,
  },
)

const canvasRef = ref<HTMLCanvasElement | null>(null)

/** 画布要真实色值：`--color-x` 用 getComputedStyle 解析，其它原样返回 */
function resolveColor(value: string | undefined, fallback: string) {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  if (!raw.startsWith('--')) return raw
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(raw).trim()
  return resolved || fallback
}

let teardown: (() => void) | null = null
let themeObserver: MutationObserver | null = null
let resizeTimer: number | null = null

function queueSetup() {
  if (resizeTimer !== null) window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    resizeTimer = null
    setup()
  }, 150)
}

async function setup() {
  teardown?.()
  teardown = null

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let cancelled = false
  let animationFrameId = 0
  let glitchTimeoutId: number | null = null
  let glitchEndTimeoutId: number | null = null
  let clickTimeoutId: number | null = null

  const stop = () => {
    cancelled = true
    window.cancelAnimationFrame(animationFrameId)
    if (glitchTimeoutId !== null) window.clearTimeout(glitchTimeoutId)
    if (glitchEndTimeoutId !== null) window.clearTimeout(glitchEndTimeoutId)
    if (clickTimeoutId !== null) window.clearTimeout(clickTimeoutId)
    glitchTimeoutId = glitchEndTimeoutId = clickTimeoutId = null
  }
  teardown = stop

  const computedFontFamily =
    props.fontFamily === 'inherit' ? window.getComputedStyle(canvas).fontFamily || 'sans-serif' : props.fontFamily
  const fontSizeStr = typeof props.fontSize === 'number' ? `${props.fontSize}px` : String(props.fontSize)
  const fontString = `${props.fontWeight} ${fontSizeStr} ${computedFontFamily}`

  // 字体就绪前光栅化会量错宽度（加超时兜底，别把页面卡住）
  await Promise.race([
    document.fonts?.load(fontString).then(() => document.fonts.ready).catch(() => document.fonts?.ready) ?? Promise.resolve(),
    new Promise(resolve => window.setTimeout(resolve, 1500)),
  ]).catch(() => {})
  if (cancelled) return

  let numericFontSize: number
  if (typeof props.fontSize === 'number') {
    numericFontSize = props.fontSize
  } else {
    const temp = document.createElement('span')
    temp.style.fontSize = fontSizeStr
    temp.style.position = 'absolute'
    temp.style.visibility = 'hidden'
    document.body.appendChild(temp)
    numericFontSize = Number.parseFloat(window.getComputedStyle(temp).fontSize) || 96
    document.body.removeChild(temp)
  }

  const text = String(props.text ?? '')
  const offscreen = document.createElement('canvas')
  const offCtx = offscreen.getContext('2d')
  if (!offCtx) return

  const fuzzRange = Math.max(0, Number(props.fuzzRange) || 0)
  const letterSpacing = Number(props.letterSpacing) || 0
  const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1))

  offCtx.font = fontString
  offCtx.textBaseline = 'alphabetic'

  let totalWidth = 0
  if (letterSpacing !== 0) {
    for (const char of Array.from(text)) totalWidth += offCtx.measureText(char).width + letterSpacing
    totalWidth -= letterSpacing
  } else {
    totalWidth = offCtx.measureText(text).width
  }

  const metrics = offCtx.measureText(text)
  const actualLeft = metrics.actualBoundingBoxLeft ?? 0
  const actualRight = letterSpacing !== 0 ? totalWidth : (metrics.actualBoundingBoxRight ?? metrics.width)
  const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize
  const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2

  const textBoundingWidth = Math.ceil(letterSpacing !== 0 ? totalWidth : actualLeft + actualRight)
  const tightHeight = Math.ceil(actualAscent + actualDescent)

  const extraWidthBuffer = 10
  const offscreenWidth = textBoundingWidth + extraWidthBuffer
  const xOffset = extraWidthBuffer / 2

  offscreen.width = Math.ceil(offscreenWidth * dpr)
  offscreen.height = Math.ceil(tightHeight * dpr)
  offCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  offCtx.font = fontString
  offCtx.textBaseline = 'alphabetic'

  const gradientStops = (props.gradient ?? []).filter(stop => String(stop ?? '').trim().length > 0)
  if (gradientStops.length >= 2) {
    const grad = offCtx.createLinearGradient(0, 0, offscreenWidth, 0)
    gradientStops.forEach((stop, index) => {
      grad.addColorStop(index / (gradientStops.length - 1), resolveColor(stop, 'currentColor'))
    })
    offCtx.fillStyle = grad
  } else {
    offCtx.fillStyle = resolveColor(props.color, '#fff')
  }

  if (letterSpacing !== 0) {
    let xPos = xOffset
    for (const char of Array.from(text)) {
      offCtx.fillText(char, xPos, actualAscent)
      xPos += offCtx.measureText(char).width + letterSpacing
    }
  } else {
    offCtx.fillText(text, xOffset - actualLeft, actualAscent)
  }

  const direction = props.direction
  const horizontalMargin = fuzzRange + 20
  const verticalMargin = direction === 'vertical' || direction === 'both' ? fuzzRange + 10 : 0
  const canvasCssWidth = offscreenWidth + horizontalMargin * 2
  const canvasCssHeight = tightHeight + verticalMargin * 2

  canvas.width = Math.ceil(canvasCssWidth * dpr)
  canvas.height = Math.ceil(canvasCssHeight * dpr)
  canvas.style.width = `${canvasCssWidth}px`
  canvas.style.height = `${canvasCssHeight}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.translate(horizontalMargin, verticalMargin)

  const interactiveLeft = horizontalMargin + xOffset
  const interactiveTop = verticalMargin
  const interactiveRight = interactiveLeft + textBoundingWidth
  const interactiveBottom = interactiveTop + tightHeight

  let isHovering = false
  let isClicking = false
  let isGlitching = false
  let currentIntensity = props.baseIntensity
  let targetIntensity = props.baseIntensity
  let lastFrameTime = 0
  const frameDuration = 1000 / Math.max(1, Number(props.fps) || 60)

  const startGlitchLoop = () => {
    if (!props.glitchMode || cancelled) return
    glitchTimeoutId = window.setTimeout(() => {
      if (cancelled) return
      isGlitching = true
      glitchEndTimeoutId = window.setTimeout(() => {
        isGlitching = false
        startGlitchLoop()
      }, Math.max(0, Number(props.glitchDuration) || 0))
    }, Math.max(0, Number(props.glitchInterval) || 0))
  }
  if (props.glitchMode) startGlitchLoop()

  /** 画一帧（含强度推进），抽出来是为了「挂载后先同步画一帧」 */
  const frame = (timestamp: number) => {
    const clearRange = {
      x: -fuzzRange - 20,
      y: -fuzzRange - 10,
      w: offscreenWidth + 2 * (fuzzRange + 20),
      h: tightHeight + 2 * (fuzzRange + 10),
    }
    ctx.clearRect(clearRange.x, clearRange.y, clearRange.w, clearRange.h)

    if (isClicking || isGlitching) targetIntensity = 1
    else if (isHovering) targetIntensity = props.hoverIntensity
    else targetIntensity = props.baseIntensity

    const transitionFrames = Number(props.transitionDuration) || 0
    if (transitionFrames > 0) {
      const step = 1 / (transitionFrames / frameDuration)
      if (currentIntensity < targetIntensity) currentIntensity = Math.min(currentIntensity + step, targetIntensity)
      else if (currentIntensity > targetIntensity) currentIntensity = Math.max(currentIntensity - step, targetIntensity)
    } else {
      currentIntensity = targetIntensity
    }

    if (direction === 'horizontal') {
      for (let j = 0; j < tightHeight; j++) {
        const dx = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange)
        // 源也按行取（dpr 放大后的 1 行）
        ctx.drawImage(offscreen, 0, j * dpr, offscreen.width, dpr, dx, j, offscreenWidth, 1)
      }
    } else if (direction === 'vertical') {
      for (let i = 0; i < offscreenWidth; i++) {
        const dy = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange)
        ctx.drawImage(offscreen, i * dpr, 0, dpr, offscreen.height, i, dy, 1, tightHeight)
      }
    } else {
      for (let j = 0; j < tightHeight; j++) {
        const dx = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange)
        const dy = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange * 0.5)
        ctx.drawImage(offscreen, 0, j * dpr, offscreen.width, dpr, dx, j + dy, offscreenWidth, 1)
      }
    }
    void timestamp
  }

  const run = (timestamp: number) => {
    if (cancelled) return
    if (timestamp - lastFrameTime < frameDuration) {
      animationFrameId = window.requestAnimationFrame(run)
      return
    }
    lastFrameTime = timestamp
    frame(timestamp)
    animationFrameId = window.requestAnimationFrame(run)
  }

  // 先同步画一帧：后台标签页里 rAF 被冻结也不至于空白
  frame(0)
  animationFrameId = window.requestAnimationFrame(run)

  const isInsideTextArea = (x: number, y: number) =>
    x >= interactiveLeft && x <= interactiveRight && y >= interactiveTop && y <= interactiveBottom

  const handleMouseMove = (event: MouseEvent) => {
    if (!props.enableHover) return
    const rect = canvas.getBoundingClientRect()
    isHovering = isInsideTextArea(event.clientX - rect.left, event.clientY - rect.top)
  }
  const handleMouseLeave = () => { isHovering = false }
  const handleClick = () => {
    if (!props.clickEffect) return
    isClicking = true
    if (clickTimeoutId !== null) window.clearTimeout(clickTimeoutId)
    clickTimeoutId = window.setTimeout(() => { isClicking = false }, 150)
  }
  const handleTouchMove = (event: TouchEvent) => {
    if (!props.enableHover) return
    event.preventDefault()
    const rect = canvas.getBoundingClientRect()
    const touch = event.touches[0]
    if (!touch) return
    isHovering = isInsideTextArea(touch.clientX - rect.left, touch.clientY - rect.top)
  }
  const handleTouchEnd = () => { isHovering = false }

  if (props.enableHover) {
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)
  }
  if (props.clickEffect) canvas.addEventListener('click', handleClick)

  const previousTeardown = teardown
  teardown = () => {
    previousTeardown?.()
    if (props.enableHover) {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
    if (props.clickEffect) canvas.removeEventListener('click', handleClick)
  }
}

/** 影响光栅化的参数（文案/字体/尺寸/间距/方向/颜色/渐变）变了就整体重建 */
const rasterKey = computed(() =>
  JSON.stringify([
    props.text,
    String(props.fontSize),
    String(props.fontWeight),
    props.fontFamily,
    props.color,
    props.gradient ?? null,
    props.letterSpacing,
    props.fuzzRange,
    props.direction,
  ]),
)

onMounted(() => {
  setup()
  // 窗口尺寸变化：clamp 字号与 devicePixelRatio 都可能变，需要重新光栅化（防抖）
  window.addEventListener('resize', queueSetup)
  // 主题切换：颜色变量变了要重绘（画布存的是解析后的真实色值）
  themeObserver = new MutationObserver(() => setup())
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] })
})

watch(rasterKey, () => setup())

onBeforeUnmount(() => {
  window.removeEventListener('resize', queueSetup)
  if (resizeTimer !== null) window.clearTimeout(resizeTimer)
  teardown?.()
  teardown = null
  themeObserver?.disconnect()
  themeObserver = null
})

defineExpose({ refresh: setup })
</script>

<template>
  <canvas
    ref="canvasRef"
    class="fuzzy-text"
    role="img"
    :aria-label="text"
  />
</template>

<style scoped>
.fuzzy-text {
  display: inline-block;
  vertical-align: middle;
  /* 画布尺寸是算出来的：窄屏别撑破容器 */
  max-width: 100%;
}
</style>
