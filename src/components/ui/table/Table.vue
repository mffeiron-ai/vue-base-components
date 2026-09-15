<script setup lang="ts">
/**
 * Table —— 表格根：外层 div 是滚动容器（data-slot="table-container"），内层是 <table>。
 *
 * maxHeight 传字符串（如 "20rem"）：内容超出时只在容器内滚动；
 * 想让表头固定，需要自己给 TableHeader 加 `sticky top-0 z-10 bg-background`
 * （滚动发生在这层容器上，sticky 相对它生效）。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
  /** 表格容器最大高度（触发内部滚动，配合表头 sticky） */
  maxHeight?: string
}>()
</script>

<template>
  <div data-slot="table-container" class="relative w-full overflow-auto" :style="{ maxHeight: maxHeight || undefined }">
    <table data-slot="table" :class="cn('w-full caption-bottom text-sm', props.class)">
      <slot />
    </table>
  </div>
</template>
