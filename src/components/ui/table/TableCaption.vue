<script setup lang="ts">
/**
 * TableCaption —— 表格 <caption>，放在表格底部当说明/数据来源（语义上仍属表格标题）。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <caption
    data-slot="table-caption"
    :class="cn('text-muted-foreground mt-4 text-sm', props.class)"
  >
    <slot />
  </caption>
</template>
