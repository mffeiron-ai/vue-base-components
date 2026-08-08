<script setup lang="ts">
import CatalogToolbar from '../components/navigation/CatalogToolbar.vue'
import EmailToolbar from '../components/navigation/EmailToolbar.vue'
import Faq from '../components/navigation/Faq.vue'
import FrontDoor from '../components/navigation/FrontDoor.vue'
import IconPreviewGrid from '../components/navigation/IconPreviewGrid.vue'
import Payments from '../components/cards/Payments.vue'
import Shortcuts from '../components/navigation/Shortcuts.vue'
import SidebarNav from '../components/navigation/SidebarNav.vue'
</script>

<template>
  <div class="flex flex-col gap-(--gap)">
    <section class="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div class="mb-3 flex flex-col gap-1 px-1">
        <p class="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">导航与操作组件</p>
        <p class="text-sm text-muted-foreground">用于页面骨架、目录入口、快捷键与图标浏览。</p>
      </div>
      <div class="grid grid-cols-2 items-start gap-(--gap)">
        <div class="flex flex-col gap-(--gap)">
          <SidebarNav />
          <CatalogToolbar />
          <EmailToolbar />
          <Shortcuts />
          <Faq />
        </div>
        <div class="flex flex-col gap-(--gap)">
          <FrontDoor />
          <Payments />
          <IconPreviewGrid />
        </div>
      </div>
    </section>
  </div>
</template>
