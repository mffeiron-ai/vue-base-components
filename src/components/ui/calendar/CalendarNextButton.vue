<script lang="ts" setup>
// reka-ui 的「下一月」按钮（无头基元）：到底时自动置为 disabled
import type { CalendarNextProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
// 默认图标；想换图标用 <template #default> 插槽覆盖
import { ChevronRight } from "lucide-vue-next"
import { CalendarNext, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"
// 复用 Button 的样式表，保证切按钮与普通按钮观感一致
import { buttonVariants } from "../button"

const props = defineProps<CalendarNextProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <CalendarNext
    data-slot="calendar-next-button"
    :class="cn(
      buttonVariants({ variant: 'outline' }),
      'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
      props.class,
    )"
    v-bind="forwardedProps"
  >
    <slot>
      <ChevronRight class="size-4" />
    </slot>
  </CalendarNext>
</template>
