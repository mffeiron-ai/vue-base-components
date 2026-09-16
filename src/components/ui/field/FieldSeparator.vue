<script setup lang="ts">
/**
 * FieldSeparator —— 字段组之间的分隔线；给默认插槽传文字就变成「中间带字」的分隔线
 * （例如「或者用邮箱登录」），不传插槽就是一条普通线。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"
import { Separator } from "../separator"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="field-separator"
    :data-content="!!$slots.default"
    :class="cn(
      'relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2',
      props.class,
    )"
  >
    <Separator class="absolute inset-0 top-1/2" />
    <span
      v-if="$slots.default"
      class="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
      data-slot="field-separator-content"
    >
      <slot />
    </span>
  </div>
</template>
