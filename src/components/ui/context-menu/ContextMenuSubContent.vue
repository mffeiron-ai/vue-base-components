<script setup lang="ts">
/**
 * ContextMenuSubContent —— 子菜单弹出层（向右展开）。
 * 样式与 Content 接近（同样一套 fade/zoom/slide 动画），但没有最大高度限制，
 * `origin-(--reka-context-menu-content-transform-origin)` 让缩放从父项那一侧开始。
 */
import type { ContextMenuSubContentEmits, ContextMenuSubContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  ContextMenuSubContent,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ContextMenuSubContentProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<ContextMenuSubContentEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ContextMenuSubContent
    data-slot="context-menu-sub-content"
    v-bind="forwarded"
    :class="
      cn(
        'cn-anim-overlay bg-popover text-popover-foreground z-50 min-w-[8rem] origin-(--reka-context-menu-content-transform-origin) overflow-hidden rounded-md border border-input p-1 shadow-lg',
        props.class,
      )
    "
  >
    <slot />
  </ContextMenuSubContent>
</template>
