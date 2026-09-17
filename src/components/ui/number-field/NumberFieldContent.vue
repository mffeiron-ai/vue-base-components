<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <!-- 给输入框补左右内边距，别让数字被 ＋/－ 按钮压住。
       两个注意点：
       1) 判断「按钮存在」要在**父级**上用 :has()（按钮是 input 的兄弟，不是后代）
       2) 必须带 `!`：样式预设给 [data-slot=input] 的 padding 是无层样式，优先级高于 @layer utilities -->
  <div :class="cn('relative [&:has([data-slot=decrement])>[data-slot=input]]:pl-5! [&:has([data-slot=increment])>[data-slot=input]]:pr-5!', props.class)">
    <slot />
  </div>
</template>
