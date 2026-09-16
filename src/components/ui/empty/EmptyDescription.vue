<script setup lang="ts">
/**
 * EmptyDescription —— 标题下面那行说明（muted 小字号）；里面写 `<a>` 会自动带上
 * 下划线 + hover 变主题色，所以「去创建 / 看文档」这类链接不用自己加样式。
 */

import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <p
    data-slot="empty-description"
    :class="cn(
      'text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4',
      props.class,
    )"
  >
    <slot />
  </p>
</template>
