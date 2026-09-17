<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

// ---------- 演示状态 ----------
const query = ref('invoice')
const searching = ref(false)
function search() {
  searching.value = true
  setTimeout(() => (searching.value = false), 800)
}

// ---------- API ----------
const rows = [
  { name: 'Empty', type: 'class', def: '—', desc: '空状态容器：居中排版 + min-w-0 flex-1（放进卡片/单元格能撑满）；自带 border-dashed 但**没有边框宽度**，想要虚线框自己加 border（+ 颜色建议用 border-input）' },
  { name: 'EmptyHeader', type: 'class', def: '—', desc: '文字区：把图标、标题、描述竖着居中排好（gap-2）' },
  { name: 'EmptyMedia', type: 'class / variant', def: "variant: 'default'", desc: '图标/插画位；variant="icon" 给 40×40 圆角浅底并把 svg 收敛到 24px' },
  { name: 'EmptyTitle', type: 'class', def: '—', desc: '主标题（18px / medium）' },
  { name: 'EmptyDescription', type: 'class', def: '—', desc: '说明文字（muted 小字号）；内部 <a> 自动带下划线与 hover 主题色' },
  { name: 'EmptyContent', type: 'class', def: '—', desc: '内容区（一般放按钮），自带 max-w-sm 限制宽度' },
]

const slots = [
  { name: 'Empty / EmptyHeader / EmptyMedia / EmptyTitle / EmptyDescription / EmptyContent', desc: '都是单默认插槽，内容直接写在标签里' },
  { name: 'EmptyMedia 的 #indicator-icon', desc: '本项目在 CheckboxItem / RadioItem 上有同名插槽，EmptyMedia 没有 —— 它直接放子元素即可' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Empty 空状态</h1>
    <p class="mt-3 text-muted-foreground">
      列表为空、搜索无结果、还没有数据时用的占位块。<br />
      结构固定是：<code>Empty</code> → <code>EmptyHeader</code>（<code>EmptyMedia</code> + <code>EmptyTitle</code> + <code>EmptyDescription</code>）<br />
      + <code>EmptyContent</code>（放一个主操作按钮）。<br />
      它自带 <code>min-w-0 flex-1</code>，所以丢进卡片或表格单元里会自动撑满并居中；<br />
      注意边框只给了虚线样式（<code>border-dashed</code>），想要虚线框自己再加一个 <code>border</code>。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <p class="text-muted-foreground text-sm">图标 + 标题 + 说明 + 主操作，最常见的组合。</p>
      </CardHeader>
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <path d="M14 2v6h6" />
              </svg>
            </EmptyMedia>
            <EmptyTitle>还没有工单</EmptyTitle>
            <EmptyDescription>
              工单是跟进客户问题的基本单位，创建后可以指派、流转、关闭。
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div class="flex flex-wrap items-center justify-center gap-2">
              <Button size="sm">新建工单</Button>
              <Button size="sm" variant="outline">导入历史数据</Button>
            </div>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>

    <!-- 2. 变体 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">两个变体</h2>
        <p class="text-muted-foreground text-sm">
          <code>variant="icon"</code>（默认用 default）会给图标一个 40×40 的圆角浅底；default 是透明的，适合放大一点的插画。
        </p>
      </CardHeader>
      <CardContent class="grid gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-input">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </EmptyMedia>
              <EmptyTitle>icon 变体</EmptyTitle>
              <EmptyDescription>带浅色圆角底，图标自动 24px。</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
        <div class="rounded-lg border border-input">
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="size-12 text-muted-foreground"><circle cx="12" cy="12" r="10" /><path d="M8 15h8M9 9h.01M15 9h.01" /></svg>
              </EmptyMedia>
              <EmptyTitle>default 变体</EmptyTitle>
              <EmptyDescription>无底色，适合放较大的插画或自定义 svg。</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 虚线框 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">虚线框（自己加 border）</h2>
        <p class="text-muted-foreground text-sm">
          组件只给了 <code>border-dashed</code> 的线型，加一个 <code>border</code> 才是能看见的虚线框 ——
          常用于「拖拽上传区」「还没选中的容器」。
        </p>
      </CardHeader>
      <CardContent>
        <Empty class="border border-input">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </EmptyMedia>
            <EmptyTitle>拖拽文件到这里</EmptyTitle>
            <EmptyDescription>支持 PNG / JPG / PDF，单文件不超过 20MB。</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" variant="outline">选择文件</Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>

    <!-- 4. 搜索无结果 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">搜索无结果</h2>
        <p class="text-muted-foreground text-sm">
          文案里带上搜索词、并给一个「清空条件」的出口，比干巴巴的「暂无数据」好用。
        </p>
      </CardHeader>
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </EmptyMedia>
            <EmptyTitle>没有找到「{{ query }}」</EmptyTitle>
            <EmptyDescription>
              换个关键词试试，或者<a href="#" @click.prevent="query = ''">清空搜索条件</a>。
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" variant="outline" :disabled="searching" @click="search">
              {{ searching ? '搜索中…' : '重新搜索' }}
            </Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>

    <!-- 5. class 透传 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">每个子组件都能透传 class</h2>
        <p class="text-muted-foreground text-sm">
          6 个组件都接受 <code>class</code>（经 tailwind-merge 去重）。注意样式预设是无层规则，
          它定义过的属性（字号、颜色等）你传的类盖不过 —— 要带 <code>!</code>，例如 <code>class="text-xs!"</code>。
        </p>
      </CardHeader>
      <CardContent class="grid gap-4">
        <Empty class="bg-muted/40 border border-input">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Badge variant="secondary">0</Badge>
            </EmptyMedia>
            <EmptyTitle class="text-primary">用主题色强调的标题</EmptyTitle>
            <EmptyDescription class="text-xs!">描述也能单独改字号（预设定义过的属性要带 !）。</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto rounded-lg">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/40 text-left">
                <th class="px-4 py-2 font-medium">组件</th>
                <th class="px-4 py-2 font-medium">可传</th>
                <th class="px-4 py-2 font-medium">默认</th>
                <th class="px-4 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.name" class="border-b border-border last:border-0">
                <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">插槽</p>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li v-for="s in slots" :key="s.name">
              · <code>{{ s.name }}</code>：{{ s.desc }}
            </li>
          </ul>
        </div>

        <p class="text-sm text-muted-foreground">
          另外导出了 <code>emptyMediaVariants</code>（cva），需要自己拼图标容器样式时可以直接复用。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
