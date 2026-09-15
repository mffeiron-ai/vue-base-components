<script setup lang="ts">
import type { CollapsibleTriggerProps } from "reka-ui"
import { CollapsibleTrigger } from "reka-ui"
// CollapsibleTrigger：默认渲染一个 <button>，自动带 aria-expanded / aria-controls / data-state / data-disabled

const props = defineProps<CollapsibleTriggerProps>()
</script>

<template>
  <!--
    data-slot="collapsible-trigger"：样式钩子。
    - 开合状态在 data-state="open" | "closed" 上，所以图标可以写 group-data-[state=open]:rotate-180
      （自己充当触发器的那层加个 group 类即可，见文档示例）
    - 想用 Button / Card 头部等等当触发器，就传 as-child，把样式合并到子元素上
    - 默认插槽透出 { open }，需要根据不同状态换内容时可以用
  -->
  <CollapsibleTrigger
    data-slot="collapsible-trigger"
    v-bind="props"
  >
    <slot />
  </CollapsibleTrigger>
</template>
