<script setup lang="ts">
/**
 * TableRow —— 表格行。
 * 自带 hover 底色；选中态靠 `data-[state=selected]:bg-muted`，
 * 所以行选择场景要手动接上：`:data-state="selected ? 'selected' : undefined'"`。
 *
 * `border-input` 只负责**给下边框上色**：下边框的宽度来自样式预设（预设里只写了 `border-b`），
 * 而 Tailwind v4 的默认边框色是 `currentColor`，不显式给色的话行线会取到 `--foreground`（#333 近黑），
 * 跟设计系统的描边色对不上。（同类修复：Popover / Dialog 等 Content 的 border-input）
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <tr
    data-slot="table-row"
    :class="cn('border-input hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors', props.class)"
  >
    <slot />
  </tr>
</template>
