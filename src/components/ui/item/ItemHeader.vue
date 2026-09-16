<script setup lang="ts">
/**
 * ItemHeader —— 条目顶部那一行（`basis-full` 独占整行）。
 *
 * 内部是 `flex justify-between`，适合放「左侧小标题 + 右侧小状态」。
 * 因为它带 `basis-full`，必须放在根 Item 的直接子级才有效果。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="item-header"
    :class="cn('flex basis-full items-center justify-between gap-2', props.class)"
  >
    <slot />
  </div>
</template>
