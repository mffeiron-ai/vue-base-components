<script setup lang="ts">
/**
 * ContextMenuPortal —— 把内容挂到 body（避免被父级 overflow / transform 裁剪）。
 * ContextMenuContent 里已经内置了一层 Portal，所以业务里一般不需要手写它。
 */
import type { ContextMenuPortalProps } from "reka-ui"
import { ContextMenuPortal } from "reka-ui"

const props = defineProps<ContextMenuPortalProps>()
</script>

<template>
  <ContextMenuPortal
    data-slot="context-menu-portal"
    v-bind="props"
  >
    <slot />
  </ContextMenuPortal>
</template>
