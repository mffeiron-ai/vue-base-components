<script setup lang="ts">
/**
 * MenubarRadioGroup —— 单选组容器，里面放若干 `MenubarRadioItem`。
 *
 * `v-model` 绑定选中的项（互斥）；不传时内部自管。
 * 它只有一个 prop 组就是 `modelValue`，值要与对应 RadioItem 的 `value` 对得上。
 */
import type { MenubarRadioGroupEmits, MenubarRadioGroupProps } from "reka-ui"
import {
  MenubarRadioGroup,
  useForwardPropsEmits,
} from "reka-ui"

const props = defineProps<MenubarRadioGroupProps>()
const emits = defineEmits<MenubarRadioGroupEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <MenubarRadioGroup
    data-slot="menubar-radio-group"
    v-bind="forwarded"
  >
    <slot />
  </MenubarRadioGroup>
</template>
