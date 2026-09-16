<script setup lang="ts">
/**
 * FieldSet —— `<fieldset>` 语义的一组字段外层（比 FieldGroup 间距小）。
 * 里面是 CheckboxGroup / RadioGroup 时会自动把间距收紧（它们本身自带行距）。
 * 配 FieldLegend 做组标题。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <fieldset
    data-slot="field-set"
    :class="cn(
      'flex flex-col gap-6',
      'has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
      props.class,
    )"
  >
    <slot />
  </fieldset>
</template>
