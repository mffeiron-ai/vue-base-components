<script setup lang="ts">
/**
 * FieldTitle —— 纯视觉的字段标题（**没有** `<label>` 语义，点它不会聚焦控件）。
 *
 * 什么时候用：只想在字段上面放一行标题、控件自己已经有无障碍标签时
 * （例如 Checkbox 已带 aria-label），或有「标题 + 附加节点（右侧小字）」的排版需求。
 * 需要点击联动就用 FieldLabel。
 *
 * 注意：它故意复用 `data-slot="field-label"`（而不是 field-title）——
 * 目的是吃到预设里 field-label 的那套样式，改名会失去视觉，别动。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="field-label"
    :class="cn(
      'flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
