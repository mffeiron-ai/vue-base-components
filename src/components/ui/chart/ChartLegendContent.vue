<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, onMounted, ref } from "vue"
import { cn } from "../../../lib/utils"
import { useChart } from "."

const props = withDefaults(defineProps<{
  /** 不显示 config 里的 icon，只用色块 */
  hideIcon?: boolean
  /** 图例文案取 config 的哪个键 */
  nameKey?: string
  /** 放图表上方还是下方 */
  verticalAlign?: "bottom" | "top"
  // payload?: any[]
  class?: HTMLAttributes["class"]
}>(), {
  verticalAlign: "bottom",
})

const { id, config } = useChart()

// 图例不需要 payload：直接从 config 生成（所以它放在 VisXYContainer 外面即可）
const payload = computed(() => Object.entries(config.value).map(([key, value]) => {
  return {
    key: props.nameKey || key,
    itemConfig: config.value[key],
  }
}))

// 等挂载后再算选择器：只有 XY 容器旁才适合放图例（环形/饼图用的是 SingleContainer）
const containerSelector = ref("")
onMounted(() => {
  containerSelector.value = `[data-chart="chart-${id}"]>[data-vis-xy-container]`
})
</script>

<template>
  <!-- 横向排列的图例；verticalAlign="top" 时加下内边距、否则加上内边距 -->
  <div
    v-if="containerSelector"
    :class="cn(
      'flex items-center justify-center gap-4',
      verticalAlign === 'top' ? 'pb-3' : 'pt-3',
      props.class,
    )"
  >
    <div
      v-for="{ key, itemConfig } in payload"
      :key="key"
      :class="cn(
        '[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3',
      )"
    >
      <component :is="itemConfig?.icon" v-if="itemConfig?.icon" />
      <div
        v-else
        class="h-2 w-2 shrink-0 rounded-[2px]"
        :style="{
          backgroundColor: itemConfig?.color,
        }"
      />

      {{ itemConfig?.label }}
    </div>
  </div>
</template>
