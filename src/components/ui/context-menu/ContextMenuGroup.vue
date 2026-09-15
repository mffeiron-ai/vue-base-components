<script setup lang="ts">
/**
 * ContextMenuGroup —— 分组容器（只做语义分组，样式靠自身/预设；组间要线用 Separator）。
 */
import type { ContextMenuGroupProps } from "reka-ui"
import { ContextMenuGroup } from "reka-ui"

const props = defineProps<ContextMenuGroupProps>()
</script>

<template>
  <ContextMenuGroup
    data-slot="context-menu-group"
    v-bind="props"
  >
    <slot />
  </ContextMenuGroup>
</template>
