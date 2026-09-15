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
  <!--
    页脚：横向 flex 排列操作按钮（常配 justify-end 或 justify-between）；
    [.border-t]:pt-6 —— 使用方自己加 border-t 分隔线时，自动补上向上的内边距；
    同样，左右 px-6 在 Card 的 size="sm" 下会被预设改成 px-4。
  -->
  <div
    data-slot="card-footer"
    :class="cn('flex items-center px-6 [.border-t]:pt-6', props.class)"
  >
    <slot />
  </div>
</template>
