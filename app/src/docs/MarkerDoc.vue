<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { Bot, Calendar, Check, Clock, PencilLine, Sparkles, User, Zap } from 'lucide-vue-next'

// ---------- 演示数据 ----------
/** 对话流：用来演示 Marker 在真实场景里的位置 */
const messages = [
  { from: 'me', text: 'Marker 是干什么的？' },
  { from: 'ai', text: '内容是「不属于对话气泡本身」的提示行 —— 比如今天、已编辑、AI 已停止生成。' },
  { from: 'me', text: '分隔线怎么加？' },
  { from: 'ai', text: '用 variant="separator"，两侧横线是 before/after 伪元素画的。' },
]

/** 变体对照 */
const variants = [
  { v: 'default' as const, label: 'default：只有一行灰字，配图标做状态标记' },
  { v: 'separator' as const, label: 'separator：两侧横线，做时间 / 日期分隔' },
  { v: 'border' as const, label: 'border：底部一条边，分隔段落' },
]

// ---------- API ----------
const markerRows = [
  { name: 'variant', type: "'default' | 'separator' | 'border'", def: "'default'", desc: '普通灰字 / 两侧画横线 / 底部加边' },
  { name: 'as / as-child', type: '—', def: "'div'", desc: '透传 reka-ui 的 Primitive，可换根标签或把样式交给子元素（如包一个 <a> 做「查看更多」）' },
  { name: 'class', type: 'string', def: '—', desc: '追加类名。字号 / 间距由预设的 <code>[data-slot="marker"]</code> 管着，要改需带 <code>!</code>' },
]

const partRows = [
  { name: 'MarkerContent', slot: 'marker-content', desc: '文字部分：<code>min-w-0</code> + <code>wrap-break-word</code> 保证长文案正常换行；<code>separator</code> 下自动 <code>flex-none</code> + 居中' },
  { name: 'MarkerIcon', slot: 'marker-icon', desc: '前置图标：16×16、<code>shrink-0</code>；带 <code>aria-hidden</code>（纯装饰），所以用图标时一定要同时给文字' },
]

const autoRows = [
  { name: '[a]: 钩子', desc: 'Marker 与 MarkerContent 里放 <code>&lt;a&gt;</code> 会自动带下划线，hover 变深色，不用自己写链接样式' },
  { name: 'min-h-4', desc: '即使内容为空也占住 16px 高度，避免加载中 / 流式输出时行高跳动' },
  { name: 'group/marker', desc: '根上带具名 group，子组件靠 <code>group-data-[variant=separator]/marker:</code> 感知变体' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Marker 标记</h1>
    <p class="mt-3 text-muted-foreground">
      内容流里的<b>提示行 / 分隔行</b>：不是消息本身，而是「今天」「已编辑」「AI 已停止生成」这类说明。<br />
      结构是 <code>Marker</code> 里放可选的 <code>MarkerIcon</code> + <code>MarkerContent</code>；<br />
      <code>variant</code> 三档：普通灰字 / 两侧横线 / 底部带边。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          默认就是一行灰字，配个图标做状态标记很自然；里面放 <code>&lt;a&gt;</code> 会自动带链接样式。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Marker>
          <MarkerIcon>
            <Sparkles />
          </MarkerIcon>
          <MarkerContent>AI 正在思考…</MarkerContent>
        </Marker>

        <Marker>
          <MarkerIcon>
            <PencilLine />
          </MarkerIcon>
          <MarkerContent>已编辑 · 2 分钟前</MarkerContent>
        </Marker>

        <Marker>
          <MarkerIcon>
            <Check />
          </MarkerIcon>
          <MarkerContent>
            生成完成，<a href="#">查看详情</a>
          </MarkerContent>
        </Marker>
      </CardContent>
    </Card>

    <!-- 2. separator -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">分隔线：variant="separator"</h2>
        <CardDescription>
          两侧横线是 <code>before</code> / <code>after</code> 伪元素画的（它们 <code>flex-1</code> 自动撑开），
          所以文字长短都能自动居中，不用手写边框。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Marker variant="separator">
          <MarkerContent>今天</MarkerContent>
        </Marker>

        <Marker variant="separator">
          <MarkerContent>2026 年 9 月 16 日 星期三</MarkerContent>
        </Marker>

        <Marker variant="separator">
          <MarkerIcon>
            <Clock />
          </MarkerIcon>
          <MarkerContent>以下是较早的消息</MarkerContent>
        </Marker>
      </CardContent>
    </Card>

    <!-- 3. border -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">段落分隔：variant="border"</h2>
        <CardDescription>
          底部加一条边（<code>border-b</code> + <code>pb-2</code>），适合把一长段内容切成几块。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Marker variant="border">
          <MarkerIcon>
            <Zap />
          </MarkerIcon>
          <MarkerContent>第一部分：基础用法</MarkerContent>
        </Marker>
        <p class="text-sm text-muted-foreground">这里是这一段的正文内容……</p>

        <Marker variant="border">
          <MarkerIcon>
            <Zap />
          </MarkerIcon>
          <MarkerContent>第二部分：进阶用法</MarkerContent>
        </Marker>
        <p class="text-sm text-muted-foreground">下面是另一段正文内容……</p>
      </CardContent>
    </Card>

    <!-- 4. 三种 variant 对照 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">三种 variant 对照</h2>
        <CardDescription>同一段文字在三档下的表现。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-for="v in variants" :key="v.v" class="space-y-1">
          <Marker :variant="v.v">
            <MarkerContent>{{ v.v }}</MarkerContent>
          </Marker>
          <p class="text-muted-foreground text-xs">{{ v.label }}</p>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 对话流 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">在对话流里用</h2>
        <CardDescription>
          Marker 的典型位置：气泡之间。日期用 <code>separator</code>，状态用默认变体。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Marker variant="separator">
          <MarkerContent>今天</MarkerContent>
        </Marker>

        <template v-for="(m, i) in messages" :key="i">
          <!-- 第 3 条消息前插一个「已读」标记 -->
          <Marker v-if="i === 3">
            <MarkerIcon>
              <Check />
            </MarkerIcon>
            <MarkerContent>对方已读</MarkerContent>
          </Marker>

          <div class="flex items-start gap-3" :class="m.from === 'me' ? 'justify-end' : ''">
            <Avatar v-if="m.from === 'ai'" class="size-8 shrink-0">
              <AvatarFallback><Bot class="size-4" /></AvatarFallback>
            </Avatar>
            <div
              class="max-w-[70%] rounded-2xl px-3 py-2 text-sm"
              :class="m.from === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'"
            >
              {{ m.text }}
            </div>
            <Avatar v-if="m.from === 'me'" class="size-8 shrink-0">
              <AvatarFallback><User class="size-4" /></AvatarFallback>
            </Avatar>
          </div>
        </template>

        <Marker>
          <MarkerIcon>
            <Sparkles />
          </MarkerIcon>
          <MarkerContent>AI 正在输入…</MarkerContent>
        </Marker>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>3 个组件：1 个根 + 文字 + 图标。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">Marker</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in markerRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">子组件</th>
                <th class="py-2 pr-4 font-medium">data-slot</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in partRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground"><code>{{ row.slot }}</code></td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">内置行为</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in autoRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-sm text-muted-foreground">
          图标（<code>MarkerIcon</code>）带 <code>aria-hidden</code>，是纯装饰 ——
          所以别只放图标不给文字，否则读屏会漏掉这条信息。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
