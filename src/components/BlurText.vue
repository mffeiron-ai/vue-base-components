<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { Motion } from 'motion-v'
import type { Easing } from 'motion-v'

// ── Props ─────────────────────────────────────────────
interface BlurTextProps {
  text?: string
  delay?: number          // 每个元素的延迟（ms），默认 200
  animateBy?: 'words' | 'letters'
  direction?: 'top' | 'bottom'
  threshold?: number
  rootMargin?: string
  animationFrom?: Record<string, string | number>
  animationTo?: Array<Record<string, string | number>>
  easing?: Easing | Easing[]
  onAnimationComplete?: () => void
  stepDuration?: number   // 每步持续时间（秒），默认 0.35
}

const props = withDefaults(defineProps<BlurTextProps>(), {
  text: '',
  delay: 200,
  animateBy: 'words',
  direction: 'top',
  threshold: 0.1,
  rootMargin: '0px',
  easing: (t: number) => t,
  stepDuration: 0.35,
})

// ── 拆分文本 ───────────────────────────────────────────
const elements = computed(() =>
  props.animateBy === 'words'
    ? props.text.split(' ')
    : props.text.split('')
)

// ── IntersectionObserver ───────────────────────────────
const targetRef = ref<HTMLElement | null>(null)
const inView = ref(false)

useIntersectionObserver(
  targetRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      inView.value = true
    }
  },
  { threshold: props.threshold, rootMargin: props.rootMargin }
)

// ── 默认关键帧 ─────────────────────────────────────────
const defaultFrom = computed(() =>
  props.direction === 'top'
    ? { filter: 'blur(10px)', opacity: 0, y: -50 }
    : { filter: 'blur(10px)', opacity: 0, y: 50 }
)

const defaultTo = computed(() => [
  {
    filter: 'blur(5px)',
    opacity: 0.5,
    y: props.direction === 'top' ? 5 : -5,
  },
  { filter: 'blur(0px)', opacity: 1, y: 0 },
])

// ── 动画配置 ───────────────────────────────────────────
const fromSnapshot = computed(() => props.animationFrom ?? defaultFrom.value)
const toSnapshots = computed(() => props.animationTo ?? defaultTo.value)

const stepCount = computed(() => toSnapshots.value.length + 1)
const totalDuration = computed(() => props.stepDuration * (stepCount.value - 1))
const times = computed(() =>
  Array.from({ length: stepCount.value }, (_, i) =>
    stepCount.value === 1 ? 0 : i / (stepCount.value - 1)
  )
)

// ── 构建关键帧 ─────────────────────────────────────────
function buildKeyframes(
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> {
  const keys = new Set([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ])
  const keyframes: Record<string, Array<string | number>> = {}
  keys.forEach((k) => {
    keyframes[k] = [from[k] ?? 0, ...steps.map((s) => s[k] ?? 0)]
  })
  return keyframes
}

// ── 每个元素的动画参数 ─────────────────────────────────
function getAnimateKeyframes(index: number) {
  return buildKeyframes(fromSnapshot.value, toSnapshots.value)
}

function getTransition(index: number) {
  return {
    duration: totalDuration.value,
    times: times.value,
    delay: (index * props.delay) / 1000,
    ease: props.easing,
  }
}

// ── 动画完成回调 ───────────────────────────────────────
function handleComplete(index: number) {
  if (index === elements.value.length - 1) {
    props.onAnimationComplete?.()
  }
}
</script>

<template>
  <p ref="targetRef" class="blur-text flex flex-wrap" :class="$attrs.class">
    <template v-for="(segment, index) in elements" :key="index">
      <Motion
        tag="span"
        :initial="fromSnapshot"
        :animate="inView ? getAnimateKeyframes(index) : fromSnapshot"
        :transition="getTransition(index)"
        @animation-complete="handleComplete(index)"
        style="display: inline-block; will-change: transform, filter, opacity"
      >
        {{ segment === ' ' ? '\u00A0' : segment }}
      </Motion>
      <!-- 单词模式下自动加空格 -->
      <span
        v-if="animateBy === 'words' && index < elements.length - 1"
        style="display: inline-block"
      >&nbsp;</span>
    </template>
  </p>
</template>
