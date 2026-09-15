<script lang="ts" setup>
/**
 * DrawerClose —— 关闭抽屉的按钮（放 Footer 里当「取消 / 关闭」）。
 *
 * 注意：vaul 没给它任何定位样式，放在哪就在哪。想在右上角加一个 ×，
 * 自己在 `DrawerContent` 里用 `DrawerClose` 加 `absolute top-4 right-4`。
 */
import type { DrawerCloseProps } from "vaul-vue"
import { DrawerClose } from "vaul-vue"

const props = defineProps<DrawerCloseProps>()
</script>

<template>
  <DrawerClose
    data-slot="drawer-close"
    v-bind="props"
  >
    <slot />
  </DrawerClose>
</template>
