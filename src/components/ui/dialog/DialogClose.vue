<script setup lang="ts">
/**
 * DialogClose —— 「关闭」按钮（点击后把对话框关掉）。
 *
 * 放在 `DialogFooter` 里做取消 / 关闭；也可以 `as-child` 包自己的按钮。
 * 右上角那个 × 是 `DialogContent` 自带的，不需要手写。
 */
import type { DialogCloseProps } from "reka-ui"
import { DialogClose } from "reka-ui"

const props = defineProps<DialogCloseProps>()
</script>

<template>
  <DialogClose
    data-slot="dialog-close"
    v-bind="props"
  >
    <slot />
  </DialogClose>
</template>
