<script lang='ts' setup>
import type { PrimitiveProps } from "reka-ui"
/**
 * PrimitiveProps：
 * 提供 as / asChild，用于决定最终渲染的元素，或把样式/事件透传给子元素。
 * 它的全部作用 = 让 BubbleReactions 默认渲染成 <div>，也可换成其它元素。
 */
import type { HTMLAttributes } from "vue"
import type { BubbleReactionsVariants } from "."
import { Primitive } from "reka-ui"
/**
 * Primitive：
 * reka-ui 的通用渲染原语，按 as / asChild 渲染成对应元素。
 * 这里它的作用 = 气泡角上的反应条（绝对定位、与气泡边缘重叠）。
 */
import { cn } from "../../../lib/utils"
import { bubbleReactionsVariants } from "."

interface Props extends PrimitiveProps {
  side?: BubbleReactionsVariants["side"]
  align?: BubbleReactionsVariants["align"]
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  side: "bottom",
  align: "end",
  as: "div",
})
</script>

<template>
  <!-- BubbleReactions: 气泡上的反应条
   data-slot="bubble-reactions" 标识插槽
   data-side（top / bottom）/ data-align（start / end）决定贴在哪条边、哪个角 -->
  <Primitive
    data-slot="bubble-reactions"
    :data-side="side"
    :data-align="align"
    :as="as"
    :as-child="asChild"
    :class="cn(bubbleReactionsVariants({ side, align }), props.class)"
  >
    <!-- 默认插槽：emoji 或图标按钮 -->
    <slot />
  </Primitive>
</template>
