<script setup lang="ts">
/**
 * DropdownMenu —— 点击展开的下拉菜单根组件（状态层，不渲染 DOM）。
 *
 * 组合：`DropdownMenu` 包住 `DropdownMenuTrigger` + `DropdownMenuContent`，
 * 里面再放 `DropdownMenuItem` / `DropdownMenuLabel` / `DropdownMenuSeparator` /
 * `DropdownMenuCheckboxItem` / `DropdownMenuRadioGroup` + `DropdownMenuRadioItem` / `DropdownMenuSub` 系列。
 *
 * 与 ContextMenu 的区别：这个是「点一下触发」（按钮菜单），ContextMenu 是「右键触发」。
 * 常用：`v-model:open` 受控开合。
 *
 * **`modal` 默认给 false**（reka 上游默认 true）：菜单打开时不该锁页面滚动 ——
 * 上游默认值会给 body 加 `overflow: hidden`，导致 `position: sticky` 的侧边栏
 * 失去滚动祖先而“往上跳”，关闭时还会把滚动位置重置到顶部。
 * 确实需要模态（锁滚动 + 锁焦点）时显式传 `modal` 即可。
 */

import type { DropdownMenuRootEmits, DropdownMenuRootProps } from "reka-ui"
import { DropdownMenuRoot, useForwardPropsEmits } from "reka-ui"

// modal 默认关掉：见上方说明（避免粘性侧边栏跳位 / 滚动位置被重置）
const props = withDefaults(defineProps<DropdownMenuRootProps>(), {
  modal: false,
})
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
