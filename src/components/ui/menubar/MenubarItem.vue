<script setup lang="ts">
/**
 * MenubarItem —— 普通菜单项。
 *
 * - `inset`：左侧缩进（`data-inset` → `pl-8`），用来和带勾选标记的项左对齐
 * - `variant="destructive"`：危险操作配色（文字与 hover 底色都变红）
 * - 用 `@select` 拿点击；想阻止「选完自动关面板」用 `@select.prevent`（与 DropdownMenu 同）
 * - `variant` 给了默认值 `'default'`，保证 `data-variant` 一定渲染出来
 *   （预设按 data 属性选变体，属性不渲染时会静默失效 —— 同类坑踩过多次）
 */
import type { MenubarItemEmits, MenubarItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  MenubarItem,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../../lib/utils"

const props = withDefaults(defineProps<MenubarItemProps & {
  class?: HTMLAttributes["class"]
  inset?: boolean
  variant?: "default" | "destructive"
}>(), {
  variant: "default",
})

const emits = defineEmits<MenubarItemEmits>()

const delegatedProps = reactiveOmit(props, "class", "inset", "variant")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <MenubarItem :data-inset="inset ? '' : undefined" :data-variant="variant" data-slot="menubar-item" v-bind="forwarded" :class="cn( 'focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*=\'text-\'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4', props.class, )" >
    <slot />
  </MenubarItem>
</template>
