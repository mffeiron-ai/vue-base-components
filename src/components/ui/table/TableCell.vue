<script setup lang="ts">
/**
 * TableCell —— 普通单元格 <td>（与 TableHead 同样的复选框对齐规则，属预设写法）。
 * `whitespace-normal break-words`：内容默认换行不断词，长文本不会把表格撑爆。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <td
    data-slot="table-cell"
    :class="
      cn(
        'p-2 align-middle whitespace-normal break-words [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        props.class,
      )
    "
  >
    <slot />
  </td>
</template>
