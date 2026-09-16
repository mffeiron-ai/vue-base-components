<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteNavbar from './SiteNavbar.vue'
import SidebarCategoryCard from './SidebarCategoryCard.vue'
import { componentDocs, getCategoriesWithDocs } from '../docs/registry'

// 当前路由页组件（由 App.vue 传入）
defineProps<{ page: Component }>()

const route = useRoute()

// 全屏页（如落地页）隐藏侧栏，让内容全宽
const isFullPage = computed(() => route.meta.fullPage === true)

// 分类卡片分列中央文档两侧（哪一类放哪边由 registry 的 ComponentCategory.side 决定）
const categories = getCategoriesWithDocs()
const leftCategories = computed(() => categories.filter((c) => (c.side ?? 'left') === 'left'))
const rightCategories = computed(() => categories.filter((c) => c.side === 'right'))
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- 顶部玻璃导航栏（常驻，整站同步） -->
    <SiteNavbar />

    <!-- 全屏页（落地页等）：不渲染侧栏，内容全宽 -->
    <main v-if="isFullPage" class="min-w-0">
      <Transition name="page" mode="out-in">
        <component :is="page" :key="route.path" />
      </Transition>
    </main>

    <!-- 文档页：左两卡 | 中央文档 | 右一卡
         items-start 是必须的：不能让 flex 拉高两列，否则 sticky 会失效
         两列高度自适应（h-fit），超过视口才出现自己的滚动条，不硬占满 -->
    <div v-else class="mx-auto flex max-w-[1440px] items-start justify-center gap-10 px-6 pt-14 xl:gap-14">
      <!-- 左列：展示 + 输入 -->
      <aside class="sticky top-20 hidden h-fit max-h-[calc(100vh-6rem)] w-56 shrink-0 flex-col gap-4 overflow-y-auto lg:flex">
        <SidebarCategoryCard
          v-for="cat in leftCategories"
          :key="cat.key"
          :title="cat.title"
          :hint="cat.hint"
          :docs="cat.docs"
        />
      </aside>

      <!-- 中央：文档正文 -->
      <main class="docs-content min-w-0 flex-1">
        <Transition name="page" mode="out-in">
          <component :is="page" :key="route.path" />
        </Transition>
      </main>

      <!-- 右列：交互（组件最多的一类，高度跟左侧两张卡接近） -->
      <aside class="sticky top-20 hidden h-fit max-h-[calc(100vh-6rem)] w-56 shrink-0 flex-col gap-4 overflow-y-auto xl:flex">
        <SidebarCategoryCard
          v-for="cat in rightCategories"
          :key="cat.key"
          :title="cat.title"
          :hint="cat.hint"
          :docs="cat.docs"
        />
        <p class="shrink-0 px-2 text-xs text-muted-foreground">
          {{ componentDocs.length }} 个组件 · 基于
          <a
            href="https://github.com/unovue/shadcn-vue"
            target="_blank"
            rel="noreferrer"
            class="underline underline-offset-4 hover:text-foreground"
          >shadcn-vue</a>
        </p>
      </aside>
    </div>
  </div>
</template>
