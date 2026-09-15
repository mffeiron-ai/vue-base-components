<script setup lang="ts">
import type { HTMLAttributes } from "vue"
// HTMLAttributes：Vue 内置 HTML 属性类型，用于给 id prop 做类型提示
import { Primitive } from "reka-ui"
// Primitive：无头基元，这里用 as="style" 直接渲染一个 <style> 标签（不额外包一层元素）
import { computed } from "vue"
import { THEMES, useChart } from "."

defineProps<{
  id?: HTMLAttributes["id"]
}>()

const { config } = useChart()

// 只挑出真的配了颜色的项（color 或 theme）
const colorConfig = computed(() => {
  return Object.entries(config.value).filter(
    ([, config]) => config.theme || config.color,
  )
})
</script>

<template>
  <!--
    动态生成一段 CSS：
      [data-chart=chart-xxx]      { --color-desktop: var(--chart-1); … }
      .dark [data-chart=chart-xxx] { --color-desktop: var(--chart-2); … }
    图形用 var(--color-<key>) 上色，所以切主题/明暗模式时颜色会自动跟着变。
    没有配颜色的 config 不输出任何东西（v-if）。
  -->
  <Primitive
    v-if="colorConfig.length"
    as="style"
  >
    {{ Object.entries(THEMES)
      .map(
        ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color
      = itemConfig.theme?.[theme as keyof typeof itemConfig.theme]
      || itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
        .join("\n")}
}
`,
      )
      .join("\n") }}
  </Primitive>
</template>
