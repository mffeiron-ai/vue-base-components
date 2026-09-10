<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
/**
 * PrimitiveProps：
 * 提供 as / asChild，用于决定最终渲染的元素，或把样式/事件透传给子元素。
 * 它的全部作用 = 让 Badge 支持渲染成任意元素（如 <a>）。
 */
import type { HTMLAttributes } from "vue"
import type { BadgeVariants } from "."
import { reactiveOmit } from "@vueuse/core"
import { Primitive } from "reka-ui"
/**
 * Primitive：
 * reka-ui 的通用渲染原语，按 as / asChild 渲染成对应元素。
 * 这里它的作用 = 作为 Badge 的根节点，支持 `as-child` 把样式套到链接等子元素上。
 * 用法：
 * <Primitive as="span"> <slot /> </Primitive>
 */
import { cn } from "../../../lib/utils"
import { badgeVariants } from "."

const props = defineProps<PrimitiveProps & {
  variant?: BadgeVariants["variant"]
  class?: HTMLAttributes["class"]
}>()

// 从 props 里剔除 class，剩下的（as / asChild）用于透传给 Primitive
const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <!-- Badge: 徽标
   data-slot="badge" 标识插槽，便于样式按 data-slot 定位
   data-variant 供样式预设切换变体（default / secondary / outline / destructive / ghost / link）
   v-bind="delegatedProps" 透传 as / asChild -->
  <Primitive
    data-slot="badge"
    :data-variant="variant"
    :class="cn(badgeVariants({ variant }), props.class)"
    v-bind="delegatedProps"
  >
    <!-- 默认插槽：徽标内容（文字 / 图标） -->
    <slot />
  </Primitive>
</template>
