<script setup lang="ts">
/**
 * ContextMenuTrigger —— 右键（移动端长按）触发区。
 *
 * - 默认渲染一个 div，**as-child** 可把触发行为合并到自己写的元素上。
 * - 和 DropdownMenuTrigger 不同：左键点它不会展开菜单，必须右键。
 * - 菜单会弹在鼠标位置，所以这个区域通常是一整块“可操作区域”（列表行、卡片、画布）。
 * - 预设没有给它定样式（无 data-slot 规则），外观完全由使用方决定。
 */
import type { ContextMenuTriggerProps } from "reka-ui"
import { ContextMenuTrigger, useForwardProps } from "reka-ui"

const props = defineProps<ContextMenuTriggerProps>()

const forwardedProps = useForwardProps(props)
</script>

<template>
  <ContextMenuTrigger
    data-slot="context-menu-trigger"
    v-bind="forwardedProps"
  >
    <slot />
  </ContextMenuTrigger>
</template>
