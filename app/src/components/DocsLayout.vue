<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteNavbar from './SiteNavbar.vue'
import { componentDocs } from '../docs/registry'

// 当前路由页组件（由 App.vue 传入）
defineProps<{ page: Component }>()

const route = useRoute()

// 全屏页（如落地页）隐藏左侧组件列表，让内容全宽
const isFullPage = computed(() => route.meta.fullPage === true)
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- 顶部玻璃导航栏（常驻，整站同步） -->
    <SiteNavbar />

    <!-- 主体：侧边栏 + 内容区（非全屏页让出导航栏高度） -->
    <div :class="['flex', isFullPage ? '' : 'pt-14']">
      <!-- 侧边栏（仅非全屏页，粘性，滚动时保持） -->
      <aside v-if="!isFullPage" class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col border-r border-border lg:flex">
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
          <p>{{ componentDocs.length }} 个组件 · 纯 Vue 渲染</p>
          <p class="mt-1">
            UI 组件基于
            <a
              href="https://github.com/unovue/shadcn-vue"
              target="_blank"
              rel="noreferrer"
              class="underline underline-offset-4 hover:text-foreground"
            >shadcn-vue</a>
          </p>
        </div>
      </aside>

      <!-- 内容区（所有路由切换用 page 过渡） -->
      <main class="min-w-0 flex-1">
        <Transition name="page" mode="out-in">
          <component :is="page" :key="route.path" />
        </Transition>
      </main>
    </div>
  </div>
</template>
