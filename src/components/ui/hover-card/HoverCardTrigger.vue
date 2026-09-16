<script setup lang="ts">
/**
 * HoverCardTrigger —— 悬停目标。
 * 默认是一层行内元素（reka 渲染成 `<a>`）；想用自己的元素（按钮、头像、整行文字）
 * 就加 `as-child`：`<HoverCardTrigger as-child><Button>…</Button></HoverCardTrigger>`。
 */
import type { HoverCardTriggerProps } from "reka-ui"
import { HoverCardTrigger } from "reka-ui"

const props = defineProps<HoverCardTriggerProps>()
</script>

<template>
  <HoverCardTrigger
    data-slot="hover-card-trigger"
    v-bind="props"
  >
    <slot />
  </HoverCardTrigger>
</template>
