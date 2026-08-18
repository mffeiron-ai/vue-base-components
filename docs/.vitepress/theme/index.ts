// https://vitepress.dev/guide/custom-theme
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Demo from './components/Demo.vue'
import CustomLayout from './Layout.vue'
import { appStore, pageRegistry } from './store'
import './style.css'
import './vitepress-reset.css'

// 应用统一入口：注册全局组件、全局状态、自定义布局
export default {
  extends: DefaultTheme,
  Layout: CustomLayout,

  enhanceApp({ app }) {
    // 全局组件
    app.component('Demo', Demo)

    // 全局状态（通过 provide/inject 或直接 import store 使用）
    app.provide('appStore', appStore)
    app.provide('pageRegistry', pageRegistry)
  },
} satisfies Theme
