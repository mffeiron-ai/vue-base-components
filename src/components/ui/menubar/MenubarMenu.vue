<script setup lang="ts">
/**
 * MenubarMenu —— 菜单栏里的「一个菜单」（标题 + 对应面板）。
 *
 * 它自己不渲染节点，只提供 reka 的 context：`MenubarTrigger` 与 `MenubarContent`
 * 都放在它里面，**不要把两者拆进不同的 MenubarMenu**。
 */
import type { MenubarMenuProps } from "reka-ui"
import { MenubarMenu } from "reka-ui"

const props = defineProps<MenubarMenuProps>()
</script>

<template>
  <MenubarMenu
    data-slot="menubar-menu"
    v-bind="props"
  >
    <slot />
  </MenubarMenu>
</template>
