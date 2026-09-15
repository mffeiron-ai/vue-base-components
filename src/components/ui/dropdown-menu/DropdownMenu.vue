<script setup lang="ts">
/**
 * DropdownMenu —— 点击展开的下拉菜单根组件（状态层，不渲染 DOM）。
 *
 * 组合：`DropdownMenu` 包住 `DropdownMenuTrigger` + `DropdownMenuContent`，
 * 里面再放 `DropdownMenuItem` / `DropdownMenuLabel` / `DropdownMenuSeparator` /
 * `DropdownMenuCheckboxItem` / `DropdownMenuRadioGroup` + `DropdownMenuRadioItem` / `DropdownMenuSub` 系列。
 *
 * 与 ContextMenu 的区别：这个是「点一下触发」（按钮菜单），ContextMenu 是「右键触发」。
 * 常用：`v-model:open` 受控开合；`modal` 为 true 时会锁住背景滚动与交互。
 */

import type { DropdownMenuRootEmits, DropdownMenuRootProps } from "reka-ui"
import { DropdownMenuRoot, useForwardPropsEmits } from "reka-ui"

const props = defineProps<DropdownMenuRootProps>()
const emits = defineEmits<DropdownMenuRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DropdownMenuRoot
    v-slot="slotProps"
    data-slot="dropdown-menu"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </DropdownMenuRoot>
</template>
