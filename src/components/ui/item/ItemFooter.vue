<script setup lang="ts">
/**
 * ItemFooter —— 条目底部那一行（`basis-full` 独占整行）。
 *
 * 内部是 `flex justify-between`，常见用法是「左价格 / 右按钮」。
 * 与 `ItemHeader` 同理，必须放在根 Item 的直接子级。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="item-footer"
    :class="cn('flex basis-full items-center justify-between gap-2', props.class)"
  >
    <slot />
  </div>
</template>
