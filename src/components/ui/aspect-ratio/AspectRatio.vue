<script setup lang="ts">
import type { AspectRatioProps } from "reka-ui"
/**
 * AspectRatioProps：
 * 继承 PrimitiveProps（as / asChild 等），外加：
 *   ratio?: number 期望的宽高比（宽 / 高），默认 1。
 * 它的全部作用 = 定义 AspectRatio 接收的 props。
 */
import { AspectRatio } from "reka-ui"
/**
 * AspectRatio：
 * 它的全部作用 = 渲染一个按 ratio 维持宽高比的容器（内部用 padding-bottom 撑高）。
 * 用法：
 * <AspectRatio :ratio="16 / 9">
 *   <img src="..." alt="Image" class="h-full w-full object-cover" />
 * </AspectRatio>
 */

const props = defineProps<AspectRatioProps>()
</script>

<template>
  <!-- AspectRatio: 固定宽高比容器
   v-slot="slotProps" 接收 reka-ui 透传的插槽属性
   data-slot="aspect-ratio" 标识插槽，便于样式按 data-slot 定位
   v-bind="props" 透传 ratio / as / asChild 给 reka-ui -->
  <AspectRatio
    v-slot="slotProps"
    data-slot="aspect-ratio"
    v-bind="props"
  >
    <!-- 默认插槽：放置需要维持比例的内容（图片 / 视频等） -->
    <slot v-bind="slotProps" />
  </AspectRatio>
</template>
