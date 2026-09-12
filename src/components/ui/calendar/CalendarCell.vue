<script lang="ts" setup>
// reka-ui 的日历单元格（无头基元）：负责日期格子的定位、焦点管理与无障碍语义
import type { CalendarCellProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
// reactiveOmit 先把 class 摘出来单独交给 cn() 合并；
// useForwardProps 把其余 props 透传给 reka-ui（避免 class 被透传时覆盖合并结果）
import { reactiveOmit } from "@vueuse/core"
import { CalendarCell, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<CalendarCellProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarCell
    data-slot="calendar-cell"
    :class="cn('relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1', props.class)"
    v-bind="forwardedProps"
  >
    <slot />
  </CalendarCell>
</template>
