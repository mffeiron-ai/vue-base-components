<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const group = [
  { src: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=200&dpr=2&q=80', fallback: 'CN' },
  { src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&dpr=2&q=80', fallback: 'LR' },
  { src: '', fallback: 'JD' },
  { src: '', fallback: 'MK' },
]

const avatarRows = [
  { name: 'size', type: `'sm' | 'default' | 'lg'`, desc: '尺寸档位（默认 default），映射为 size-6 / size-8 / size-10' },
  { name: 'class', type: 'string', desc: '追加 / 覆盖类名（尺寸、圆角等）' },
  { name: 'as / asChild', type: 'string / boolean', desc: '渲染的元素标签或作为子元素渲染（reka-ui）' },
]

const imageRows = [
  { name: 'src', type: 'string', desc: '必填，图片地址' },
  { name: 'alt', type: 'string', desc: '图片替代文本（无障碍）' },
  { name: 'referrerPolicy', type: 'string', desc: '图片请求的 referrer 策略' },
  { name: 'crossOrigin', type: 'string', desc: '跨域属性' },
  { name: '@loadingStatusChange', type: `(s: 'idle' | 'loading' | 'loaded' | 'error') => void`, desc: '图片加载状态变化回调' },
  { name: 'class', type: 'string', desc: '追加 / 覆盖类名' },
]

const fallbackRows = [
  { name: 'delayMs', type: 'number', desc: '延迟多少毫秒再显示兜底内容（避免慢网下闪一下）' },
  { name: 'as / asChild', type: 'string / boolean', desc: '渲染的元素标签或作为子元素渲染（reka-ui）' },
  { name: 'class', type: 'string', desc: '追加 / 覆盖类名' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Avatar 头像</h1>
    <p class="mt-3 text-muted-foreground">用图片表示用户，图片缺失或加载失败时自动回退到兜底内容。</p>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">基础用法</CardTitle>
        <CardDescription>`AvatarImage` 放图片，`AvatarFallback` 放兜底文字（加载失败时自动接管）。</CardDescription>
      </CardHeader>
      <CardContent>
        <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=200&dpr=2&q=80" alt="用户头像" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </CardContent>
    </Card>

    <!-- 兜底 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">兜底内容</CardTitle>
        <CardDescription>不传 `src`（或图片加载失败）时只显示兜底；也可用 `delay-ms` 延迟出现。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-center gap-4">
          <!-- 无图片：只显示首字母 -->
          <Avatar>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <!-- 图片地址无效：自动回退 -->
          <Avatar>
            <AvatarImage src="/not-exist.png" alt="不存在的头像" />
            <AvatarFallback>404</AvatarFallback>
          </Avatar>
          <!-- 延迟 600ms 再显示兜底 -->
          <Avatar>
            <AvatarImage src="/not-exist.png" alt="延迟兜底" />
            <AvatarFallback :delay-ms="600">…</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
    </Card>

    <!-- 尺寸 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">尺寸</CardTitle>
        <CardDescription>用 `size` 在 `sm`(24px) / `default`(32px) / `lg`(40px) 间切换；要任意尺寸可加 `!` 强制覆盖类名。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-center gap-4">
          <Avatar size="sm">
            <AvatarImage src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=200&dpr=2&q=80" alt="小号" />
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=200&dpr=2&q=80" alt="默认" />
            <AvatarFallback>DEF</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarImage src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=200&dpr=2&q=80" alt="大号" />
            <AvatarFallback>LG</AvatarFallback>
          </Avatar>
          <!-- 自定义尺寸：用 ! 提升优先级，压过样式预设里的默认尺寸 -->
          <Avatar class="size-16!">
            <AvatarImage src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=200&dpr=2&q=80" alt="自定义 64" />
            <AvatarFallback class="text-lg">64</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
    </Card>

    <!-- 组合堆叠 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">堆叠分组</CardTitle>
        <CardDescription>用负外边距 + 描边组合多个头像，常用于"参与人"列表。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex -space-x-2">
          <Avatar v-for="(m, i) in group" :key="i" class="ring-2 ring-background">
            <AvatarImage v-if="m.src" :src="m.src" :alt="m.fallback" />
            <AvatarFallback>{{ m.fallback }}</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">API / Props</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <p class="text-sm font-medium">Avatar</p>
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
                <tr v-for="row in avatarRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-muted-foreground">{{ row.type }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">AvatarImage</p>
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
                <tr v-for="row in imageRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-muted-foreground">{{ row.type }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">AvatarFallback</p>
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
                <tr v-for="row in fallbackRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-muted-foreground">{{ row.type }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
