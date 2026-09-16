<script setup lang="ts">
/**
 * ItemDescription —— 条目说明文字（灰色小字，最多两行）。
 *
 * - 默认 `line-clamp-2` 截断两行，想完整显示传 `class="line-clamp-none"`
 * - 里面的 `<a>` 会自动下划线，hover 变主色，不用自己写
 * - 一旦出现它，`ItemMedia` 会自动改成顶部对齐（见 ItemMedia 注释）
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <p
    data-slot="item-description"
    :class="cn(
      'text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance',
      '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
      props.class,
    )"
  >
    <slot />
  </p>
</template>
