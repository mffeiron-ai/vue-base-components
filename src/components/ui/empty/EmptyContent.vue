<script setup lang="ts">
/**
 * EmptyContent —— 标题下面的内容区（一般放最多两个按钮：主操作 + 次操作）。
 * 自带 `max-w-sm` 限制宽度，宽屏下不会拖得很长。
 */

import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="empty-content"
    :class="cn(
      'flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
