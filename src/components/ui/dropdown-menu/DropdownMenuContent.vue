<script setup lang="ts">
/**
 * DropdownMenuContent —— 菜单面板（自动挂 Portal，跟随触发器定位）。
 *
 * 几个省心的默认：`sideOffset: 4`（与触发器留 4px）、`max-h-(--reka-…-available-height)`
 * （空间不够时自动变矮并内部滚动）、最小宽度 8rem。
 * 宽度用 `class` 覆盖（如 `w-56`），对齐用 `align` / `side`。
 *
 * **必须和 `DropdownMenuTrigger` 一起用**：触发器同时是菜单的定位锚点，
 * 只渲染 Content（例如想纯用代码控制开合）会让菜单定位到看不见的地方。
 */

import type { DropdownMenuContentEmits, DropdownMenuContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../../lib/utils"

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<DropdownMenuContentProps & { class?: HTMLAttributes["class"] }>(),
  {
    sideOffset: 4,
  },
)
const emits = defineEmits<DropdownMenuContentEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)

/**
 * 关闭时把焦点还给触发器（无障碍默认行为），但不用 reka 默认的 `focus()` ——
 * 那个会把页面滚回触发器位置（菜单在下方时，页面会被拽回去），
 * 也可能把焦点丢给 body 导致浏览器滚回顶部。这里改成 `focus({ preventScroll: true })`。
 */
function onCloseAutoFocus(event: Event) {
  const content = document.activeElement as HTMLElement | null
  const triggerId = content?.getAttribute?.("aria-labelledby") ?? null
  event.preventDefault()
  if (triggerId)
    document.getElementById(triggerId)?.focus({ preventScroll: true })
}
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      data-slot="dropdown-menu-content"
      v-bind="{ ...$attrs, ...forwarded }"
      @close-auto-focus="onCloseAutoFocus"
      :class="cn('bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--reka-dropdown-menu-content-available-height) min-w-[8rem] origin-(--reka-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-input p-1 shadow-md', props.class)"
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
