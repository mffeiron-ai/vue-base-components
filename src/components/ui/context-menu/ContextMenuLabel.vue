<script setup lang="ts">
/**
 * ContextMenuLabel —— 菜单内的小标题（不可点、不参与键盘导航）。
 * - inset：与带勾选指示器的项对齐（预设 data-inset:pl-8）。
 * - 预设会把颜色收成 muted-foreground、字号 text-xs（组件自带的类是没套预设时的兜底）。
 */
import type { ContextMenuLabelProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ContextMenuLabel } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ContextMenuLabelProps & { class?: HTMLAttributes["class"], inset?: boolean }>()

// inset 是本组件的便捷 prop（对齐指示器），必须从透传给 reka 的 props 里剔除，
// 否则会作为无意义的 DOM 属性渲染到标签元素上。
const delegatedProps = reactiveOmit(props, "class", "inset")
</script>

<template>
  <ContextMenuLabel
    data-slot="context-menu-label"
    :data-inset="inset ? '' : undefined"
    v-bind="delegatedProps"
    :class="cn('text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', props.class)"
  >
    <slot />
  </ContextMenuLabel>
</template>
