<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
/**
 * PrimitiveProps：
 * 提供 as / asChild，用于决定最终渲染的元素，或把样式/事件透传给子元素。
 * 它的全部作用 = 让 BubbleGroup 默认渲染成 <div>，也可换成其它元素。
 */
import type { HTMLAttributes } from "vue"
import { Primitive } from "reka-ui"
/**
 * Primitive：
 * reka-ui 的通用渲染原语，按 as / asChild 渲染成对应元素。
 * 这里它的作用 = 把同一发送者的多条气泡纵向分组（默认 as="div"）。
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
  <!-- BubbleGroup: 气泡分组（同一发送者的多条消息）
   data-slot="bubble-group" 标识插槽
   默认 flex 纵向 + gap-2；align 要设在各 Bubble 上而不是这里 -->
  <Primitive
    data-slot="bubble-group"
    :as="as"
    :as-child="asChild"
    :class="cn('gap-2 flex min-w-0 flex-col', props.class)"
  >
    <!-- 默认插槽：多个 Bubble -->
    <slot />
  </Primitive>
</template>
