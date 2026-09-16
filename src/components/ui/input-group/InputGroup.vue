<script setup lang="ts">
/**
 * InputGroup —— 把「输入框 + 图标 / 文本 / 按钮」拼成一体的容器。
 *
 * 结构：`InputGroup` 里放若干 `InputGroupAddon` + 一个
 * `InputGroupInput`（或 `InputGroupTextarea`）；
 * 容器负责外框、圆角与聚焦 / 错误态，内部控件是「无边框、无 ring」的。
 *
 * - **必须用 `InputGroupInput` / `InputGroupTextarea`，不要直接放 `Input`**：
 *   容器靠 `data-slot="input-group-control"` 找到内部控件来接管 hover/聚焦与错误态
 * - 聚焦：内部控件 focus-visible 时容器整体出现 ring（不用自己写 `focus-within`）
 * - 错误态：给**内部控件**加 `aria-invalid="true"` 就行，容器用 `has-[...]` 自动变红，
 *   不需要（也不应该）给容器加
 * - 尺寸：默认 `h-9`；放 `align="block-*"` 的 addon 或 textarea 时自动变成 `h-auto`
 * - 高度 / 圆角在预设里是写死的，想改要带 `!`
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="input-group"
    role="group"
    :class="cn(
      'group/input-group border-input dark:bg-input/30 relative flex w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none',
      'h-9 min-w-0 has-[>textarea]:h-auto',

      // Variants based on alignment.
      'has-[>[data-align=inline-start]]:[&>input]:pl-2',
      'has-[>[data-align=inline-end]]:[&>input]:pr-2',
      'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3',
      'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3',

      // Focus state.
      'has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]',

      // Error state.
      'has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40',

      props.class,
    )"
  >
    <slot />
  </div>
</template>
