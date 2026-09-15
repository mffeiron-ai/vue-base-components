<script setup lang="ts">
/**
 * CommandShortcut —— 选项右侧的快捷键提示（纯展示，不会真绑定按键）。
 * 注意：它属于选项文本的一部分，会被 command-item 的 textContent 采集到，
 * 所以输入快捷键字母也能搜到该选项。不想被搜到就把快捷键放到选项外面。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <span
    data-slot="command-shortcut"
    :class="cn('text-muted-foreground ml-auto text-sm tracking-widest', props.class)"
  >
    <slot />
  </span>
</template>
