<script lang="ts">
import type { HTMLAttributes } from "vue"
import type { ChartConfig } from "."
import { useId } from "reka-ui"
// useId：生成唯一 id（注意它带冒号，下面会替换掉才能当 CSS 选择器用）
import { computed, toRefs } from "vue"
import { cn } from "../../../lib/utils"
import { provideChartContext } from "."
import ChartStyle from "./ChartStyle.vue"
</script>

<script setup lang="ts">
const props = defineProps<{
  id?: HTMLAttributes["id"]
  class?: HTMLAttributes["class"]
  config: ChartConfig
  cursor?: boolean
}>()
// config 必填：里面的 label / color 就是提示框与图例的数据源
// cursor：是否显示十字准线（false 时线宽置 0，Tooltip 仍保留）

defineSlots<{
  default: {
    id: string
    config: ChartConfig
  }
}>()
// 默认插槽透出 { id, config }，需要时可写 <ChartContainer v-slot="{ config }">

const { config } = toRefs(props)
const uniqueId = useId()
// 作为 data-chart 属性，同时也是 ChartStyle 里选择器的锚点（CSS 里不能带冒号，故去掉）
const chartId = computed(() => `chart-${props.id || uniqueId.replace(/:/g, "")}`)

provideChartContext({
  id: uniqueId,
  config,
})
</script>

<template>
  <!--
    一个 ChartContainer 只负责“壳”与主题变量：
    - data-chart 给 ChartStyle 挂作用域化的颜色变量；同页多个图表用 id 区分
    - 一堆 [&_.tick_text] / [&_.recharts-*] 是在覆盖 Unovis 内部类名的颜色（轴线、网格、光标等），
      让它们跟随主题而不是写死的灰色
    - style 里把 Unovis 的 CSS 变量对齐到本项目：提示框透明（我们用 .recharts-* 组件渲染自己的提示框）、
      crosshair 颜色透背景、字体用 --font-sans
  -->
  <div
    data-slot="chart"
    :data-chart="chartId"
    :class="cn(
      `[&_.tick_text]:!fill-muted-foreground [&_.tick_line]:!stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex flex-col aspect-video justify-center text-sm [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden [&_[data-vis-xy-container]]:h-full [&_[data-vis-single-container]]:h-full h-full [&_[data-vis-xy-container]]:w-full [&_[data-vis-single-container]]:w-full w-full `,
      props.class,
    )"
    :style="{
      '--vis-tooltip-padding': '0px',
      '--vis-tooltip-background-color': 'transparent',
      '--vis-tooltip-border-color': 'transparent',
      '--vis-tooltip-text-color': 'none',
      '--vis-tooltip-shadow-color': 'none',
      '--vis-tooltip-backdrop-filter': 'none',
      '--vis-crosshair-circle-stroke-color': '#0000',
      '--vis-crosshair-line-stroke-width': cursor ? '1px' : '0px',
      '--vis-font-family': 'var(--font-sans)',
    }"
  >
    <!-- 默认插槽：放 Unovis 容器（VisXYContainer / VisSingleContainer）及其图形、坐标轴、提示框 -->
    <slot :id="uniqueId" :config="config" />
    <!-- 把 config 里的颜色写成 CSS 变量，供图形与提示框使用 -->
    <ChartStyle :id="chartId" />
  </div>
</template>
