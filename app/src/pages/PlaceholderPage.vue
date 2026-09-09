<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Construction } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const route = useRoute()

const title = computed(() => (route.path.startsWith('/business') ? '业务组件' : '主题预览'))
const desc = computed(() =>
  route.path.startsWith('/business')
    ? 'BaseTable 等业务组件文档待迁移到纯 Vue 文档。'
    : '随机 UI 生成器 / 主题预览待迁移到纯 Vue 文档。',
)
</script>

<template>
  <div class="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
    <span class="flex size-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
      <Construction class="size-7" />
    </span>
    <h1 class="mt-6 text-2xl font-bold tracking-tight">{{ title }}</h1>
    <p class="mt-3 text-muted-foreground">{{ desc }}</p>
    <div class="mt-6 flex gap-3">
      <RouterLink to="/">
        <Button variant="outline">返回首页</Button>
      </RouterLink>
      <RouterLink to="/components/button">
        <Button>浏览组件</Button>
      </RouterLink>
    </div>
  </div>
</template>
