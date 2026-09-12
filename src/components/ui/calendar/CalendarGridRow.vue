<script lang="ts" setup>
// reka-ui 的日历行（无头基元）：表头的星期行与表体的每一周都用它
import type { CalendarGridRowProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
// reactiveOmit + useForwardProps：class 单独合并，其余 props 原样透传
import { reactiveOmit } from "@vueuse/core"
import { CalendarGridRow, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<CalendarGridRowProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarGridRow
    data-slot="calendar-grid-row"
    :class="cn('flex', props.class)" v-bind="forwardedProps"
  >
    <slot />
  </CalendarGridRow>
</template>
