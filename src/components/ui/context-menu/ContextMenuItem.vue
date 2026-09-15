<script setup lang="ts">
/**
 * ContextMenuItem —— 普通菜单项。
 *
 * - inset：与带勾选指示器的项左边对齐（预设用 data-inset:pl-8）。
 * - variant="destructive"：危险操作（删除等），预设会把文字/图标换成 destructive 色。
 * - disabled：不可点且不参与键盘高亮。
 * - 高亮态：键盘上下或鼠标划过（`data-[highlighted]`）—— 与 DropdownMenu 一致。
 * - 右侧快捷键提示用 ContextMenuShortcut（它靠 group/context-menu-item 记住父项高亮态）。
 */
import type { ContextMenuItemEmits, ContextMenuItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  ContextMenuItem,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../../lib/utils"

const props = withDefaults(defineProps<ContextMenuItemProps & {
  class?: HTMLAttributes["class"]
  inset?: boolean
  variant?: "default" | "destructive"
}>(), {
  variant: "default",
})
const emits = defineEmits<ContextMenuItemEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ContextMenuItem :data-inset="inset ? '' : undefined" :data-variant="variant" data-slot="context-menu-item" v-bind="forwarded" :class="cn( 'focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*=\'text-\'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4', props.class, )" >
    <slot />
  </ContextMenuItem>
</template>
