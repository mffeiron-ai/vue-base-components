/**
 * GSAP 常见缓动名 → CSS 缓动
 *
 * 移植 React Bits 的组件时，原版 `ease` 参数传的是 GSAP 的名字（`power2.out` 之类）。
 * 我们统一用浏览器自带动画（WAAPI / CSS），只认 CSS 缓动，所以在这里做一层映射，
 * 让原版文档里的写法可以直接抄过来。传 CSS 缓动字符串（或 cubic-bezier）时原样返回。
 */
const EASE_MAP: Record<string, string> = {
  none: 'linear',
  linear: 'linear',
  'power1.out': 'cubic-bezier(0.33, 1, 0.68, 1)',
  'power2.out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'power3.out': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'power4.out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'power1.inOut': 'cubic-bezier(0.65, 0, 0.35, 1)',
  'power2.inOut': 'cubic-bezier(0.65, 0, 0.35, 1)',
  'sine.out': 'cubic-bezier(0.33, 1, 0.68, 1)',
  'sine.inOut': 'cubic-bezier(0.37, 0, 0.63, 1)',
  'expo.out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'circ.out': 'cubic-bezier(0, 0.55, 0.45, 1)',
  'back.out(1.2)': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
}

export function resolveEase(ease: string | undefined, fallback = 'cubic-bezier(0.16, 1, 0.3, 1)') {
  const raw = String(ease ?? '').trim()
  if (!raw) return fallback
  return EASE_MAP[raw] ?? raw
}

/* ── 缓动函数（JS） ──────────────────────────────────────
 * 有些效果是**逐帧算出来**的（比如滚动进度驱动：`scrub: true`），
 * 用不了 CSS 缓动，必须拿到 `t => value` 的函数。
 * 这里按 GSAP 的名字与公式实现常用几种；不认识的回落 power2.out。
 */

const pow = (n: number) => (t: number) => Math.pow(t, n)
const powOut = (n: number) => (t: number) => 1 - Math.pow(1 - t, n)
const powInOut = (n: number) => (t: number) => (t < 0.5 ? Math.pow(2, n - 1) * Math.pow(t, n) : 1 - Math.pow(-2 * t + 2, n) / 2)

function backIn(t: number, s: number) {
  return t * t * ((s + 1) * t - s)
}
function backOut(t: number, s: number) {
  return (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1
}
function backInOut(t: number, s: number) {
  const p = t * 2
  if (p < 1) return 0.5 * (p * p * ((s + 1) * p - s))
  const q = p - 2
  return 0.5 * (q * q * ((s + 1) * q + s) + 2)
}

const sineIn = (t: number) => 1 - Math.cos((t * Math.PI) / 2)
const sineOut = (t: number) => Math.sin((t * Math.PI) / 2)
const sineInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

const expoIn = (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10))
const expoOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
const expoInOut = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2

const circIn = (t: number) => 1 - Math.sqrt(1 - t * t)
const circOut = (t: number) => Math.sqrt(1 - (t - 1) * (t - 1))
const circInOut = (t: number) =>
  t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2

const POWER_BASE: Record<string, (t: number) => number> = {
  power0: t => t,
  power1: pow(2),
  power2: pow(3),
  power3: pow(4),
  power4: pow(5),
}

/** GSAP 名字 → `t => value` 的缓动函数；不认识的按 `power2.out` 处理 */
export function resolveEaseFn(ease: string | undefined): (t: number) => number {
  const raw = String(ease ?? '').trim().replace(/\s+/g, '')
  if (!raw) return powOut(3)

  if (raw === 'none' || raw === 'linear') return t => t

  // back.inOut(2) / back.out(1.7) / back.in …
  const back = /^back\.(in|out|inOut)(?:\(([\d.]+)\))?$/.exec(raw)
  if (back) {
    const overshoot = back[2] !== undefined ? parseFloat(back[2]) : 1.70158
    if (back[1] === 'in') return t => backIn(t, overshoot)
    if (back[1] === 'out') return t => backOut(t, overshoot)
    return t => backInOut(t, overshoot)
  }

  const named = /^(power[0-4]|sine|expo|circ)\.(in|out|inOut)$/.exec(raw)
  if (named) {
    const [, family, dir] = named
    if (family.startsWith('power')) {
      const base = POWER_BASE[family] ?? pow(3)
      if (dir === 'in') return base
      const order = Number(family.replace('power', '')) + 1
      if (dir === 'out') return powOut(order)
      return powInOut(order)
    }
    const sets: Record<string, [typeof sineIn, typeof sineOut, typeof sineInOut]> = {
      sine: [sineIn, sineOut, sineInOut],
      expo: [expoIn, expoOut, expoInOut],
      circ: [circIn, circOut, circInOut],
    }
    const set = sets[family]
    if (set) return dir === 'in' ? set[0] : dir === 'out' ? set[1] : set[2]
  }

  return powOut(3)
}
