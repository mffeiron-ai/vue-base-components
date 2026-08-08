<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { watch } from 'vue'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
import { appStore } from './store'

const { Layout } = DefaultTheme
const { isDark } = useData()

// 主题模式与 VitePress 亮暗色联动，写入全局 store
watch(isDark, (val) => {
  appStore.themeMode = val ? 'dark' : 'light'
}, { immediate: true })
</script>

<template>
  <Layout>
    <!-- 全局挂载点：所有页面共享的顶层元素 -->
    <template #layout-top>
      <Toaster position="top-right" rich-colors />
    </template>
  </Layout>
</template>
