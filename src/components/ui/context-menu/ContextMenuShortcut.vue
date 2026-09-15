<script setup lang="ts">
/**
 * ContextMenuShortcut —— 菜单项右侧的快捷键提示（纯展示，不绑定按键）。
 * 靠预设的 `group-focus/context-menu-item:text-accent-foreground` 跟随父项高亮变色，
 * 所以它必须放在 ContextMenuItem 里面（父项已带 group/context-menu-item）。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <span
    data-slot="context-menu-shortcut"
    :class="cn('text-muted-foreground ml-auto text-sm tracking-widest', props.class)"
  >
    <slot />
  </span>
</template>
