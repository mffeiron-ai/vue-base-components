<script setup lang="ts">
/**
 * MenubarLabel —— 面板里的小标题（分组名）。
 *
 * - `inset` → `data-inset` → `pl-8`，与带勾选标记的项左对齐
 * - 它不是可点的菜单项，不会获得焦点
 */
import type { MenubarLabelProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { MenubarLabel } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<MenubarLabelProps & { class?: HTMLAttributes["class"], inset?: boolean }>()
const delegatedProps = reactiveOmit(props, "class", "inset")
</script>

<template>
  <MenubarLabel
    :data-inset="inset ? '' : undefined"
    v-bind="delegatedProps"
    :class="cn('px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', props.class)"
  >
    <slot />
  </MenubarLabel>
</template>
