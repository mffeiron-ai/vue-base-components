<script setup lang="ts">
/**
 * ItemGroup —— 一组 Item 的容器（`role="list"`，本身只管竖排）。
 *
 * 条目之间要分隔线就把 `ItemSeparator` 插在 Item 之间（不要放在最前 / 最后）。
 * 这里没有 `divide-*`，所以分隔线的显隐完全由你自己控制。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    role="list"
    data-slot="item-group"
    :class="cn('group/item-group flex flex-col', props.class)"
  >
    <slot />
  </div>
</template>
