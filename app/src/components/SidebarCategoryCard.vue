<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { ComponentDoc } from '../docs/registry'

/**
 * 侧边栏分类卡片 —— 一张卡代表一个分类（交互 / 展示 / 输入）。
 *
 * 被 DocsLayout 复用：左侧列放若干张、右侧列放一张（右侧那张会被撑长）。
 * 卡片本体只负责「标题 + 数量 + 说明 + 链接列表」，位置与宽度交给外层。
 */
defineProps<{
  title: string
  hint: string
  docs: ComponentDoc[]
}>()

const route = useRoute()
</script>

<template>
  <section class="rounded-lg border border-border bg-card p-2 shadow-xs">
    <div class="flex items-baseline justify-between px-2 pt-1 pb-1">
      <h3 class="text-sm font-semibold">{{ title }}</h3>
      <span class="text-xs tabular-nums text-muted-foreground">{{ docs.length }}</span>
    </div>
    <p class="px-2 pb-2 text-[11px] leading-snug text-muted-foreground/80">{{ hint }}</p>
    <ul class="space-y-0.5">
      <li v-for="doc in docs" :key="doc.name">
        <RouterLink
          :to="`/components/${doc.name}`"
          class="flex items-center truncate rounded-md px-3 py-1.5 text-sm transition-colors"
          :class="route.path === `/components/${doc.name}` ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50'"
        >
          {{ doc.title }}
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
