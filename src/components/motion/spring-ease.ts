/**
 * 弹簧缓动（把「质量-弹簧-阻尼」的解析解换成 CSS 能用的缓动）
 *
 * 移植 React Bits 的动效时经常遇到 `transition={{ type: 'spring', damping, stiffness }}`
 * （motion / framer-motion 的写法）。我们不用动画库，但弹簧本身是有解析解的：
 *
 *   ω₀ = √(k / m)               阻尼比 ζ = c / (2√(k·m))
 *   欠阻尼（ζ < 1）：x(t) = 1 − e^(−ζω₀t) · [cos(ω𝒹t) + (ζω₀/ω𝒹)·sin(ω𝒹t)]，ω𝒹 = ω₀√(1−ζ²)
 *
 * 于是可以把它**采样成一串点**，喂给 WAAPI 的 `linear()` 缓动 —— 浏览器会按这些点做分段线性插值，
 * 看起来就是弹簧（含过冲），而且动画跑在合成器线程上，比每帧写样式便宜得多。
 * `linear()` 不被支持时退回一个带过冲的 `cubic-bezier`（形状近似，不至于没效果）。
 */

export interface SpringOptions {
  /** 劲度系数（motion 的 `stiffness`） */
  stiffness: number
  /** 阻尼（motion 的 `damping`） */
  damping: number
  /** 质量（motion 的 `mass`） */
  mass?: number
}

/** 归一化进度：t 秒时从 0 走到 1 的位置（可能超过 1 = 过冲） */
export function springProgress({ stiffness, damping, mass = 1 }: SpringOptions, t: number): number {
  const k = Math.max(0.0001, stiffness)
  const m = Math.max(0.0001, mass)
  const w0 = Math.sqrt(k / m)
  const zeta = Math.max(0, damping) / (2 * Math.sqrt(k * m))

  if (zeta < 1) {
    // 欠阻尼：会过冲一点点，也就是弹簧的手感来源
    const wd = w0 * Math.sqrt(1 - zeta * zeta)
    return (
      1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
    )
  }
  if (Math.abs(zeta - 1) < 1e-6) {
    // 临界阻尼
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t)
  }
  // 过阻尼：两个实根
  const s = Math.sqrt(zeta * zeta - 1)
  const r1 = -w0 * (zeta - s)
  const r2 = -w0 * (zeta + s)
  return 1 + (r1 * Math.exp(r2 * t) - r2 * Math.exp(r1 * t)) / (r2 - r1)
}

/**
 * 弹簧「停下来」需要多久（秒）。
 * 用振幅包络判断：`e^(−ζω₀t) / √(1−ζ²) < restDelta` —— 比逐帧试到「接近 1」稳，
 * 否则可能在第一个过冲峰上就误判成结束了。
 */
export function springDuration(options: SpringOptions, restDelta = 0.001): number {
  const { stiffness, damping, mass = 1 } = options
  const k = Math.max(0.0001, stiffness)
  const m = Math.max(0.0001, mass)
  const w0 = Math.sqrt(k / m)
  const zeta = Math.max(0, damping) / (2 * Math.sqrt(k * m))
  const decay = zeta * w0
  if (decay <= 0.0001) return 4 // 没有阻尼 = 不会停，给个上限兜住
  const wobble = Math.sqrt(Math.abs(1 - zeta * zeta)) || 1
  const t = Math.log(1 / (restDelta * Math.max(0.0001, wobble))) / decay
  // 过阻尼时包络不适用，用解析解自己找一个上限
  return Math.min(6, Math.max(0.05, zeta < 1 ? t : t * 1.6))
}

let linearEasingSupport: boolean | null = null

/** 浏览器支不支持 `linear()` 缓动（Chrome 113+ / Safari 17.2+ / Firefox 112+） */
export function supportsLinearEasing(): boolean {
  if (linearEasingSupport !== null) return linearEasingSupport
  linearEasingSupport =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('transition-timing-function', 'linear(0, 1)')
  return linearEasingSupport
}

const easingCache = new Map<string, string>()

/**
 * 弹簧 → CSS 缓动字符串。支持 `linear()` 时采样它（首尾强制 0 / 1），否则退回近似 bezier。
 */
export function springEasing(options: SpringOptions, samples = 48): string {
  const key = `${options.stiffness}|${options.damping}|${options.mass ?? 1}|${samples}`
  const cached = easingCache.get(key)
  if (cached) return cached

  if (!supportsLinearEasing()) {
    const fallback = 'cubic-bezier(0.34, 1.42, 0.64, 1)'
    easingCache.set(key, fallback)
    return fallback
  }

  const duration = springDuration(options)
  const points: number[] = []
  for (let i = 0; i <= samples; i += 1) {
    const value = i === 0 ? 0 : i === samples ? 1 : springProgress(options, (duration * i) / samples)
    points.push(Math.round(value * 10000) / 10000)
  }
  const easing = `linear(${points.join(', ')})`
  easingCache.set(key, easing)
  return easing
}
