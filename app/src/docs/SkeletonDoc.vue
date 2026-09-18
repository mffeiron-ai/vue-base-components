<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/* ── 加载切换演示 ── */
const loading = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
function startLoad() {
  loading.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    loading.value = false
  }, 1800)
}
onBeforeUnmount(() => clearTimeout(timer))

/* ── API 表 ── */
const propRows = [
  { name: 'class', type: 'string', def: '—', desc: '唯一的 prop —— Skeleton 就是一个空 <code>div</code>，尺寸、圆角、颜色<b>全靠 class 描述</b>（<code>h-4 w-40</code> / <code>size-12 rounded-full</code> …）' },
]

const presetRows = [
  { name: '背景色', type: 'bg-muted', desc: '组件自带 <code>bg-primary/10</code>，但 8 套预设都会把它覆盖成 <code>bg-muted</code> —— 所以实际生效的是预设值，想换色记得带 <code>!</code>' },
  { name: '圆角', type: 'rounded-md', desc: '各风格不同：「经典 / 直角」是 <code>rounded-md</code>（6px），「胶囊 / 饱满」等是 <code>rounded-2xl</code>。所以同一段 HTML 在不同风格下圆角会变 —— 这就是「跟随设计系统」；要固定住就写 <code>rounded-full!</code> 之类' },
  { name: '动画', type: 'animate-pulse', desc: '内置 <code>animate-pulse</code>（Tailwind 的呼吸式透明度动画）。不想要动画（比如配合 <code>prefers-reduced-motion</code>）写 <code>animate-none</code> 即可，同组属性后写者胜、不加 <code>!</code> 也能覆盖' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Skeleton 骨架屏</h1>
    <p class="mt-3 text-muted-foreground">
      内容加载前的占位块 —— 一个空 <code>div</code>，带呼吸式淡入淡出动画，尺寸与形状全由 <code>class</code> 描述。<br />
      它本身没有任何逻辑，价值在于<b>把真实布局量出来再照着摆</b>：让用户在等待时看到「这里将会有什么」，
      避免内容到位时整页跳动。
    </p>

    <!-- 1. 基础形状 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础形状</h2>
        <CardDescription>
          用 <code>h-*</code> / <code>w-*</code> / <code>rounded-*</code> 拼出你要的形状 ——
          文字行、头像圆、封面图、按钮位都只是同一个组件换了 class。<br />
          背景色与圆角<b>由设计系统接管</b>：底色取 <code>--muted</code>，圆角各风格不同（「经典」6px，「胶囊 / 饱满」是 <code>rounded-2xl</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-start gap-10">
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              文字段落
            </p>
            <div class="space-y-2">
              <Skeleton class="h-4 w-[280px]" />
              <Skeleton class="h-4 w-[240px]" />
              <Skeleton class="h-4 w-[180px]" />
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              头像 / 圆形
            </p>
            <div class="flex items-center gap-3">
              <Skeleton class="size-12 rounded-full!" />
              <div class="space-y-2">
                <Skeleton class="h-4 w-24" />
                <Skeleton class="h-3 w-16" />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              按钮 / 封面
            </p>
            <div class="space-y-3">
              <Skeleton class="h-9 w-28" />
              <Skeleton class="h-20 w-40" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 2. 组合成布局 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">拼成真实布局</h2>
        <CardDescription>
          骨架屏的常见做法是<b>照着成品的样子摆占位块</b>：卡片（头像 + 标题 + 两行正文）、
          列表行、表格行都是这么拼的。注意占位块之间用父级的 <code>space-y-*</code> / <code>gap-*</code> 控制间距，
          不要在 Skeleton 上写 margin。
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-6 lg:grid-cols-2">
        <!-- 卡片骨架 -->
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            卡片
          </p>
          <div class="rounded-lg border border-input p-4">
            <div class="flex items-center gap-3">
              <Skeleton class="size-10 rounded-full!" />
              <div class="flex-1 space-y-2">
                <Skeleton class="h-4 w-1/3" />
                <Skeleton class="h-3 w-1/4" />
              </div>
            </div>
            <div class="mt-4 space-y-2">
              <Skeleton class="h-3 w-full" />
              <Skeleton class="h-3 w-5/6" />
            </div>
            <div class="mt-4 flex gap-2">
              <Skeleton class="h-8 w-20" />
              <Skeleton class="h-8 w-20" />
            </div>
          </div>
        </div>

        <!-- 列表骨架 -->
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            列表
          </p>
          <div class="rounded-lg border border-input">
            <div
              v-for="i in 4"
              :key="i"
              class="flex items-center gap-3 p-3"
              :class="i > 1 && 'border-t border-input'"
            >
              <Skeleton class="size-9" />
              <div class="flex-1 space-y-2">
                <Skeleton class="h-3.5" :class="i % 2 ? 'w-2/5' : 'w-3/5'" />
                <Skeleton class="h-3 w-1/4" />
              </div>
              <Skeleton class="h-6 w-16" />
            </div>
          </div>
        </div>

        <!-- 表格骨架 -->
        <div class="space-y-2 lg:col-span-2">
          <p class="text-xs font-medium text-muted-foreground">
            表格
          </p>
          <div class="rounded-lg border border-input">
            <div class="flex items-center gap-4 border-b border-input bg-muted/40 p-3">
              <Skeleton
                v-for="w in ['w-16', 'flex-1', 'w-24', 'w-20']"
                :key="w"
                class="h-3.5"
                :class="w"
              />
            </div>
            <div
              v-for="i in 3"
              :key="i"
              class="flex items-center gap-4 p-3"
              :class="i > 1 && 'border-t border-input'"
            >
              <Skeleton class="h-3.5 w-16" />
              <Skeleton class="h-3.5 flex-1" />
              <Skeleton class="h-6 w-24 rounded-full!" />
              <Skeleton class="h-3.5 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 加载切换 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">加载态切换</h2>
        <CardDescription>
          真实项目里就是一个 <code>v-if</code>：加载中渲染骨架、加载完换成内容。
          骨架的尺寸要尽量贴近成品，这样切换时布局不会跳。<br />
          点下面按钮模拟 1.8 秒的请求。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Button size="sm" variant="outline" @click="startLoad">
          {{ loading ? '加载中…' : '模拟加载' }}
        </Button>

        <div class="max-w-md rounded-lg border border-input p-4">
          <!-- 骨架 -->
          <div v-if="loading" class="flex items-start gap-3">
            <Skeleton class="size-10 rounded-full!" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-1/3" />
              <Skeleton class="h-3 w-full" />
              <Skeleton class="h-3 w-4/5" />
            </div>
          </div>

          <!-- 真实内容 -->
          <div v-else class="flex items-start gap-3">
            <Avatar class="size-10">
              <AvatarFallback>陈</AvatarFallback>
            </Avatar>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium">
                  陈可
                </p>
                <Badge variant="secondary" class="text-[10px]">
                  维护者
                </Badge>
              </div>
              <p class="mt-1 text-sm text-muted-foreground">
                负责组件库的样式预设与文档站，最近在补 Skeleton 这类展示组件的说明。
              </p>
            </div>
          </div>
        </div>

        <p class="text-xs text-muted-foreground">
          注意两边用的是同一套尺寸（<code>size-10</code> 头像、<code>h-4</code> / <code>h-3</code> 文字行）：
          实测切换前后容器高度只有 8px 的出入（98 → 90 → 98），几乎感觉不到跳动 —— 这就是骨架屏的意义。
        </p>
      </CardContent>
    </Card>

    <!-- 4. 自定义 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">改颜色、圆角与动画</h2>
        <CardDescription>
          底色与圆角由预设负责，<b>覆盖它们要带 <code>!</code></b>
          （预设是无层样式，会压过普通工具类）；<code>animate-none</code> 则不需要 ——
          动画类只和组件自带的 <code>animate-pulse</code> 竞争，同组属性后写者胜。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-5 sm:grid-cols-3">
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              默认（bg-muted + rounded-md）
            </p>
            <Skeleton class="h-16 w-full" />
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              <code>bg-foreground/15!</code>
            </p>
            <Skeleton class="h-16 w-full bg-foreground/15!" />
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              <code>rounded-full!</code> + <code>animate-none</code>
            </p>
            <Skeleton class="h-16 w-full rounded-full! animate-none" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 5. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>只有一个 prop，剩下全靠 class。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  属性
                </th>
                <th class="py-2 pr-4 font-medium">
                  类型
                </th>
                <th class="py-2 pr-4 font-medium">
                  默认
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in propRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ row.name }}</code>
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ row.type }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ row.def }}
                </td>
                <td class="py-2 align-top" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">
            预设接管了什么（8 套风格下）
          </p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b text-left">
                  <th class="py-2 pr-4 font-medium">
                  项
                  </th>
                  <th class="py-2 pr-4 font-medium">
                  预设值
                  </th>
                  <th class="py-2 font-medium">
                  说明
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in presetRows" :key="row.name" class="border-b last:border-0">
                  <td class="py-2 pr-4 align-top">
                    {{ row.name }}
                  </td>
                  <td class="py-2 pr-4 align-top text-muted-foreground">
                    <code>{{ row.type }}</code>
                  </td>
                  <td class="py-2 align-top" v-html="row.desc" />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          另外 <code>SidebarMenuSkeleton</code>（Sidebar 里那个）内部用的就是 <code>Skeleton</code>，
          并额外带 <code>cn-sidebar-menu-skeleton-icon</code> / <code>-text</code> 两个钩子控制图标位与文字条。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
