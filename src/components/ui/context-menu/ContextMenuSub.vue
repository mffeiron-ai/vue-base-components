<script setup lang="ts">
/**
 * ContextMenuSub —— 子菜单根：里面放 SubTrigger（父项）+ SubContent（向右展开的菜单）。
 * 开合默认由 hover / 键盘右键（ArrowRight）驱动。
 */
import type { ContextMenuSubEmits, ContextMenuSubProps } from "reka-ui"
import {
  ContextMenuSub,
  useForwardPropsEmits,
} from "reka-ui"

const props = defineProps<ContextMenuSubProps>()
const emits = defineEmits<ContextMenuSubEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <ContextMenuSub
    data-slot="context-menu-sub"
    v-bind="forwarded"
  >
    <slot />
  </ContextMenuSub>
</template>
