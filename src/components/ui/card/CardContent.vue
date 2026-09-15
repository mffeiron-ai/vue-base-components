<script setup lang="ts">
import type { HTMLAttributes } from "vue"
// HTMLAttributes：Vue 内置 HTML 属性类型，用于给 class prop 做类型提示
import { cn } from "../../../lib/utils"
// cn：类名合并工具（clsx + tailwind-merge），后面的类会覆盖前面冲突的 Tailwind 类

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
// 定义组件的 props：仅一个可选的 class
</script>

<template>
  <!-- 正文区只管左右内边距（横向 px-6 与 header / footer 对齐，Card 的 size="sm" 下预设会改成 px-4）；竖向间距由 Card 的 gap 负责 -->
  <div
    data-slot="card-content"
    :class="cn('px-6', props.class)"
  >
    <slot />
  </div>
</template>
