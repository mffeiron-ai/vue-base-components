<script setup lang="ts">
/**
 * ContextMenuCheckboxItem —— 可勾选项。
 *
 * - `v-model` 是**布尔**（单项自己管自己的勾选态），不同于 RadioItem。
 * - 勾选后 reka 才渲染 ContextMenuItemIndicator，所以对勾图标不会一直占位。
 * - 指示器具名插槽 `indicator-icon` 可换图标（默认 Check）。
 * - 位置：**右侧**（预设 `.cn-context-menu-item-indicator` 就是 absolute right-2，
 *   内边距也按预设的 pr-8 pl-2 预留）；改成左对齐会和文字重叠，别动这两处。
 */
import type { ContextMenuCheckboxItemEmits, ContextMenuCheckboxItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Check } from "lucide-vue-next"
import {
  ContextMenuCheckboxItem,
  ContextMenuItemIndicator,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ContextMenuCheckboxItemProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<ContextMenuCheckboxItemEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ContextMenuCheckboxItem
    data-slot="context-menu-checkbox-item"
    v-bind="forwarded"
    :class="cn(
      'focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
      props.class,
    )"
  >
    <span class="cn-context-menu-item-indicator pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
      <ContextMenuItemIndicator>
        <slot name="indicator-icon">
          <Check class="size-4" />
        </slot>
      </ContextMenuItemIndicator>
    </span>
    <slot />
  </ContextMenuCheckboxItem>
</template>
