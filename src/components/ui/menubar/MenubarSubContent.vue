<script setup lang="ts">
/**
 * MenubarSubContent —— 二级菜单的面板（Portal 到 body）。
 *
 * - 比一级面板窄（`min-w-[8rem]`，一级是 `12rem`）、阴影更重（`shadow-lg`）
 * - 位置由 reka 自动算，默认贴在父项右侧；空间不够会自己翻转
 * - 同样 `inheritAttrs: false` + 合并 `$attrs`，保证外部 `class` 不重复转发
 */
import type { MenubarSubContentEmits, MenubarSubContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  MenubarPortal,
  MenubarSubContent,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../../lib/utils"

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<MenubarSubContentProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<MenubarSubContentEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <MenubarPortal>
    <MenubarSubContent
      data-slot="menubar-sub-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'cn-anim-overlay bg-popover text-popover-foreground z-50 min-w-[8rem] origin-(--reka-menubar-content-transform-origin) overflow-hidden rounded-md border border-input p-1 shadow-lg',
          props.class,
        )
      "
    >
      <slot />
    </MenubarSubContent>
  </MenubarPortal>
</template>
