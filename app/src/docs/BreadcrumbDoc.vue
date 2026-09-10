<script setup lang="ts">
import { ChevronDown, Slash } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const rows = [
  { name: 'Breadcrumb', props: 'class', desc: '根容器，渲染 <nav aria-label="breadcrumb">' },
  { name: 'BreadcrumbList', props: 'class', desc: '有序列表 <ol>，横向排列各层级' },
  { name: 'BreadcrumbItem', props: 'class', desc: '单个层级 <li>' },
  { name: 'BreadcrumbLink', props: 'as / asChild, class', desc: '链接，默认渲染 <a>；as-child 可套路由链接' },
  { name: 'BreadcrumbPage', props: 'class', desc: '当前页（不可点击），带 aria-current="page"' },
  { name: 'BreadcrumbSeparator', props: 'class', desc: '层级分隔符，默认 ChevronRight，可用插槽替换' },
  { name: 'BreadcrumbEllipsis', props: 'class', desc: '折叠省略号，用于层级过多时' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Breadcrumb 面包屑</h1>
    <p class="mt-3 text-muted-foreground">用层级链接展示当前页面在站点结构中的位置。</p>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">基础用法</CardTitle>
        <CardDescription>由 `BreadcrumbList` / `BreadcrumbItem` / `BreadcrumbLink` / `BreadcrumbSeparator` 组合；末尾用 `BreadcrumbPage` 表示当前页。</CardDescription>
      </CardHeader>
      <CardContent>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">首页</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/components/accordion">组件</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>面包屑</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </CardContent>
    </Card>

    <!-- 自定义分隔符 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">自定义分隔符</CardTitle>
        <CardDescription>给 `BreadcrumbSeparator` 传入插槽内容即可替换默认的右箭头。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">首页</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/components/accordion">组件</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>面包屑</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <!-- 用文字作为分隔符 -->
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">首页</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>面包屑</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </CardContent>
    </Card>

    <!-- 折叠 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">折叠</CardTitle>
        <CardDescription>层级太长时，用 `BreadcrumbEllipsis` 折叠中间部分。</CardDescription>
      </CardHeader>
      <CardContent>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">首页</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/components/accordion">组件</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>面包屑</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </CardContent>
    </Card>

    <!-- 下拉菜单 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">下拉菜单</CardTitle>
        <CardDescription>把 `BreadcrumbItem` 与 `DropdownMenu` 组合，把中间层级折叠进下拉菜单里。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 省略号触发（官方写法） -->
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">首页</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger :as-child="true">
                  <Button size="icon-sm" variant="ghost">
                    <BreadcrumbEllipsis />
                    <span class="sr-only">展开更多层级</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>文档</DropdownMenuItem>
                  <DropdownMenuItem>主题</DropdownMenuItem>
                  <DropdownMenuItem>GitHub</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/components/accordion">组件</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>面包屑</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <!-- 文字触发 -->
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">首页</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger :as-child="true">
                  <button type="button" class="hover:text-foreground flex items-center gap-1 transition-colors">
                    组件
                    <ChevronDown class="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Accordion</DropdownMenuItem>
                  <DropdownMenuItem>Alert</DropdownMenuItem>
                  <DropdownMenuItem>Badge</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>面包屑</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </CardContent>
    </Card>

    <!-- 路由链接 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">配合路由链接</CardTitle>
        <CardDescription>用 `as-child` 把样式套到 `RouterLink` 上，保持客户端路由跳转。</CardDescription>
      </CardHeader>
      <CardContent>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as-child>
                <RouterLink to="/">首页</RouterLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink as-child>
                <RouterLink to="/components/accordion">组件</RouterLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>面包屑</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
                <th class="px-4 py-2 font-medium">组件</th>
                <th class="px-4 py-2 font-medium">属性</th>
                <th class="px-4 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.name" class="border-b border-border last:border-0">
                <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                <td class="px-4 py-2 font-mono text-muted-foreground">{{ row.props }}</td>
                <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
