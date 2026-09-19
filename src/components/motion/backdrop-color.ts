/**
 * 「元素背后是什么颜色」—— 给需要**真实色值**做遮罩的动效用
 *
 * 有些故障风效果（比如 GlitchText）会用伪元素盖一层背景色，只露出被裁出来的横条；
 * 这个背景色必须等于**页面实际底色**，否则会露出色块。而底色可能是 `oklch(...)` 之类的
 * 表达式（这个项目的主题就是），也可能挂在很远的一个祖先上，所以：
 *   · 用 1px canvas 归一化任意 CSS 颜色（能识别透明度）
 *   · 从元素自己开始沿 DOM 往上找第一个「足够不透明」的背景
 */

let probeCtx: CanvasRenderingContext2D | null = null

function ensureProbe(): CanvasRenderingContext2D | null {
  if (!probeCtx) {
    const probe = document.createElement('canvas')
    probe.width = 1
    probe.height = 1
    probeCtx = probe.getContext('2d', { willReadFrequently: true })
  }
  return probeCtx
}

/** 把任意 CSS 颜色画到 1px 画布上再读回来 —— 顺便解决 oklch() 这类表达式不好解析的问题 */
function paint(color: string): [number, number, number, number] | null {
  const ctx = ensureProbe()
  if (!ctx) return null
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#000000'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  return [r, g, b, a]
}

/** 颜色的 alpha（0~1） */
export function colorAlpha(color: string): number {
  const rgba = paint(color)
  return rgba ? rgba[3] / 255 : 0
}

/** 颜色是否「足够实」（可以当作可见底色） */
export function isOpaqueColor(color: string, threshold = 0.5) {
  return colorAlpha(color) >= threshold
}

/** 归一化成 `rgb()` / `rgba()` 字符串 */
export function toRgbString(color: string): string {
  const rgba = paint(color)
  if (!rgba) return color
  const [r, g, b, a] = rgba
  return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`
}

/**
 * 从 `el` 自己开始往上找第一个足够不透明的背景色；找不到就返回 `fallback`。
 */
export function resolveBackdropColor(el: Element | null, fallback = 'transparent'): string {
  let node: Element | null = el
  while (node) {
    const color = getComputedStyle(node).backgroundColor
    if (color && isOpaqueColor(color)) return toRgbString(color)
    node = node.parentElement
  }
  return fallback
}
