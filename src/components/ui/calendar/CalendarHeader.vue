<script lang="ts" setup>
// reka-ui 的日历头部（无头基元）：左右切换按钮 + 当前月份/年份标题都放这里
import type { CalendarHeaderProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
// reactiveOmit + useForwardProps：class 单独合并，其余 props 原样透传
import { reactiveOmit } from "@vueuse/core"
import { CalendarHeader, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<CalendarHeaderProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarHeader
    data-slot="calendar-header"
    :class="cn('flex justify-center pt-1 relative items-center w-full px-8', props.class)"
    v-bind="forwardedProps"
  >
    <slot />
  </CalendarHeader>
</template>
