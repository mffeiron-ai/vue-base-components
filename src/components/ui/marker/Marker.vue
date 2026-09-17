<script setup lang="ts">
/**
 * Marker —— 内容流里的「标记 / 分隔」行：如对话里的「今天」「已编辑」「AI 已停止生成」。
 *
 * 结构：`Marker` > （可选的 `MarkerIcon`）+ `MarkerContent`。
 *
 * - `variant`：
 *   · `default`（默认）—— 只有一行灰字，适合配图标做状态标记
 *   · `separator` —— 两侧自动画横线把文字夹在中间（「——— 今天 ———」）
 *   · `border` —— 底部一条边，用来分隔段落
 * - 里面放 `<a>` 会自动带下划线，hover 变深色（`[a]:` 钩子）
 * - 默认 `min-h-4`（16px），即使暂时没字也能占住一行高度
 * - 带 `group/marker`：子组件靠 `group-data-[variant=separator]/marker:` 感知当前变体
 * - `variant` 给了默认值 `'default'`，保证 `data-variant` 一定渲染出来，
 *   将来预设若加 default 分支能自动接上
 */
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { MarkerVariants } from "."
import { Primitive } from "reka-ui"
import { cn } from "../../../lib/utils"
import { markerVariants } from "."

interface Props extends PrimitiveProps {
  variant?: MarkerVariants["variant"]
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<Props>(), {
  as: "div",
  // 给默认值是为了让 data-variant 一定渲染（预设按 data 属性选变体，
  // 不渲染时会静默失效 —— 同类坑在 Avatar / Badge / Item 上都踩过）
  variant: "default",
})
</script>

<template>
  <Primitive
    data-slot="marker"
    :data-variant="variant"
    :as="as"
    :as-child="asChild"
    :class="cn(markerVariants({ variant }), props.class)"
  >
    <slot />
  </Primitive>
</template>
