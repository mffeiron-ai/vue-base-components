<script setup lang="ts">
/**
 * EmptyMedia —— 图标 / 插画位。
 *
 * `variant="icon"`（默认是 `default`）：给一个 40×40 的圆角浅底，里面的 svg 自动
 * 收敛到 24px —— 放一个 lucide 图标就很好看。
 * 想要自定义插画直接丢 svg / img 进去即可（两个变体都不限制子元素尺寸）。
 */

import type { HTMLAttributes } from "vue"
import type { EmptyMediaVariants } from "."
import { cn } from "../../../lib/utils"
import { emptyMediaVariants } from "."

// 显式给默认值：cva 的 defaultVariants 只管类名，不会给 data-variant 赋值，
// 一旦没值预设 / 自己写的 [data-variant=…] 规则就会静默失效
const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  variant?: EmptyMediaVariants["variant"]
}>(), {
  variant: "default",
})
</script>

<template>
  <div
    data-slot="empty-icon"
    :data-variant="variant"
    :class="cn(emptyMediaVariants({ variant }), props.class)"
  >
    <slot />
  </div>
</template>
