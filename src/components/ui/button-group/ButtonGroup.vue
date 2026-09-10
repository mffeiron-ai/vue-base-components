<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { ButtonGroupVariants } from "."
import { cn } from "../../../lib/utils"
import { buttonGroupVariants } from "."

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  /** 排列方向：horizontal（默认）/ vertical */
  orientation?: ButtonGroupVariants["orientation"]
}>(), {
  // 必须显式给默认值：cva 的 defaultVariants 只影响类名，
  // 而 :data-orientation 是 style-*.css 预设的选择器钩子（[data-orientation="horizontal"]），
  // 不传时 Vue 会直接不渲染该属性，预设里的组规则就会静默失效。
  orientation: "horizontal",
})
</script>

<template>
  <!--
    role="group"：无障碍上告诉读屏「这几个控件是一组的」
    data-slot + data-orientation：给 src/styles/style-*.css 的 8 套风格预设做选择器钩子
    （预设里有 [data-slot="button-group"][data-orientation="horizontal"] 规则，缺属性就会静默失效）
  -->
  <div
    role="group"
    data-slot="button-group"
    :data-orientation="props.orientation"
    :class="cn(buttonGroupVariants({ orientation: props.orientation }), props.class)"
  >
    <!-- 默认插槽：放 Button / ButtonGroupSeparator / ButtonGroupText / Input / Select 等 -->
    <slot />
  </div>
</template>
