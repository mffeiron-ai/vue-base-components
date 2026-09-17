<script setup lang="ts">
/**
 * MenubarSeparator —— 面板里的分隔线（`h-px bg-border`）。
 *
 * 用了负外边距 `-mx-1` 横向溢出面板的 `p-1`，这样线能通顶到左右边缘，
 * 视觉上才像一条完整的分隔。
 */
import type { MenubarSeparatorProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { MenubarSeparator, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<MenubarSeparatorProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <MenubarSeparator
    data-slot="menubar-separator"
    :class=" cn('bg-border -mx-1 my-1 h-px', props.class)"
    v-bind="forwardedProps"
  />
</template>
