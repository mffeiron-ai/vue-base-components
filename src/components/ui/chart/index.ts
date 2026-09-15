// 图表。图形本身来自 Unovis（@unovis/vue），这一层只做两件事：
// 1) 把 ChartConfig 里的颜色/名称变成主题变量（ChartContainer + ChartStyle）
// 2) 提供与主题一致的提示框 / 图例内容组件（TooltipContent / LegendContent）
import type { Component, Ref } from "vue"
import { createContext } from "reka-ui"

export { default as ChartContainer } from "./ChartContainer.vue"
export { default as ChartLegendContent } from "./ChartLegendContent.vue"
export { default as ChartTooltipContent } from "./ChartTooltipContent.vue"
export { componentToString } from "./utils"

// 主题名 → CSS 选择器前缀：浅色不用加前缀，深色要挂到 .dark 下
// Format: { THEME_NAME: CSS_SELECTOR }
export const THEMES = { light: "", dark: ".dark" } as const

/**
 * 图表配置：键名要和数据列名对应。
 * 每一项给出 label（提示框/图例里的名字，可以传组件当图标）+
 * color 或 theme 二者选一（theme 用来让明暗模式用不同颜色）。
 */
export type ChartConfig = {
  [k in string]: {
    label?: string | Component
    icon?: string | Component
  } & (
    | { color?: string, theme?: never }
    | { color?: never, theme: Record<keyof typeof THEMES, string> }
  )
}

// 通过 context 把 chartId 与 config 传给子树（ChartStyle / ChartTooltipContent / ChartLegendContent 都要用）
interface ChartContextProps {
  id: string
  config: Ref<ChartConfig>
}

export const [useChart, provideChartContext] = createContext<ChartContextProps>("Chart")

// 把 Unovis 的准线与提示框原样转出，统一从这个入口导入
export { VisCrosshair as ChartCrosshair, VisTooltip as ChartTooltip } from "@unovis/vue"
