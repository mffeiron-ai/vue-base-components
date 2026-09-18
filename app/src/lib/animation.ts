/**
 * 全局动效设置（与「风格」「主题」「字体」并列的第四个维度）
 *
 * 做两件事：
 *   ① 「动画形式」→ `<html data-anim="…">`（播哪套关键帧）
 *   ② 「动画时长」→ `<html data-anim-speed="…">`（多快；`custom` 档再补一个**内联**变量
 *      `--anim-custom-dur`，值来自滑块）
 * 具体 keyframes 与数值都写在 src/styles/animations.css 里
 *（组件里只写 cn-anim-enter / cn-anim-overlay / cn-anim-backdrop 这类语义类）。
 *
 * 持久化 key：`app-global-anim` / `app-global-anim-speed` / `app-global-anim-dur`
 */
import { computed, ref, watch } from 'vue'

export type AnimKey = 'fade' | 'from-left' | 'from-right' | 'from-bottom' | 'zoom' | 'none'

export const ANIM_OPTIONS: Array<{ value: AnimKey, label: string, short: string, hint: string }> = [
  { value: 'fade', label: '淡入', short: '淡入', hint: '只做透明度，最稳' },
  { value: 'from-left', label: '从左滑入', short: '左滑', hint: '水平位移 16px' },
  { value: 'from-right', label: '从右滑入', short: '右滑', hint: '与「从左滑入」相反' },
  { value: 'from-bottom', label: '从下浮入', short: '下浮', hint: '竖向位移 16px' },
  { value: 'zoom', label: '缩放', short: '缩放', hint: '从 96% 放大到 100%' },
  { value: 'none', label: '无动画', short: '无', hint: '只保留最终态' },
]

// 说明：`label` 给面板与窄屏提示用，`short` 给**滚动收窄后的导航栏**用
//（长名 4 个字会占 56px，把整行挤到换行，见 SiteNavbar 的长短标签交叉淡入）。

const ANIM_STORAGE_KEY = 'app-global-anim'
const SPEED_STORAGE_KEY = 'app-global-anim-speed'
const MS_STORAGE_KEY = 'app-global-anim-dur'

/**
 * 时长档位。
 * 固定档位的毫秒数**同时**写在 animations.css（`[data-anim-speed='…']`）里，
 * 这里的 `ms` 只用于界面显示与「当前时长」计算，改动记得两边一起改。
 * `custom` 档没有固定值，读滑块（`animMs`）。
 */
export type AnimSpeedKey = 'faster' | 'normal' | 'slow' | 'slower' | 'custom'

export const ANIM_SPEED_OPTIONS: Array<{ value: AnimSpeedKey, label: string, ms: number | null }> = [
  { value: 'faster', label: '很快', ms: 120 },
  { value: 'normal', label: '标准', ms: 240 },
  { value: 'slow', label: '舒缓', ms: 360 },
  { value: 'slower', label: '很慢', ms: 520 },
  { value: 'custom', label: '自定义', ms: null },
]

export const ANIM_MS_MIN = 60
export const ANIM_MS_MAX = 800
export const ANIM_MS_STEP = 20
export const ANIM_MS_DEFAULT = 240

/** 归一到 [MIN, MAX] 并对齐 STEP（滑块与本地存储都走它） */
export function clampAnimMs(ms: number) {
  const stepped = Math.round(ms / ANIM_MS_STEP) * ANIM_MS_STEP
  return Math.min(ANIM_MS_MAX, Math.max(ANIM_MS_MIN, stepped))
}

/** 读本地存的动效形式；值已下线（如旧版 flip）或非法时回退到 fade */
function readStoredAnim(): AnimKey {
  const stored = localStorage.getItem(ANIM_STORAGE_KEY)
  return ANIM_OPTIONS.some(o => o.value === stored) ? (stored as AnimKey) : 'fade'
}

/** 读本地存的时长档位；非法值回退到 standard */
function readStoredSpeed(): AnimSpeedKey {
  const stored = localStorage.getItem(SPEED_STORAGE_KEY)
  return ANIM_SPEED_OPTIONS.some(o => o.value === stored) ? (stored as AnimSpeedKey) : 'normal'
}

function readStoredMs(): number {
  const n = Number(localStorage.getItem(MS_STORAGE_KEY))
  return Number.isFinite(n) && n > 0 ? clampAnimMs(n) : ANIM_MS_DEFAULT
}

const animKey = ref<AnimKey>(readStoredAnim())
const animSpeed = ref<AnimSpeedKey>(readStoredSpeed())
const animMs = ref<number>(readStoredMs())

watch(animKey, (value) => {
  document.documentElement.dataset.anim = value
  localStorage.setItem(ANIM_STORAGE_KEY, value)
}, { immediate: true })

watch([animSpeed, animMs], ([speed, ms]) => {
  const root = document.documentElement
  root.dataset.animSpeed = speed
  localStorage.setItem(SPEED_STORAGE_KEY, speed)
  localStorage.setItem(MS_STORAGE_KEY, String(ms))
  // 固定档位的时长由 CSS 给；只有自定义档才写内联变量（用 removeProperty 清干净，避免残留）
  if (speed === 'custom')
    root.style.setProperty('--anim-custom-dur', `${ms}ms`)
  else
    root.style.removeProperty('--anim-custom-dur')
}, { immediate: true })

export function useGlobalAnim() {
  /** 当前实际生效的进入时长（ms）：固定档位查表，自定义读滑块值 */
  const currentMs = computed(() => {
    if (animSpeed.value === 'custom')
      return animMs.value
    return ANIM_SPEED_OPTIONS.find(o => o.value === animSpeed.value)?.ms ?? ANIM_MS_DEFAULT
  })

  const currentSpeedLabel = computed(
    () => ANIM_SPEED_OPTIONS.find(o => o.value === animSpeed.value)?.label ?? '标准',
  )

  return {
    animKey,
    animSpeed,
    animMs,
    currentMs,
    currentSpeedLabel,
    setAnim(key: AnimKey) {
      animKey.value = key
    },
    setAnimSpeed(key: AnimSpeedKey) {
      animSpeed.value = key
    },
    /** 拖动滑块：写值并自动切到「自定义」档 */
    setAnimMs(ms: number) {
      animMs.value = clampAnimMs(ms)
      animSpeed.value = 'custom'
    },
  }
}
