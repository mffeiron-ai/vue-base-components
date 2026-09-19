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
