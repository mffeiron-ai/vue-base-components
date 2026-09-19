<script setup lang="ts">
/**
 * Ascii Text —— 用 ASCII 字符拼出一段会呼吸的 3D 文字
 *
 * 移植自 React Bits 的 AsciiText（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/ascii-text
 * 原版源头是 JuanFuentes 的 codepen（https://codepen.io/JuanFuentes/pen/eYEeoyE），
 * 上游用 three.js：把文字画成纹理贴到 36×36 的平面上，顶点着色器做波浪，
 * 再用自制的 `AsciiFilter` 把 WebGL 的输出缩到「一格一字符」，逐像素查表写进 `<pre>`。
 *
 * 本实现**不引 three / WebGL**，把「渲染 + 缩小 + 取像素」换成 CPU 软件光栅化
 * （见同目录 `ascii-renderer.ts`，投影与波浪公式与上游着色器一致）。
 * 产物与上游同构：一层马赛克底图 + 一层彩虹 ASCII 字符（差集混合），鼠标移动时
 * 整块文字会跟着倾斜，同时画面色相绕着鼠标角度旋转。
 *
 * 与上游的差异（有意为之）：
 *   · `textColor` 默认给 `--color-foreground`（上游写死 #fdf9f3）—— 直接跟着主题走
 *   · 上游用 `:root[data-theme='light'] { filter: invert(1) }` 处理浅色主题，
 *     这里改成**读当前背景亮度**判断（不依赖具体主题实现），主题切换会自动重算
 *   · 不加载 Google Fonts：字体走 `fontFamily`（默认给一栈等宽字体），需要 IBM Plex Mono 请自托管
 *   · `prefers-reduced-motion: reduce` 时冻结时间与鼠标跟随（仍渲染静态 ASCII 图，不丢失画面）
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { AsciiScene, DEFAULT_CHARSET } from './ascii-renderer'

const props = withDefaults(
  defineProps<{
    /** 要显示的文字 */
    text?: string
    /** 一个 ASCII 字符占多少像素（越小越细，格子数按平方增长） */
    asciiFontSize?: number
    /** 画到平面纹理上的字号（像素），决定平面的宽高比 */
    textFontSize?: number
    /** 文字颜色；传 `--color-*` 变量名会跟随主题 */
    textColor?: string
    /** 平面在 3D 里的高度，宽度按文字宽高比自动算 */
    planeBaseHeight?: number
    /** 波浪形变开关 */
    enableWaves?: boolean
    /** 鼠标在容器里移动时，平面跟着倾斜、色相跟着鼠标角度转 */
    followMouse?: boolean
    /** 色相随鼠标角度旋转（上游行为，默认开） */
    hueShift?: boolean
    /** 字符表反转：亮的地方用「密」字符（上游 `invert: true`） */
    invert?: boolean
    /** 字符表，由疏到密 */
    charset?: string
    /** ASCII 字符的渐变三色（上游是固定的粉→橙→黄） */
    rainbowColors?: string[]
    /** ASCII 字符是否用彩虹渐变填充；关掉就用 `textColor` 单色 */
    rainbow?: boolean
    /** 浅色背景时整体反色（上游用 `data-theme='light'` 选择器，这里按背景亮度自动判断） */
    invertOnLight?: boolean
    /** 等宽字体（上游是 IBM Plex Mono，这里不远程加载） */
    fontFamily?: string
    /** 暂停渲染（画面停在当前帧） */
    paused?: boolean
  }>(),
  {
    text: 'David!',
    asciiFontSize: 8,
    textFontSize: 200,
    // 上游写死 #fdf9f3。这个颜色**不是界面色**，它决定的是纹理里笔画的亮度，
    // 而亮度又决定用多「密」的字符 —— 想得到经典观感就保持亮色（也可以传 `--color-*`）
    textColor: '#fdf9f3',
    planeBaseHeight: 8,
    enableWaves: true,
    followMouse: true,
    hueShift: true,
    invert: true,
    charset: DEFAULT_CHARSET,
    rainbowColors: () => ['#ff6188', '#fc9867', '#ffd866'],
    rainbow: true,
    invertOnLight: true,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    paused: false,
  },
)

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const preRef = ref<HTMLPreElement | null>(null)

/* ── 色值 / 主题 ────────────────────────────────────────── */

/** 画布需要真实色值：`--color-x` 用 getComputedStyle 解析，其它颜色原样返回 */
function resolveColor(value: string, fallback = '#fdf9f3') {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  if (!raw.startsWith('--')) return raw
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(raw).trim()
  return resolved || fallback
}

/**
 * 背景亮不亮：从组件自己往上找**第一个不透明背景**。
 * 不直接读 html/body —— 这个文档站的页面背景其实在更里层的容器上（html/body 是透明的），
 * 而组件真正「摆在」的底色（比如示例里的深色盒子）才是决定反色与否的那个。
 *
 * 颜色一律丢给 1px canvas 归一化，因为 `getComputedStyle` 现在常常回 `oklch(...)` 这类
 * 解析不了「rgba 括号」的格式（本项目主题就是 oklch）。
 */
let luminanceCtx: CanvasRenderingContext2D | null = null
function luminanceOf(color: string): number | null {
  if (!luminanceCtx) {
    const probe = document.createElement('canvas')
    probe.width = 1
    probe.height = 1
    luminanceCtx = probe.getContext('2d', { willReadFrequently: true })
  }
  const ctx = luminanceCtx
  if (!ctx) return null
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#000000'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  if (a < 128) return null
  return (0.3 * r + 0.6 * g + 0.1 * b) / 255
}

function detectLightBackground(from: Element | null) {
  let node: Element | null = from
  while (node) {
    const lum = luminanceOf(getComputedStyle(node).backgroundColor)
    if (lum !== null) return lum > 0.5
    node = node.parentElement
  }
  return false
}

/* ── 渲染状态 ───────────────────────────────────────────── */

const map = (n: number, a: number, b: number, c: number, d: number) => ((n - a) / (b - a)) * (d - c) + c

let scene: AsciiScene | null = null
let ctx: CanvasRenderingContext2D | null = null
let imageData: ImageData | null = null
let rafId = 0
let disposed = false
let reduceMotion = false
let lightBackground = false
let themeObserver: MutationObserver | null = null

const rotation = { x: 0, y: 0, tx: 0, ty: 0 }
const mouse = { x: 0, y: 0 }
let hue = 0
let hueTarget = 0
/** 上一帧「光栅化 + 写 DOM」的耗时（毫秒），用来盯性能 */
let lastCost = 0
let lastCellCount = 0

const size = { width: 0, height: 0 }

function syncSceneOptions() {
  if (!scene) return
  scene.update({
    text: props.text,
    asciiFontSize: props.asciiFontSize,
    textFontSize: props.textFontSize,
    textColor: resolveColor(props.textColor),
    planeBaseHeight: props.planeBaseHeight,
    enableWaves: props.enableWaves && !reduceMotion,
    charset: props.charset,
    invert: props.invert,
  })
}

function applySize(width: number, height: number) {
  if (!scene || width <= 0 || height <= 0) return
  size.width = width
  size.height = height
  scene.setSize(width, height)
  const { cols, rows } = scene.size
  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = cols
    canvas.height = rows
    ctx = canvas.getContext('2d')
  }
  imageData = null
  // 鼠标还没进来过 → 让旋转目标回到「正对镜头」
  if (!props.followMouse) {
    rotation.tx = 0
    rotation.ty = 0
  }
}

function applyFilter() {
  const el = rootRef.value
  if (!el) return
  const parts: string[] = []
  if (props.invertOnLight && lightBackground) parts.push('invert(1)')
  if (props.hueShift && !reduceMotion) parts.push(`hue-rotate(${hue.toFixed(1)}deg)`)
  el.style.filter = parts.join(' ')
}

/* ── 主循环 ─────────────────────────────────────────────── */

function tick() {
  rafId = window.requestAnimationFrame(tick)
  if (disposed || !scene || props.paused) return
  const started = performance.now()

  // 上游把 `Math.sin(unix 秒)` 喂给 uTime（所以波浪是慢速往复，不会越滚越快）
  const uTime = reduceMotion ? 0.35 : Math.sin(Date.now() * 0.001)

  if (reduceMotion || !props.followMouse) {
    rotation.x += (0 - rotation.x) * 0.05
    rotation.y += (0 - rotation.y) * 0.05
  } else {
    rotation.x += (rotation.tx - rotation.x) * 0.05
    rotation.y += (rotation.ty - rotation.y) * 0.05
    hue += (hueTarget - hue) * 0.075
  }
  applyFilter()

  const frame = scene.frame(uTime, rotation.x, rotation.y)

  // ① 马赛克底图：直接把每格的颜色铺到低分辨率 canvas 上，再由 CSS 拉伸铺满
  if (ctx) {
    if (!imageData || imageData.width !== frame.cols || imageData.height !== frame.rows) {
      imageData = new ImageData(new Uint8ClampedArray(frame.cols * frame.rows * 4), frame.cols, frame.rows)
    }
    imageData.data.set(frame.pixels)
    ctx.putImageData(imageData, 0, 0)
  }

  // ② ASCII 层：只改文本节点的值（比 innerHTML/textContent 都省）
  const pre = preRef.value
  if (pre) {
    const node = pre.firstChild
    if (node && node.nodeType === 3) node.nodeValue = frame.text
    else pre.textContent = frame.text
  }

  // 给文档页 / 探针看的性能读数
  lastCost = performance.now() - started
  lastCellCount = frame.cols * frame.rows
}

/* ── 生命周期 ───────────────────────────────────────────── */

let resizeObserver: ResizeObserver | null = null

function setup() {
  if (disposed) return
  const root = rootRef.value
  if (!root) return
  const rect = root.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return // 还没布局出来，等 ResizeObserver 再叫一次

  const pre = preRef.value
  if (pre && !pre.firstChild) pre.textContent = ' '

  lightBackground = detectLightBackground(root)
  scene = new AsciiScene({
    text: props.text,
    asciiFontSize: props.asciiFontSize,
    textFontSize: props.textFontSize,
    textColor: resolveColor(props.textColor),
    planeBaseHeight: props.planeBaseHeight,
    enableWaves: props.enableWaves && !reduceMotion,
    charset: props.charset,
    invert: props.invert,
    fontFamily: props.fontFamily,
  })
  applySize(rect.width, rect.height)
  applyFilter()

  root.addEventListener('mousemove', onMouseMove)
  root.addEventListener('touchmove', onTouchMove, { passive: true })

  if (rafId) window.cancelAnimationFrame(rafId)
  rafId = window.requestAnimationFrame(tick)
}

function teardown() {
  if (rafId) window.cancelAnimationFrame(rafId)
  rafId = 0
  const root = rootRef.value
  root?.removeEventListener('mousemove', onMouseMove)
  root?.removeEventListener('touchmove', onTouchMove)
  scene?.dispose()
  scene = null
  ctx = null
  imageData = null
}

function onMouseMove(event: MouseEvent) {
  const root = rootRef.value
  if (!root || !props.followMouse) return
  const rect = root.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  mouse.x = x
  mouse.y = y
  rotation.tx = map(y, 0, rect.height, 0.5, -0.5)
  rotation.ty = map(x, 0, rect.width, -0.5, 0.5)
  hueTarget = (Math.atan2(y - rect.height / 2, x - rect.width / 2) * 180) / Math.PI
}

function onTouchMove(event: TouchEvent) {
  const touch = event.touches[0]
  if (!touch) return
  onMouseMove(touch as unknown as MouseEvent)
}

onMounted(async () => {
  reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (typeof ResizeObserver !== 'undefined' && rootRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect
      if (!box) return
      if (!scene) setup()
      else applySize(box.width, box.height)
    })
    resizeObserver.observe(rootRef.value)
  }

  // 主题 / 风格切换：重解析文字色、重判背景亮度
  themeObserver = new MutationObserver(() => {
    lightBackground = detectLightBackground(rootRef.value)
    syncSceneOptions()
    applyFilter()
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style', 'data-theme'],
  })
  if (document.head) {
    themeObserver.observe(document.head, { childList: true, subtree: true, characterData: true })
  }

  // 字体就绪后再建纹理（行高 / 字宽都会影响网格）
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready
    } catch {
      /* 字体加载失败也能用 fallback 渲染 */
    }
  }
  setup()
})

onBeforeUnmount(() => {
  disposed = true
  teardown()
  resizeObserver?.disconnect()
  resizeObserver = null
  themeObserver?.disconnect()
  themeObserver = null
})

watch(
  [
    () => props.text,
    () => props.asciiFontSize,
    () => props.textFontSize,
    () => props.textColor,
    () => props.planeBaseHeight,
    () => props.enableWaves,
    () => props.invert,
    () => props.charset,
    () => props.fontFamily,
  ],
  () => {
    if (!scene) return
    if (props.fontFamily !== scene.fontFamily) {
      // 字体变了要整体重建（测量结果都变了）
      teardown()
      setup()
      return
    }
    syncSceneOptions()
  },
)

watch(
  () => props.followMouse,
  (on) => {
    if (on) return
    rotation.tx = 0
    rotation.ty = 0
  },
)

const preStyle = computed(() => {
  // 字体与字号必须和「测量字符宽 / 字符高」时用的一致，否则 ASCII 网格会与底层马赛克错位
  const base = {
    fontFamily: props.fontFamily,
    fontSize: `${props.asciiFontSize}px`,
  }
  if (!props.rainbow) return { ...base, color: resolveColor(props.textColor) }
  const [a, b, c] = props.rainbowColors.length >= 3
    ? props.rainbowColors
    : ['#ff6188', '#fc9867', '#ffd866']
  return {
    ...base,
    backgroundImage: `radial-gradient(circle, ${a} 0%, ${b} 50%, ${c} 100%)`,
    backgroundAttachment: 'fixed',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
  }
})

defineExpose({
  /** 立刻按当前状态渲染一帧（探针 / 手动驱动用） */
  renderOnce: () => {
    if (!scene) return null
    const frame = scene.frame(
      reduceMotion ? 0.35 : Math.sin(Date.now() * 0.001),
      rotation.x,
      rotation.y,
    )
    return { cols: frame.cols, rows: frame.rows, text: frame.text, pixels: frame.pixels }
  },
  /** 当前状态读数（格子数 / 单帧耗时 / 色相 / 倾斜角） */
  stats: () => ({
    cols: scene?.size.cols ?? 0,
    rows: scene?.size.rows ?? 0,
    cells: lastCellCount,
    cost: lastCost,
    hue,
    rotationX: rotation.x,
    rotationY: rotation.y,
    reducedMotion: reduceMotion,
    lightBackground,
  }),
  /** 重新读一次背景亮度（外层容器换底色后调一下，比如示例里的彩色底切换） */
  refreshBackground: () => {
    lightBackground = detectLightBackground(rootRef.value)
    syncSceneOptions()
    applyFilter()
  },
})
</script>

<template>
  <div ref="rootRef" class="ascii-text" aria-hidden="true">
    <canvas ref="canvasRef" class="ascii-text__mosaic" />
    <pre ref="preRef" class="ascii-text__ascii" :style="preStyle" />
  </div>
</template>

<style scoped>
.ascii-text {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.ascii-text__mosaic {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}

.ascii-text__ascii {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  padding: 0;
  line-height: 1em;
  text-align: left;
  white-space: pre;
  user-select: none;
  z-index: 9;
  mix-blend-mode: difference;
}
</style>
