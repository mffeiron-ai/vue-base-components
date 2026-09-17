<script setup lang="ts">
/**
 * Kbd —— 键盘按键标记（渲染成原生 `<kbd>`）。
 *
 * - 外观：浅底小方块，`font-sans` 保证按键字形与正文一致；带 `select-none`，
 *   所以复制旁边文本时不会把它一起选上
 * - 里面放 `<svg>` 时自动缩到 12×12
 * - **放进 Tooltip 会自动换色**：靠 `[[data-slot=tooltip-content]_&]` 切成半透明反色，
 *   所以 `<Kbd>⌘K</Kbd>` 直接塞进 Tooltip 内容即可，不用手动调颜色
 * - 类名里的 `cn-kbd` 是给 8 套风格预设用的钩子（预设按 `.cn-kbd` 控制字号 / 圆角 /
 *   背景），**别删**；`data-slot="kbd"` 用于定位与测试
 * - 组合键用 `KbdGroup` 包一层
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <kbd
    data-slot="kbd"
    :class="cn(
      'cn-kbd bg-muted text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-sm font-medium select-none',
      '[&_svg:not([class*=\'size-\'])]:size-3',
      '[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10',
      props.class,
    )"
  >
    <slot />
  </kbd>
</template>
