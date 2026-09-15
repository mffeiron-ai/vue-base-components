<script setup lang="ts">
/**
 * ContextMenu 根组件 —— reka-ui 的 ContextMenuRoot 直通封装。
 *
 * 关键 props：
 * - v-model:open：受控开合（右键后菜单是否展开）。
 * - modal：默认 true，菜单展开时会锁住页面其余部分的交互（点外面关闭）。
 * - dir：书写方向。
 * 默认插槽里放：`ContextMenuTrigger`（右键区）+ `ContextMenuContent`（菜单本体）。
 */
import type { ContextMenuRootEmits, ContextMenuRootProps } from "reka-ui"
import { ContextMenuRoot, useForwardPropsEmits } from "reka-ui"

const props = defineProps<ContextMenuRootProps>()
const emits = defineEmits<ContextMenuRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <ContextMenuRoot
    data-slot="context-menu"
    v-bind="forwarded"
  >
    <slot />
  </ContextMenuRoot>
</template>
