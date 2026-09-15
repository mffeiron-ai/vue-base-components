<script setup lang="ts">
/**
 * TableBody —— 表体 <tbody>（最后一行的下边框由 TableRow 的 border-b 负责，这里去掉，避免双线）。
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
