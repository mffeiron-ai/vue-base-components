<script setup lang="ts">
/**
 * Dialog —— 模态对话框的根组件（状态与语义层，本身不渲染任何 DOM）。
 *
 * 组合方式：`Dialog` 包住 `DialogTrigger` + `DialogContent`（内容里再放
 * `DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter`）。
 *
 * 要点：
 * - 受控用 `v-model:open`，不管就是非受控；作用域插槽可拿到 `{ open }`
 * - 默认 `modal`：打开时锁住背景滚动与焦点，Esc 或点遮罩会关闭
 * - 需要「必须点按钮才能关」（如删除确认）请用 AlertDialog，那个不吃 Esc / 点遮罩
 */
import type { DialogRootEmits, DialogRootProps } from "reka-ui"
import { DialogRoot, useForwardPropsEmits } from "reka-ui"

// props / emits 原样透传给 reka 的 DialogRoot
const props = defineProps<DialogRootProps>()
const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DialogRoot
    v-slot="slotProps"
    data-slot="dialog"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </DialogRoot>
</template>
