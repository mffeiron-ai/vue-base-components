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
    CardAction：卡片右上角的操作区（放按钮 / 徽标 / 下拉菜单）。
    注意它自己并不相对卡片定位，而是靠 CardHeader 的 grid 摆位置：
      col-start-2 → 放到第 2 列；row-span-2 + row-start-1 → 从第 1 行起跨 2 行；
      self-start + justify-self-end → 顶部对齐、靠右。
    所以它必须放在 <CardHeader> 里才能生效（也能触发 header 切两列）。
  -->
  <div
    data-slot="card-action"
    :class="cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', props.class)"
  >
    <slot />
  </div>
</template>
