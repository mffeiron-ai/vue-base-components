<script setup lang="ts">
/**
 * Glitch Text —— 故障风文字：上下两层彩色副本不断「切片」错位，像信号不稳的显示器
 *
 * 移植自 React Bits 的 Glitch Text（作者 DavidHDev，MIT 许可，代码可自由修改）：
 * https://reactbits.dev/text-animations/glitch-text
 * 上游的做法很轻：
 *   · 真正的文字在 `<div data-text="...">` 里
 *   · `::before` / `::after` 用 `content: attr(data-text)` 复制一份，各自 `left: ∓10px` 错开，
 *     再叠一层 `text-shadow` 做红/青「色差」
 *   · 两份副本用同一个 `clip-path` 关键帧动画（`inset(上 0 下 0)` 的横条），
 *     但周期不同（`3s` / `2s`，都 `alternate-reverse`）—— 于是两层一直在不同高度切片，看着很随机
 *   · 副本还带一个**实心背景色**把下面的原字盖住，这样每一片看起来是「这段被替换掉了」
 *
 * 我们照搬这套，另外补了三处（都是上游写死的）：
 *   · 那层「遮罩背景色」改成**自动测量**：从组件自己往上找第一个不透明背景（项目主题是 oklch，得用 canvas 归一化），
 *     所以浅色 / 深色主题下都不会露出色块
 *   · `shadowColors` / `shadowOffset` / `layerOffset` 提成 props
 *   · `prefers-reduced-motion: reduce` 时停下切片动画，只留静态色差
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { resolveBackdropColor } from '../backdrop-color'

const props = withDefaults(
  defineProps<{
    /** 要显示的文字 */
    text?: string
    /** 速度倍数：越大越慢（对应 `--after-duration: speed×3s`、`--before-duration: speed×2s`） */
    speed?: number
    /** 是否给两份副本加红/青文字阴影（色差） */
    enableShadows?: boolean
    /** 只在悬停时才故障 */
    enableOnHover?: boolean
    /** 两份副本的阴影色 `[after, before]`；支持 `--color-*` 主题变量 */
    shadowColors?: string[]
    /** 文字阴影的横向偏移（px） */
    shadowOffset?: number
    /** 两份副本相对原字的横向偏移（px） */
    layerOffset?: number
    /** 副本那层遮罩用的背景色；`auto`（默认）= 自动测量元素背后的第一个不透明背景 */
    maskColor?: string
    /** 额外类名（Vue 里直接写 class 也会透传到根元素） */
    mainClassName?: string
  }>(),
  {
    text: '',
    speed: 0.5,
    enableShadows: true,
    enableOnHover: false,
    shadowColors: () => ['red', 'cyan'],
    shadowOffset: 5,
    layerOffset: 10,
    maskColor: 'auto',
    mainClassName: '',
  },
)

const rootRef = ref<HTMLElement | null>(null)
/** 主题 / 风格切换时 +1，逼着下面两个 computed 重算（它们读的是 getComputedStyle） */
const themeTick = ref(0)

/** 颜色参数接受 `--color-*` 变量名（伪元素里要真实色值） */
function resolveColor(value: string, fallback = 'transparent') {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  if (!raw.startsWith('--')) return raw
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(raw).trim()
  return resolved || fallback
}

/** 遮罩色（自动测量时会在挂载后 / 主题变化时重算） */
const mask = ref('transparent')

function refreshMask() {
  const custom = String(props.maskColor ?? '').trim()
  mask.value = custom && custom !== 'auto'
    ? resolveColor(custom)
    : resolveBackdropColor(rootRef.value)
  themeTick.value += 1
}

const cssVars = computed(() => {
  void themeTick.value
  const speed = Math.max(0.05, Number(props.speed) || 0.5)
  const offset = Number(props.shadowOffset) || 0
  const layer = Number(props.layerOffset) || 0
  const [afterColor = 'red', beforeColor = 'cyan'] = props.shadowColors ?? []
  return {
    '--glitch-after-duration': `${speed * 3}s`,
    '--glitch-before-duration': `${speed * 2}s`,
    '--glitch-after-shadow': props.enableShadows
      ? `${-offset}px 0 ${resolveColor(afterColor, 'red')}`
      : 'none',
    '--glitch-before-shadow': props.enableShadows
      ? `${offset}px 0 ${resolveColor(beforeColor, 'cyan')}`
      : 'none',
    '--glitch-after-left': `${layer}px`,
    '--glitch-before-left': `${-layer}px`,
    '--glitch-mask': mask.value,
  }
})

let themeObserver: MutationObserver | null = null

onMounted(() => {
  refreshMask()
  themeObserver = new MutationObserver(() => refreshMask())
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style', 'data-theme'],
  })
  if (document.head) {
    themeObserver.observe(document.head, { childList: true, subtree: true, characterData: true })
  }
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  themeObserver = null
})

watch(() => props.maskColor, () => refreshMask())

defineExpose({
  /** 重新测一次遮罩背景色（外层容器换了底色之后调） */
  refreshMask,
  /** 读数：当前遮罩色与两份副本的 CSS 变量（探针用） */
  stats: () => ({
    mask: mask.value,
    text: props.text,
    vars: cssVars.value,
  }),
})
</script>

<template>
  <div
    ref="rootRef"
    class="glitch"
    :class="[props.enableOnHover ? 'glitch--hover' : '', mainClassName]"
    :data-text="text"
    :style="cssVars"
  >{{ text }}</div>
</template>

<style scoped>
.glitch {
  position: relative;
  display: inline-block;
  font-size: clamp(2rem, 10vw, 8rem);
  font-weight: 900;
  line-height: 1.15;
  white-space: nowrap;
  user-select: none;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  /* 盖住下面的原字，只让被裁出来的横条可见 —— 颜色由 JS 测出来 */
  background-color: var(--glitch-mask, transparent);
  color: inherit;
  overflow: hidden;
  clip-path: inset(0 0 0 0);
  will-change: clip-path;
}

.glitch::after {
  left: var(--glitch-after-left, 10px);
  text-shadow: var(--glitch-after-shadow, -5px 0 red);
  animation: glitch-slice var(--glitch-after-duration, 3s) infinite linear alternate-reverse;
}

.glitch::before {
  left: var(--glitch-before-left, -10px);
  text-shadow: var(--glitch-before-shadow, 5px 0 cyan);
  animation: glitch-slice var(--glitch-before-duration, 2s) infinite linear alternate-reverse;
}

/* 悬停模式：平时完全隐藏副本，鼠标上来才故障 */
.glitch--hover::before,
.glitch--hover::after {
  content: '';
  opacity: 0;
  animation: none;
}

.glitch--hover:hover::after {
  content: attr(data-text);
  opacity: 1;
  animation: glitch-slice var(--glitch-after-duration, 3s) infinite linear alternate-reverse;
}

.glitch--hover:hover::before {
  content: attr(data-text);
  opacity: 1;
  animation: glitch-slice var(--glitch-before-duration, 2s) infinite linear alternate-reverse;
}

@keyframes glitch-slice {
  0% {
    clip-path: inset(20% 0 50% 0);
  }
  5% {
    clip-path: inset(10% 0 60% 0);
  }
  10% {
    clip-path: inset(15% 0 55% 0);
  }
  15% {
    clip-path: inset(25% 0 35% 0);
  }
  20% {
    clip-path: inset(30% 0 40% 0);
  }
  25% {
    clip-path: inset(40% 0 20% 0);
  }
  30% {
    clip-path: inset(10% 0 60% 0);
  }
  35% {
    clip-path: inset(15% 0 55% 0);
  }
  40% {
    clip-path: inset(25% 0 35% 0);
  }
  45% {
    clip-path: inset(30% 0 40% 0);
  }
  50% {
    clip-path: inset(20% 0 50% 0);
  }
  55% {
    clip-path: inset(10% 0 60% 0);
  }
  60% {
    clip-path: inset(15% 0 55% 0);
  }
  65% {
    clip-path: inset(25% 0 35% 0);
  }
  70% {
    clip-path: inset(30% 0 40% 0);
  }
  75% {
    clip-path: inset(40% 0 20% 0);
  }
  80% {
    clip-path: inset(20% 0 50% 0);
  }
  85% {
    clip-path: inset(10% 0 60% 0);
  }
  90% {
    clip-path: inset(15% 0 55% 0);
  }
  95% {
    clip-path: inset(25% 0 35% 0);
  }
  100% {
    clip-path: inset(30% 0 40% 0);
  }
}

/* 减少动效：停掉切片，保留静态的色差错位 */
@media (prefers-reduced-motion: reduce) {
  .glitch::before,
  .glitch::after,
  .glitch--hover:hover::before,
  .glitch--hover:hover::after {
    animation: none;
    clip-path: none;
  }
}
</style>
