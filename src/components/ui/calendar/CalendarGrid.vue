<script lang="ts" setup>
// reka-ui 的日历表格（无头基元）：一个 <table>，承载「月」的网格
import type { CalendarGridProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
// reactiveOmit + useForwardProps：class 单独合并，其余 props 原样透传
import { reactiveOmit } from "@vueuse/core"
import { CalendarGrid, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<CalendarGridProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarGrid
    data-slot="calendar-grid"
    :class="cn('w-full border-collapse space-x-1', props.class)"
    v-bind="forwardedProps"
  >
    <slot />
  </CalendarGrid>
</template>
