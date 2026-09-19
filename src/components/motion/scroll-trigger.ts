/**
 * 极小号的 ScrollTrigger 替代（滚动驱动动效的公共部分）
 *
 * React Bits 里一批动效（ScrollFloat / ScrollReveal / …）都用 gsap 的 ScrollTrigger，
 * 而且核心写法都是 `scrub: true`：**每一帧的值由滚动位置算出来**，可以倒放。
 * 移植时真正要复刻的其实只有两件事：
 *
 *   ① 把 GSAP 的位置写法解析成「滚动位置」
 *      `"center bottom+=50%"` = 「触发器(元素)的 center 碰到 容器底部再往下 50% 容器高」的那一刻，
 *      该滚动多少。公式：`S = 元素在内容坐标系的 top + 触发点偏移 − 容器上的位置`
 *      （`+=` / `-=` 的百分比按**滚动容器高度**算）
 *   ② 从滚动位置算出 0~1 的进度：`progress = (scrollTop − S_start) / (S_end − S_start)`
 *
 * 剩下的监听（rAF 节流 + resize + 字体就绪）也放在这里，省得每个组件抄一遍。
 */

/** 夹到 0~1 */
export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

/** 把 `scrollContainer` 归一成元素：支持直接传元素、模板 ref 对象、组件实例 */
export function toScrollerElement(raw: unknown): HTMLElement | null {
  if (!raw || typeof HTMLElement === 'undefined') return null
  if (raw instanceof HTMLElement) return raw
  const maybe = raw as { value?: unknown; $el?: unknown }
  if (maybe.value instanceof HTMLElement) return maybe.value
  if (maybe.$el instanceof HTMLElement) return maybe.$el
  return null
}

/* ── 位置解析（GSAP 的 "center bottom+=50%" 写法） ────────── */

/** `top` / `center` / `bottom` / `50%` / `120px` → 该轴上的像素偏移 */
export function resolveToken(token: string, size: number) {
  const t = token.trim()
  if (t === 'top' || t === 'start') return 0
  if (t === 'bottom' || t === 'end') return size
  if (t === 'center') return size / 2
  const m = /^(-?[\d.]+)(px|%)?$/.exec(t)
  if (!m) return 0
  const value = parseFloat(m[1])
  return m[2] === '%' ? (size * value) / 100 : value
}

/**
 * 解析 GSAP 的 `"<触发器位置> <滚动容器位置>"` → **该触发点对应的滚动位置**（容器内容坐标系）
 *   `top bottom`      ：元素顶边碰到容器底边
 *   `bottom bottom`   ：元素底边碰到容器底边
 *   `center bottom+=50%`：元素中线碰到「容器底边再往下半个容器高」
 *   `top bottom-=20%` ：元素顶边碰到「容器底边往上 20% 容器高」
 */
export function triggerScroll(elTop: number, elSize: number, viewportSize: number, expr: string) {
  const parts = String(expr ?? '').trim().split(/\s+/)
  const elOffset = resolveToken(parts[0] ?? 'top', elSize)
  const rawScroller = parts[1] ?? 'bottom'
  const mod = /([+-])=([\d.]+)(%|px)?/.exec(rawScroller)
  const baseToken = mod ? rawScroller.slice(0, mod.index) : rawScroller
  let scrollerOffset = resolveToken(baseToken || 'bottom', viewportSize)
  if (mod) {
    const value = parseFloat(mod[2])
    const unit = mod[3] ?? (mod[2].includes('%') ? '%' : 'px')
    const delta = unit === '%' ? (viewportSize * value) / 100 : value
    scrollerOffset += mod[1] === '+' ? delta : -delta
  }
  return elTop + elOffset - scrollerOffset
}

/* ── 测量与进度 ─────────────────────────────────────────── */

/** 滚动视口的几何：scrollTop / 高度 / 顶边在屏幕上的位置（滚动容器与 window 统一看待） */
export function readViewport(scroller: HTMLElement | null) {
  if (scroller) {
    return {
      scrollTop: scroller.scrollTop,
      height: scroller.clientHeight || 1,
      top: scroller.getBoundingClientRect().top,
    }
  }
  return {
    scrollTop: window.scrollY || 0,
    height: window.innerHeight || 1,
    top: 0,
  }
}

/**
 * 读元素**未变换**的矩形。
 *
 * 这点很关键：`getBoundingClientRect()` 会把元素自己的 `rotate/scale` 算进去，
 * 于是「元素顶边在容器底边」这类判定会随着动画本身漂移（越转越歪）。
 * GSAP 的 ScrollTrigger 同样会先临时清掉 transform 再测，这里照做。
 * 只在同一个 JS 任务里清 → 恢复，浏览器不会渲染中间那一帧。
 */
export function measureRect(el: HTMLElement): DOMRect {
  const prev = el.style.transform
  if (prev) el.style.transform = 'none'
  const rect = el.getBoundingClientRect()
  if (prev) el.style.transform = prev
  return rect
}

/** 元素顶边在**滚动容器内容坐标系**里的位置（给需要自己算区间的场景用） */
export function elementTopInScroller(el: HTMLElement, scroller: HTMLElement | null) {
  const viewport = readViewport(scroller)
  const rect = measureRect(el)
  return { top: rect.top - viewport.top + viewport.scrollTop, height: rect.height, viewport }
}

/**
 * 当前滚动进度（0~1）。
 * 区间取不到（元素或区间宽度为 0）时返回 null —— 调用方直接跳过写样式，避免写出 NaN。
 */
export function scrollProgress(
  el: HTMLElement,
  scroller: HTMLElement | null,
  startExpr: string,
  endExpr: string,
): number | null {
  const { top: elTop, height, viewport } = elementTopInScroller(el, scroller)
  const start = triggerScroll(elTop, height, viewport.height, startExpr)
  const end = triggerScroll(elTop, height, viewport.height, endExpr)
  const range = end - start
  if (!Number.isFinite(range) || Math.abs(range) < 1) return null
  return clamp01((viewport.scrollTop - start) / range)
}

/* ── 监听 ───────────────────────────────────────────────── */

/**
 * 挂上滚动监听（rAF 节流），另外在 window resize / 元素自身尺寸变化 / 字体就绪后再算一次。
 * `getScroller` 每次现读（滚动容器可能是后来才绑上的）。返回解绑函数。
 */
export function createScrollWatcher(
  getScroller: () => HTMLElement | null,
  onUpdate: () => void,
  watchResizeOf?: HTMLElement | null,
): () => void {
  let rafId = 0
  let alive = true
  const schedule = () => {
    if (rafId) return
    rafId = window.requestAnimationFrame(() => {
      rafId = 0
      onUpdate()
    })
  }

  const target: HTMLElement | Window = getScroller() ?? window
  target.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)

  let observer: ResizeObserver | null = null
  if (watchResizeOf && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(schedule)
    observer.observe(watchResizeOf)
  }

  // 字体到位后行高会变，位置得重算（promise 没法取消，用标志位兜住）
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    void document.fonts.ready.then(() => {
      if (alive) schedule()
    })
  }

  return () => {
    alive = false
    if (rafId) window.cancelAnimationFrame(rafId)
    rafId = 0
    target.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    observer?.disconnect()
  }
}

/** 用户系统里开了「减少动效」时，滚动驱动动效一律不参与 */
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
