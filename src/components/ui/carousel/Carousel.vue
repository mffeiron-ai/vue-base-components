<script setup lang="ts">
import type { CarouselEmits, CarouselProps, WithClassAsProps } from "./interface"
// CarouselProps：opts / plugins / orientation；CarouselEmits：init-api；WithClassAsProps：各子组件共用的 class prop
import { cn } from "../../../lib/utils"
// cn：类名合并工具（clsx + tailwind-merge），后面的类会覆盖前面冲突的 Tailwind 类
import { useProvideCarousel } from "./useCarousel"
// useProvideCarousel：创建 embla 实例并提供给 CarouselContent / Item / Next / Previous（provide/inject）

const props = withDefaults(defineProps<CarouselProps & WithClassAsProps>(), {
  orientation: "horizontal",
})
// 默认横向轮播；纵向要显式传 orientation="vertical"

const emits = defineEmits<CarouselEmits>()

const { canScrollNext, canScrollPrev, carouselApi, carouselRef, orientation, scrollNext, scrollPrev } = useProvideCarousel(props, emits)

// 暴露给父组件：给 <Carousel> 加 ref 后就能调 scrollNext() / 拿 carouselApi（做缩略图、进度条等）
defineExpose({
  canScrollNext,
  canScrollPrev,
  carouselApi,
  carouselRef,
  orientation,
  scrollNext,
  scrollPrev,
})

// 键盘支持：按方向键翻页（横向 ← / →，纵向 ↑ / ↓）
function onKeyDown(event: KeyboardEvent) {
  const prevKey = props.orientation === "vertical" ? "ArrowUp" : "ArrowLeft"
  const nextKey = props.orientation === "vertical" ? "ArrowDown" : "ArrowRight"

  if (event.key === prevKey) {
    event.preventDefault()
    scrollPrev()

    return
  }

  if (event.key === nextKey) {
    event.preventDefault()
    scrollNext()
  }
}
</script>

<template>
  <!--
    根容器：
    - role="region" + aria-roledescription="carousel" 告诉屏幕阅读器这是一块轮播区域
    - tabindex="0" 让容器可聚焦，上面的 @keydown 方向键翻页才能生效
    - relative：CarouselNext / Previous 默认是 absolute 定位，靠它做参照
    - 默认插槽把 carousel 状态透传出去，可以写 <Carousel v-slot="{ carouselApi }"> 直接拿实例
  -->
  <div
    data-slot="carousel"
    :class="cn('relative', props.class)"
    role="region"
    aria-roledescription="carousel"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <slot :can-scroll-next :can-scroll-prev :carousel-api :carousel-ref :orientation :scroll-next :scroll-prev />
  </div>
</template>
