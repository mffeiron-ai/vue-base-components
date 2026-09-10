<script setup lang="ts">
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const propsRows = [
  { name: 'ratio', type: 'number', desc: '期望的宽高比（宽 / 高），默认 1' },
  { name: 'as / asChild', type: 'string / boolean', desc: '渲染的元素标签或作为子元素渲染（reka-ui）' },
  { name: 'class', type: 'string', desc: '追加 / 覆盖类名' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Aspect Ratio 宽高比</h1>
    <p class="mt-3 text-muted-foreground">按指定比例维持内容尺寸，常用于图片、视频、地图等媒体容器。</p>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">基础用法</CardTitle>
        <CardDescription>用 `ratio` 指定宽高比，`16 / 9` 表示宽是高的 16/9 倍。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="w-full max-w-md">
          <AspectRatio :ratio="16 / 9" class="overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
              alt="Photo"
              class="h-full w-full object-cover"
            >
          </AspectRatio>
        </div>
      </CardContent>
    </Card>

    <!-- 不同比例 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">不同比例</CardTitle>
        <CardDescription>通过改动 `ratio` 可得到正方形、宽幅、竖版等不同比例的容器。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="space-y-2">
            <AspectRatio :ratio="1" class="overflow-hidden rounded-lg border border-border">
              <div class="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                1 / 1
              </div>
            </AspectRatio>
            <p class="text-center text-xs text-muted-foreground">正方形</p>
          </div>
          <div class="space-y-2">
            <AspectRatio :ratio="16 / 9" class="overflow-hidden rounded-lg border border-border">
              <div class="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                16 / 9
              </div>
            </AspectRatio>
            <p class="text-center text-xs text-muted-foreground">宽幅</p>
          </div>
          <div class="space-y-2">
            <AspectRatio :ratio="3 / 4" class="overflow-hidden rounded-lg border border-border">
              <div class="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                3 / 4
              </div>
            </AspectRatio>
            <p class="text-center text-xs text-muted-foreground">竖版</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 媒体容器 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">媒体容器</CardTitle>
        <CardDescription>把图片 / 视频放进 AspectRatio，可避免加载前的高度跳动。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="w-full max-w-md">
          <AspectRatio :ratio="16 / 9" class="overflow-hidden rounded-lg">
            <div class="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 via-background to-background text-sm text-muted-foreground">
              <span class="text-base font-medium text-foreground">16 : 9 占位</span>
              <span>内容自适应容器比例</span>
            </div>
          </AspectRatio>
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">API / Props</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto rounded-lg">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/40 text-left">
                <th class="px-4 py-2 font-medium">属性</th>
                <th class="px-4 py-2 font-medium">类型</th>
                <th class="px-4 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in propsRows" :key="row.name" class="border-b border-border last:border-0">
                <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                <td class="px-4 py-2 font-mono text-muted-foreground">{{ row.type }}</td>
                <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
