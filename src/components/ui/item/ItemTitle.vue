<script setup lang="ts">
/**
 * ItemTitle —— 条目标题（14px 中等字重，宽度跟随内容）。
 *
 * `w-fit` 是为了让它在 header 的 `justify-between` 里不被拉满。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="item-title"
    :class="cn('flex w-fit items-center gap-2 text-sm leading-snug font-medium', props.class)"
  >
    <slot />
  </div>
</template>
