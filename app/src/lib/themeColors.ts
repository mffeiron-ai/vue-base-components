/**
 * 主题色读取工具
 *
 * 给需要**真实色值**的地方用 —— canvas（`fillStyle` 不认 `var()`）、
 * `<input type="color">`（只吃 `#rrggbb`）、以及任何要把颜色拼进字符串的场合。
 *
 * CSS 变量本身不能直接喂过去，得先解析成具体色值；主题 / 风格切换会重写
 * `<html>` 的 class、`style`，或改写主题 `<style>` 的文本，所以这里用
 * MutationObserver 打一个递增的 tick —— 需要跟着主题重算的地方依赖它即可。
 */
import { onBeforeUnmount, ref } from 'vue'

/** `--color-primary` → 当前主题里的真实色值；普通颜色原样返回 */
export function resolveThemeColor(value: string, fallback = '#000000'): string {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  if (!raw.startsWith('--')) return raw
  const fromTheme = getComputedStyle(document.documentElement).getPropertyValue(raw).trim()
  return fromTheme || fallback
}

/** 任意 CSS 颜色（含 `--` 变量名）→ `#rrggbb`，用 1px canvas 归一化，oklch 之类也能转 */
export function toHexColor(value: string, fallback = '#000000'): string {
  const raw = resolveThemeColor(value, fallback)
  const probe = document.createElement('canvas')
  probe.width = 1
  probe.height = 1
  const ctx = probe.getContext('2d', { willReadFrequently: true })
  if (!ctx) return fallback
  ctx.fillStyle = '#000000'
  ctx.fillStyle = raw
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  if (!a) return fallback
  return `#${[r, g, b].map(n => n.toString(16).padStart(2, '0')).join('')}`
}

/** 主题变化计数：computed 里读一下它，切主题 / 切风格时就会自动重算 */
export function useThemeTick() {
  const tick = ref(0)
  if (typeof document === 'undefined') return tick

  const mo = new MutationObserver(() => {
    tick.value += 1
  })
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] })
  // 主题色是写进一个 <style> 的文本里的，改色不改 DOM 属性，所以要盯 head
  if (document.head) mo.observe(document.head, { childList: true, subtree: true, characterData: true })

  onBeforeUnmount(() => mo.disconnect())
  return tick
}
