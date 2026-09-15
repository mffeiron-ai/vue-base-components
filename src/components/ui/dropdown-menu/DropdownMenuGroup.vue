<script setup lang="ts">
/**
 * DropdownMenuGroup —— 一组菜单项（通常配一个 `DropdownMenuLabel` 标题）。
 */

import type { DropdownMenuGroupProps } from "reka-ui"
import { DropdownMenuGroup } from "reka-ui"

const props = defineProps<DropdownMenuGroupProps>()
</script>

<template>
  <DropdownMenuGroup
    data-slot="dropdown-menu-group"
    v-bind="props"
  >
    <slot />
  </DropdownMenuGroup>
</template>
