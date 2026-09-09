<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
// 定义组件的 props：仅一个可选的 class
</script>

<template>
  <!-- data-slot="alert-description" 标识描述块
       :class 合并默认描述样式（col-start-2 / text-sm / text-muted-foreground）与 props.class -->
  <div
    data-slot="alert-description"
    :class="cn('text-muted-foreground col-start-2 text-sm [&_p]:leading-relaxed', props.class)"
  >
    <slot />
  </div>
</template>
