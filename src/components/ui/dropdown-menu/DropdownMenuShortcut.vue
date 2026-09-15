<script setup lang="ts">
/**
 * DropdownMenuShortcut —— 右侧的快捷键提示文字（如 ⌘K）。
 *
 * 注意：它只是**样式**，不会真的注册快捷键 —— 键盘绑定要自己在应用里做（或用 Command 组件）。
 */

import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <span
    data-slot="dropdown-menu-shortcut"
    :class="cn('text-muted-foreground ml-auto text-sm tracking-widest', props.class)"
  >
    <slot />
  </span>
</template>
