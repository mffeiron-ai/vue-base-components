import type { UnwrapRefCarouselApi as CarouselApi, CarouselEmits, CarouselProps } from "./interface"
// UnwrapRefCarouselApi：embla 实例（Vue ref 解包后的类型）
import { createInjectionState } from "@vueuse/core"
// createInjectionState：把 provide / inject 成对生成，不用手写 InjectionKey
import emblaCarouselVue from "embla-carousel-vue"
// emblaCarouselVue：embla 的 Vue 适配层，返回 [节点 ref, api ref]，无头（只管滚动逻辑）
import { onMounted, ref } from "vue"

// 用 createInjectionState 生成一对：[供给端, 注入端]。
// Carousel.vue 调供给端，子组件（Content / Item / Next / Previous）调注入端拿同一份状态。
const [useProvideCarousel, useInjectCarousel] = createInjectionState(
  ({
    opts,
    orientation,
    plugins,
  }: CarouselProps, emits: CarouselEmits) => {
    // orientation 要映射成 embla 的 axis：横向 = x，纵向 = y
    const [emblaNode, emblaApi] = emblaCarouselVue({
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    }, plugins)

    function scrollPrev() {
      emblaApi.value?.scrollPrev()
    }
    function scrollNext() {
      emblaApi.value?.scrollNext()
    }

    // canScroll* 用来给上/下翻页按钮做禁用态（到头了就禁用）
    const canScrollNext = ref(false)
    const canScrollPrev = ref(false)

    function onSelect(api: CarouselApi) {
      canScrollNext.value = api?.canScrollNext() || false
      canScrollPrev.value = api?.canScrollPrev() || false
    }

    onMounted(() => {
      if (!emblaApi.value)
        return

      // 三个时机都要同步按钮状态：init（初始化）、reInit（尺寸/配置变化后重建）、select（一次翻页完成）
      emblaApi.value?.on("init", onSelect)
      emblaApi.value?.on("reInit", onSelect)
      emblaApi.value?.on("select", onSelect)

      // 把实例抛给父组件，外部可以调 scrollTo / selectedScrollSnap 等 API
      emits("init-api", emblaApi.value)
    })

    return { carouselRef: emblaNode, carouselApi: emblaApi, canScrollPrev, canScrollNext, scrollPrev, scrollNext, orientation }
  },
)

// 子组件用它拿父级状态；不在 <Carousel> 内使用会直接报错，方便定位用法问题
function useCarousel() {
  const carouselState = useInjectCarousel()

  if (!carouselState)
    throw new Error("useCarousel must be used within a <Carousel />")

  return carouselState
}

export { useCarousel, useProvideCarousel }
