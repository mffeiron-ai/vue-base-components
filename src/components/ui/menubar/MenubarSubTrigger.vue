<script setup lang="ts">
/**
 * MenubarSubTrigger —— 二级菜单的入口项（右侧自带一个 ChevronRight）。
 *
 * - 展开时 `data-[state=open]:bg-accent`；`inset` 与其它项一致
 * - 悬停或按右方向键展开子菜单；子菜单内容写在 `MenubarSubContent` 里
 * - 右端的箭头是默认插槽内容，可自己换
 */
import type { MenubarSubTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ChevronRight } from "lucide-vue-next"
import { MenubarSubTrigger, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<MenubarSubTriggerProps & { class?: HTMLAttributes["class"], inset?: boolean }>()

const delegatedProps = reactiveOmit(props, "class", "inset")
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <MenubarSubTrigger :data-inset="inset ? '' : undefined" data-slot="menubar-sub-trigger" v-bind="forwardedProps" :class="cn( 'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8', props.class, )" >
    <slot />
    <ChevronRight class="ml-auto size-4" />
  </MenubarSubTrigger>
</template>
