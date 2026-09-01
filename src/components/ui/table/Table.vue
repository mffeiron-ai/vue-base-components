<script setup lang="ts">
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
