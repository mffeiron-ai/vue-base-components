<script setup lang="ts">
import DocsLayout from './components/DocsLayout.vue'
</script>

<template>
  <!-- 整站统一外壳：导航栏常驻 + 侧边栏（仅组件页）+ 内容 page 过渡 -->
  <RouterView v-slot="{ Component }">
    <DocsLayout :page="Component" />
  </RouterView>
</template>
