<script setup lang="ts">
import AlertDialogDemo from '../components/states/AlertDialogDemo.vue'
import AnomalyAlert from '../components/states/AnomalyAlert.vue'
import EmptyConnectBank from '../components/states/EmptyConnectBank.vue'
import EmptyDistributeTrack from '../components/states/EmptyDistributeTrack.vue'
import EmptyExploreCatalog from '../components/states/EmptyExploreCatalog.vue'
import NoTeamMembers from '../components/states/NoTeamMembers.vue'
import NotFound from '../components/states/NotFound.vue'
import SkeletonLoading from '../components/states/SkeletonLoading.vue'
import SyncingState from '../components/states/SyncingState.vue'
</script>

<template>
  <div class="flex flex-col gap-(--gap)">
    <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div class="mb-3 flex flex-col gap-1 px-1">
        <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">空状态与反馈组件</p>
        <p class="text-sm text-muted-foreground">适合错误页、空白页、同步态和异常提醒。</p>
      </div>
      <div class="flex flex-col gap-(--gap)">
        <EmptyConnectBank />
        <EmptyDistributeTrack />
        <EmptyExploreCatalog />
        <NoTeamMembers />
        <NotFound />
        <SkeletonLoading />
        <SyncingState />
        <AnomalyAlert />
        <AlertDialogDemo />
      </div>
    </section>
  </div>
</template>
