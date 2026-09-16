<script setup lang="ts">
/**
 * Field —— 单个表单字段的容器（一个 label + 一个控件 + 描述/错误）。
 *
 * - `orientation`：`vertical`（默认，label 在上）/ `horizontal`（label 与控件同行，
 *   配 FieldContent 才能把“标签+描述”整块放到控件左侧）/ `responsive`
 *   （窄屏垂直、宽屏水平，靠外层 FieldGroup 提供的 `@container/field-group` 容器查询）
 * - 整个字段会填满宽度；用 `class` 控制列宽（如放进 12 栅格时的 `col-span-4`）
 * - 校验失败：给 Field 加 `:data-invalid="true"`，内部文字会变成 destructive 色
 *   （Input 自带 `aria-invalid` 样式，两者一起用）
 */
import type { HTMLAttributes } from "vue"
import type { FieldVariants } from "."
import { cn } from "../../../lib/utils"
import { fieldVariants } from "."

const props = defineProps<{
  class?: HTMLAttributes["class"]
  orientation?: FieldVariants["orientation"]
}>()
</script>

<template>
  <div
    role="group"
    data-slot="field"
    :data-orientation="orientation"
    :class="cn(
      fieldVariants({ orientation }),
      props.class,
    )"
  >
    <slot />
  </div>
</template>
