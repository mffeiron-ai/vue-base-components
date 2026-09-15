<script setup lang="ts">
/**
 * CommandDialog —— 把 Command 装进 Dialog，做成 ⌘K 命令面板。
 *
 * - 标题 / 描述默认英文（上游文案），建议自己传中文；两者默认是 sr-only（只给读屏）。
 * - 默认插槽会把 Dialog 的 slotProps（open 等）透出去，方便在内容里写条件。
 * - 关闭行为走 Dialog：Esc / 点遮罩由 DialogRoot 处理，打开时自动聚焦到搜索框
 *   （CommandInput 带了 auto-focus）。
 * - 预设里有 `.cn-command-dialog`（rounded-xl!）这个类钩子，所以内容层带上了这个类：
 *   弹窗圆角来自预设而不是 DialogContent 自己的值。
 */
import type { DialogRootEmits, DialogRootProps } from "reka-ui"
import { useForwardPropsEmits } from "reka-ui"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../dialog"
import Command from "./Command.vue"

const props = withDefaults(defineProps<DialogRootProps & {
  title?: string
  description?: string
}>(), {
  title: "Command Palette",
  description: "Search for a command to run...",
})
const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <Dialog v-slot="slotProps" v-bind="forwarded">
    <DialogContent class="cn-command-dialog overflow-hidden p-0">
      <DialogHeader class="sr-only">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <Command>
        <slot v-bind="slotProps" />
      </Command>
    </DialogContent>
  </Dialog>
</template>
