<script setup lang="ts">
/**
 * ItemContent —— 条目的中间内容区（标题 / 描述都放这里）。
 *
 * 自动 `flex-1` 吃掉剩余宽度，所以右侧的 `ItemActions` 会被推到最右。
 * 一条目里放**两个** Content 时，第二个会变成 `flex-none`（不撑开），
 * 适合做「左边标题右边数值」这种两栏内容。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="item-content"
    :class="cn('flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none', props.class)"
  >
    <slot />
  </div>
</template>
