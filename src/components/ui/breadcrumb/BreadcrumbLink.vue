<script lang="ts" setup>
import type { PrimitiveProps } from "reka-ui"
/**
 * PrimitiveProps：
 * 提供 as / asChild，用于决定最终渲染的元素，或把样式/事件透传给子元素。
 * 它的全部作用 = 让 BreadcrumbLink 默认渲染成 <a>，也可用 as-child 套到 RouterLink 等组件上。
 */
import type { HTMLAttributes } from "vue"
import { Primitive } from "reka-ui"
/**
 * Primitive：
 * reka-ui 的通用渲染原语，按 as / asChild 渲染成对应元素。
 * 这里它的作用 = 作为面包屑链接的根节点（默认 as="a"）。
 * 用法：
 * <Primitive as="a"> <slot /> </Primitive>
 */
import { cn } from "../../../lib/utils"

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>(), {
  as: "a",
})
</script>

<template>
  <!-- BreadcrumbLink: 面包屑链接
   data-slot="breadcrumb-link" 标识插槽，便于样式按 data-slot 定位
   默认渲染 <a>；用 as-child 可把样式套到路由链接组件上 -->
  <Primitive
    data-slot="breadcrumb-link"
    :as="as"
    :as-child="asChild"
    :class="cn('hover:text-foreground transition-colors', props.class)"
  >
    <!-- 默认插槽：链接文字 -->
    <slot />
  </Primitive>
</template>
