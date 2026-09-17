<script setup lang="ts">
import type { SelectItemTextProps } from "reka-ui"
import { SelectItemText } from "reka-ui"

const props = defineProps<SelectItemTextProps>()
</script>

<template>
  <!--
    注意：reka 的 SelectItemText 声明了 inheritAttrs: false，它渲染出的那个 span **不接收**外部 attrs
    （class 与 data-slot 都落不上去，实测渲染后 class 为空），所以这里不挂 data-slot。
    8 套预设里的 `.cn-select-item-text`（flex flex-1 gap-2）因此属于「上游限制下的不可达钩子」，
    对视觉没有影响：那个 span 天然是 SelectItem 的 flex 子项，宽度自动铺满。
  -->
  <SelectItemText v-bind="props">
    <slot />
  </SelectItemText>
</template>
