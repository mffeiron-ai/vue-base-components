<script setup lang="ts">
/**
 * ContextMenuRadioGroup —— 单选组：`v-model` 存组内当前选中项的值，
 * 内部的 ContextMenuRadioItem 只需给 value（不用各自 v-model）。
 */
import type { ContextMenuRadioGroupEmits, ContextMenuRadioGroupProps } from "reka-ui"
import {
  ContextMenuRadioGroup,
  useForwardPropsEmits,
} from "reka-ui"

const props = defineProps<ContextMenuRadioGroupProps>()
const emits = defineEmits<ContextMenuRadioGroupEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <ContextMenuRadioGroup
    data-slot="context-menu-radio-group"
    v-bind="forwarded"
  >
    <slot />
  </ContextMenuRadioGroup>
</template>
