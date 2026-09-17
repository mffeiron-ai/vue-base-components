<script setup lang="ts">
/**
 * KbdGroup —— 组合键的容器（如 ⌘ + K）。
 *
 * 只负责用 `inline-flex items-center gap-1` 把多个 Kbd 排成一行；
 * 渲染的也是 `<kbd>` —— HTML 规范里 `kbd` 套 `kbd` 正是表示「组合键」的推荐写法。
 * 想在中间加「+」号，直接写文字节点就行：
 * `<KbdGroup><Kbd>⌘</Kbd>+<Kbd>K</Kbd></KbdGroup>`。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <kbd
    data-slot="kbd-group"
    :class="cn('inline-flex items-center gap-1', props.class)"
  >
    <slot />
  </kbd>
</template>
