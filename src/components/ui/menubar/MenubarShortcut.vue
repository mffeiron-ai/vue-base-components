<script setup lang="ts">
/**
 * MenubarShortcut —— 菜单项右侧的快捷键提示（纯展示，`ml-auto` 靠右）。
 *
 * 它**不会**注册快捷键，只是文案；真正的快捷键要自己监听 `keydown`。
 * （预设里字号是 `text-xs` + `tracking-widest`，被聚焦时跟随项的前景色）
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <span
    data-slot="menubar-shortcut"
    :class="cn('text-muted-foreground ml-auto text-sm tracking-widest', props.class)"
  >
    <slot />
  </span>
</template>
