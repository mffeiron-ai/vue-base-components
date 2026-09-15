<script setup lang="ts">
/**
 * TableHead —— 表头单元格 <th>。
 * 内置“放复选框”时的两条对齐规则：`[&:has([role=checkbox])]:pr-0`（收紧右侧内边距）
 * 与 `[&>[role=checkbox]]:translate-y-[2px]`（复选框视觉居中）—— Checkbox 自带 role=checkbox。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <th
    data-slot="table-head"
    :class="cn('text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', props.class)"
  >
    <slot />
  </th>
</template>
