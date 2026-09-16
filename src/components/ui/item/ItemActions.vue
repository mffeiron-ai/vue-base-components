<script setup lang="ts">
/**
 * ItemActions —— 条目右侧的操作区（按钮 / 下拉菜单 / 开关…）。
 *
 * 只是 `flex items-center gap-2`，靠 `ItemContent` 的 `flex-1` 被顶到最右。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="item-actions"
    :class="cn('flex items-center gap-2', props.class)"
  >
    <slot />
  </div>
</template>
