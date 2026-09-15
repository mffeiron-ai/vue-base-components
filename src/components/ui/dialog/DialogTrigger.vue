<script setup lang="ts">
/**
 * DialogTrigger —— 打开对话框的触发器。
 *
 * 默认渲染成 `<button>`；想用自己已有的按钮加 `as-child`：
 *   <DialogTrigger as-child><Button>打开</Button></DialogTrigger>
 */
import type { DialogTriggerProps } from "reka-ui"
import { DialogTrigger } from "reka-ui"

const props = defineProps<DialogTriggerProps>()
</script>

<template>
  <DialogTrigger
    data-slot="dialog-trigger"
    v-bind="props"
  >
    <slot />
  </DialogTrigger>
</template>
