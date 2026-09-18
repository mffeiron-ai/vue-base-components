<script setup lang="ts">
/**
 * ContextMenuContent —— 菜单本体（Portal + 定位到鼠标位置）。
 *
 * - 定位：不用 anchor，菜单直接开在右键时的光标坐标；超出视口时 reka 会自动翻转/碰撞。
 * - 高度：`max-h-(--reka-context-menu-content-available-height)`，即“到视口边缘还剩多少”
 *   （reka 写入的变量），所以菜单不会溢到屏幕外，超出部分自己滚。
 * - 宽度：组件给 min-w-[8rem] 兜底，预设会收紧到 min-w-36（両者取谁看层叠，见预设注释）。
 * - 动画：只写语义类 `cn-anim-overlay`（进出场由 `<html data-anim>` 与 `--anim-dur` 决定），
 *   所以这里**不要**再写 animate-in / duration-*，否则会与全局动效设定打架。
 * - inheritAttrs:false + `{ ...$attrs, ...forwarded }`：外层 Portal 不吃属性，属性要落到内容元素上。
 * - 关闭时拦掉 `close-auto-focus` 的默认焦点搬迁（reka 会把焦点交给面板自身，
 *   面板一卸载焦点就落到 body，浏览器会因此把页面滚回顶部）；右键菜单本来也没有
 *   「触发器」可还焦点，所以直接 preventDefault 最干净。 */
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
      @close-auto-focus.prevent
      :class="cn(
        'cn-anim-overlay bg-popover text-popover-foreground z-50 max-h-(--reka-context-menu-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border border-input p-1 shadow-md',
        props.class,
      )"
    >
      <slot />
    </ContextMenuContent>
  </ContextMenuPortal>
</template>
