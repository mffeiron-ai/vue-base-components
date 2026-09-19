<script setup lang="ts">
/**
 * Shiny Text —— 扫光文字：一条高光从左（右）扫过整行文字
 *
 * 移植自 React Bits 的 Shiny Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/shiny-text
 * 原版的实现要点：`linear-gradient(spread deg, color…shineColor…color)` + `background-size: 200% auto`
 * + `background-clip: text`，然后用 rAF 逐帧推 `background-position`（p: 0→150%，100→-50%）。
 *
 * 这里不逐帧推，改成**等价的一整套 CSS keyframes**：
 *   · `yoyo` / `delay` 折成关键帧里的「停滞段」，时长由参数算出来（因此按实例动态生成 keyframes）
 *   · `pauseOnHover` → `animation-play-state: paused`，`disabled` → 不挂动画
 *   · 颜色参数直接接受 `--color-*` 变量名（包成 `var(...)`），所以默认就跟着当前主题走
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

let seed = 0

const props = withDefaults(
  defineProps<{
    /** 展示的文案 */
    text?: string
    /** 关掉扫光（保持静态） */
    disabled?: boolean
    /** 一个扫光来回的时长（秒） */
    speed?: number
    /** 每个循环之间的停顿（秒）；yoyo 时平均分在两端 */
    delay?: number
    /** 渐变角度 */
    spread?: number
    /** 底色；传 `--color-*` 变量名会跟随主题 */
    color?: string
    /** 高光色；传 `--color-*` 变量名会跟随主题 */
    shineColor?: string
    /** 扫光方向：left = 从右往左扫（上游默认），right = 从左往右 */
    direction?: 'left' | 'right'
    /** 来回扫（false 则每次从头开始） */
    yoyo?: boolean
    /** 悬停暂停 */
    pauseOnHover?: boolean
  }>(),
  {
    text: '',
    disabled: false,
    speed: 2,
    delay: 0,
    spread: 120,
    // 上游默认是 #b5b5b5 / #ffffff（浅灰底 + 白高光）；这里换成主题 token，深浅色下都自然
    color: '--color-muted-foreground',
    shineColor: '--color-foreground',
    direction: 'left',
    yoyo: false,
    pauseOnHover: false,
  },
)

const hovered = ref(false)

/** `--color-x` → `var(--color-x, fallback)`，普通色值原样用 */
function colorCss(value: string | undefined, fallback: string) {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  return raw.startsWith('--') ? `var(${raw}, ${fallback})` : raw
}

const animationName = `shiny-sweep-${++seed}`

/** 上游的起止位置：p=0 → 150%（高光在右侧外面），p=100 → -50%（高光扫到左侧外面） */
const FROM = '150% center'
const TO = '-50% center'

/** 按参数生成 keyframes：把 delay 折成「停滞段」 */
function buildKeyframes() {
  const speed = Math.max(0.05, Number(props.speed) || 2)
  const pause = Math.max(0, Number(props.delay) || 0)
  const start = props.direction === 'right' ? TO : FROM
  const end = props.direction === 'right' ? FROM : TO

  if (props.yoyo) {
    // 去程 speed + 停顿一半 + 回程 speed + 停顿一半 → 循环起来无缝
    const total = speed * 2 + pause
    const a = (speed / total) * 100
    const b = ((speed + pause / 2) / total) * 100
    const c = ((speed * 2 + pause / 2) / total) * 100
    return `@keyframes ${animationName} {
  0% { background-position: ${start}; }
  ${a.toFixed(3)}% { background-position: ${end}; }
  ${b.toFixed(3)}% { background-position: ${end}; }
  ${c.toFixed(3)}% { background-position: ${start}; }
  100% { background-position: ${start}; }
}`
  }
  const total = speed + pause
  const move = (speed / total) * 100
  return `@keyframes ${animationName} {
  0% { background-position: ${start}; }
  ${move.toFixed(3)}% { background-position: ${end}; }
  100% { background-position: ${end}; }
}`
}

let styleEl: HTMLStyleElement | null = null

function syncKeyframes() {
  if (typeof document === 'undefined') return
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.setAttribute('data-shiny-text', animationName)
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = buildKeyframes()
}

const cycleSeconds = computed(
  () => (props.yoyo ? Math.max(0.05, props.speed) * 2 + Math.max(0, props.delay) : Math.max(0.05, props.speed) + Math.max(0, props.delay)),
)

const gradient = computed(() => {
  const color = colorCss(props.color, 'currentColor')
  const shine = colorCss(props.shineColor, 'currentColor')
  // 与上游逐字一致：底 0/35%，高光 50%，回到 65/100%
  return `linear-gradient(${Number(props.spread) || 0}deg, ${color} 0%, ${color} 35%, ${shine} 50%, ${color} 65%, ${color} 100%)`
})

const rootStyle = computed<Record<string, string>>(() => ({
  backgroundImage: gradient.value,
  backgroundSize: '200% auto',
  animationName: props.disabled ? 'none' : animationName,
  animationDuration: `${cycleSeconds.value}s`,
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
  animationPlayState: props.pauseOnHover && hovered.value ? 'paused' : 'running',
}))

onMounted(syncKeyframes)

watch(
  [() => props.speed, () => props.delay, () => props.yoyo, () => props.direction],
  syncKeyframes,
)

onBeforeUnmount(() => {
  styleEl?.remove()
  styleEl = null
})
</script>

<template>
  <span
    class="shiny-text"
    :class="disabled ? 'shiny-text--disabled' : ''"
    :style="rootStyle"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >{{ text }}</span>
</template>

<style scoped>
.shiny-text {
  display: inline-block;
  /* 渐变只能画在文字上 */
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* 关掉扫光时把高光停在「屏幕外」，文字就是纯底色 */
.shiny-text--disabled {
  background-position: 150% center;
}

/* 装饰性动画：系统要求减少动效时直接不扫 */
@media (prefers-reduced-motion: reduce) {
  .shiny-text {
    animation: none !important;
  }
}
</style>
