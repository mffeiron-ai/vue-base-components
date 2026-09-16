<script setup lang="ts">
/**
 * Item —— 通用「条目」容器：左侧媒体（图标 / 头像 / 图片）+ 中间内容 + 右侧操作。
 *
 * 布局靠 flex-wrap 做：媒体与内容默认同行，`ItemHeader` / `ItemFooter` 带 `basis-full`
 * 会各自占满一行，所以「上标题下操作」和「左图右文」能混着用。
 *
 * - 一般包在 `ItemGroup` 里（那是 `role="list"`，外面配 `ItemSeparator` 分隔）
 * - `variant`：`default`（透明）/ `outline`（带边框）/ `muted`（浅底）
 * - `size`：`default`（p-4 gap-4）/ `sm`（py-3 px-4 gap-2.5）
 * - **整块可点**：配 `as-child` 包一个 `<a>` / 按钮即可 —— 根上带了
 *   `[a]:hover:bg-accent/50`，里面的链接 hover 时会自动给整块底色
 * - 想可聚焦/键盘操作，直接给根加 `tabindex`（已有 focus-visible 的 ring 样式）
 */
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { ItemVariants } from "."
import { Primitive } from "reka-ui"
import { cn } from "../../../lib/utils"
import { itemVariants } from "."

const props = withDefaults(defineProps<PrimitiveProps & {
  class?: HTMLAttributes["class"]
  variant?: ItemVariants["variant"]
  size?: ItemVariants["size"]
}>(), {
  as: "div",
  // variant / size 必须给默认值：预设是按 [data-variant] / [data-size] 选规则的，
  // 不传时 Vue 不会渲染这两个属性，预设里那些规则会全部静默失效
  //（同类坑：Avatar 的 data-size、Badge 的 data-variant、ButtonGroup 的 data-orientation、EmptyMedia 的 variant）
  variant: "default",
  size: "default",
})
</script>

<template>
  <Primitive
    data-slot="item"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :class="cn(itemVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
