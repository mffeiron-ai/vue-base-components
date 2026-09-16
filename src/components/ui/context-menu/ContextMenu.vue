<script setup lang="ts">
/**
 * ContextMenu 根组件 —— reka-ui 的 ContextMenuRoot 直通封装。
 *
 * 关键 props：
 * - v-model:open：受控开合（右键后菜单是否展开）。
 * - modal：**默认给 false**（reka 上游默认 true）—— 菜单展开时不该锁页面滚动：
 *   上游默认值会给 body 加 overflow: hidden，导致 position: sticky 的侧边栏失去
 *   滚动祖先而“往上跳”，关闭时还会把滚动位置重置。需要模态行为时显式传 modal。
 * - dir：书写方向。
 * 默认插槽里放：`ContextMenuTrigger`（右键区）+ `ContextMenuContent`（菜单本体）。
 */
import type { ContextMenuRootEmits, ContextMenuRootProps } from "reka-ui"
import { ContextMenuRoot, useForwardPropsEmits } from "reka-ui"

const props = withDefaults(defineProps<ContextMenuRootProps>(), {
  modal: false,
})
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
