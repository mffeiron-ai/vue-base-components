/**
 * AsciiText 的渲染核心 —— 不引 three.js / WebGL，纯 CPU 光栅化
 *
 * 上游（React Bits 的 ASCIIText，源头是 JuanFuentes 的 codepen）用 three.js 做三件事：
 *   ① 把文字画进 canvas 当纹理（`CanvasTxt`）
 *   ② 用 36×36 网格的 `PlaneGeometry` + 自定义顶点着色器做「波浪 + 透视」
 *   ③ WebGL 渲染一遍，再用 `AsciiFilter` 把结果缩到「一格一字符」的小 canvas，
 *      逐像素取灰度 → 查字符表 → 写进 `<pre>`
 *
 * 这里 ① ② 照抄（数学一样），③ 换成**软件光栅化**：
 *   把网格顶点自己做旋转 + 透视投影，然后逐个四边形用重心坐标插值采样纹理，
 *   直接写进 `cols × rows` 的像素缓冲 —— 每格正好是一个 ASCII 字符。
 * 所以最终产物与上游完全同构：一张马赛克底图 + 一层 ASCII 字符。
 *
 * 顶点着色器（照抄）：
 *   t = uTime * 5
 *   x += sin(t + y) * 0.5 * waves
 *   y += cos(t + z) * 0.15 * waves      // 平面 z = 0 → cos(t)
 *   z += sin(t + x) * waves
 * 片元着色器（照抄）：R/G/B 三个通道各自把 uv 偏移一点点再采样（色差抖动），A 用原 uv；
 * 注意 GLSL 里 `pos + float` 是**逐分量**相加，所以 u、v 都加了同一个偏移。
 */
/** 上游 `PlaneGeometry(planeW, planeH, 36, 36)` 的细分段数 */
const GRID = 36
/** 上游 `PerspectiveCamera(45, aspect, 1, 1000)` */
const FOV = 45
const CAMERA_Z = 30
const DEG = Math.PI / 180
/** uv 偏移系数（上游 shader 里的 `.01`） */
const UV_SHIFT = 0.01

/** 上游 AsciiFilter 的默认字符表：由「疏」到「密」，配合 invert 用 */
export const DEFAULT_CHARSET =
  ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'

/** 构造 `AsciiScene` 需要的参数（对应上游的同名 props + 字符表） */
export interface AsciiSceneOptions {
  text: string
  asciiFontSize: number
  textFontSize: number
  textColor: string
  planeBaseHeight: number
  enableWaves: boolean
  charset: string
  invert: boolean
  fontFamily: string
}

export interface AsciiFrame {
  /** cols × rows 的 RGBA（马赛克底图） */
  pixels: Uint8ClampedArray
  /** cols × rows 的字符（含换行） */
  text: string
  cols: number
  rows: number
}

/** 字形测量用的比 `A` —— 用来算「一格多宽」（等宽字体下和上游一致） */
function charWidthOf(ctx: CanvasRenderingContext2D, fontSize: number, fontFamily: string) {
  ctx.font = `${fontSize}px ${fontFamily}`
  return Math.max(1, ctx.measureText('A').width)
}

export class AsciiScene {
  readonly fontFamily: string
  textColor: string

  private readonly gridPoints = GRID + 1
  private charset: string
  private invert: boolean
  private enableWaves: boolean
  private asciiFontSize: number
  private textFontSize: number
  private planeBaseHeight: number

  /* 文字纹理 */
  private texCanvas: HTMLCanvasElement
  private texCtx: CanvasRenderingContext2D | null
  private texData = new Uint8ClampedArray(0)
  private texW = 0
  private texH = 0
  private text = ''

  /* 输出缓冲（每格 = 一个字符） */
  private width = 1
  private height = 1
  private cols = 1
  private rows = 1
  private pixels = new Uint8ClampedArray(4)
  private depth = new Float32Array(1)

  /* 顶点缓存：屏幕坐标（已换算到「格」坐标系）、深度、uv */
  private vx = new Float32Array(0)
  private vy = new Float32Array(0)
  private vw = new Float32Array(0)
  private vu = new Float32Array(0)
  private vv = new Float32Array(0)
  private baseX = new Float32Array(0)
  private baseY = new Float32Array(0)

  private planeW = 8
  private planeH = 8
  private charWidth = 1

  constructor(options: AsciiSceneOptions) {
    this.text = options.text
    this.asciiFontSize = options.asciiFontSize
    this.textFontSize = options.textFontSize
    this.textColor = options.textColor
    this.planeBaseHeight = options.planeBaseHeight
    this.enableWaves = options.enableWaves
    this.charset = options.charset || DEFAULT_CHARSET
    this.invert = options.invert
    this.fontFamily = options.fontFamily

    this.texCanvas = document.createElement('canvas')
    this.texCtx = this.texCanvas.getContext('2d', { willReadFrequently: true })
    this.buildTexture()
  }

  /** 改参数后要重建纹理的几项 */
  update(next: Partial<AsciiSceneOptions>) {
    let dirty = false
    if (next.text !== undefined && next.text !== this.text) {
      this.text = next.text
      dirty = true
    }
    if (next.textFontSize !== undefined && next.textFontSize !== this.textFontSize) {
      this.textFontSize = next.textFontSize
      dirty = true
    }
    if (next.textColor !== undefined && next.textColor !== this.textColor) {
      this.textColor = next.textColor
      dirty = true
    }
    if (next.planeBaseHeight !== undefined) this.planeBaseHeight = next.planeBaseHeight
    if (next.asciiFontSize !== undefined) this.asciiFontSize = next.asciiFontSize
    if (next.enableWaves !== undefined) this.enableWaves = next.enableWaves
    if (next.charset !== undefined) this.charset = next.charset || DEFAULT_CHARSET
    if (next.invert !== undefined) this.invert = next.invert
    if (dirty) this.buildTexture()
    // 分辨率相关：重算 cols/rows
    this.layout()
  }

  /* ── ① 文字纹理 ─────────────────────────────────────── */

  private buildTexture() {
    const ctx = this.texCtx
    if (!ctx) return
    const font = `600 ${this.textFontSize}px ${this.fontFamily}`
    ctx.font = font
    const metrics = ctx.measureText(this.text)
    // 上游留 20px 边距（左右各 10）
    const w = Math.ceil(metrics.width) + 20
    const h = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + 20
    this.texCanvas.width = Math.max(1, w)
    this.texCanvas.height = Math.max(1, h)
    this.texW = this.texCanvas.width
    this.texH = this.texCanvas.height

    ctx.clearRect(0, 0, this.texW, this.texH)
    ctx.font = font
    ctx.fillStyle = this.textColor
    ctx.fillText(this.text, 10, 10 + metrics.actualBoundingBoxAscent)

    this.texData = ctx.getImageData(0, 0, this.texW, this.texH).data

    // 平面的宽高比跟着文字纹理走（上游同）
    this.planeH = this.planeBaseHeight
    this.planeW = this.planeBaseHeight * (this.texW / this.texH)
    this.buildGrid()
  }

  private buildGrid() {
    const n = this.gridPoints
    this.baseX = new Float32Array(n)
    this.baseY = new Float32Array(n)
    for (let i = 0; i < n; i += 1) {
      const r = i / GRID
      this.baseX[i] = (r - 0.5) * this.planeW
      // 上游 `vertices.push(x, -y, 0)`：iy=0 是最上面一行
      this.baseY[i] = (0.5 - r) * this.planeH
    }
    const count = n * n
    this.vx = new Float32Array(count)
    this.vy = new Float32Array(count)
    this.vw = new Float32Array(count)
    this.vu = new Float32Array(count)
    this.vv = new Float32Array(count)
  }

  /* ── ② 尺寸 / 字符网格 ──────────────────────────────── */

  setSize(width: number, height: number) {
    this.width = Math.max(1, width)
    this.height = Math.max(1, height)
    this.layout()
  }

  private layout() {
    const measure = this.texCtx
    this.charWidth = measure
      ? charWidthOf(measure, this.asciiFontSize, this.fontFamily)
      : this.asciiFontSize * 0.6
    const cols = Math.max(1, Math.floor(this.width / this.charWidth))
    const rows = Math.max(1, Math.floor(this.height / this.asciiFontSize))
    if (cols === this.cols && rows === this.rows) return // 格子数没变就别重建缓冲（主题重算时会走到这）
    this.cols = cols
    this.rows = rows
    this.pixels = new Uint8ClampedArray(cols * rows * 4)
    this.depth = new Float32Array(cols * rows)
  }

  get size() {
    return { cols: this.cols, rows: this.rows, width: this.width, height: this.height }
  }

  /* ── ③ 每帧：投影 → 光栅化 → 量化 ───────────────────── */

  /**
   * @param uTime 上游把 `Math.sin(unix 秒)` 喂给 `uTime`，所以这里也是 −1~1
   * @param rotX  网格 rotation.x（鼠标上下控制）
   * @param rotY  网格 rotation.y（鼠标左右控制）
   */
  frame(uTime: number, rotX: number, rotY: number): AsciiFrame {
    this.project(uTime, rotX, rotY)
    this.rasterize(uTime)
    return {
      pixels: this.pixels,
      text: this.quantize(),
      cols: this.cols,
      rows: this.rows,
    }
  }

  /** 顶点变换：波浪位移 → 旋转（R = Rx·Ry，rotation.z 恒为 0）→ 透视投影 */
  private project(uTime: number, rotX: number, rotY: number) {
    const t = uTime * 5
    const wave = this.enableWaves ? 1 : 0
    const n = this.gridPoints
    const f = 1 / Math.tan((FOV / 2) * DEG)
    const aspect = this.width / this.height

    const sx = Math.sin(rotX)
    const cx = Math.cos(rotX)
    const sy = Math.sin(rotY)
    const cy = Math.cos(rotY)

    for (let iy = 0; iy < n; iy += 1) {
      const by = this.baseY[iy]
      const v = 1 - iy / GRID
      for (let ix = 0; ix < n; ix += 1) {
        const bx = this.baseX[ix]
        const k = iy * n + ix

        // 顶点着色器
        const x0 = bx + Math.sin(t + by) * 0.5 * wave
        const y0 = by + Math.cos(t) * 0.15 * wave
        const z0 = Math.sin(t + bx) * wave

        // 旋转：m = Rx·Ry
        const wx = cy * x0 + sy * z0
        const wy = sx * sy * x0 + cx * y0 - sx * cy * z0
        const wz = -cx * sy * x0 + sx * y0 + cx * cy * z0

        // 透视投影（相机在 (0, 0, 30) 看向 −z）
        const depth = CAMERA_Z - wz
        const inv = depth > 0.0001 ? 1 / depth : 0
        const ndcX = ((f / aspect) * wx) * inv
        const ndcY = (f * wy) * inv

        this.vx[k] = (ndcX * 0.5 + 0.5) * this.cols
        this.vy[k] = (1 - (ndcY * 0.5 + 0.5)) * this.rows
        this.vw[k] = depth > 0.0001 ? depth : 1e6
        this.vu[k] = ix / GRID
        this.vv[k] = v
      }
    }
  }

  /** 逐四边形（拆两个三角形）光栅化，写入马赛克缓冲 */
  private rasterize(uTime: number) {
    const n = this.gridPoints
    const { cols, rows, pixels, depth } = this
    pixels.fill(0)
    depth.fill(Infinity)

    for (let iy = 0; iy < GRID; iy += 1) {
      for (let ix = 0; ix < GRID; ix += 1) {
        const i00 = iy * n + ix
        const i10 = i00 + 1
        const i01 = i00 + n
        const i11 = i01 + 1
        this.triangle(i00, i10, i11, uTime)
        this.triangle(i00, i11, i01, uTime)
      }
    }
  }

  private triangle(a: number, b: number, c: number, uTime: number) {
    const { cols, rows } = this
    const ax = this.vx[a]
    const ay = this.vy[a]
    const bx = this.vx[b]
    const by = this.vy[b]
    const cx = this.vx[c]
    const cy = this.vy[c]

    const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay)
    if (!Number.isFinite(area) || Math.abs(area) < 1e-6) return

    const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)))
    const maxX = Math.min(cols - 1, Math.ceil(Math.max(ax, bx, cx)))
    const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)))
    const maxY = Math.min(rows - 1, Math.ceil(Math.max(ay, by, cy)))
    if (minX > maxX || minY > maxY) return

    const inv = 1 / area
    const aU = this.vu[a]
    const aV = this.vv[a]
    const bU = this.vu[b]
    const bV = this.vv[b]
    const cU = this.vu[c]
    const cV = this.vv[c]
    const aW = this.vw[a]
    const bW = this.vw[b]
    const cW = this.vw[c]

    for (let py = minY; py <= maxY; py += 1) {
      const sy = py + 0.5
      for (let px = minX; px <= maxX; px += 1) {
        const sxp = px + 0.5
        const w0 = ((bx - sxp) * (cy - sy) - (cx - sxp) * (by - sy)) * inv
        const w1 = ((cx - sxp) * (ay - sy) - (ax - sxp) * (cy - sy)) * inv
        const w2 = 1 - w0 - w1
        if (w0 < -0.0001 || w1 < -0.0001 || w2 < -0.0001) continue

        const wDepth = w0 * aW + w1 * bW + w2 * cW
        const index = py * cols + px
        if (wDepth >= this.depth[index]) continue

        const u = w0 * aU + w1 * bU + w2 * cU
        const v = w0 * aV + w1 * bV + w2 * cV
        const o = index * 4
        const t = uTime

        // 片元着色器的三通道偏移（GLSL 里 `vec2 + float` 是逐分量加）
        const shiftR = Math.cos(t + u) * UV_SHIFT
        const shiftG = Math.tan(u - 0.5 * t) * UV_SHIFT
        const shiftB = -Math.cos(3 * t + v) * UV_SHIFT

        this.pixels[o] = this.sample(u + shiftR, v + shiftR, 0)
        this.pixels[o + 1] = this.sample(u + shiftG, v + shiftG, 1)
        this.pixels[o + 2] = this.sample(u + shiftB, v + shiftB, 2)
        this.pixels[o + 3] = this.sample(u, v, 3)
        this.depth[index] = wDepth
      }
    }
  }

  /** 最近邻采样（上游 `texture.minFilter = NearestFilter`），uv 超界按 ClampToEdge 处理 */
  private sample(u: number, v: number, channel: number) {
    const data = this.texData
    if (!data.length) return 0
    let tx = (u * this.texW) | 0
    let ty = ((1 - v) * this.texH) | 0
    if (tx < 0) tx = 0
    else if (tx >= this.texW) tx = this.texW - 1
    if (ty < 0) ty = 0
    else if (ty >= this.texH) ty = this.texH - 1
    return data[(ty * this.texW + tx) * 4 + channel]
  }

  /** 灰度 → 字符表（上游 `asciify` 的原样搬运） */
  private quantize() {
    const { cols, rows, charset, invert, pixels } = this
    const last = charset.length - 1
    const parts: string[] = []
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const o = (y * cols + x) * 4
        if (pixels[o + 3] === 0) {
          parts.push(' ')
          continue
        }
        const gray = (0.3 * pixels[o] + 0.6 * pixels[o + 1] + 0.1 * pixels[o + 2]) / 255
        let idx = Math.floor((1 - gray) * last)
        if (idx < 0) idx = 0
        else if (idx > last) idx = last
        if (invert) idx = last - idx
        parts.push(charset[idx])
      }
      parts.push('\n')
    }
    return parts.join('')
  }

  dispose() {
    this.texData = new Uint8ClampedArray(0)
    this.texCanvas.width = 1
    this.texCanvas.height = 1
  }
}
