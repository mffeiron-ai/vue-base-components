<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
/**
 * PrimitiveProps：
 * 提供 as / asChild，用于决定最终渲染的元素，或把样式/事件透传给子元素。
 * 它的全部作用 = 让 AttachmentTrigger 支持渲染成 button / a 等任意元素。
 */
import { Primitive } from "reka-ui"
/**
 * Primitive：
 * reka-ui 的通用渲染原语，按 as / asChild 渲染成对应元素。
 * 这里它的作用 = 把整张卡片铺满一个可点击的覆盖层（trigger）。
 * 用法：
 * <Primitive as="button" :as-child="asChild"> <slot /> </Primitive>
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

interface Props extends PrimitiveProps {
  class?: HTMLAttributes["class"]
}
const props = withDefaults(defineProps<Props>(), {
  as: "button",
})
</script>

<template>
  <!-- AttachmentTrigger: 铺满卡片的可点击覆盖层
   data-slot="attachment-trigger" 标识插槽，便于样式定位
   :as / :as-child 由 Primitive 决定渲染成 button 或透传给子元素（如 a）
   class 绝对定位铺满卡片，z-10 位于 actions（z-20）之下，两者互不遮挡 -->
  <Primitive
    data-slot="attachment-trigger"
    :as="as"
    :as-child="asChild"
    :class="cn('absolute inset-0 z-10 outline-none', props.class)"
  >
    <!-- 默认插槽：通常为空，用 as-child 时放置链接等子元素 -->
    <slot />
  </Primitive>
</template>
