<script lang="ts" setup>
// reka-ui 的日历根组件（无头基元）：负责日期逻辑、键盘导航、无障碍语义，
// 格子/表头/切换按钮等结构由下面一排 Calendar* 子组件搭出来
import type { CalendarRootEmits, CalendarRootProps } from "reka-ui"
// @internationalized/date 提供时区安全的日期类型与运算（DateValue / today 等）
import type { DateValue } from "@internationalized/date"
import type { HTMLAttributes, Ref } from "vue"
import type { LayoutTypes, PageAnimationTypes } from "."
import { getLocalTimeZone, today } from "@internationalized/date"
import { createReusableTemplate, reactiveOmit, useVModel } from "@vueuse/core"
import { CalendarRoot, useDateFormatter, useForwardPropsEmits } from "reka-ui"
// reka-ui 的日期工具：createYear 生成某年的 12 个月，createYearRange 生成年份序列，toDate 转成原生 Date
import { createYear, createYearRange, toDate } from "reka-ui/date"
import { computed, ref, toRaw, watch } from "vue"
import { cn } from "../../../lib/utils"
// 「点标题就能改月份/年份」的下拉用项目自己的 Select（reka-ui），而不是原生 select
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select"
import { CalendarCell, CalendarCellTrigger, CalendarGrid, CalendarGridBody, CalendarGridHead, CalendarGridRow, CalendarHeadCell, CalendarHeader, CalendarHeading, CalendarNextButton, CalendarPrevButton } from "."

// modelValue / defaultValue / placeholder 在 reka-ui 里是 DateValue，
// 这里放宽成 any 以免使用方在模板里绑定日期对象时被类型卡住
const props = withDefaults(defineProps<Omit<CalendarRootProps, 'modelValue' | 'defaultValue' | 'placeholder' | 'defaultPlaceholder'> & {
  class?: HTMLAttributes["class"]
  /** 标题栏形式：月+年下拉 / 仅月下拉 / 仅年下拉；不传则为纯文本标题 */
  layout?: LayoutTypes
  /** 换页动画：换月/翻页时给月份网格播的动画；不传就是默认的 slide 滑入，想要直切传 none */
  pageAnimation?: PageAnimationTypes
  /** 自定义年份下拉的区间，不传则自动推算 */
  yearRange?: any[]
  modelValue?: any
  defaultValue?: any
  placeholder?: any
  defaultPlaceholder?: any
}>(), {
  modelValue: undefined,
  layout: undefined,
  pageAnimation: 'slide',
})
const emits = defineEmits<CalendarRootEmits>()

const delegatedProps = reactiveOmit(props, "class", "layout", "pageAnimation", "placeholder")

// placeholder = 「当前显示的是哪个月」，不直接解构是为了做成受控/非受控通用的 v-model
// （passive: true 时子组件内部变更也会同步回父级）
const placeholder = useVModel(props, "placeholder", emits, {
  passive: true,
  defaultValue: props.defaultPlaceholder ?? today(getLocalTimeZone()),
}) as Ref<any>

// 按 locale 格式化月份/年份文案
const formatter = useDateFormatter(props.locale ?? "en")

// 年份下拉的可选项：优先用外部传入的 yearRange；否则以 min/max（没传就用当前 placeholder）为基准，
// 前后各推 100 年 / 10 年
const yearRange = computed(() => {
  return props.yearRange ?? createYearRange({
    start: props?.minValue ?? (toRaw(props.placeholder) ?? props.defaultPlaceholder ?? today(getLocalTimeZone()))
      .cycle("year", -100),

    end: props?.maxValue ?? (toRaw(props.placeholder) ?? props.defaultPlaceholder ?? today(getLocalTimeZone()))
      .cycle("year", 10),
  })
})

// 月份/年份下拉的模板要在多个 layout 分支里重复使用，用 createReusableTemplate 定义一次即可
const [DefineMonthTemplate, ReuseMonthTemplate] = createReusableTemplate<{ date: DateValue }>()
const [DefineYearTemplate, ReuseYearTemplate] = createReusableTemplate<{ date: DateValue }>()

// ── 换页动画 ──────────────────────────────────────────
// 思路：给月份网格一层 <Transition>，网格 key 用「当前显示的年月」（点日期不会改变 key，
// 所以只有换月/翻页才播动画），4 种动画全用 Tailwind 工具类实现，不额外写 CSS。
// 默认就是 slide，想要直切（不做动画、也不卸载重建节点）传 page-animation="none"。
const hasPageAnimation = computed(() => !!props.pageAnimation && props.pageAnimation !== 'none')

/** 当前展示的年月，作为网格的 key */
const pageKey = computed(() => {
  const d = toRaw(placeholder.value)
  return d ? `${d.year}-${String(d.month).padStart(2, "0")}` : ""
})

/** 翻页方向：1 = 往后翻（下一月），-1 = 往前翻（上一月）；slide 靠它决定从哪边滑进来 */
const pageDirection = ref<1 | -1>(1)
let lastMonthIndex: number | null = null
watch(placeholder, () => {
  const d = toRaw(placeholder.value)
  if (!d) return
  const idx = d.year * 12 + d.month
  // 只在「月份真的变了」时更新方向（选中某一天也会改 placeholder）
  if (lastMonthIndex !== null && idx !== lastMonthIndex) {
    pageDirection.value = idx > lastMonthIndex ? 1 : -1
  }
  lastMonthIndex = idx
}, { immediate: true })

/** 把 pageAnimation + 方向翻译成 <Transition> 的 4 个 class */
const animationClasses = computed(() => {
  const dir = pageDirection.value
  switch (props.pageAnimation) {
    case "slide":
      return {
        base: "",
        enterActive: "transition-all duration-200 ease-out",
        enterFrom: dir === 1 ? "translate-x-8 opacity-0" : "-translate-x-8 opacity-0",
        leaveActive: "transition-all duration-150 ease-in",
        leaveTo: dir === 1 ? "-translate-x-8 opacity-0" : "translate-x-8 opacity-0",
      }
    case "fade":
      return {
        base: "",
        enterActive: "transition-opacity duration-200 ease-out",
        enterFrom: "opacity-0",
        leaveActive: "transition-opacity duration-150 ease-in",
        leaveTo: "opacity-0",
      }
    case "zoom":
      return {
        base: "",
        enterActive: "transition-all duration-200 ease-out",
        enterFrom: "scale-95 opacity-0",
        leaveActive: "transition-all duration-150 ease-in",
        leaveTo: "scale-95 opacity-0",
      }
    case "flip":
      // 3D 翻转：基础态显式写成 rotateY(0)，这样进出场能从具体矩阵插值，不会有跳变
      return {
        base: "origin-center [transform:perspective(1000px)_rotateY(0deg)]",
        enterActive: "transition-all duration-300 ease-out",
        enterFrom: "[transform:perspective(1000px)_rotateY(-90deg)] opacity-0",
        leaveActive: "transition-all duration-200 ease-in",
        leaveTo: "[transform:perspective(1000px)_rotateY(90deg)] opacity-0",
      }
    default:
      return { base: "", enterActive: "", enterFrom: "", leaveActive: "", leaveTo: "" }
  }
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <!--
    月份下拉：用项目自己的 Select（reka-ui）替代原生 select。
    触发器把边框/底色/阴影都去掉、只留文字和小箭头，所以看上去就是标题文字，点开才是下拉列表。
    年份下拉同理。
  -->
  <DefineMonthTemplate v-slot="{ date }">
    <!-- SelectItem 的 value 只接受字符串，所以这里统一 String() 一下，回调里再转回数字 -->
    <Select
      :model-value="String(date.month)"
      @update:model-value="(v: any) => { placeholder = placeholder.set({ month: Number(v) }) }"
    >
      <SelectTrigger class="h-8! gap-1! rounded-md! border-0! bg-transparent! px-2! py-0! text-sm shadow-none!">
        {{ formatter.custom(toDate(date), { month: 'short' }) }}
      </SelectTrigger>
      <SelectContent class="max-h-72">
        <SelectItem
          v-for="month in createYear({ dateObj: date })"
          :key="month.toString()"
          :value="String(month.month)"
        >
          {{ formatter.custom(toDate(month), { month: 'short' }) }}
        </SelectItem>
      </SelectContent>
    </Select>
  </DefineMonthTemplate>

  <DefineYearTemplate v-slot="{ date }">
    <Select
      :model-value="String(date.year)"
      @update:model-value="(v: any) => { placeholder = placeholder.set({ year: Number(v) }) }"
    >
      <SelectTrigger class="h-8! gap-1! rounded-md! border-0! bg-transparent! px-2! py-0! text-sm shadow-none!">
        {{ formatter.custom(toDate(date), { year: 'numeric' }) }}
      </SelectTrigger>
      <SelectContent class="max-h-72">
        <SelectItem
          v-for="year in yearRange"
          :key="year.toString()"
          :value="String(year.year)"
        >
          {{ formatter.custom(toDate(year), { year: 'numeric' }) }}
        </SelectItem>
      </SelectContent>
    </Select>
  </DefineYearTemplate>

  <!--
    CalendarRoot 通过作用域插槽把渲染所需的数据交出来：
      grid     —— 要展示的月份（numberOfMonths > 1 时会有多项）
      weekDays —— 按 locale 排好的星期名
      date     —— 当前视图日期（切月/切年就是改它）
  -->
  <CalendarRoot
    v-slot="{ grid, weekDays, date }"
    v-bind="forwarded"
    v-model:placeholder="placeholder"
    data-slot="calendar"
    :class="cn('p-3', props.class)"
  >
    <CalendarHeader class="pt-0">
      <!--
        这排「上/下月」按钮用 absolute 铺满整个标题行（inset-x-0），于是标题行中间那块的
        月份/年份下拉会整片落在 nav 的命中区域里，导致下拉点不开。
        所以 nav 自身设为 pointer-events-none（不吃事件），只把两个按钮单独设回 pointer-events-auto。
      -->
      <nav class="pointer-events-none flex items-center gap-1 absolute top-0 inset-x-0 justify-between">
        <CalendarPrevButton class="pointer-events-auto">
          <slot name="calendar-prev-icon" />
        </CalendarPrevButton>
        <CalendarNextButton class="pointer-events-auto">
          <slot name="calendar-next-icon" />
        </CalendarNextButton>
      </nav>

      <!-- 标题区的三种 layout 变体；都不传时用纯文本标题（CalendarHeading） -->
      <slot name="calendar-heading" :date="date" :month="ReuseMonthTemplate" :year="ReuseYearTemplate">
        <template v-if="layout === 'month-and-year'">
          <div class="flex items-center justify-center gap-1">
            <ReuseMonthTemplate :date="date" />
            <ReuseYearTemplate :date="date" />
          </div>
        </template>
        <template v-else-if="layout === 'month-only'">
          <div class="flex items-center justify-center gap-1">
            <ReuseMonthTemplate :date="date" />
            {{ formatter.custom(toDate(date), { year: 'numeric' }) }}
          </div>
        </template>
        <template v-else-if="layout === 'year-only'">
          <div class="flex items-center justify-center gap-1">
            {{ formatter.custom(toDate(date), { month: 'short' }) }}
            <ReuseYearTemplate :date="date" />
          </div>
        </template>
        <template v-else>
          <CalendarHeading />
        </template>
      </slot>
    </CalendarHeader>

    <!--
      一个 grid = 一个月的表格；numberOfMonths > 1 时横向排列多个月。
      外面套 <Transition>：key = 当前年月，换月/翻页时才播动画（用 mode="out-in" 避免新旧月份重叠）。
      没传 page-animation 时 key 为 undefined（保持原来的直切，不做卸载重建）。
    -->
    <Transition
      :enter-active-class="animationClasses.enterActive"
      :enter-from-class="animationClasses.enterFrom"
      :leave-active-class="animationClasses.leaveActive"
      :leave-to-class="animationClasses.leaveTo"
      mode="out-in"
    >
      <div
        :key="hasPageAnimation ? pageKey : undefined"
        :class="animationClasses.base"
        class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0"
      >
        <CalendarGrid v-for="month in grid" :key="month.value.toString()">
          <CalendarGridHead>
            <CalendarGridRow>
              <!-- 表头：固定的星期名 -->
              <CalendarHeadCell
                v-for="day in weekDays" :key="day"
              >
                {{ day }}
              </CalendarHeadCell>
            </CalendarGridRow>
          </CalendarGridHead>
          <CalendarGridBody>
            <!-- 表体：month.rows 是「一周一行」的二维数组 -->
            <CalendarGridRow v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`" class="mt-2 w-full">
              <CalendarCell
                v-for="weekDate in weekDates"
                :key="weekDate.toString()"
                :date="weekDate"
              >
                <CalendarCellTrigger
                  :day="weekDate"
                  :month="month.value"
                />
              </CalendarCell>
            </CalendarGridRow>
          </CalendarGridBody>
        </CalendarGrid>
      </div>
    </Transition>
  </CalendarRoot>
</template>
