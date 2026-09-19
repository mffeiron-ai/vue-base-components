<script setup lang="ts">
/**
 * Text Type —— 打字机效果（逐字打出来、停一下、再逐字删掉）
 *
 * 移植自 React Bits 的 Text Type（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/text-type
 * 原版只用 gsap 做「光标闪烁」（`gsap.to(opacity, { repeat: -1, yoyo: true })`），
 * 打字节奏本身是 React 的 useEffect + setTimeout 链。这里：
 *   · 光标闪烁 → 纯 CSS `@keyframes` + `alternate infinite`（等价 yoyo + repeat: -1），并尊重 prefers-reduced-motion
 *   · 打字节奏 → setTimeout 链（**不用 rAF**：后台标签页里 rAF 会被冻结）
 *   · 颜色 → `textColors` 里传 `--color-*` 变量名会自动包成 `var(...)`，天然跟随主题
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface TextTypeVariableSpeed {
  min: number
  max: number
}

export type TextTypeTag = 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4'

const props = withDefaults(
  defineProps<{
    /** 一句话，或一组句子（循环播放） */
    text: string | string[]
    /** 渲染成什么标签 */
    as?: TextTypeTag
    /** 每个字符之间的间隔（毫秒） */
    typingSpeed?: number
    /** 开始打字前的初始延迟（毫秒） */
    initialDelay?: number
    /** 打完之后、开始删除之前的停顿（毫秒） */
    pauseDuration?: number
    /** 每个字符删除之间的间隔（毫秒） */
    deletingSpeed?: number
    /** 是否循环播放整组句子 */
    loop?: boolean
    /** 是否显示光标 */
    showCursor?: boolean
    /** 打字 / 删除过程中隐藏光标 */
    hideCursorWhileTyping?: boolean
    /** 光标字符（也可以是一个 emoji / 符号） */
    cursorCharacter?: string
    /** 光标额外 class */
    cursorClassName?: string
    /** 光标闪烁的半周期时长（秒） */
    cursorBlinkDuration?: number
    /** 每句话的颜色；传 `--color-*` 变量名会跟随主题 */
    textColors?: string[]
    /** 打字速度抖动区间（毫秒），不传则恒定 */
    variableSpeed?: TextTypeVariableSpeed
    /** 进入视口才开始（默认挂载即开始） */
    startOnVisible?: boolean
    /** 反向打字（从右往左） */
    reverseMode?: boolean
  }>(),
  {
    as: 'div',
    typingSpeed: 50,
    initialDelay: 0,
    pauseDuration: 2000,
    deletingSpeed: 30,
    loop: true,
    showCursor: true,
    hideCursorWhileTyping: false,
    cursorCharacter: '|',
    cursorClassName: '',
    cursorBlinkDuration: 0.5,
    reverseMode: false,
  },
)

const emit = defineEmits<{
  /** 一句话被完整删完之后触发（与上游 onSentenceComplete 一致） */
  sentenceComplete: [sentence: string, index: number]
}>()

const rootEl = ref<HTMLElement | null>(null)

const textArray = computed<string[]>(() => (Array.isArray(props.text) ? props.text : [String(props.text ?? '')]))

const displayed = ref('')
const charIndex = ref(0)
const isDeleting = ref(false)
const textIndex = ref(0)
const visible = ref(true)
const running = ref(false)

let timer: number | null = null
let viewObserver: IntersectionObserver | null = null

/** 当前这句话（开启 reverseMode 时把字序倒过来） */
const targetChars = computed(() => {
  const raw = textArray.value[textIndex.value] ?? ''
  return Array.from(props.reverseMode ? Array.from(raw).reverse().join('') : raw)
})

const currentColor = computed(() => {
  const list = props.textColors ?? []
  if (!list.length) return 'inherit'
  const color = String(list[textIndex.value % list.length] ?? '')
  if (!color) return 'inherit'
  // `--color-primary` 这类主题变量名 → 包成 var(...)，换主题自动跟着变
  return color.startsWith('--') ? `var(${color})` : color
})

const shouldHideCursor = computed(
  () => props.hideCursorWhileTyping && (charIndex.value < targetChars.value.length || isDeleting.value),
)

/* ── 打字状态机 ─────────────────────────────────────────── */

function clearTimer() {
  if (timer !== null) {
    window.clearTimeout(timer)
    timer = null
  }
}

function later(fn: () => void, delay: number) {
  clearTimer()
  timer = window.setTimeout(() => {
    timer = null
    fn()
  }, Math.max(0, Number(delay) || 0))
}

function randomSpeed() {
  const range = props.variableSpeed
  if (!range) return props.typingSpeed
  const min = Math.min(range.min, range.max)
  const max = Math.max(range.min, range.max)
  return Math.random() * (max - min) + min
}

function step() {
  if (!running.value) return
  const arr = textArray.value
  if (!arr.length) return

  if (isDeleting.value) {
    if (displayed.value === '') {
      isDeleting.value = false
      // 与上游一致：事件在「这句被删完」时抛，而不是刚打完时
      emit('sentenceComplete', arr[textIndex.value] ?? '', textIndex.value)
      if (textIndex.value === arr.length - 1 && !props.loop) {
        running.value = false
        return
      }
      textIndex.value = (textIndex.value + 1) % arr.length
      charIndex.value = 0
      later(step, props.pauseDuration)
      return
    }
    charIndex.value = Math.max(0, charIndex.value - 1)
    displayed.value = Array.from(displayed.value).slice(0, -1).join('')
    later(step, props.deletingSpeed)
    return
  }

  if (charIndex.value < targetChars.value.length) {
    charIndex.value += 1
    displayed.value = targetChars.value.slice(0, charIndex.value).join('')
    later(step, props.variableSpeed ? randomSpeed() : props.typingSpeed)
    return
  }

  // 打完了：非循环模式下最后一句就停在这里（不删除）
  if (!props.loop && textIndex.value === arr.length - 1) {
    running.value = false
    return
  }
  later(() => {
    isDeleting.value = true
    step()
  }, props.pauseDuration)
}

/** 从头开始（写文案改切分、或手动重播都走这里） */
function start() {
  clearTimer()
  textIndex.value = 0
  charIndex.value = 0
  displayed.value = ''
  isDeleting.value = false
  if (!visible.value) {
    running.value = false
    return
  }
  running.value = true
  later(step, props.initialDelay)
}

/* ── 生命周期 ───────────────────────────────────────────── */

onMounted(() => {
  const root = rootEl.value
  if (props.startOnVisible && root) {
    visible.value = false
    viewObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some(entry => entry.isIntersecting)) return
        visible.value = true
        viewObserver?.disconnect()
        viewObserver = null
        start()
      },
      { threshold: 0.1 },
    )
    viewObserver.observe(root)
    return
  }
  visible.value = true
  start()
})

onBeforeUnmount(() => {
  running.value = false
  clearTimer()
  viewObserver?.disconnect()
  viewObserver = null
})

// 文案 / 方向变了 → 从头开始
watch([textArray, () => props.reverseMode], () => {
  if (visible.value) start()
})

defineExpose({ play: start, replay: start })
</script>

<template>
  <component
    :is="as"
    ref="rootEl"
    class="text-type"
  >
    <span
      class="text-type__content"
      :style="{ color: currentColor }"
    >{{ displayed }}</span>
    <span
      v-if="showCursor"
      class="text-type__cursor"
      :class="[cursorClassName, shouldHideCursor ? 'text-type__cursor--hidden' : '']"
      :style="{ animationDuration: `${cursorBlinkDuration}s` }"
    >{{ cursorCharacter }}</span>
  </component>
</template>

<style scoped>
.text-type {
  display: inline-block;
  white-space: pre-wrap;
}

.text-type__content {
  display: inline;
}

.text-type__cursor {
  display: inline-block;
  margin-left: 0.25rem;
  opacity: 1;
  /* 等价上游的 gsap.to(opacity, { repeat: -1, yoyo: true, ease: 'power2.inOut' })
     —— cubic-bezier(0.65, 0, 0.35, 1) 就是 power2.inOut */
  animation-name: text-type-blink;
  animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.text-type__cursor--hidden {
  display: none;
}

@keyframes text-type-blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .text-type__cursor {
    animation: none;
  }
}
</style>
