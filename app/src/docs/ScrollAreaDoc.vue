<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const items = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `条目 ${i + 1}`,
  desc: `第 ${i + 1} 条内容，用来把滚动区撑高`,
}))

const tags = ['Vue', 'TypeScript', 'Tailwind', 'reka-ui', 'shadcn-vue', 'Vite', 'Vitest', 'ECharts', 'VueUse', 'Pinia', 'Vue Router', 'ESLint', 'Prettier', 'PostCSS', 'Rollup', 'esbuild']

// 显示策略：reka 的 type，默认 hover（悬停/滚动时才浮出来）
const scrollType = ref<'hover' | 'always' | 'scroll' | 'auto'>('hover')
const typeOptions: Array<{ label: string, value: 'hover' | 'always' | 'scroll' | 'auto' }> = [
  { label: '悬停时显示 hover', value: 'hover' },
  { label: '总是显示 always', value: 'always' },
  { label: '滚动时显示 scroll', value: 'scroll' },
  { label: '自动 auto', value: 'auto' },
]

// 演示「命令式滚动」：实际要滚的是组件内部的 viewport 元素
// （`<ScrollArea ref>` 拿到的是组件实例，DOM 要取 $el 再往下找）
const areaRef = ref<any>(null)
const scrollLog = ref('')
function scrollToItem(n: number) {
  const root = areaRef.value?.$el ?? areaRef.value
  const viewport = root?.querySelector?.('[data-slot="scroll-area-viewport"]')
  if (!viewport) {
    return
  }
  viewport.scrollTo({ top: (n - 1) * 64, behavior: 'smooth' })
  scrollLog.value = `已滚到第 ${n} 条`
}

/**
 * 自定义滚动条外观用的任意值类，两个坑：
 * 1. 必须写在 script 里：Vue 模板里的 `&` 得写成 `&amp;`，而 Tailwind 扫的是源码文本，看到 `&amp;_[…]` 会把整个候选类丢掉。
 * 2. 属性选择器的值**必须带引号**（`[data-slot='x']`），无引号写法 Tailwind 不认（对比 chart 里的 `[&_.recharts-dot[stroke='#fff']]` 能生成）。
 */
const thumbStrong = "[&_[data-slot='scroll-area-thumb']]:bg-muted-foreground/40"
const thumbPrimary = "[&_[data-slot='scroll-area-thumb']]:bg-primary/50"
const barWide = "[&_[data-slot='scroll-area-scrollbar']]:w-3!"

const rootRows = [
  { name: 'type', type: "'hover' | 'always' | 'scroll' | 'auto'", def: "'hover'", desc: '滚动条什么时候出现：悬停/滚动时浮出 / 常显 / 只在滚动中出现 / 交给浏览器判断' },
  { name: 'dir', type: "'ltr' | 'rtl'", def: '—', desc: '阅读方向，影响横向滚动条的方向' },
  { name: 'scrollHideDelay', type: 'number', def: '600', desc: '滚动结束后滚动条<b>淡出</b>前的等待毫秒数（<code>type</code> 为 <code>hover</code>/<code>scroll</code> 时有效）' },
  { name: 'class', type: 'string', def: '—', desc: '挂在滚动容器根节点上，所以<b>高度/宽度约束写这里</b>（根是 <code>relative</code> + 溢出裁剪）' },
]

const partRows = [
  { name: 'ScrollAreaViewport', slot: 'scroll-area-viewport', desc: '真正滚动的那个元素（<code>overflow: auto</code> 被 reka 换成了自定义滚动条，原生条被隐藏）。它自带 <code>size-full</code>，所以外层有高度就自动撑满' },
  { name: 'ScrollBar', slot: 'scroll-area-scrollbar', desc: '自定义滚动条：<code>orientation</code> 传 <code>"horizontal"</code> 就是横条。内部是 <code>ScrollAreaThumb</code>（<code>data-slot="scroll-area-thumb"</code>）' },
  { name: 'ScrollAreaCorner', slot: 'scroll-area-corner', desc: '横纵滚动条交汇处的小方块，由 <code>ScrollArea</code> 自动渲染，不用手动管' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Scroll Area 滚动区域</h1>
    <p class="mt-3 text-muted-foreground">
      给一块区域加<b>自定义样式的滚动条</b>：底色、宽度、圆角都跟设计系统走，并且可以控制在悬停 / 滚动时才浮出来，
      不会像原生滚动条那样各平台长得都不一样。<br />
      用法就是在 <code>ScrollArea</code> 上给一个高度（或宽度），里面塞内容；<b>默认只渲染垂直滚动条</b>，
      要横条得自己加一个 <code>&lt;ScrollBar orientation="horizontal" /&gt;</code>。
    </p>

    <!-- 1. 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          外层给 <code>h-64</code>，里面 30 条内容。把指针移到区域里之后<b>右侧会浮出滚动条</b>（默认
          <code>type="hover"</code>），滚轮 / 拖动滚动条 / 键盘都能滚。<br />
          下面两个按钮演示命令式滚动：拿到 viewport 元素直接 <code>scrollTo</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" @click="scrollToItem(1)">
            回顶部
          </Button>
          <Button size="sm" variant="outline" @click="scrollToItem(20)">
            第 20 条
          </Button>
          <span v-if="scrollLog" class="text-sm text-muted-foreground">{{ scrollLog }}</span>
        </div>

        <ScrollArea ref="areaRef" class="h-64 rounded-md border border-input">
          <div class="p-4">
            <div v-for="item in items" :key="item.id" class="border-b border-input py-3 last:border-0">
              <p class="text-sm font-medium">
                {{ item.title }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ item.desc }}
              </p>
            </div>
          </div>
          <ScrollBar />
        </ScrollArea>

        <p class="text-xs text-muted-foreground">
          滚动条的 thumb 默认用 <code>bg-border</code>，在浅色主题下偏淡；想让它更明显，用后代选择器直接覆盖即可：
          <code>[&amp;_[data-slot='scroll-area-thumb']]:bg-muted-foreground/40</code>（写到
          <code>&lt;ScrollArea&gt;</code> 的 <code>class</code> 上）。
        </p>
      </CardContent>
    </Card>

    <!-- 2. 横向 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">横向滚动</h2>
        <CardDescription>
          <code>ScrollArea</code> 只自带垂直条，横向要显式加
          <code>&lt;ScrollBar orientation="horizontal" /&gt;</code>。<br />
          横向滚动区需要给<b>宽度</b>约束、内容本身要能超出（这里是 <code>w-max</code> 的一排标签）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea class="w-full whitespace-nowrap rounded-md border border-input">
          <div class="flex w-max gap-2 p-4">
            <Badge v-for="tag in tags" :key="tag" variant="secondary">
              {{ tag }}
            </Badge>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>

    <!-- 3. 显示策略 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">滚动条的显示策略</h2>
        <CardDescription>
          <code>type</code> 控制滚动条什么时候出现：<code>hover</code>（默认，进来才浮出来）、
          <code>always</code>（常显，适合需要明确提示「这里能滚」的场景）、<code>scroll</code>（只在滚动过程中显示）、
          <code>auto</code>（由系统判定）。<code>scroll-hide-delay</code> 管淡出前的等待时间。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-muted-foreground">type：</span>
          <Button
            v-for="option in typeOptions"
            :key="option.value"
            size="sm"
            :variant="scrollType === option.value ? 'default' : 'outline'"
            @click="scrollType = option.value"
          >
            {{ option.label }}
          </Button>
          <code class="text-xs text-muted-foreground">:type="{{ scrollType }}"</code>
        </div>

        <ScrollArea :key="scrollType" :type="scrollType" class="h-48 rounded-md border border-input">
          <div class="p-4">
            <div v-for="item in items" :key="item.id" class="border-b border-input py-2.5 last:border-0">
              <p class="text-sm">
                {{ item.title }}
              </p>
            </div>
          </div>
          <ScrollBar />
        </ScrollArea>

        <p class="text-xs text-muted-foreground">
          补充一个容易踩的点：<code>hover</code> / <code>scroll</code> 下，滚动条在「不该显示」时
          <b>根本不在 DOM 里</b> —— reka 用 Presence 控制的是<b>挂载</b>，而不是单纯改透明度。
          所以自动化断言 / 快照里查不到 <code>[data-slot="scroll-area-scrollbar"]</code> 是正常现象，
          需要它稳定存在就切到 <code>always</code>。
        </p>
      </CardContent>
    </Card>

    <!-- 4. 外观自定义 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">滚动条外观自定义</h2>
        <CardDescription>
          三种常见调法：默认、提高对比度、主色加宽。都用后代选择器写到
          <code>&lt;ScrollArea&gt;</code> 的 <code>class</code> 上，不必动组件源码。
          下面三个都指定了 <code>type="always"</code>，好让滚动条常显、方便直接对比。<br />
          <b>注意加宽要带 <code>!</code></b>：预设里 <code>[data-slot="scroll-area-scrollbar"]</code> 的
          <code>w-2.5</code> 是<b>无层样式</b>，会压过普通工具类（改 thumb 颜色不受影响，预设没给 thumb 上色）。
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-5 md:grid-cols-3">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            默认
          </p>
          <ScrollArea class="h-40 rounded-md border border-input" type="always">
            <div class="p-3">
              <div v-for="item in items.slice(0, 8)" :key="item.id" class="border-b border-input py-2 text-sm last:border-0">
                {{ item.title }}
              </div>
            </div>
            <ScrollBar />
          </ScrollArea>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            提高对比度
          </p>
          <ScrollArea class="h-40 rounded-md border border-input" :class="thumbStrong" type="always">
            <div class="p-3">
              <div v-for="item in items.slice(0, 8)" :key="item.id" class="border-b border-input py-2 text-sm last:border-0">
                {{ item.title }}
              </div>
            </div>
            <ScrollBar />
          </ScrollArea>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            主色 + 加宽
          </p>
          <ScrollArea class="h-40 rounded-md border border-input" :class="[barWide, thumbPrimary]" type="always">
            <div class="p-3">
              <div v-for="item in items.slice(0, 8)" :key="item.id" class="border-b border-input py-2 text-sm last:border-0">
                {{ item.title }}
              </div>
            </div>
            <ScrollBar />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 双向 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">横纵双向 + 交汇角</h2>
        <CardDescription>
          同时放两个 <code>ScrollBar</code>，右下角的交汇处由 <code>ScrollAreaCorner</code> 自动补上
          （<code>ScrollArea</code> 内部已渲染，不用手写）。这里塞一张超宽的表格来看效果。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea class="h-56 rounded-md border border-input">
          <div class="w-[1200px] p-4">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-input text-left">
                  <th v-for="col in ['编号', '名称', '负责人', '状态', '更新时间', '说明', '备注']" :key="col" class="py-2 pr-6 font-medium">
                    {{ col }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="item.id" class="border-b border-input last:border-0">
                  <td class="py-2 pr-6 tabular-nums">#{{ item.id }}</td>
                  <td class="py-2 pr-6">{{ item.title }}</td>
                  <td class="py-2 pr-6">张三</td>
                  <td class="py-2 pr-6">进行中</td>
                  <td class="py-2 pr-6 tabular-nums">2026-09-{{ String((item.id % 28) + 1).padStart(2, '0') }}</td>
                  <td class="py-2 pr-6 text-muted-foreground">{{ item.desc }}</td>
                  <td class="py-2 pr-6 text-muted-foreground">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ScrollBar />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>

    <!-- 6. 嵌套 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">嵌套滚动区</h2>
        <CardDescription>
          滚动区可以嵌套：内层滚动到底后会「接力」给外层（浏览器原生行为，reka 没有拦截）。
          左边是内层在滚，右边是内外层各滚各的。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-medium text-muted-foreground">外层不动，内层滚</p>
            <ScrollArea class="h-56 rounded-md border border-input">
              <div class="p-4">
                <div v-for="item in items.slice(0, 4)" :key="item.id" class="py-2">
                  <p class="text-sm font-medium">
                    {{ item.title }}
                  </p>
                </div>
                <ScrollArea class="h-32 rounded-md border border-input">
                  <div class="p-3">
                    <div v-for="item in items" :key="item.id" class="py-1.5 text-sm text-muted-foreground">
                      {{ item.title }}
                    </div>
                  </div>
                  <ScrollBar />
                </ScrollArea>
                <div v-for="item in items.slice(4, 8)" :key="`b-${item.id}`" class="py-2">
                  <p class="text-sm font-medium">
                    {{ item.title }}
                  </p>
                </div>
              </div>
              <ScrollBar />
            </ScrollArea>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-medium text-muted-foreground">放进可调整面板</p>
            <div class="h-56 overflow-hidden rounded-md border border-input">
              <div class="flex h-full w-full">
                <ScrollArea class="h-full w-1/3 border-r border-input">
                  <div class="p-3">
                    <div v-for="item in items" :key="item.id" class="py-1.5 text-sm text-muted-foreground">
                      侧栏 {{ item.id }}
                    </div>
                  </div>
                  <ScrollBar />
                </ScrollArea>
                <ScrollArea class="h-full flex-1">
                  <div class="p-3">
                    <div v-for="item in items" :key="item.id" class="border-b border-input py-2 last:border-0">
                      <p class="text-sm">
                        正文 {{ item.title }}
                      </p>
                    </div>
                  </div>
                  <ScrollBar />
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          除下列项外，reka-ui 的 <code>ScrollAreaRoot</code> 属性都能透传。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">ScrollArea</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rootRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">子部件</th>
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

        <p class="text-sm text-muted-foreground">
          <code>ScrollBar</code> 的 <code>orientation</code> 默认 <code>vertical</code>；它自己带 2.5 的宽度/高度与
          <code>border-transparent</code> 的「留白边」，把滚动条往里收一点。想让滚动条更宽/更细，
          直接用 <code>class</code> 覆盖它的 <code>w-2.5</code>（预设是无层样式，记得带 <code>!</code>）。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
