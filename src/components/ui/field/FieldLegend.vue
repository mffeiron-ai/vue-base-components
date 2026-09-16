<script setup lang="ts">
/**
 * FieldLegend —— `<legend>` 语义的分组标题，配 FieldSet 使用。
 * `variant="legend"`（默认，16px）用于整组字段的标题；`"label"`（14px）用于紧凑场景。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
  variant?: "legend" | "label"
}>()
</script>

<template>
  <legend
    data-slot="field-legend"
    :data-variant="variant"
    :class="cn(
      'mb-3 font-medium',
      'data-[variant=legend]:text-base',
      'data-[variant=label]:text-sm',
      props.class,
    )"
  >
    <slot />
  </legend>
</template>
