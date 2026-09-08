<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Boxes, Palette, Rocket } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { componentDocs } from '../docs/registry'
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-16">
    <span class="inline-flex items-center gap-2">
      <Badge variant="secondary">RionStudio UI</Badge>
      <Badge variant="outline">纯 Vue 文档</Badge>
    </span>

    <h1 class="mt-6 text-4xl font-bold tracking-tight">组件文档，直接用 Vue 渲染</h1>
    <p class="mt-4 max-w-2xl text-muted-foreground">
      这套文档站不再依赖 VitePress / Markdown，改为结构化数据 + 组件库自身组件渲染。
      每一篇文档都是组件库的「展示间」。
    </p>

    <div class="mt-6 flex flex-wrap gap-3">
      <RouterLink to="/components/button">
        <Button size="lg">开始浏览组件</Button>
      </RouterLink>
      <Button variant="outline" size="lg">查看源码</Button>
    </div>

    <div class="mt-16 grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <Boxes class="size-5 text-muted-foreground" />
          <CardTitle>结构化内容</CardTitle>
          <CardDescription>导入、变体、Props 都由 registry 数据驱动，可自动生成。</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>

      <Card>
        <CardHeader>
          <Palette class="size-5 text-muted-foreground" />
          <CardTitle>主题无关</CardTitle>
          <CardDescription>沿用组件库 design token，亮/暗色一致。</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>

      <Card>
        <CardHeader>
          <Rocket class="size-5 text-muted-foreground" />
          <CardTitle>当前已有 {{ componentDocs.length }} 篇</CardTitle>
          <CardDescription>从 button 起步，后续可全量迁移。</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  </div>
</template>
