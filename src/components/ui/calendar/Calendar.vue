<script lang="ts" setup>
// reka-ui 的日历根组件（无头基元）：负责日期逻辑、键盘导航、无障碍语义，
// 格子/表头/切换按钮等结构由下面一排 Calendar* 子组件搭出来
import type { CalendarRootEmits, CalendarRootProps } from "reka-ui"
// @internationalized/date 提供时区安全的日期类型与运算（DateValue / today 等）
import type { DateValue } from "@internationalized/date"
import type { HTMLAttributes, Ref } from "vue"
import type { LayoutTypes } from "."
import { getLocalTimeZone, today } from "@internationalized/date"
import { createReusableTemplate, reactiveOmit, useVModel } from "@vueuse/core"
import { CalendarRoot, useDateFormatter, useForwardPropsEmits } from "reka-ui"
// reka-ui 的日期工具：createYear 生成某年的 12 个月，createYearRange 生成年份序列，toDate 转成原生 Date
import { createYear, createYearRange, toDate } from "reka-ui/date"
import { computed, toRaw } from "vue"
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
  /** 自定义年份下拉的区间，不传则自动推算 */
  yearRange?: any[]
  modelValue?: any
  defaultValue?: any
  placeholder?: any
  defaultPlaceholder?: any
}>(), {
  modelValue: undefined,
  layout: undefined,
})
const emits = defineEmits<CalendarRootEmits>()

const delegatedProps = reactiveOmit(props, "class", "layout", "placeholder")

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

    <!-- 一个 grid = 一个月的表格；numberOfMonths > 1 时横向排列多个月 -->
    <div class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
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
  </CalendarRoot>
</template>
