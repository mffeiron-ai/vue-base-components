<script lang='ts' setup>
import type { PrimitiveProps } from "reka-ui"
/**
 * PrimitiveProps：
 * 提供 as / asChild，用于决定最终渲染的元素，或把样式/事件透传给子元素。
 * 它的全部作用 = 让 Bubble 默认渲染成 <div>，也可换成其它元素。
 */
import type { HTMLAttributes } from "vue"
import type { BubbleVariants } from "."
import { Primitive } from "reka-ui"
/**
 * Primitive：
 * reka-ui 的通用渲染原语，按 as / asChild 渲染成对应元素。
 * 这里它的作用 = 作为气泡的根节点（默认 as="div"），承载变体与对齐属性。
 */
import { cn } from "../../../lib/utils"
import { bubbleVariants } from "."

interface Props extends PrimitiveProps {
  variant?: BubbleVariants["variant"]
  align?: "start" | "end"
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  align: "start",
  as: "div",
})
</script>

<template>
  <!-- Bubble: 气泡根容器
   data-slot="bubble" 标识插槽，便于样式按 data-slot 定位
   data-variant / data-align 供样式预设与子级（BubbleContent / BubbleReactions）联动
   v-bind as / as-child 透传给 Primitive -->
  <Primitive
    data-slot="bubble"
    :data-variant="variant"
    :data-align="align"
    :as="as"
    :as-child="asChild"
    :class="cn(bubbleVariants({ variant }), props.class)"
  >
    <!-- 默认插槽：BubbleContent（及可选的 BubbleReactions） -->
    <slot />
  </Primitive>
</template>
