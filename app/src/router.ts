import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import ComponentPage from './pages/ComponentPage.vue'
import { componentDocs } from './docs/registry'

// 由组件文档数据自动生成路由：/components/:name
const componentRoutes: RouteRecordRaw[] = componentDocs.map((doc) => ({
  path: `/components/${doc.name}`,
  name: `component-${doc.name}`,
  component: ComponentPage,
  meta: { doc },
}))

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomePage },
  ...componentRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
