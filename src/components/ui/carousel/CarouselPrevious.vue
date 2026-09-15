<script setup lang="ts">
import type { WithClassAsProps } from "./interface"
import type { ButtonVariants } from "../button"
import { ArrowLeft } from "lucide-vue-next"
// 默认图标；想换就用默认插槽：<CarouselPrevious><ChevronsLeft /></CarouselPrevious>
import { cn } from "../../../lib/utils"
import { Button } from "../button"
// 直接复用 Button：variant / size 可透传，外观与全站按钮一致
import { useCarousel } from "./useCarousel"

const props = withDefaults(defineProps<{
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
}
& WithClassAsProps>(), {
  variant: "outline",
  size: "icon",
})
// 默认描边 + 图标尺寸

const { orientation, canScrollPrev, scrollPrev } = useCarousel()
</script>

<template>
  <!--
    :disabled="!canScrollPrev" —— 到头（或没开 loop）时自动禁用。
    定位：水平时贴在左侧外侧（-left-12 垂直居中），纵向时挪到上方并旋转 90°。
    按钮在外侧，所以使用方一般要给 Carousel 留出左右（纵向则是上下）空间，或用 class 改定位。
    sr-only 文案保证屏幕阅读器能读出来。
  -->
  <Button
    data-slot="carousel-previous"
    :disabled="!canScrollPrev"
    :class="cn(
      'absolute size-8 rounded-full',
      orientation === 'horizontal'
        ? 'top-1/2 -left-12 -translate-y-1/2'
        : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
      props.class,
    )"
    :variant="variant"
    :size="size"
    @click="scrollPrev"
  >
    <slot>
      <ArrowLeft />
      <span class="sr-only">Previous Slide</span>
    </slot>
  </Button>
</template>
