<script setup lang="ts">
import type { HTMLAttributes } from "vue"
// HTMLAttributes：Vue 内置 HTML 属性类型，用于给 class prop 做类型提示
import { cn } from "../../../lib/utils"
// cn：类名合并工具（clsx + tailwind-merge），后面的类会覆盖前面冲突的 Tailwind 类

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  /** 尺寸：default 常规 / sm 紧凑（更小的行间距与纵向内边距，子组件的内边距也会跟着收） */
  size?: "default" | "sm"
}>(), {
  size: "default",
})
// 定义组件的 props：可选的 class，以及尺寸 size（默认 default）
</script>

<template>
  <!--
    Card 是整套卡片的最外层容器（纯布局，不含任何 reka-ui 基元）。
    - data-slot="card" 是样式钩子：src/styles/style-*.css 里 8 套风格预设就是按 [data-slot="card"] 定位的
    - data-size 对应预设里的 data-[size=sm] 紧凑变体（gap / py 取自预设，故各风格数值不同）
    - group/card 是必须的：预设用 group-data-[size=sm]/card: 去改 CardHeader / Content / Footer 的内边距
    - 纵向 flex + gap-6：header / content / footer 之间的竖向间距统一在这里控制，子组件不用各写 margin
    - 竖向内边距 py-6 放在这一层、横向 px-6 放在子组件里，所以三段内容的左右对齐天然一致
    - 外部传 class 会经 cn() 合并，可覆盖圆角 / 边框 / 背景等
  -->
  <div
    data-slot="card"
    :data-size="size"
    :class="
      cn(
        'group/card bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm border-input data-[size=sm]:gap-4 data-[size=sm]:py-4',
        props.class,
      )
    "
  >
    <!-- 默认插槽：放 CardHeader / CardContent / CardFooter（顺序由使用方决定） -->
    <slot />
  </div>
</template>
