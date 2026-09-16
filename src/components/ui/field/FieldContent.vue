<script setup lang="ts">
/**
 * FieldContent —— 把「标签 + 描述」包成一列，方便与控件左右并列。
 * 水平布局（`orientation="horizontal"`）里不包它的话，label 和控件会各自占一列。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="field-content"
    :class="cn(
      'group/field-content flex flex-1 flex-col gap-1.5 leading-snug',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
