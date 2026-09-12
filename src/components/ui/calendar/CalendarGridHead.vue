<script lang="ts" setup>
// reka-ui 的日历表头（无头基元）：<thead>，里面放星期名那一行
import type { CalendarGridHeadProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
// 这个组件不需要合并 class 列表，直接整体透传 props 即可
import { CalendarGridHead } from "reka-ui"

const props = defineProps<CalendarGridHeadProps & { class?: HTMLAttributes["class"] }>()
</script>

<template>
  <CalendarGridHead
    data-slot="calendar-grid-head"
    v-bind="props"
  >
    <slot />
  </CalendarGridHead>
</template>
