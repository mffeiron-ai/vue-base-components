<script setup lang="ts">
/**
 * TableBody —— 表体 <tbody>。
 * 最后一行去掉下边框，避免与容器边缘叠成双线（下边框本身由样式预设的 `border-b` 提供，
 * 颜色则由 TableRow 上的 `border-input` 负责）。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <tbody
    data-slot="table-body"
    :class="cn('[&_tr:last-child]:border-0', props.class)"
  >
    <slot />
  </tbody>
</template>
