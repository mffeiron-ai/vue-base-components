<script setup lang="ts">
import Contributors from '../components/lists/Contributors.vue'
import ItemList from '../components/lists/ItemList.vue'
import NewMilestone from '../components/lists/NewMilestone.vue'
import NotificationSettings from '../components/lists/NotificationSettings.vue'
import RecentTransactions from '../components/lists/RecentTransactions.vue'
import ReleaseCatalog from '../components/lists/ReleaseCatalog.vue'
import SavingsTargets from '../components/lists/SavingsTargets.vue'
import SocialLinks from '../components/navigation/SocialLinks.vue'
</script>

<template>
  <div class="flex flex-col gap-(--gap)">
    <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div class="mb-3 flex flex-col gap-1 px-1">
        <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">列表与信息流组件</p>
        <p class="text-sm text-muted-foreground">适合时间线、成员列表、通知中心和内容发布列表。</p>
      </div>
      <div class="flex flex-col gap-(--gap)">
        <RecentTransactions />
        <SavingsTargets />
        <Contributors />
        <NewMilestone />
        <NotificationSettings />
        <ReleaseCatalog />
        <SocialLinks />
        <ItemList />
      </div>
    </section>
  </div>
</template>
