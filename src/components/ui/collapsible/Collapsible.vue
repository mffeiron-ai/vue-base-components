<script setup lang="ts">
import type { CollapsibleRootEmits, CollapsibleRootProps } from "reka-ui"
// CollapsibleRootProps：open / defaultOpen / disabled / as / asChild
// CollapsibleRootEmits：update:open
import { CollapsibleRoot, useForwardPropsEmits } from "reka-ui"
// CollapsibleRoot：单个「展开 / 收起」区域的无头基元 —— 只管开合状态与 aria，不带任何样式

const props = defineProps<CollapsibleRootProps>()
const emits = defineEmits<CollapsibleRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <!--
    data-slot="collapsible"：样式钩子。
    默认插槽透出 { open }，可以 <Collapsible v-slot="{ open }"> 自己写触发器：
    受控用 v-model:open，非受控用 :default-open。
    多个独立折叠区就放多个 Collapsible；需要「同时只开一个」请用 Accordion。
  -->
  <CollapsibleRoot
    v-slot="slotProps"
    data-slot="collapsible"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </CollapsibleRoot>
</template>
