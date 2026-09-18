import type { DateValue } from "@internationalized/date"
import type { Ref } from "vue"
import { computed, ref, toRaw, watch } from "vue"

/**
 * 换页（换月/翻页）动画，**不传默认滑入（slide）**：
 *  - slide：横向滑入滑出（按翻页方向自动换向）
 *  - fade：淡入淡出
 *  - zoom：缩放
 *  - flip：3D 翻转
 * 传 none 关掉动画，直接切换（此时网格不会卸载重建）。
 */
export type PageAnimationTypes = "none" | "slide" | "fade" | "zoom" | "flip" | undefined

export interface PageAnimationClasses {
  base: string
  enterActive: string
  enterFrom: string
  leaveActive: string
  leaveTo: string
}

/**
 * 把「当前显示的月份 + 动画类型」翻译成 `<Transition>` 用的 class。
 *
 * Calendar 与 RangeCalendar 共用：模板里把月份网格套一层 `<Transition>`，
 * `:key="hasPageAnimation ? pageKey : undefined"` —— 用 key 让网格只在**换月**时卸载重建
 * （选某一天也会改 placeholder，所以 key 取「年月」而不是整个日期）。
 */
export function usePageAnimation(
  placeholder: Ref<DateValue | null | undefined>,
  animation: () => PageAnimationTypes,
) {
  const hasPageAnimation = computed(() => !!animation() && animation() !== "none")

  /** 当前展示的年月，作为网格的 key */
  const pageKey = computed(() => {
    const date = toRaw(placeholder.value)
    return date ? `${date.year}-${String(date.month).padStart(2, "0")}` : ""
  })

  /** 翻页方向：1 = 往后翻（下一月），-1 = 往前翻（上一月）；slide 靠它决定从哪边滑进来 */
  const pageDirection = ref<1 | -1>(1)
  let lastMonthIndex: number | null = null
  watch(placeholder, () => {
    const date = toRaw(placeholder.value)
    if (!date) {
      return
    }

    const index = date.year * 12 + date.month

    // 只在「月份真的变了」时更新方向（选中某一天也会改 placeholder）
    if (lastMonthIndex !== null && index !== lastMonthIndex) {
      pageDirection.value = index > lastMonthIndex ? 1 : -1
    }

    lastMonthIndex = index
  }, { immediate: true })

  /**
   * 把 pageAnimation + 方向翻译成 <Transition> 的 4 个 class。
   *
   * 时长**跟随全局动效设置**：`duration-[var(--anim-dur,200ms)]` 读的是
   * `src/styles/animations.css` 里定义的 `--anim-dur`（进入）/ `--anim-dur-out`（离开）。
   * 逗号后是回退值 —— 没引入那个样式文件的消费方仍是原来的 200ms / 150ms，行为不变。
   * 注意「形式」不跟随全局：slide / fade / zoom / flip 由组件的 `pageAnimation` prop 决定。
   */
  const animationClasses = computed<PageAnimationClasses>(() => {
    const direction = pageDirection.value
    const enterDuration = "duration-[var(--anim-dur,200ms)]"
    const leaveDuration = "duration-[var(--anim-dur-out,150ms)]"

    switch (animation()) {
      case "slide":
        return {
          base: "",
          enterActive: `transition-all ${enterDuration} ease-out`,
          enterFrom: direction === 1 ? "translate-x-8 opacity-0" : "-translate-x-8 opacity-0",
          leaveActive: `transition-all ${leaveDuration} ease-in`,
          leaveTo: direction === 1 ? "-translate-x-8 opacity-0" : "translate-x-8 opacity-0",
        }
      case "fade":
        return {
          base: "",
          enterActive: `transition-opacity ${enterDuration} ease-out`,
          enterFrom: "opacity-0",
          leaveActive: `transition-opacity ${leaveDuration} ease-in`,
          leaveTo: "opacity-0",
        }
      case "zoom":
        return {
          base: "",
          enterActive: `transition-all ${enterDuration} ease-out`,
          enterFrom: "scale-95 opacity-0",
          leaveActive: `transition-all ${leaveDuration} ease-in`,
          leaveTo: "scale-95 opacity-0",
        }
      case "flip":
        // 3D 翻转：基础态显式写成 rotateY(0)，这样进出场能从具体矩阵插值，不会有跳变
        return {
          base: "origin-center [transform:perspective(1000px)_rotateY(0deg)]",
          enterActive: "transition-all duration-[var(--anim-dur,300ms)] ease-out",
          enterFrom: "[transform:perspective(1000px)_rotateY(-90deg)] opacity-0",
          leaveActive: "transition-all duration-[var(--anim-dur-out,200ms)] ease-in",
          leaveTo: "[transform:perspective(1000px)_rotateY(90deg)] opacity-0",
        }
      default:
        return { base: "", enterActive: "", enterFrom: "", leaveActive: "", leaveTo: "" }
    }
  })

  return { hasPageAnimation, pageKey, animationClasses }
}
