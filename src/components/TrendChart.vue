<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

export interface TrendItem {
  date: string
  payout: number
  order_count: number
}

const props = defineProps<{
  data: TrendItem[]
  loading?: boolean
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

function buildOption() {
  const dates = props.data.map(d => d.date.slice(5)) // MM-DD
  const payouts = props.data.map(d => d.payout)
  const counts = props.data.map(d => d.order_count)

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        const date = props.data[params[0]?.dataIndex]?.date || ''
        let html = `<strong>${date}</strong><br/>`
        params.forEach(p => {
          html += `${p.marker} ${p.seriesName}: ${p.seriesName === '赔付金额' ? '¥' + p.value.toFixed(2) : p.value + '�?}<br/>`
        })
        return html
      },
    },
    legend: { bottom: 0, data: ['赔付金额', '工单�?] },
    grid: { left: 50, right: 50, top: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { fontSize: 11 },
    },
    yAxis: [
      {
        type: 'value',
        name: '赔付金额 (¥)',
        axisLabel: { fontSize: 11, formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v.toString() },
      },
      {
        type: 'value',
        name: '工单�?,
        axisLabel: { fontSize: 11 },
      },
    ],
    series: [
      {
        name: '赔付金额',
        type: 'line',
        data: payouts,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#1677ff' },
        itemStyle: { color: '#1677ff' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(22,119,255,0.25)' },
          { offset: 1, color: 'rgba(22,119,255,0.02)' },
        ])},
      },
      {
        name: '工单�?,
        type: 'line',
        yAxisIndex: 1,
        data: counts,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#00b42a' },
        itemStyle: { color: '#00b42a' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0,180,42,0.2)' },
          { offset: 1, color: 'rgba(0,180,42,0.02)' },
        ])},
      },
    ],
  }
}

function initChart() {
  if (!chartRef.value) return
  const el = chartRef.value
  // 确保容器有有效宽�?
  if (el.clientWidth === 0 || el.clientHeight === 0) return

  if (!chart) {
    chart = echarts.init(el)
    // �?ResizeObserver 监听容器大小变化
    resizeObserver = new ResizeObserver(() => chart?.resize())
    resizeObserver.observe(el)
  }
  chart.setOption(buildOption(), true)
  chart.resize()
}

function tryInit(retries = 5) {
  initChart()
  if (!chart && retries > 0) {
    requestAnimationFrame(() => tryInit(retries - 1))
  }
}

watch(() => props.data, () => {
  if (chart) {
    chart.setOption(buildOption(), true)
    chart.resize()
  }
}, { deep: true })

onMounted(async () => {
  await nextTick()
  tryInit()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div style="width: 100%; min-height: 280px; position: relative">
    <div v-if="loading" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.6); z-index: 10">
      <span class="text-sm text-muted-foreground">加载�?..</span>
    </div>
    <div ref="chartRef" style="width: 100%; height: 280px; min-width: 400px" />
  </div>
</template>
