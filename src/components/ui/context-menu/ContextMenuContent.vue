<script setup lang="ts">
/**
 * ContextMenuContent —— 菜单本体（Portal + 定位到鼠标位置）。
 *
 * - 定位：不用 anchor，菜单直接开在右键时的光标坐标；超出视口时 reka 会自动翻转/碰撞。
 * - 高度：`max-h-(--reka-context-menu-content-available-height)`，即“到视口边缘还剩多少”
 *   （reka 写入的变量），所以菜单不会溢到屏幕外，超出部分自己滚。
 * - 宽度：组件给 min-w-[8rem] 兜底，预设会收紧到 min-w-36（両者取谁看层叠，见预设注释）。
 * - 动画：data-[state=open/closed] 的 fade + zoom + 按 side 的 slide，预设里也复述了一套
 *   （外加 duration-100），改动画时两边都要看。
 * - inheritAttrs:false + `{ ...$attrs, ...forwarded }`：外层 Portal 不吃属性，属性要落到内容元素上。
 */
import type { ContextMenuContentEmits, ContextMenuContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  ContextMenuContent,
  ContextMenuPortal,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../../lib/utils"

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<ContextMenuContentProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<ContextMenuContentEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ContextMenuPortal>
    <ContextMenuContent
      data-slot="context-menu-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--reka-context-menu-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border border-input p-1 shadow-md',
        props.class,
      )"
    >
      <slot />
    </ContextMenuContent>
  </ContextMenuPortal>
</template>
