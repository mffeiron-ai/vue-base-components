<script setup lang="ts">
/**
 * MenubarGroup —— 把若干菜单项归为一组（只有语义，不影响布局）。
 *
 * 组之间想用分隔线就用 `MenubarSeparator`；也可以用 `MenubarLabel` 给组加标题。
 */
import type { MenubarGroupProps } from "reka-ui"
import { MenubarGroup } from "reka-ui"

const props = defineProps<MenubarGroupProps>()
</script>

<template>
  <MenubarGroup
    data-slot="menubar-group"
    v-bind="props"
  >
    <slot />
  </MenubarGroup>
</template>
