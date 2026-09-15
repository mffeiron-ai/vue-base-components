<script setup lang="ts">
import type { WithClassAsProps } from "./interface"
import type { ButtonVariants } from "../button"
import { ArrowRight } from "lucide-vue-next"
// 默认图标；想换就用默认插槽
import { cn } from "../../../lib/utils"
import { Button } from "../button"
// 直接复用 Button：variant / size 可透传
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

const { orientation, canScrollNext, scrollNext } = useCarousel()
</script>

<template>
  <!-- 与 CarouselPrevious 对称：水平贴右侧外侧、纵向贴下方，到头自动禁用，sr-only 保留无障碍文案 -->
  <Button
    data-slot="carousel-next"
    :disabled="!canScrollNext"
    :class="cn(
      'absolute size-8 rounded-full',
      orientation === 'horizontal'
        ? 'top-1/2 -right-12 -translate-y-1/2'
        : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
      props.class,
    )"
    :variant="variant"
    :size="size"
    @click="scrollNext"
  >
    <slot>
      <ArrowRight />
      <span class="sr-only">Next Slide</span>
    </slot>
  </Button>
</template>
