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
    CardHeader 用 grid 把「标题 + 描述」和右上角的 CardAction 摆在同一块区域：
    - @container/card-header：把 header 声明为具名容器查询容器，子元素可用 @sm: 等前缀按 header 自身宽度响应
    - grid-rows-[auto_auto] + auto-rows-min：标题 / 描述各占一行，行高随内容自适应
    - has-data-[slot=card-action]:grid-cols-[1fr_auto]：只有真的放了 CardAction 才切成两列；
      没放时标题仍占满整行（CardAction 的 col-start-2 依赖这条规则）
    - [.border-b]:pb-6：使用方自己给 header 加 border-b 时，自动补上向下的内边距
    - px-6 的左右内边距在紧凑尺寸（Card 传 size="sm"）下会由预设改成 px-4
  -->
  <div
    data-slot="card-header"
    :class="cn('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', props.class)"
  >
    <!-- 默认插槽：按顺序放 CardTitle、CardDescription，右上角操作放 CardAction -->
    <slot />
  </div>
</template>
