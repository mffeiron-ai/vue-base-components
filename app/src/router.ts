import { createRouter, createWebHistory } from 'vue-router'
import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import LandingPage from './pages/LandingPage.vue'
import ComponentPage from './pages/ComponentPage.vue'
import PlaceholderPage from './pages/PlaceholderPage.vue'
import { componentDocs } from './docs/registry'

// 自动加载 `app/src/docs/*.vue` 独立文档组件，文件名 `<Name>Doc.vue` → 路由段 `name`
// （如 AccordionDoc.vue → /components/accordion）
const docModules = import.meta.glob('./docs/*.vue', { eager: true }) as Record<string, { default: Component }>

const docComponents: Record<string, Component> = {}
for (const [path, mod] of Object.entries(docModules)) {
  const file = path.split('/').pop()?.replace(/\.vue$/, '') ?? ''
  const kebab = file
    .replace(/Doc$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
  docComponents[kebab] = mod.default
}

// 由组件文档数据自动生成路由：/components/:name
// 存在独立文档组件时优先使用，否则回退到数据驱动页
const componentRoutes: RouteRecordRaw[] = componentDocs.map((doc) => ({
  path: `/components/${doc.name}`,
  name: `component-${doc.name}`,
  component: docComponents[doc.name] ?? ComponentPage,
  meta: { doc },
}))

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: LandingPage,
    // 全屏落地页：不走 app 的侧边栏/顶栏外壳
    meta: { fullPage: true },
  },
  // 尚未迁移的模块 → 占位页（避免落地页链接 404）
  { path: '/playground', name: 'playground', component: PlaceholderPage },
  { path: '/business/basetable', name: 'business-basetable', component: PlaceholderPage },
  ...componentRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
