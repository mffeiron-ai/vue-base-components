<script setup lang="ts">
/**
 * ItemMedia —— Item 左侧的媒体区（图标 / 头像 / 图片）。
 *
 * - `variant="default"`：什么都不加，里面自己放 Avatar 等
 * - `variant="icon"`：32×32 方块（浅底 + 细边框），里面的 svg 自动缩到 16×16
 * - `variant="image"`：40×40 圆角缩略图，里面的 `<img>` 自动铺满并 object-cover
 *
 * 自动垂直对齐：当同一条目里存在 `ItemDescription`（说明文字）时，
 * 媒体会自己改到顶部对齐并下移 0.5（靠 `group-has-[…]/item:` 实现），
 * 所以带描述的条目不用手动调对齐。
 */
import type { HTMLAttributes } from "vue"
import type { ItemMediaVariants } from "."
import { cn } from "../../../lib/utils"
import { itemMediaVariants } from "."

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  variant?: ItemMediaVariants["variant"]
}>(), {
  // 同上：预设按 [data-variant] 命中，不给默认值就不渲染
  variant: "default",
})
</script>

<template>
  <div
    data-slot="item-media"
    :data-variant="props.variant"
    :class="cn(itemMediaVariants({ variant }), props.class)"
  >
    <slot />
  </div>
</template>
