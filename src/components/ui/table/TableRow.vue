<script setup lang="ts">
/**
 * TableRow —— 表格行。
 * 自带 hover 底色；选中态靠 `data-[state=selected]:bg-muted`，
 * 所以行选择场景要手动接上：`:data-state="selected ? 'selected' : undefined'"`。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <tr
    data-slot="table-row"
    :class="cn('hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors', props.class)"
  >
    <slot />
  </tr>
</template>
