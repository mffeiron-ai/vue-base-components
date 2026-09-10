<script lang='ts' setup>
import type { PrimitiveProps } from "reka-ui"
/**
 * PrimitiveProps：
 * 提供 as / asChild，用于决定最终渲染的元素，或把样式/事件透传给子元素。
 * 它的全部作用 = 让 BubbleContent 可 as-child 把样式合并到链接 / 按钮上。
 */
import type { HTMLAttributes } from "vue"
import { Primitive } from "reka-ui"
/**
 * Primitive：
 * reka-ui 的通用渲染原语，按 as / asChild 渲染成对应元素。
 * 这里它的作用 = 气泡内容区（默认 as="div"），默认样式含圆角 / 内边距 / 文本尺寸。
 */
import { cn } from "../../../lib/utils"

interface Props extends PrimitiveProps {
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  as: "div",
})
</script>

<template>
  <!-- BubbleContent: 气泡内容区
   data-slot="bubble-content" 标识插槽（外层 variant 样式通过它定位）
   用 as-child 时，样式 / 焦点环会合并到插槽里的 <button> / <a> 上 -->
  <Primitive
    data-slot="bubble-content"
    :as="as"
    :as-child="asChild"
    :class="cn(
      'rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed [button,a]:outline-none [button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-ring/50 group-data-[align=end]/bubble:self-end w-fit max-w-full min-w-0 overflow-hidden wrap-break-word [button]:text-left [button,a]:transition-colors',
      props.class,
    )"
  >
    <!-- 默认插槽：消息文字，或 as-child 时的 button / a -->
    <slot />
  </Primitive>
</template>
