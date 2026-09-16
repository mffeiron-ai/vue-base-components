<script setup lang="ts">
/**
 * EmptyHeader —— 空状态的文字区：把图标、标题、描述竖着居中排好（gap-2、居中）。
 */

import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="empty-header"
    :class="cn(
      'flex max-w-sm flex-col items-center gap-2 text-center',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
