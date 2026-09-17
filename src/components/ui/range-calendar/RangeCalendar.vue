<script lang="ts" setup>
import type { RangeCalendarRootEmits, RangeCalendarRootProps } from "reka-ui"
import type { HTMLAttributes, Ref } from "vue"
import type { PageAnimationTypes } from "../calendar/usePageAnimation"
import { getLocalTimeZone, today } from "@internationalized/date"
import { reactiveOmit, useVModel } from "@vueuse/core"
import { RangeCalendarRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "../../../lib/utils"
import { usePageAnimation } from "../calendar/usePageAnimation"
import { RangeCalendarCell, RangeCalendarCellTrigger, RangeCalendarGrid, RangeCalendarGridBody, RangeCalendarGridHead, RangeCalendarGridRow, RangeCalendarHeadCell, RangeCalendarHeader, RangeCalendarHeading, RangeCalendarNextButton, RangeCalendarPrevButton } from "."

const props = withDefaults(defineProps<RangeCalendarRootProps & {
  class?: HTMLAttributes["class"]
  /** 换页动画：换月/翻页时给月份网格播的动画；不传默认 slide 滑入，想要直切传 none */
  pageAnimation?: PageAnimationTypes
}>(), {
  pageAnimation: "slide",
})

const emits = defineEmits<RangeCalendarRootEmits>()

const delegatedProps = reactiveOmit(props, "class", "pageAnimation", "placeholder")

// placeholder = 「当前显示的是哪个月」，做成受控/非受控通用的 v-model
// （passive: true 时子组件内部翻页也会同步回父级）
const placeholder = useVModel(props, "placeholder", emits, {
  passive: true,
  defaultValue: props.defaultPlaceholder ?? today(getLocalTimeZone()),
}) as Ref<any>

// 换页动画与 Calendar 共用同一套实现（见 calendar/usePageAnimation.ts）
const { hasPageAnimation, pageKey, animationClasses } = usePageAnimation(
  placeholder,
  () => props.pageAnimation,
)

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <RangeCalendarRoot
    v-slot="{ grid, weekDays }"
    v-model:placeholder="placeholder"
    data-slot="range-calendar"
    :class="cn('p-3', props.class)"
    v-bind="forwarded"
    :locale="props.locale ?? 'zh-CN'"
  >
    <RangeCalendarHeader>
      <RangeCalendarHeading />

      <div class="flex items-center gap-1">
        <RangeCalendarPrevButton />
        <RangeCalendarNextButton />
      </div>
    </RangeCalendarHeader>

    <!--
      换页动画与 Calendar 共用同一套（见 calendar/usePageAnimation.ts）：
      key = 当前显示的年月，所以只有换月/翻页才播动画；page-animation="none" 时 key 为 undefined。
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
        <RangeCalendarGrid v-for="month in grid" :key="month.value.toString()">
          <RangeCalendarGridHead>
            <RangeCalendarGridRow>
              <RangeCalendarHeadCell
                v-for="day in weekDays" :key="day"
              >
                {{ day }}
              </RangeCalendarHeadCell>
            </RangeCalendarGridRow>
          </RangeCalendarGridHead>
          <RangeCalendarGridBody>
            <RangeCalendarGridRow v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`" class="mt-2 w-full">
              <RangeCalendarCell
                v-for="weekDate in weekDates"
                :key="weekDate.toString()"
                :date="weekDate"
              >
                <RangeCalendarCellTrigger
                  :day="weekDate"
                  :month="month.value"
                />
              </RangeCalendarCell>
            </RangeCalendarGridRow>
          </RangeCalendarGridBody>
        </RangeCalendarGrid>
      </div>
    </Transition>
  </RangeCalendarRoot>
</template>
