<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
// 定义组件的 props：仅一个可选的 class
</script>

<template>
  <!-- data-slot="alert-title" 标识标题块
       :class 合并默认标题样式（col-start-2 / font-medium / tracking-tight）与 props.class -->
  <div
    data-slot="alert-title"
    :class="cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', props.class)"
  >
    <slot />
  </div>
</template>
