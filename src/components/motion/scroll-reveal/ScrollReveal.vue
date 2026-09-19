<script setup lang="ts">
/**
 * Scroll Reveal —— 滚动揭露：文字随滚动逐词「显影」（透明度 + 模糊一起走），整块文字还会从微小的倾角转正
 *
 * 移植自 React Bits 的 Scroll Reveal（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/scroll-reveal
 * 原版用 gsap + ScrollTrigger 挂了**三条互相独立的 scrub 补间**：
 *
 *   ① 容器：`rotate: baseRotation → 0`（`transform-origin: 0% 50%`）
 *      区间 `top bottom`（元素顶边碰到容器底边）→ `rotationEnd`（默认 `bottom bottom`）
 *   ② 逐词：`opacity: baseOpacity → 1`，`stagger: 0.05`
 *      区间 `top bottom-=20%` → `wordAnimationEnd`（默认 `bottom bottom`）
 *   ③ 逐词：`filter: blur(blurStrength px) → blur(0)`（`enableBlur` 时），区间与 stagger 同 ②
 *
 * 三条都是 `ease: 'none'`（线性），所以这里不需要缓动函数，纯线性插值；
 * 滚动进度怎么算交给 `../scroll-trigger`（和 ScrollFloat 共用同一套 GSAP 位置解析）。
 *
 * 与上游的差异（都是有意为之）：
 *   · 上游把 `stagger: 0.05` 写死在代码里，这里提成 prop `wordStagger`
 *   · 上游按**空白**切词，中文整段会变成一个「词」（失去逐词感）→ 这里中日韩逐字切开，
 *     中文标点跟随前一个字（避免标点单独换行）
 *   · 上游没有 `prefers-reduced-motion` 处理 → 这里开了减少动效就完全不参与，文字保持原样
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { clamp01, createScrollWatcher, prefersReducedMotion, scrollProgress, toScrollerElement } from '../scroll-trigger'

const props = withDefaults(
  defineProps<{
    /** 要展示的文字；也可以用默认插槽（插槽内容不会被切词） */
    text?: string
    /** 滚动容器；不传则用 window（页面滚动） */
    scrollContainer?: HTMLElement | null
    /** 逐词动画时是否叠一层模糊 */
    enableBlur?: boolean
    /** 逐词的初始透明度（0 = 完全隐形） */
    baseOpacity?: number
    /** 容器初始倾角（度），滚过区间后转到 0 */
    baseRotation?: number
    /** 初始模糊强度（px） */
    blurStrength?: number
    /** 相邻词错开的时间线长度（秒）；上游写死 0.05 */
    wordStagger?: number
    /** 容器旋转的区间终点（GSAP 位置写法） */
    rotationEnd?: string
    /** 逐词动画的区间终点（GSAP 位置写法） */
    wordAnimationEnd?: string
    /** 外层容器的类名（Vue 里直接写 class 也会透传到根元素） */
    containerClassName?: string
    /** 文字层的类名 */
    textClassName?: string
  }>(),
  {
    text: '',
    scrollContainer: null,
    enableBlur: true,
    baseOpacity: 0.1,
    baseRotation: 3,
    blurStrength: 4,
    wordStagger: 0.05,
    rotationEnd: 'bottom bottom',
    wordAnimationEnd: 'bottom bottom',
    containerClassName: '',
    textClassName: '',
  },
)

/** 上游里两个区间起点是写死的（只有终点能配） */
const ROTATE_START = 'top bottom'
const WORD_START = 'top bottom-=20%'
/** `gsap.fromTo(el, {...}, {...})` 没写 duration 时是 0.5s —— 逐词的错开就是在这一条线上偏移 */
const WORD_DURATION = 0.5

const rootRef = ref<HTMLElement | null>(null)

/* ── 切词 ───────────────────────────────────────────────── */

/** 中日韩表意文字 / 假名 / 谚文：这类文字之间没有空白，得逐字切 */
const CJK_CHAR = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/
/** 中文标点：不单独成词，附到前一个字上（否则行首会冒标点） */
const CJK_PUNCT = /[\u3001-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65\u2014\u2026\u2018\u2019\u201c\u201d]/

function splitWords(text: string): string[] {
  const out: string[] = []
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue
    if (/^\s+$/.test(part)) {
      out.push(part) // 空白原样保留（原生空格会随行折断）
      continue
    }
    let buffer = ''
    const flush = () => {
      if (buffer) {
        out.push(buffer)
        buffer = ''
      }
    }
    for (const char of Array.from(part)) {
      if (CJK_CHAR.test(char)) {
        flush()
        out.push(char)
      } else if (CJK_PUNCT.test(char)) {
        flush()
        const prev = out[out.length - 1]
        if (prev && !/^\s+$/.test(prev)) out[out.length - 1] = prev + char
        else out.push(char)
      } else {
        buffer += char
      }
    }
    flush()
  }
  return out
}

interface Piece {
  text: string
  /** 这是第几个「词」（空白片为 -1） */
  wordIndex: number
}

const pieces = computed<Piece[]>(() => {
  let index = 0
  return splitWords(String(props.text ?? '')).map((text) => {
    const isWord = !/^\s+$/.test(text)
    return { text, wordIndex: isWord ? index++ : -1 }
  })
})

/** 词的数量（= 参与动画的元素个数） */
const wordCount = computed(() => pieces.value.filter((piece) => piece.wordIndex >= 0).length)

const wordEls: (HTMLElement | null)[] = []
function setWordEl(el: Element | null, index: number) {
  wordEls[index] = (el as HTMLElement | null) ?? null
}

/* ── 应用 ───────────────────────────────────────────────── */

/** 清掉所有内联样式（挂载 / 参数变化时先回到干净状态，免得旧值残留） */
function resetStyles() {
  if (rootRef.value) rootRef.value.style.transform = ''
  const count = wordCount.value
  for (let i = 0; i < count; i += 1) {
    const word = wordEls[i]
    if (!word) continue
    word.style.opacity = ''
    word.style.filter = ''
  }
}

/** 按当前滚动位置重算一遍样式 */
function update() {
  const el = rootRef.value
  if (!el) return
  const scroller = toScrollerElement(props.scrollContainer)

  // ① 容器：baseRotation → 0
  const baseRotation = Number(props.baseRotation) || 0
  const rotateProgress = scrollProgress(el, scroller, ROTATE_START, props.rotationEnd)
  if (rotateProgress !== null) {
    el.style.transform = baseRotation
      ? `rotate(${((1 - rotateProgress) * baseRotation).toFixed(4)}deg)`
      : ''
  }

  // ②③ 逐词：透明度 + 模糊共用一条时间线
  const wordProgress = scrollProgress(el, scroller, WORD_START, props.wordAnimationEnd)
  const count = wordCount.value
  if (wordProgress === null || !count) return

  const stagger = Math.max(0, Number(props.wordStagger) || 0)
  const total = WORD_DURATION + stagger * (count - 1)
  const time = wordProgress * total
  const baseOpacity = clamp01(Number(props.baseOpacity) || 0)
  const blur = Math.max(0, Number(props.blurStrength) || 0)
  const showBlur = props.enableBlur && blur > 0

  for (let i = 0; i < count; i += 1) {
    const word = wordEls[i]
    if (!word) continue
    const local = clamp01((time - i * stagger) / WORD_DURATION)
    word.style.opacity = String(baseOpacity + (1 - baseOpacity) * local)
    word.style.filter = showBlur ? `blur(${(blur * (1 - local)).toFixed(3)}px)` : ''
  }
}

/** 读当前两条进度（给文档 / 调试看） */
function progress() {
  const el = rootRef.value
  if (!el) return { rotate: null as number | null, words: null as number | null }
  const scroller = toScrollerElement(props.scrollContainer)
  return {
    rotate: scrollProgress(el, scroller, ROTATE_START, props.rotationEnd),
    words: scrollProgress(el, scroller, WORD_START, props.wordAnimationEnd),
  }
}

/* ── 生命周期 ───────────────────────────────────────────── */

let disposeWatcher: (() => void) | null = null

async function start() {
  await nextTick()
  if (prefersReducedMotion()) return // 减少动效：不参与，文字保持可见
  resetStyles()
  update()
  disposeWatcher?.()
  disposeWatcher = createScrollWatcher(
    () => toScrollerElement(props.scrollContainer),
    update,
    rootRef.value,
  )
}

onMounted(() => void start())

onBeforeUnmount(() => {
  disposeWatcher?.()
  disposeWatcher = null
})

watch(
  [
    () => props.text,
    () => props.scrollContainer,
    () => props.enableBlur,
    () => props.baseOpacity,
    () => props.baseRotation,
    () => props.blurStrength,
    () => props.wordStagger,
    () => props.rotationEnd,
    () => props.wordAnimationEnd,
  ],
  () => {
    void start()
  },
)

defineExpose({
  /** 手动按当前滚动位置重算一次 */
  update,
  /** 读两条进度（0~1 或 null） */
  progress,
})
</script>

<template>
  <h2 ref="rootRef" class="scroll-reveal" :class="containerClassName">
    <p class="scroll-reveal__text" :class="textClassName">
      <template v-if="$slots.default">
        <slot />
      </template>
      <template v-else>
        <template v-for="(piece, index) in pieces" :key="`${index}-${piece.text}`">
          <span v-if="piece.wordIndex < 0" class="scroll-reveal__space">{{ piece.text }}</span>
          <span
            v-else
            :ref="el => setWordEl(el, piece.wordIndex)"
            class="scroll-reveal__word"
          >{{ piece.text }}</span>
        </template>
      </template>
    </p>
  </h2>
</template>

<style scoped>
.scroll-reveal {
  /* 从左边（0% 50%）转，所以整段文字像被人「掰正」 */
  transform-origin: 0% 50%;
  margin: 20px 0;
}

.scroll-reveal__text {
  font-size: clamp(1.6rem, 4vw, 3rem);
  font-weight: 600;
  line-height: 1.5;
}

.scroll-reveal__word {
  display: inline-block;
  will-change: opacity, filter;
}

/* 减少动效时不参与：文字保持原样 */
@media (prefers-reduced-motion: reduce) {
  .scroll-reveal {
    transform: none !important;
  }

  .scroll-reveal__word {
    opacity: 1 !important;
    filter: none !important;
  }
}
</style>
