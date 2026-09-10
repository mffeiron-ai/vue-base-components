<script setup lang="ts">
// reka-ui 的 headless 基元：Primitive 负责「把样式渲染到指定标签上」这件事本身，
// 默认渲染 <div>，通过 as 指定真实标签；这里默认 button。
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "."
import { Primitive } from "reka-ui"
import { cn } from "../../../lib/utils"
import { buttonVariants } from "."

/**
 * PrimitiveProps 自带两个关键 prop：
 * - as：指定最终渲染的标签（默认 button，可换成 a 等）
 * - asChild：不渲染自身标签，改为把样式合并到唯一的子元素上（常用于 RouterLink / <a>）
 * variant / size 直接复用 cva 推导出的联合类型，保证 TS 提示与运行时样式表一致。
 */
interface Props extends PrimitiveProps {
  /** 视觉变体：default / destructive / outline / secondary / ghost / link，默认 default */
  variant?: ButtonVariants["variant"]
  /** 尺寸：default / sm / lg / icon / icon-sm / icon-lg，默认 default */
  size?: ButtonVariants["size"]
  /** 追加的自定义类，最终经 cn()（tailwind-merge）去重合并 */
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  // 默认渲染成一个真实的 <button>，保证可聚焦、可被表单提交、有正确的无障碍语义
  as: "button",
})
</script>

<template>
  <!--
    data-slot / data-variant / data-size 是组件库约定的样式钩子：
    src/styles/style-*.css 的 8 套风格预设用 [data-slot="button"][data-variant="..."] 做选择器，
    且特异性高于工具类 —— 三者缺一，预设里的变体样式就会静默失效。
  -->
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <!-- 默认插槽：放文字或「图标 + 文字」；图标尺寸由 cva 基类里的 [&_svg] 规则统一收敛 -->
    <slot />
  </Primitive>
</template>
