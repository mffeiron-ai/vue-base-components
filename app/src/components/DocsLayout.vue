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

/**
 * 侧栏按「章节」分开，两个章节不混在一起（靠顶栏「UI 组件 / 业务组件 / 动效设计」切换）：
 *   /components/* → 只列原子分类（展示 / 输入 / 交互 / 浮层）
 *   /business/*   → 只列业务组件（分子组件）
 *   /motion/*     → 只列动效组件（一个动效一个页面）
 * 哪一类放哪一列仍由 registry 的 ComponentCategory.side 决定（不填＝左列）。
 */
const categories = getCategoriesWithDocs()
const section = computed<'business' | 'motion' | 'component'>(() => {
  if (route.path.startsWith('/business')) return 'business'
  if (route.path.startsWith('/motion')) return 'motion'
  return 'component'
})
const sectionCategories = computed(() => categories.filter((c) => c.kind === section.value))
const leftCategories = computed(() => sectionCategories.value.filter((c) => (c.side ?? 'left') === 'left'))
const rightCategories = computed(() => sectionCategories.value.filter((c) => c.side === 'right'))
// 左列只有 1 张卡时不占两列宽度（原子章节是「输入｜展示」两张并排，才需要 29rem）
const leftWide = computed(() => leftCategories.value.length > 1)
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- 顶部玻璃导航栏（常驻，整站同步） -->
    <SiteNavbar />

    <!-- 布局容器：全屏页 / 文档页只切 class，DOM 结构恒定。
         注意：这里不能用 v-if / v-else 拆成两个分支 —— 跨「全屏页 ↔ 文档页」时
         内层 <Transition> 会被整块换掉，新实例首次挂载不播 appear 动画，过渡动画就没了。
           · 全屏页（落地页）→ block，main 全宽，不渲染两侧栏
           · 文档页        → flex，左两列（输入｜展示）| 中央文档 | 右两列（交互 / 浮层）
         模式由 layoutFullPage 控制（比路由晚一步生效，见 script 里的说明）
         items-start 是必须的：不能让 flex 拉高两列，否则 sticky 会失效
         两列高度自适应（h-fit），超过视口才出现自己的滚动条，不硬占满
         宽度上限：2xl 之前 1680（左列竖排 224px）；2xl 起 1900
         —— 左列横向变两列后占 464px（224×2 + 16），1900 时中央仍有 1036，文档 1024 刚好铺满 -->
    <div
      class="items-start justify-center"
      :class="layoutFullPage
        ? 'block'
        : 'mx-auto flex max-w-[1680px] gap-10 px-6 pt-14 xl:gap-14 2xl:max-w-[1900px]'"
    >
      <!-- 左列（仅文档页）：内容随章节变（原子章节＝展示｜输入，业务章节＝业务组件）。
           卡片包一层 div 做 2xl 横排，aside 自身保持竖排；2xl:items-start 只加在内层，
           避免多张卡被 stretch 拉成等高（件数少的那张底下会空一大块）；
           宽度只在多卡时撑到 29rem（224×2 + 16），单卡就保持 224 不占位 -->
      <aside
        v-if="!layoutFullPage"
        class="sticky top-20 hidden h-fit max-h-[calc(100vh-6rem)] w-56 shrink-0 flex-col gap-4 overflow-y-auto lg:flex"
        :class="leftWide && '2xl:w-[29rem]'"
      >
        <div class="flex flex-col gap-4 2xl:flex-row 2xl:items-start">
          <SidebarCategoryCard
            v-for="cat in leftCategories"
            :key="cat.key"
            :title="cat.title"
            :hint="cat.hint"
            :docs="cat.docs"
            :href-base="cat.hrefBase"
          />
        </div>
      </aside>

      <!-- 中央内容：全屏页与文档页共用同一个 <main>（也是整站唯一的路由出口），
           这样 <Transition> 实例在路由切换期间不会被替换，所有切换都有过渡 -->
      <main class="min-w-0" :class="layoutFullPage ? 'w-full' : 'docs-content flex-1'">
        <Transition name="page" mode="out-in" @after-leave="syncLayout">
          <component :is="page" :key="route.path" />
        </Transition>
      </main>

      <!-- 右列：原子章节放「交互 + 浮层」（左列偏「内容型」，右列偏「会动 / 浮起」）。
           业务章节这里没有分类，但页面可能自己往这栏塞卡片（如 demo 的能力开关），
           所以恒渲染；`#docs-aside-extra` 是页面的 Teleport 挂载点，
           用 display:contents 让塞进来的卡片直接成为这一列的 flex 子项（享受同一个 gap） -->
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
          :href-base="cat.hrefBase"
        />

        <div id="docs-aside-extra" class="contents"></div>

        <p v-if="rightCategories.length" class="shrink-0 px-2 text-xs text-muted-foreground">
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
