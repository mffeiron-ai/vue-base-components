<script lang="ts" setup>
// reka-ui 的日期可点击单元（无头基元）：自带键盘导航、aria-selected / aria-disabled 等语义
import type { CalendarCellTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { CalendarCellTrigger, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"
// 复用 Button 的样式表，让日期格子与普通按钮共用一套尺寸/焦点环
import { buttonVariants } from "../button"

const props = withDefaults(defineProps<CalendarCellTriggerProps & { class?: HTMLAttributes["class"] }>(), {
  // 语义上就是一个按钮：可聚焦、可回车/空格选中
  as: "button",
})

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarCellTrigger
    data-slot="calendar-cell-trigger"
    :class="cn(
      buttonVariants({ variant: 'ghost' }),
      'size-8 p-0 font-normal aria-selected:opacity-100 cursor-default',
      // 今天（未被选中时）：淡色底，与选中态区分开
      '[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground',
      // 已选中：主色实底（hover / focus 保持同样的主色，不因交互而变色）
      'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:opacity-100 [&[data-selected]:hover]:bg-primary data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-primary data-[selected]:focus:text-primary-foreground',
      // 超过 min/max 范围：半透明
      'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
      // 被标记为不可用（isDateUnavailable）：删线提示
      'data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through',
      // 上下月溢出的日期：弱化为次要文字
      'data-[outside-view]:text-muted-foreground',
      props.class,
    )"
    v-bind="forwardedProps"
  >
    <slot />
  </CalendarCellTrigger>
</template>
