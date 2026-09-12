<script lang="ts" setup>
// reka-ui 的星期名单元格（无头基元）：表头里「一二三四五六日」的每个格子
import type { CalendarHeadCellProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
// reactiveOmit + useForwardProps：class 单独合并，其余 props 原样透传
import { reactiveOmit } from "@vueuse/core"
import { CalendarHeadCell, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<CalendarHeadCellProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarHeadCell
    data-slot="calendar-head-cell"
    :class="cn('text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem]', props.class)"
    v-bind="forwardedProps"
  >
    <slot />
  </CalendarHeadCell>
</template>
