<script lang="ts" setup>
/**
 * DrawerTrigger —— 打开抽屉的触发器（默认渲染成 <button>；`as-child` 可以包住自己的按钮）。
 */
import type { DrawerTriggerProps } from "vaul-vue"
import { DrawerTrigger } from "vaul-vue"

const props = defineProps<DrawerTriggerProps>()
</script>

<template>
  <DrawerTrigger
    data-slot="drawer-trigger"
    v-bind="props"
  >
    <slot />
  </DrawerTrigger>
</template>
