<script setup lang="ts">
/**
 * Gradient Text —— 渐变文字：一条会流动的渐变铺在文字上（可选渐变描边）
 *
 * 移植自 React Bits 的 Gradient Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/gradient-text
 * 原版的做法：`linear-gradient(角度, 色1, 色2, …, 色1)` + `background-size: 300% 100%`
 * + `background-repeat: repeat`，然后**逐帧推** `background-position`（0% → 100%），
 * 配 `background-clip: text` 把渐变裁到文字上。
 *
 * 这里**不逐帧推**，改成等价的一整套 CSS keyframes：
 *   · `yoyo` —— 上游的语义（去程 animationSpeed 秒 → 原路返回 animationSpeed 秒）
 *     正好就是 CSS 的 `animation-direction: alternate`，keyframes 只写 0 → 100%
 *   · 不 yoyo —— 上游的 `background-position` 会一直涨下去（0 → ∞），因为背景是
 *     `repeat` 的，涨满「一整圈」（位置 150%）看起来就接上了；这里写成 0 → 150% 的
 *     无限循环，时长 ×1.5 让速度与上游一致
 *   · `pauseOnHover` → `animation-play-state: paused`（不是 JS 计时器，移开续播不跳帧）
 *   · `showBorder` → 同一套渐变铺在整块上，中间盖一个比外框小 2px 的「挖空块」，
 *     露出来的 1px 圈就是渐变描边（上游是这么做的；挖空色默认取 `--color-background`）
 *
 * 颜色默认用主题 token（`--color-*`），所以跟着当前主题 / 风格走。
 */
import { computed, ref } from 'vue'

export type GradientTextDirection = 'horizontal' | 'vertical' | 'diagonal'

const props = withDefaults(
  defineProps<{
    /** 展示的文案（也可以用默认插槽，插槽优先） */
    text?: string
    /** 渐变色；传 `--color-*` 变量名会跟随主题 */
    colors?: string[]
    /** 一个动画循环的时长（秒） */
    animationSpeed?: number
    /** 是否加渐变描边（同时会加一点内边距） */
    showBorder?: boolean
    /** 渐变方向：横向 / 纵向 / 对角 */
    direction?: GradientTextDirection
    /** 悬停暂停 */
    pauseOnHover?: boolean
    /** 到端点原路返回（false 则一直朝一个方向流） */
    yoyo?: boolean
    /** 描边模式里「挖空块」的颜色；默认蹭页面底色，也可传卡片底色 */
    borderFill?: string
  }>(),
  {
    text: 'Gradient Magic',
    // 上游默认是 ['#5227FF', '#FF9FFC', '#B497CF']（紫粉）；这里换成主题 token，首尾同色
    // （`--color-foreground` 在深浅两套主题里都与主色差得开，渐变的走向看得出来）
    colors: () => ['--color-primary', '--color-foreground', '--color-primary'],
    animationSpeed: 8,
    showBorder: false,
    direction: 'horizontal',
    pauseOnHover: false,
    yoyo: true,
    borderFill: '--color-background',
  },
)

const hovered = ref(false)

const FALLBACK_COLORS = ['--color-primary', '--color-foreground', '--color-primary']

/** `--color-x` → `var(--color-x, fallback)`，普通色值原样用 */
function colorCss(value: string | undefined, fallback: string) {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  return raw.startsWith('--') ? `var(${raw}, ${fallback})` : raw
}

/** 首色补到末尾：首尾同色时循环才接得顺（上游的注释也强调这点） */
const stops = computed(() => {
  const list = (props.colors ?? []).map(c => String(c ?? '').trim()).filter(Boolean)
  const safe = list.length >= 2 ? list : FALLBACK_COLORS
  return [...safe, safe[0]]
})

const angle = computed(() =>
  props.direction === 'horizontal' ? 'to right' : props.direction === 'vertical' ? 'to bottom' : 'to bottom right',
)

/**
 * 上游的尺寸 / 重复方式：因为 `background-size` 是 300% 且 repeat，
 * `background-position` 的百分比每 150% 正好是一整圈（一个平铺周期）。
 */
const gradientStyle = computed<Record<string, string>>(() => ({
  backgroundImage: `linear-gradient(${angle.value}, ${stops.value.map(c => colorCss(c, 'currentColor')).join(', ')})`,
  backgroundSize:
    props.direction === 'horizontal'
      ? '300% 100%'
      : props.direction === 'vertical'
        ? '100% 300%'
        : '300% 300%',
  backgroundRepeat: 'repeat',
}))

const speed = computed(() => Math.max(0.1, Number(props.animationSpeed) || 8))

/** 对角与横向走同一套横向 keyframes（上游的对角也只推横向，避免斜向干涉纹） */
const animationName = computed(
  () => `gradient-text-${props.direction === 'vertical' ? 'v' : 'h'}-${props.yoyo ? 'yoyo' : 'loop'}`,
)

/** 文字层与描边层共用同一份样式 —— 两者的渐变相位始终是同步的 */
const animatedStyle = computed<Record<string, string>>(() => ({
  ...gradientStyle.value,
  animationName: animationName.value,
  animationDuration: `${props.yoyo ? speed.value : speed.value * 1.5}s`,
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
  animationDirection: props.yoyo ? 'alternate' : 'normal',
  animationPlayState: props.pauseOnHover && hovered.value ? 'paused' : 'running',
}))

const borderFillStyle = computed<Record<string, string>>(() => ({
  backgroundColor: colorCss(props.borderFill, '#120F17'),
}))
</script>

<template>
  <div
    class="gradient-text"
    :class="showBorder ? 'gradient-text--border' : ''"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <div v-if="showBorder" class="gradient-text__overlay" :style="animatedStyle" aria-hidden="true">
      <div class="gradient-text__overlay-inner" :style="borderFillStyle" />
    </div>
    <span class="gradient-text__content" :style="animatedStyle"><slot>{{ text }}</slot></span>
  </div>
</template>

<!--
  keyframes 必须写在**非 scoped** 块里：
  scoped 会给 @keyframes 的名字加哈希，而动画名是内联写在 :style 上的，
  Vue 只会改写 scoped CSS 里的 animation 声明、不会改内联样式 → 名字对不上就完全不动。
  四个名字都带 gradient-text 前缀，不会与别处冲突。
-->
<style>
@keyframes gradient-text-h-yoyo {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}
@keyframes gradient-text-h-loop {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 150% 50%;
  }
}
@keyframes gradient-text-v-yoyo {
  0% {
    background-position: 50% 0%;
  }
  100% {
    background-position: 50% 100%;
  }
}
@keyframes gradient-text-v-loop {
  0% {
    background-position: 50% 0%;
  }
  100% {
    background-position: 50% 150%;
  }
}
</style>

<style scoped>
.gradient-text {
  position: relative;
  margin: 0 auto;
  display: flex;
  max-width: fit-content;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 1.25rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
  transition: box-shadow 0.5s ease-out;
  overflow: hidden;
  cursor: pointer;
}

/* 描边模式要留出 1px 圈的空间（上游 CSS 版是 0.35rem / 0.75rem） */
.gradient-text--border {
  padding: 0.35rem 0.75rem;
}

.gradient-text__overlay {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  /* 必须自成层叠上下文：里面 z-index: -1 的「挖空块」才会画在渐变**之上** */
  z-index: 0;
  pointer-events: none;
}

.gradient-text__overlay-inner {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  border-radius: inherit;
  z-index: -1;
}

.gradient-text__content {
  display: inline-block;
  position: relative;
  z-index: 2;
  /* 渐变只画在文字上 */
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

/* 装饰性动画：系统要求减少动效时停在起始帧 */
@media (prefers-reduced-motion: reduce) {
  .gradient-text__overlay,
  .gradient-text__content {
    animation: none !important;
    background-position: 0% 50%;
  }
}
</style>
