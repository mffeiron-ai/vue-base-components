<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { ChartConfig } from "."
import { computed } from "vue"
import { cn } from "../../../lib/utils"

// 这个组件不是直接写在模板里的，而是被 componentToString() 渲染成 HTML 串，
// 再交给 Unovis 的 Crosshair / Tooltip 当模板 —— 所以 props 的 payload / config / x 都是 Unovis 运行时传进来的。
const props = withDefaults(defineProps<{
  /** 隐藏顶部标题行（横轴标签） */
  hideLabel?: boolean
  /** 隐藏系列色块，只留文字（适合单系列） */
  hideIndicator?: boolean
  /** 色块形状：圆点 / 竖线 / 虚线 */
  indicator?: "line" | "dot" | "dashed"
  /** 按数据源的某个键取系列名 */
  nameKey?: string
  /** 标题取哪一列（如 monthLabel）；不传则用横轴原始值 x */
  labelKey?: string
  /** 自定义标题格式化，优先级高于 labelKey */
  labelFormatter?: (d: number | Date) => string
  /** Unovis 传入的当前点数据（键 = 数据列名） */
  payload?: Record<string, any>
  /** 图表配置（componentToString 会自动注入） */
  config?: ChartConfig
  class?: HTMLAttributes["class"]
  color?: string
  x?: number | Date
}>(), {
  payload: () => ({}),
  config: () => ({}),
  indicator: "dot",
})

const payload = computed(() => {
  return Object.entries(props.payload).map(([key, value]) => {
    // 只回显 config 里声明过的系列，未声明的列（比如纯数字 id）不显示
    const itemConfig = props.config[key]
    const indicatorColor = props.config[key]?.color ?? props.payload.fill

    return { key, value, itemConfig, indicatorColor }
  }).filter(i => i.itemConfig)
})

// 单系列且不是圆点色块时，把标题嵌到色块那一行里（更紧凑）
const nestLabel = computed(() => Object.keys(props.payload).length === 1 && props.indicator !== "dot")
// 标题文案：hideLabel > labelFormatter > labelKey > 原始 x
const tooltipLabel = computed(() => {
  if (props.hideLabel)
    return null
  if (props.labelFormatter && props.x !== undefined) {
    return props.labelFormatter(props.x)
  }
  return props.labelKey ? props.config[props.labelKey]?.label || props.payload[props.labelKey] : props.x
})
</script>

<template>
  <!-- 提示框外观：与 popover 一致的小卡片；内容默认按 payload 逐行渲染，也提供了默认插槽彻底自定义 -->
  <div
    :class="cn(
      'border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm shadow-xl',
      props.class,
    )"
  >
    <slot>
      <div v-if="!nestLabel && tooltipLabel" class="font-medium">
        {{ tooltipLabel }}
      </div>
      <div class="grid gap-1.5">
        <div
          v-for="{ value, itemConfig, indicatorColor, key } in payload"
          :key="key"
          :class="
            cn('[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5',
               indicator === 'dot' && 'items-center')"
        >
          <!-- config 里给了 icon 就优先用 icon -->
          <component :is="itemConfig.icon" v-if="itemConfig?.icon" />
          <template v-else-if="!hideIndicator">
            <!-- 色块：用两条 CSS 变量（背景/边框）配合不同尺寸实现 dot / line / dashed 三种形态 -->
            <div
              :class="cn(
                'shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)',
                {
                  'h-2.5 w-2.5': indicator === 'dot',
                  'w-1': indicator === 'line',
                  'w-0 border-[1.5px] border-dashed bg-transparent':
                    indicator === 'dashed',
                  'my-0.5': nestLabel && indicator === 'dashed',
                },
              )"
              :style="{
                '--color-bg': indicatorColor,
                '--color-border': indicatorColor,
              }"
            />
          </template>

          <div :class="cn('flex flex-1 justify-between leading-none', nestLabel ? 'items-end' : 'items-center')">
            <div class="grid gap-1.5">
              <div v-if="nestLabel" class="font-medium">
                {{ tooltipLabel }}
              </div>
              <span class="text-muted-foreground">
                {{ itemConfig?.label || value }}
              </span>
            </div>
            <!-- 数值用等宽 + 表格数字，多行对齐不会跳 -->
            <span v-if="value" class="text-foreground font-mono font-medium tabular-nums">
              {{ value.toLocaleString() }}
            </span>
          </div>
        </div>
      </div>
    </slot>
  </div>
</template>
