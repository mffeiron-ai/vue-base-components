<script setup lang="ts">
/**
 * FieldDescription —— 字段的辅助说明（弱化小字号）。
 * 自带与 legend / 相邻元素相邻时的间距修正，放在 Field 里不用额外调 margin；
 * 内部写 `<a>` 会自动带下划线与 hover 主题色。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <p
    data-slot="field-description"
    :class="cn(
      'text-muted-foreground text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance',
      'last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5',
      '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
      props.class,
    )"
  >
    <slot />
  </p>
</template>
