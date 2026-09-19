<script setup lang="ts">
/**
 * Scroll Float —— 滚动浮动：文字逐字从下方「浮」上来，进度完全跟着滚动条走
 *
 * 移植自 React Bits 的 Scroll Float（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/scroll-float
 * 原版用 gsap + ScrollTrigger（`scrub: true`）：把每个字符从
 * `opacity 0 / yPercent 120 / scaleY 2.3 / scaleX 0.7`（transform-origin: 50% 0%）
 * 补间到 `opacity 1 / yPercent 0 / scale 1`，**每一帧的值由滚动位置决定**，并按 `stagger` 逐字错开。
 *
 * 本实现不引 gsap，自己算这套映射：
 *   · 解析 `scrollStart` / `scrollEnd`（GSAP 的 `"center bottom+=50%"` 写法）→ 得到「开始滚动位置」与「结束滚动位置」
 *   · `progress = (scrollY - start) / (end - start)`（夹在 0~1）
 *   · 整条时间线长度 `total = duration + stagger × (n - 1)`，字符 i 的局部进度
 *     `local = clamp((progress × total - i × stagger) / duration)`，再过 `ease` 缓动
 *   · 把缓动值写成 `opacity / translateY(%) / scale(x, y)` 内联样式（`transform-origin: 50% 0%` 写在 CSS 里）
 *
 * `ease` 用 GSAP 的写法（默认 `back.inOut(2)`，自带一点「回拉」），由 `resolveEaseFn()` 换算成函数。
 * `scrub` 的语义是**可逆**的：往回滚动画也会倒着走。
 * 滚动容器给了 `scrollContainer` 就用它，否则用 window。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { resolveEaseFn } from '../gsap-ease'
import { createScrollWatcher, prefersReducedMotion, scrollProgress, toScrollerElement } from '../scroll-trigger'

const props = withDefaults(
  defineProps<{
    /** 要展示的文字（逐字切开）；也可以用默认插槽（插槽内容不会被逐字切开） */
    text?: string
    /** 滚动容器；不传则用 window（页面滚动） */
    scrollContainer?: HTMLElement | null
    /** 外层容器的类名（Vue 里直接写 class 也会透传到根元素） */
    containerClassName?: string
    /** 文字层的类名 */
    textClassName?: string
    /** 一个字符从起点走到终点所占的时间线长度（秒） */
    animationDuration?: number
    /** 缓动（GSAP 写法，如 back.inOut(2) / power2.out / linear） */
    ease?: string
    /** 滚动触发区间：GSAP 的 "触发器位置 滚动容器位置" 写法 */
    scrollStart?: string
    /** 滚动结束位置（同上） */
    scrollEnd?: string
    /** 相邻字符之间错开的时间线长度（秒） */
    stagger?: number
  }>(),
  {
    text: '',
    scrollContainer: null,
    containerClassName: '',
    textClassName: '',
    animationDuration: 1,
    ease: 'back.inOut(2)',
    scrollStart: 'center bottom+=50%',
    scrollEnd: 'bottom bottom-=40%',
    stagger: 0.03,
  },
)

const rootRef = ref<HTMLElement | null>(null)

/** 逐字切开（空格换成 nbsp，免得被折叠） */
const chars = computed(() => Array.from(String(props.text ?? '')).map(char => (char === ' ' ? '\u00A0' : char)))

const charEls: (HTMLElement | null)[] = []
function setCharEl(el: Element | null, index: number) {
  charEls[index] = (el as HTMLElement | null) ?? null
}

let disposeWatcher: (() => void) | null = null

/* ── 滚动进度 → 逐字样式 ──────────────────────────────── */

function currentProgress() {
  const el = rootRef.value
  if (!el) return null
  // 位置解析 / 进度换算都在 scroll-trigger.ts 里（ScrollReveal 共用同一套）
  return scrollProgress(el, toScrollerElement(props.scrollContainer), props.scrollStart, props.scrollEnd)
}

function applyProgress(progress: number) {
  const list = charEls.filter((el): el is HTMLElement => !!el)
  const count = list.length
  if (!count) return

  const duration = Math.max(0.001, Number(props.animationDuration) || 1)
  const stagger = Math.max(0, Number(props.stagger) || 0)
  const total = duration + stagger * Math.max(0, count - 1)
  const ease = resolveEaseFn(props.ease)
  const time = progress * total

  for (let i = 0; i < count; i += 1) {
    const local = Math.min(1, Math.max(0, (time - i * stagger) / duration))
    const value = ease(local)
    const el = list[i]
    // opacity 夹到 0~1（back 这类缓动会先「回拉」到负数），缩放/位移保留过冲
    el.style.opacity = String(Math.min(1, Math.max(0, value)))
    el.style.transform = `translateY(${(120 * (1 - value)).toFixed(2)}%) scale(${(0.7 + 0.3 * value).toFixed(4)}, ${(2.3 - 1.3 * value).toFixed(4)})`
  }
}

/** 立刻按当前滚动位置重算一次 */
function update() {
  const progress = currentProgress()
  if (progress === null) return
  applyProgress(progress)
}

/** 回到「滚动前的初始态」（未进入区间时的样子） */
function resetToStart() {
  const list = charEls.filter((el): el is HTMLElement => !!el)
  for (const el of list) {
    el.style.opacity = '0'
    el.style.transform = 'translateY(120%) scale(0.7, 2.3)'
  }
}

/* ── 生命周期 ─────────────────────────────────────────── */

function attach() {
  disposeWatcher?.()
  disposeWatcher = createScrollWatcher(
    () => toScrollerElement(props.scrollContainer),
    update,
    rootRef.value,
  )
}

onMounted(async () => {
  await nextTick()
  if (prefersReducedMotion()) return // 减少动效：不参与，文字保持可见
  update()
  attach()
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    void document.fonts.ready.then(() => {
      resetToStart()
      update()
    })
  }
})

onBeforeUnmount(() => {
  disposeWatcher?.()
  disposeWatcher = null
})

// 文案 / 参数变了：重挂监听并重算
watch(
  [
    () => props.text,
    () => props.scrollStart,
    () => props.scrollEnd,
    () => props.ease,
    () => props.animationDuration,
    () => props.stagger,
    () => props.scrollContainer,
  ],
  async () => {
    await nextTick()
    if (prefersReducedMotion()) return
    attach()
    resetToStart()
    update()
  },
)

defineExpose({
  /** 手动按当前滚动位置重算一次（探针 / 外部布局变化后用） */
  update,
  /** 当前滚动进度（0~1，读一次算一次） */
  progress: () => currentProgress(),
})
</script>

<template>
  <h2 ref="rootRef" class="scroll-float" :class="containerClassName">
    <span class="scroll-float__text" :class="textClassName">
      <template v-if="$slots.default">
        <slot />
      </template>
      <template v-else>
        <span
          v-for="(char, index) in chars"
          :key="`${index}-${char}`"
          :ref="el => setCharEl(el, index)"
          class="scroll-float__char"
        >{{ char }}</span>
      </template>
    </span>
  </h2>
</template>

<style scoped>
.scroll-float {
  overflow: hidden;
}

.scroll-float__text {
  display: inline-block;
  font-size: clamp(1.6rem, 8vw, 10rem);
  font-weight: 900;
  text-align: center;
  line-height: 1.5;
}

.scroll-float__char {
  display: inline-block;
  /* 从「上方」缩放，所以字像是从底部被拉上来 */
  transform-origin: 50% 0%;
  will-change: opacity, transform;
}

/* 减少动效时不参与：字保持原样 */
@media (prefers-reduced-motion: reduce) {
  .scroll-float__char {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
