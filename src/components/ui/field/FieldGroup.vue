<script setup lang="ts">
/**
 * FieldGroup —— 一组字段（比 FieldSet 轻，字段间间距更大）。
 * 同时提供 `@container/field-group` 容器查询上下文 —— Field 的
 * `orientation="responsive"` 就是靠它按「自身宽度」而不是视口宽度切水平/垂直。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="field-group"
    :class="cn(
      'group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
