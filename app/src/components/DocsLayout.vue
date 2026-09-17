<script setup lang="ts">
import type { Component } from 'vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SiteNavbar from './SiteNavbar.vue'
import SidebarCategoryCard from './SidebarCategoryCard.vue'
import { componentDocs, getCategoriesWithDocs } from '../docs/registry'

// 当前路由页组件（由 App.vue 传入）
defineProps<{ page: Component }>()

const route = useRoute()

// 全屏页（如落地页）隐藏侧栏，让内容全宽
const isFullPage = computed(() => route.meta.fullPage === true)

/**
 * 布局切面（两侧栏 + pt-14）比路由晚一步生效
 *
 * 若跟随路由立刻切换，正在离场的页面会被当场重新布局：全宽的落地页会瞬间被压成
 * 中间文档宽（横向抽一下），文档页会因 pt-14 消失而向上瞬移 56px。
 * 所以等离场动画结束后（after-leave，早于入场）再切；
 * 另留一个定时器兜底，防止快速连点时过渡被打断、after-leave 不触发导致状态错位。
 */
const layoutFullPage = ref(isFullPage.value)
let layoutFallback: ReturnType<typeof setTimeout> | undefined
function syncLayout() {
  clearTimeout(layoutFallback)
  layoutFullPage.value = isFullPage.value
}
watch(isFullPage, () => {
  clearTimeout(layoutFallback)
  layoutFallback = setTimeout(syncLayout, 400)
})
onBeforeUnmount(() => clearTimeout(layoutFallback))

// 分类卡片分列中央文档两侧（哪一类放哪边由 registry 的 ComponentCategory.side 决定）
const categories = getCategoriesWithDocs()
const leftCategories = computed(() => categories.filter((c) => (c.side ?? 'left') === 'left'))
const rightCategories = computed(() => categories.filter((c) => c.side === 'right'))
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- 顶部玻璃导航栏（常驻，整站同步） -->
    <SiteNavbar />

    <!-- 布局容器：全屏页 / 文档页只切 class，DOM 结构恒定。
         注意：这里不能用 v-if / v-else 拆成两个分支 —— 跨「全屏页 ↔ 文档页」时
         内层 <Transition> 会被整块换掉，新实例首次挂载不播 appear 动画，过渡动画就没了。
           · 全屏页（落地页）→ block，main 全宽，不渲染两侧栏
           · 文档页        → flex，左两卡 | 中央文档 | 右一卡
         模式由 layoutFullPage 控制（比路由晚一步生效，见 script 里的说明）
         items-start 是必须的：不能让 flex 拉高两列，否则 sticky 会失效
         两列高度自适应（h-fit），超过视口才出现自己的滚动条，不硬占满
         宽度上限 1680：可视区 2448 时中央能拿到 1072，文档 1024 刚好铺满 -->
    <div
      class="items-start justify-center"
      :class="layoutFullPage
        ? 'block'
        : 'mx-auto flex max-w-[1680px] gap-10 px-6 pt-14 xl:gap-14'"
    >
      <!-- 左列：展示 + 输入（仅文档页） -->
      <aside
        v-if="!layoutFullPage"
        class="sticky top-20 hidden h-fit max-h-[calc(100vh-6rem)] w-56 shrink-0 flex-col gap-4 overflow-y-auto lg:flex"
      >
        <SidebarCategoryCard
          v-for="cat in leftCategories"
          :key="cat.key"
          :title="cat.title"
          :hint="cat.hint"
          :docs="cat.docs"
        />
      </aside>

      <!-- 中央内容：全屏页与文档页共用同一个 <main>（也是整站唯一的路由出口），
           这样 <Transition> 实例在路由切换期间不会被替换，所有切换都有过渡 -->
      <main class="min-w-0" :class="layoutFullPage ? 'w-full' : 'docs-content flex-1'">
        <Transition name="page" mode="out-in" @after-leave="syncLayout">
          <component :is="page" :key="route.path" />
        </Transition>
      </main>

      <!-- 右列：交互（组件最多的一类，高度跟左侧两张卡接近；仅文档页） -->
      <aside
        v-if="!layoutFullPage"
        class="sticky top-20 hidden h-fit max-h-[calc(100vh-6rem)] w-56 shrink-0 flex-col gap-4 overflow-y-auto xl:flex"
      >
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
