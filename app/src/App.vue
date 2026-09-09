<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Moon, Sun } from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { componentDocs } from './docs/registry'

const route = useRoute()
const isDark = useDark()
const toggleDark = useToggle(isDark)

const isFullPage = computed(() => route.meta.fullPage === true)

const navLinks = [
  { name: '首页', to: '/' },
  { name: '组件', to: `/components/${componentDocs[0]?.name ?? 'button'}` },
]
</script>

<template>
  <!-- 全屏页（如落地页）跳过 app 外壳 -->
  <RouterView v-if="isFullPage" />

  <!-- 常规文档页：侧边栏 + 顶栏外壳 -->
  <div v-else class="flex min-h-screen bg-background text-foreground">
    <!-- 侧边栏 -->
    <aside class="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border lg:flex">
      <a href="/" class="flex items-center gap-2 border-b border-border px-5 h-14">
        <span class="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">R</span>
        <span class="font-semibold tracking-tight">RionStudio</span>
      </a>

      <nav class="flex-1 overflow-y-auto py-4">
        <p class="px-5 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">UI 组件</p>
        <ul class="space-y-0.5 px-2">
          <li v-for="doc in componentDocs" :key="doc.name">
            <RouterLink
              :to="`/components/${doc.name}`"
              class="flex items-center rounded-md px-3 py-1.5 text-sm transition-colors"
              :class="route.path === `/components/${doc.name}` ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50'"
            >
              {{ doc.title }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="border-t border-border p-4 text-xs text-muted-foreground">
        {{ componentDocs.length }} 个组件 · 纯 Vue 渲染
      </div>
    </aside>

    <!-- 内容区 -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
        <nav class="flex items-center gap-6">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {{ link.name }}
          </RouterLink>
        </nav>

        <Button variant="ghost" size="icon" aria-label="切换主题" @click="toggleDark()">
          <Sun v-if="isDark" class="size-4" />
          <Moon v-else class="size-4" />
        </Button>
      </header>

      <main class="flex-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>
