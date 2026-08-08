<script setup lang="ts">
import AlbumCard from '../components/cards/AlbumCard.vue'
import BadgeShowcase from '../components/cards/BadgeShowcase.vue'
import CardOverview from '../components/cards/CardOverview.vue'
import ClaimableBalance from '../components/cards/ClaimableBalance.vue'
import CodespacesCard from '../components/cards/CodespacesCard.vue'
import CoverArt from '../components/cards/CoverArt.vue'
import GithubProfile from '../components/cards/GithubProfile.vue'
import Invoice from '../components/cards/Invoice.vue'
import LoadingCard from '../components/cards/LoadingCard.vue'
import ObservabilityCard from '../components/cards/ObservabilityCard.vue'
import SavingsProgress from '../components/cards/SavingsProgress.vue'
import UpcomingPayments from '../components/cards/UpcomingPayments.vue'
</script>

<template>
  <div class="flex flex-col gap-(--gap)">
    <!-- 数据与账单：左侧图表+账单，右侧日历按自身宽度 -->
    <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div class="mb-3 flex flex-col gap-1 px-1">
        <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">数据与账单</p>
        <p class="text-sm text-muted-foreground">图表概览、账单明细与付款日历。</p>
      </div>
      <div class="grid grid-cols-[1fr_auto] items-start gap-(--gap)">
        <div class="flex flex-col gap-(--gap)">
          <CardOverview />
          <Invoice />
        </div>
        <UpcomingPayments />
      </div>
    </section>

    <!-- 卡片展示：两列均分，左右交替摆放 -->
    <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div class="mb-3 flex flex-col gap-1 px-1">
        <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">卡片展示</p>
        <p class="text-sm text-muted-foreground">资金进度、余额状态、可观测性、专辑与封面上传。</p>
      </div>
      <div class="grid grid-cols-2 items-start gap-(--gap)">
        <div class="flex flex-col gap-(--gap)">
          <SavingsProgress />
          <AlbumCard />
          <LoadingCard />
        </div>
        <div class="flex flex-col gap-(--gap)">
          <ClaimableBalance />
          <ObservabilityCard />
          <CoverArt />
        </div>
      </div>
    </section>

    <!-- 资料与平台：个人资料 + 平台工作区 -->
    <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div class="mb-3 flex flex-col gap-1 px-1">
        <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">资料与平台</p>
        <p class="text-sm text-muted-foreground">用户资料编辑与开发环境工作区卡片。</p>
      </div>
      <div class="grid grid-cols-2 items-start gap-(--gap)">
        <GithubProfile />
        <CodespacesCard />
      </div>
      <div class="mt-(--gap) pt-(--gap) border-t border-border/40">
        <BadgeShowcase />
      </div>
    </section>
  </div>
</template>
