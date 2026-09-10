import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// RionStudio 纯 Vue 文档应用（替代 VitePress 的前置启动配置）
// root 指向 app/，与组件库的 docs (vitepress) 完全隔离，互不干扰
export default defineConfig({
  root: __dirname,

  // 部署到 GitHub Pages 项目页时，站点在 https://<owner>.github.io/<repo>/ 这个子路径下，
  // 资源前缀必须跟着变，否则 JS/CSS 会 404；
  // 本地开发/预览默认根路径，CI 里由 workflow 传 VITE_BASE_PATH 覆盖。
  base: process.env.VITE_BASE_PATH || '/',

  plugins: [vue(), tailwindcss()],

  resolve: {
    alias: {
      // `@` 指向组件库源码，文档页可直接 import 库内组件
      '@': path.resolve(__dirname, '../src'),
    },
  },

  server: {
    port: 5174, // 与 vitepress 默认的 5173 错开，两者可同时运行
  },
})
