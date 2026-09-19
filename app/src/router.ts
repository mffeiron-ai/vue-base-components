import { createRouter, createWebHistory } from 'vue-router'
import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import LandingPage from './pages/LandingPage.vue'
import PlaygroundPage from './pages/PlaygroundPage.vue'
import { businessDocs, componentDocs, motionDocs } from './docs/registry'

/**
 * 把 `./<目录>/<Name>Doc.vue` 目录下的文档组件映射成「kebab 名 → 组件」。
 * 命名约定：文件名 `<Name>Doc.vue` → 路由段 `<name>`（如 RichTableDoc.vue → rich-table）。
 */
function collectDocComponents(modules: Record<string, { default: Component }>): Record<string, Component> {
  const map: Record<string, Component> = {}
  for (const [path, mod] of Object.entries(modules)) {
    const file = path.split('/').pop()?.replace(/\.vue$/, '') ?? ''
    const kebab = file
      .replace(/Doc$/, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()
    map[kebab] = mod.default
  }
  return map
}

// 原子组件文档：app/src/docs/*.vue
const docComponents = collectDocComponents(
  import.meta.glob('./docs/*.vue', { eager: true }) as Record<string, { default: Component }>,
)

// 业务组件文档：app/src/business/*Doc.vue（同目录下还有 demo / mock 等其他文件，用 *Doc.vue 限定）
const businessComponents = collectDocComponents(
  import.meta.glob('./business/*Doc.vue', { eager: true }) as Record<string, { default: Component }>,
)

// 动效组件文档：app/src/motion/*Doc.vue（一个动效一个页面，新增组件只加一个文件 + registry 一条记录）
const motionComponents = collectDocComponents(
  import.meta.glob('./motion/*Doc.vue', { eager: true }) as Record<string, { default: Component }>,
)

// 由文档数据自动生成路由：原子 /components/:name，业务 /business/:name
// （两边都只维护 registry 里的列表，新增组件不用改这里）
const componentRoutes: RouteRecordRaw[] = componentDocs.map((doc) => ({
  path: `/components/${doc.name}`,
  name: `component-${doc.name}`,
  component: docComponents[doc.name],
}))

const businessRoutes: RouteRecordRaw[] = businessDocs.map((doc) => ({
  path: `/business/${doc.name}`,
  name: `business-${doc.name}`,
  component: businessComponents[doc.name],
}))

const motionRoutes: RouteRecordRaw[] = motionDocs.map((doc) => ({
  path: `/motion/${doc.name}`,
  name: `motion-${doc.name}`,
  component: motionComponents[doc.name],
}))

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: LandingPage,
    // 全屏落地页：不走 app 的侧边栏/顶栏外壳
    meta: { fullPage: true },
  },
  // 自建展示页：主题预览（风格 + 色板 + 随机 UI）
  // 尚未迁移的模块 → 占位页（避免落地页链接 404）
  { path: '/playground', name: 'playground', component: PlaygroundPage },
  // 动效设计：一个动效一个页面；/motion 重定向到第一个（导航也直接指第一个）
  { path: '/motion', redirect: `/motion/${motionDocs[0]?.name ?? 'masked-heading'}` },
  ...motionRoutes,
  ...componentRoutes,
  ...businessRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  // 用 import.meta.env.BASE_URL 而不是硬编码 '/'：
  // 部署到子路径（如 GitHub Pages 的 /vue-base-components/）时，
  // 路由的基准路径必须和 Vite 的 base 保持一致，否则首屏 path 匹配不上。
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
