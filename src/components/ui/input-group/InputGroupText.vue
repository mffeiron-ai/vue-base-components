<script setup lang="ts">
/**
 * InputGroupText —— Addon 里的纯文本（前缀 / 后缀 / 单位），比如 `$`、`@example.com`、`kg`。
 *
 * - 灰色小字（`text-muted-foreground`，14px）
 * - 里面的 `<svg>` 默认 16×16 且不接收指针事件（不会挡住输入框的点击）
 * - 要换字号 / 颜色直接传 `class`
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <span
    :class="cn(
      'text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4',
      props.class,
    )"
  >
    <slot />
  </span>
</template>
