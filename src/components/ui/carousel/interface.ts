import type useEmblaCarousel from "embla-carousel-vue"
// 从 embla 适配层的函数签名反推 opts / plugins 类型，不用手抄一遍 embla 的类型定义
import type {
  EmblaCarouselVueType,
} from "embla-carousel-vue"
import type { HTMLAttributes, UnwrapRef } from "vue"

type CarouselApi = EmblaCarouselVueType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

/** embla 实例解包后的类型（供 emits 与 index.ts 对外导出） */
export type UnwrapRefCarouselApi = UnwrapRef<CarouselApi>

export interface CarouselProps {
  /** embla 配置：如 { loop: true, align: 'center', dragFree: true, slidesToScroll: 2 } */
  opts?: CarouselOptions
  /** embla 插件数组：如 [Autoplay({ delay: 3000 })] */
  plugins?: CarouselPlugin
  /** 滚动方向，默认 horizontal；vertical 会自动切成纵向轨道与上下翻页按钮 */
  orientation?: "horizontal" | "vertical"
}

export interface CarouselEmits {
  /** 实例就绪时触发，外部可借此拿到 api 做缩略图 / 进度指示等定制 */
  (e: "init-api", payload: UnwrapRefCarouselApi): void
}

/** 各子组件共用的 class prop */
export interface WithClassAsProps {
  class?: HTMLAttributes["class"]
}
