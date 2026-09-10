<script setup lang="ts">
import { Check, CircleAlert, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const variants = [
  { variant: 'default', desc: '主要色，用于强调' },
  { variant: 'secondary', desc: '次要色，用于普通标签' },
  { variant: 'destructive', desc: '危险 / 错误状态' },
  { variant: 'outline', desc: '描边，弱化' },
  { variant: 'ghost', desc: '幽灵，悬停才有底色' },
  { variant: 'link', desc: '链接样式' },
] as const

const propsRows = [
  { name: 'variant', type: `'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'`, desc: '变体（默认 default）' },
  { name: 'as / asChild', type: 'string / boolean', desc: '渲染的元素标签或作为子元素渲染（reka-ui）' },
  { name: 'class', type: 'string', desc: '追加 / 覆盖类名' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Badge 徽标</h1>
    <p class="mt-3 text-muted-foreground">用于展示状态、分类或计数的短标签。</p>

    <!-- 变体 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">变体</CardTitle>
        <CardDescription>用 `variant` 在 6 种样式间切换。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-3">
          <Badge v-for="v in variants" :key="v.variant" :variant="v.variant">
            {{ v.variant }}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">基础用法</CardTitle>
        <CardDescription>不传 `variant` 时使用 `default`。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-3">
          <Badge>默认</Badge>
          <Badge variant="secondary">次要</Badge>
          <Badge variant="outline">描边</Badge>
        </div>
      </CardContent>
    </Card>

    <!-- 带图标 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">带图标</CardTitle>
        <CardDescription>图标会自动缩到 `size-3`，并与文字保持间距。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-3">
          <Badge>
            <Check />
            已完成
          </Badge>
          <Badge variant="secondary">
            <CircleAlert />
            待处理
          </Badge>
          <Badge variant="destructive">
            <X />
            失败
          </Badge>
        </div>
      </CardContent>
    </Card>

    <!-- 作为链接 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">作为链接</CardTitle>
        <CardDescription>用 `as-child` 把徽标样式套到 `&lt;a&gt;` 上。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-3">
          <Badge as-child>
            <a href="#作为链接">默认链接</a>
          </Badge>
          <Badge variant="secondary" as-child>
            <a href="#作为链接">次要链接</a>
          </Badge>
          <Badge variant="link" as-child>
            <a href="#作为链接">文字链</a>
          </Badge>
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
