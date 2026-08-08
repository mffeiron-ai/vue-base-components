<script setup lang="ts">
import KitchenIsland from '../components/showcase/KitchenIsland.vue'
import PowerUsage from '../components/showcase/PowerUsage.vue'
import RollerShades from '../components/showcase/RollerShades.vue'
import StyleOverview from '../components/showcase/StyleOverview.vue'
import TypographySpecimen from '../components/showcase/TypographySpecimen.vue'
import UIElements from '../components/showcase/UIElements.vue'
</script>

<template>
  <div class="flex flex-col gap-(--gap)">
    <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div class="mb-3 flex flex-col gap-1 px-1">
        <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">展示与样式组件</p>
        <p class="text-sm text-muted-foreground">适合预览主题风格、字体风格和 UI 元素总览。</p>
      </div>
      <div class="flex flex-col gap-(--gap)">
        <StyleOverview />
        <TypographySpecimen />
        <UIElements />
      </div>
    </section>

    <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div class="mb-3 flex flex-col gap-1 px-1">
        <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">场景控件组件</p>
        <p class="text-sm text-muted-foreground">适合模拟家居控制、功耗与场景面板。</p>
      </div>
      <div class="flex flex-col gap-(--gap)">
        <KitchenIsland />
        <PowerUsage />
        <RollerShades />
      </div>
    </section>
  </div>
</template>
