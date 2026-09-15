<script setup lang="ts">
import type { WithClassAsProps } from "./interface"
import { cn } from "../../../lib/utils"
import { useCarousel } from "./useCarousel"

const props = defineProps<WithClassAsProps>()

// 只需要方向：决定给左内边距还是上内边距（与 CarouselContent 的负边距配对成为间距）
const { orientation } = useCarousel()
</script>

<template>
  <!--
    basis-full = 一屏一个；想一屏放多个就覆盖 basis（如 basis-1/2 或 basis-1/3）。
    shrink-0 grow-0 + min-w-0 是 flex 轨道上做等比排列的标准写法：不伸不缩，宽度完全由 basis 决定。
    role="group" + aria-roledescription="slide" 让屏幕阅读器把每屏读成一张「幻灯片」。
  -->
  <div
    data-slot="carousel-item"
    role="group"
    aria-roledescription="slide"
    :class="cn(
      'min-w-0 shrink-0 grow-0 basis-full',
      orientation === 'horizontal' ? 'pl-4' : 'pt-4',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
