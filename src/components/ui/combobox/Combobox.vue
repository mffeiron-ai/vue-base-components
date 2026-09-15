<script setup lang="ts">
/**
 * Combobox 根组件 —— reka-ui ComboboxRoot 的直通封装。
 *
 * 关键 props：
 * - v-model(modelValue)：选中项的 value，任意类型都可以（对象 / 字符串 / 数字）。
 * - by：value 是对象时，声明「用哪个字段比较 + 回显」，如 by="label"。
 * - multiple：多选，此时 modelValue 变成数组。
 * - v-model:open：受控展开状态；disabled：整体禁用。
 * - resetSearchTermOnBlur / openOnFocus / openOnClick：打开与搜索词的行为开关。
 *
 * 默认插槽会透传 root 的 slotProps（open / modelValue 等），方便自绘触发器。
 */
import type { ComboboxRootEmits, ComboboxRootProps } from "reka-ui"
import { ComboboxRoot, useForwardPropsEmits } from "reka-ui"

const props = defineProps<ComboboxRootProps>()
const emits = defineEmits<ComboboxRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <ComboboxRoot
    v-slot="slotProps"
    data-slot="combobox"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </ComboboxRoot>
</template>
