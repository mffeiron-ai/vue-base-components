<script setup lang="ts">
/**
 * DropdownMenuSub —— 子菜单根（状态层）。
 *
 * 写法：`DropdownMenuSub` 包住 `DropdownMenuSubTrigger`（带右侧箭头的项）+ `DropdownMenuSubContent`（二级面板）。
 * 二级面板的弹出方向由 reka 根据可用空间自动算，不用手调。
 */

import type { DropdownMenuSubEmits, DropdownMenuSubProps } from "reka-ui"
import {
  DropdownMenuSub,
  useForwardPropsEmits,
} from "reka-ui"

const props = defineProps<DropdownMenuSubProps>()
const emits = defineEmits<DropdownMenuSubEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DropdownMenuSub v-slot="slotProps" data-slot="dropdown-menu-sub" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </DropdownMenuSub>
</template>
