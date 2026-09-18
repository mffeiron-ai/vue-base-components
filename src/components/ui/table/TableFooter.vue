<script setup lang="ts">
/**
 * TableFooter —— 页脚 <tfoot>，常用于合计行：自带浅底 + 上边框 + 加粗。
 * `border-input` 给上边框上色（原因同 TableRow：预设只写了 `border-t` 的宽度，
 * 不显式给色会取到 currentColor）。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <tfoot
    data-slot="table-footer"
    :class="cn('bg-muted/50 border-t border-input font-medium [&>tr]:last:border-b-0', props.class)"
  >
    <slot />
  </tfoot>
</template>
