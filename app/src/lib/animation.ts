/**
 * 全局动效设置（与「风格」「主题」「字体」并列的第四个维度）
 *
 * 只做一件事：把选择的「动画形式」写到 `<html data-anim="…">` 上，
 * 具体哪套 keyframes、多长时长由 src/styles/animations.css 决定
 *（组件里只写 cn-anim-enter / cn-anim-overlay / cn-anim-backdrop 这类语义类）。
 *
 * 持久化 key：`app-global-anim`
 */
import { ref, watch } from 'vue'

export type AnimKey = 'fade' | 'from-left' | 'from-right' | 'from-bottom' | 'zoom' | 'flip' | 'none'

export const ANIM_OPTIONS: Array<{ value: AnimKey, label: string, hint: string }> = [
  { value: 'fade', label: '淡入', hint: '只做透明度，最稳' },
  { value: 'from-left', label: '从左滑入', hint: '水平位移 16px' },
  { value: 'from-right', label: '从右滑入', hint: '与「从左滑入」相反' },
  { value: 'from-bottom', label: '从下浮入', hint: '竖向位移 16px' },
  { value: 'zoom', label: '缩放', hint: '从 96% 放大到 100%' },
  { value: 'flip', label: '翻转', hint: '绕 Y 轴翻开' },
  { value: 'none', label: '无动画', hint: '只保留最终态' },
]

const ANIM_STORAGE_KEY = 'app-global-anim'

const animKey = ref<AnimKey>((localStorage.getItem(ANIM_STORAGE_KEY) as AnimKey) || 'fade')

watch(animKey, (value) => {
  document.documentElement.dataset.anim = value
  localStorage.setItem(ANIM_STORAGE_KEY, value)
}, { immediate: true })

export function useGlobalAnim() {
  return {
    animKey,
    setAnim(key: AnimKey) {
      animKey.value = key
    },
  }
}
