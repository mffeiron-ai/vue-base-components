// 轮播。底层是 embla-carousel（无头滚动引擎），这里只做结构与样式包装：
// Carousel 提供实例 → CarouselContent 是可滑动轨道 → CarouselItem 是一屏 → Next/Previous 是翻页按钮
export { default as Carousel } from "./Carousel.vue"
export { default as CarouselContent } from "./CarouselContent.vue"
export { default as CarouselItem } from "./CarouselItem.vue"
export { default as CarouselNext } from "./CarouselNext.vue"
export { default as CarouselPrevious } from "./CarouselPrevious.vue"
export type {
  UnwrapRefCarouselApi as CarouselApi,
} from "./interface"

// 子组件内部靠它拿实例；在 <Carousel> 外使用会报错
export { useCarousel } from "./useCarousel"
