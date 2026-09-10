<script setup lang="ts">
// Primitive / PrimitiveProps 来自 reka-ui：把样式渲染到指定标签上，
// as-child 时改为把样式合并到唯一子元素上（例如把 Label 当成组内文本）
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ButtonGroupVariants } from "."
import { Primitive } from "reka-ui"
import { cn } from "../../../lib/utils"

interface Props extends PrimitiveProps {
  /** 追加的自定义类，经 cn()（tailwind-merge）去重合并 */
  class?: HTMLAttributes["class"]
  /** 继承组的排列方向，用于透出 data-orientation 给样式预设 */
  orientation?: ButtonGroupVariants["orientation"]
}

const props = withDefaults(defineProps<Props>(), {
  // 默认渲染成 div，作为组内的纯文本标签（不参与点击）
  as: "div",
})
</script>

<template>
  <!--
    注意 data-slot 必须是 "button-group-text"：
    组件库内部/预设靠它区分「组容器」与「组内文本」，写成 button-group 会：
    1) 让父组容器的 has-[>[data-slot=button-group]]:gap-2 误命中，多出一段间距
    2) 让预设里的 [data-slot="button-group"] 组规则错误地作用到这段文本上
  -->
  <Primitive
    role="group"
    data-slot="button-group-text"
    :data-orientation="props.orientation"
    :as="as"
    :as-child="asChild"
    :class="cn('bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4', props.class)"
  >
    <slot />
  </Primitive>
</template>
