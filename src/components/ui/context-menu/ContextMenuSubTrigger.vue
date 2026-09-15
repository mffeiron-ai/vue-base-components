<script setup lang="ts">
/**
 * ContextMenuSubTrigger —— 子菜单的父项（带右侧箭头）。
 * 鼠标划过或键盘 ArrowRight 展开子菜单；inset 与带指示器的项对齐。
 * 箭头图标固定在最后，不要再自己加一个（会两条箭头）。
 */
import type { ContextMenuSubTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ChevronRight } from "lucide-vue-next"
import {
  ContextMenuSubTrigger,
  useForwardProps,
} from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ContextMenuSubTriggerProps & { class?: HTMLAttributes["class"], inset?: boolean }>()

// inset 同 ContextMenuLabel：本地便捷 prop，别透传给 reka，否则会落到 DOM 上
const delegatedProps = reactiveOmit(props, "class", "inset")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <ContextMenuSubTrigger :data-inset="inset ? '' : undefined" data-slot="context-menu-sub-trigger" v-bind="forwardedProps" :class="cn( 'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4', props.class, )" >
    <slot />
    <ChevronRight class="ml-auto" />
  </ContextMenuSubTrigger>
</template>
