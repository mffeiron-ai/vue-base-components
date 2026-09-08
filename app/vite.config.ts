import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// RionStudio 纯 Vue 文档应用（替代 VitePress 的前置启动配置）
// root 指向 app/，与组件库的 docs (vitepress) 完全隔离，互不干扰
export default defineConfig({
  root: __dirname,

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
