<script setup lang="ts">
/**
 * DialogHeader —— 头部容器：标题 + 描述（+ 可选的其他信息）。
 * 移动端居中、sm 以上左对齐，与 shadcn 视觉一致。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="dialog-header"
    :class="cn('flex flex-col gap-2 text-center sm:text-left', props.class)"
  >
    <slot />
  </div>
</template>
