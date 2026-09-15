<script setup lang="ts">
import type { WithClassAsProps } from "./interface"
import { cn } from "../../../lib/utils"
import { useCarousel } from "./useCarousel"

// 要把 $attrs 手动透传到内层轨道，所以关掉自动继承
// （否则用户写的 class 会落到外层视口上，被裁切/滚动逻辑干扰）
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<WithClassAsProps>()

const { carouselRef, orientation } = useCarousel()
</script>

<template>
  <!--
    外层是 embla 的「视口」：ref 交给 embla（emblaNode）驱动滑动，overflow-hidden 裁掉溢出内容。
    内层才是可滑动的「轨道」（flex 容器），所以 $attrs 要绑在内层。
    间距靠一对负/正边距实现：水平时 -ml-4 抵消 item 的 pl-4（垂直同理 -mt-4 / pt-4）。
  -->
  <div
    ref="carouselRef"
    data-slot="carousel-content"
    class="overflow-hidden"
  >
    <div
      :class="
        cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          props.class,
        )"
      v-bind="$attrs"
    >
      <slot />
    </div>
  </div>
</template>
