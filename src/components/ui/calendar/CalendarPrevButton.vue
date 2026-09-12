<script lang="ts" setup>
// reka-ui 的「上一月」按钮（无头基元）：到底时自动置为 disabled
import type { CalendarPrevProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
// 默认图标；想换图标用 <template #default> 插槽覆盖
import { ChevronLeft } from "lucide-vue-next"
import { CalendarPrev, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"
// 复用 Button 的样式表，保证切按钮与普通按钮观感一致
import { buttonVariants } from "../button"

const props = defineProps<CalendarPrevProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarPrev
    data-slot="calendar-prev-button"
    :class="cn(
      buttonVariants({ variant: 'outline' }),
      'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
      props.class,
    )"
    v-bind="forwardedProps"
  >
    <slot>
      <ChevronLeft class="size-4" />
    </slot>
  </CalendarPrev>
</template>
