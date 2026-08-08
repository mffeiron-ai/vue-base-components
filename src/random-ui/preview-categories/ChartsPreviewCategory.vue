<script setup lang="ts">
import AnalyticsCard from '../components/charts/AnalyticsCard.vue' // 访客分析
import BarChartCard from '../components/charts/BarChartCard.vue' // 流量渠道
import BarVisualizer from '../components/charts/BarVisualizer.vue' // 音频可视化
import ContributionHistory from '../components/charts/ContributionHistory.vue' // 贡献历史
import ContributionsActivity from '../components/charts/ContributionsActivity.vue' // 贡献和活动
import DividendIncome from '../components/charts/DividendIncome.vue' // 股息收入
import IndexInvesting from '../components/charts/IndexInvesting.vue'// 指数投资
import PieChartCard from '../components/charts/PieChartCard.vue' // 设备使用分布
import SleepReport from '../components/charts/SleepReport.vue' // 睡眠报告
import StockPerformance from '../components/charts/StockPerformance.vue' // 股票表现
import UsageCard from '../components/charts/UsageCard.vue' // 应用使用情况
import Visitors from '../components/charts/Visitors.vue' // 访客趋势
import WeeklyFitnessSummary from '../components/charts/WeeklyFitnessSummary.vue' // 每周健身总结
</script>

<template>
  <div class="grid items-start gap-(--gap) xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.4fr)]">
    <div class="flex min-w-0 flex-col gap-(--gap)">
      <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
        <div class="mb-3 flex flex-col gap-1 px-1">
          <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">图表与指标卡</p>
          <p class="text-sm text-muted-foreground">适合仪表盘首页的摘要指标与快速洞察。</p>
        </div>
        <div class="grid grid-cols-2 items-start gap-(--gap)">
          <div class="flex flex-col gap-(--gap)">
            <BarVisualizer />
            <SleepReport />
          </div>
          <div class="flex flex-col gap-(--gap)">
            <WeeklyFitnessSummary />
            <UsageCard />
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
        <div class="mb-3 flex flex-col gap-1 px-1">
          <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">图表组件 B</p>
          <p class="text-sm text-muted-foreground">适合展示柱状、饼图、波形与访问趋势。</p>
        </div>
        <div class="grid grid-cols-2 items-start gap-(--gap)">
          <div class="flex flex-col gap-(--gap)">
            <BarChartCard />
            <LiveWaveformCard />
            <ContributionsActivity />
          </div>
          <div class="flex flex-col gap-(--gap)">
            <PieChartCard />
            <Visitors />
          </div>
        </div>
      </section>
    </div>

    <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div class="mb-3 flex flex-col gap-1 px-1">
        <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">图表组件 A</p>
        <p class="text-sm text-muted-foreground">适合展示趋势、收益和核心统计数据。</p>
      </div>
      <div class="grid grid-cols-2 items-start gap-(--gap)">
        <div class="flex flex-col gap-(--gap)">
          <ContributionHistory />
          <IndexInvesting />
          <AnalyticsCard />
        </div>
        <div class="flex flex-col gap-(--gap)">
          <DividendIncome />
          <StockPerformance />
        </div>
      </div>
    </section>
  </div>
</template>
