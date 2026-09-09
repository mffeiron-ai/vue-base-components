<script setup lang="ts">
// Alert 是纯 cva 样式组件（无 reka-ui），通过 variant 切换 default / destructive 两套提示样式。
import type { HTMLAttributes } from "vue"
/**
 * HTMLAttributes：Vue 内置 HTML 属性类型，用于给 class prop 做类型提示。
 */
import type { AlertVariants } from "."
/**
 * AlertVariants：由 cva 生成的 variant 类型（'default' | 'destructive'），约束 variant 可选值。
 */
import { cn } from "../../../lib/utils"
/**
 * cn：类名合并工具（clsx + tailwind-merge），后面的类会覆盖前面冲突的 Tailwind 类。
 */
import { alertVariants } from "."
/**
 * alertVariants：Alert 的 cva 变体定义（基础样式 + variant.default / variant.destructive）。
 */

const props = defineProps<{
  class?: HTMLAttributes["class"]
  variant?: AlertVariants["variant"]
}>()
// 定义组件的 props：可选的 class，以及由 AlertVariants 约束的 variant（默认 default）
</script>

<template>
  <!-- data-slot="alert" 标识插槽，便于样式按 data-slot 定位
       :class 合并 alertVariants({ variant }) 与用户传入的 props.class
       role="alert" 让屏幕阅读器识别为告警区 -->
  <div
    data-slot="alert"
    :class="cn(alertVariants({ variant }), props.class)"
    role="alert"
  >
    <!-- 默认插槽：用于放 AlertTitle / AlertDescription 等 -->
    <slot />
  </div>
</template>
