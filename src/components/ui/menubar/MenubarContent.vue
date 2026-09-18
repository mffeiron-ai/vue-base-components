<script setup lang="ts">
/**
 * MenubarContent —— 下拉面板（Portal 到 body）。
 *
 * - 默认 `align="start"` / `alignOffset={-4}`（与标题左对齐后回挑 4px）/ `sideOffset={8}`
 * - `min-w-[12rem]`：面板不会比这更窄；放进 Sub 里时由 MenubarSubContent 另行控制宽度
 * - 与 DropdownMenuContent 一样是 `border border-input` + `p-1`，里面直接放 Item 系列
 * - 用了 `inheritAttrs: false` + `{ ...$attrs, ...forwardedProps }`：
 *   为的是让外面传的 `class` 等属性不被转发两次
 */
import type { MenubarContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  MenubarContent,
  MenubarPortal,
  useForwardProps,
} from "reka-ui"
import { cn } from "../../../lib/utils"

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<MenubarContentProps & { class?: HTMLAttributes["class"] }>(),
  {
    align: "start",
    alignOffset: -4,
    sideOffset: 8,
  },
)

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <MenubarPortal>
    <MenubarContent
      data-slot="menubar-content"
      v-bind="{ ...$attrs, ...forwardedProps }"
      :class="
        cn(
          'cn-anim-overlay bg-popover text-popover-foreground z-50 min-w-[12rem] origin-(--reka-menubar-content-transform-origin) overflow-hidden rounded-md border border-input p-1 shadow-md',
          props.class,
        )
      "
    >
      <slot />
    </MenubarContent>
  </MenubarPortal>
</template>
