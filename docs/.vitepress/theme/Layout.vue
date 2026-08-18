<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { onMounted, onUnmounted, watch } from 'vue'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
import { appStore } from './store'

const { Layout } = DefaultTheme
const { isDark } = useData()

// 默认组件库主题类名（与 src/styles/style-vega.css 对应）
const DOCS_THEME_CLASS = 'style-vega'

// 主题模式与 VitePress 亮暗色联动，写入全局 store
watch(isDark, (val) => {
  appStore.themeMode = val ? 'dark' : 'light'
}, { immediate: true })

// 在文档根元素注入组件库主题类名，使组件样式生效
onMounted(() => {
  document.documentElement.classList.add(DOCS_THEME_CLASS)
})
onUnmounted(() => {
  document.documentElement.classList.remove(DOCS_THEME_CLASS)
})
</script>

<template>
  <Layout>
    <!-- 全局挂载点：所有页面共享的顶层元素 -->
    <template #layout-top>
      <Toaster position="top-right" rich-colors />
    </template>
  </Layout>
</template>
