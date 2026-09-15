<script setup lang="ts">
/**
 * TableHeader —— 表头容器 <thead>（内部所有行都带下边框）。
 * 固定高度滚动时给它加 `sticky top-0 z-10 bg-background` 就能粘住表头。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <thead
    data-slot="table-header"
    :class="cn('[&_tr]:border-b', props.class)"
  >
    <slot />
  </thead>
</template>
