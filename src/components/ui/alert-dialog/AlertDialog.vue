<script setup lang="ts">
import type { AlertDialogEmits, AlertDialogProps } from "reka-ui"
/**
 * AlertDialogProps：reka-ui 的 AlertDialog 根组件 props（open / defaultOpen / modal 等）。
 * AlertDialogEmits：根组件事件（update:open / openChange 等）。
 */
import { AlertDialogRoot, useForwardPropsEmits } from "reka-ui"
/**
 * AlertDialogRoot：reka-ui 真正的对话框根组件，负责管理打开/关闭状态。
 * useForwardPropsEmits：把 props + 事件合并成可 v-bind 的对象，透传给 AlertDialogRoot。
 */

const props = defineProps<AlertDialogProps>()
const emits = defineEmits<AlertDialogEmits>()
// 继承 reka-ui 的类型，让根组件的 props / emits 与 reka-ui 完全一致

const forwarded = useForwardPropsEmits(props, emits)
// 合并 { ...props, ...onXxx 事件处理器 }，供 v-bind 透传
</script>

<template>
  <!-- v-bind="forwarded"：所有 props & 事件一次性传给 AlertDialogRoot
       v-slot="slotProps" 透传根组件的 slot scope（如 open）给使用方 -->
  <AlertDialogRoot v-slot="slotProps" data-slot="alert-dialog" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </AlertDialogRoot>
</template>
