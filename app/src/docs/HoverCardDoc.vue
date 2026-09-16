<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'

// ---------- 演示状态 ----------
/** 受控示例 */
const ctrlOpen = ref(false)

const team = [
  { name: '陈可', handle: '@chenke', role: '前端工程师', bio: '负责组件库与设计系统，喜欢把交互细节抠到底。', tags: ['Vue', 'Tailwind'], posts: '128', followers: '2.4k' },
  { name: '林舟', handle: '@linzhou', role: '产品设计', bio: '关注信息密度与可访问性，最近在折腾暗色模式。', tags: ['Figma', 'A11y'], posts: '96', followers: '1.8k' },
  { name: '王沐', handle: '@wangmu', role: '后端工程师', bio: '把接口做得让人不用看文档那种。', tags: ['Go', 'Postgres'], posts: '214', followers: '3.1k' },
]

// ---------- API ----------
const rootRows = [
  { name: 'v-model:open', type: 'boolean', def: '—', desc: '受控开合；不传就是「悬停/聚焦自动开」' },
  { name: 'open-delay / close-delay', type: 'number(ms)', def: 'reka 默认', desc: '打开 / 关闭的延迟；调小更灵敏，调大更「不容易误触」' },
  { name: 'default-open', type: 'boolean', def: 'false', desc: '非受控时初始是否展开' },
]

const contentRows = [
  { name: 'side', type: "'top' | 'right' | 'bottom' | 'left'", def: "'bottom'", desc: '从哪边弹出；空间不够时 reka 会自动翻转' },
  { name: 'align', type: "'start' | 'center' | 'end'", def: "'center'", desc: '与触发器的对齐方式' },
  { name: 'side-offset / align-offset', type: 'number', def: '4 / —', desc: '与触发器之间的间距、沿排列方向的偏移' },
  { name: 'class', type: 'string', def: '—', desc: '默认宽 16rem（w-64），用 class 改宽度与内边距' },
]

const partRows = [
  { name: 'HoverCardTrigger', type: 'as-child', desc: '悬停目标；默认一层行内元素，想用按钮/头像/整行文字就加 as-child' },
  { name: 'HoverCardContent', type: '见上表', desc: '卡片本体（Portal 到 body）；内容以「预览」为主' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Hover Card 悬停卡片</h1>
    <p class="mt-3 text-muted-foreground">
      鼠标悬停（或键盘聚焦）时弹出的信息卡片，常用来做<b>用户资料卡</b>与<b>链接预览</b>。<br />
      和 Tooltip 的区别：HoverCard 内容更富、而且<b>鼠标可以移进卡片继续交互</b>（Tooltip 只显示纯文本）。<br />
      用 <code>HoverCard</code> 包住 <code>HoverCardTrigger</code> + <code>HoverCardContent</code>；
      开合有延迟，可用 <code>open-delay</code> / <code>close-delay</code> 调节。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法：用户资料卡</h2>
        <CardDescription>悬停名字弹出卡片；鼠标移进卡片不会关闭，所以里面可以放「关注」按钮。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-6">
        <span
          v-for="p in team"
          :key="p.handle"
          class="text-sm"
        >
          <HoverCard :open-delay="200" :close-delay="120">
            <HoverCardTrigger as-child>
              <button class="underline decoration-dotted underline-offset-4 hover:text-primary">
                {{ p.name }}
              </button>
            </HoverCardTrigger>
            <HoverCardContent class="w-72!">
              <div class="flex gap-3">
                <Avatar class="size-10">
                  <AvatarFallback>{{ p.name[0] }}</AvatarFallback>
                </Avatar>
                <div class="min-w-0 space-y-1">
                  <p class="text-sm font-medium">{{ p.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ p.handle }} · {{ p.role }}</p>
                </div>
              </div>
              <p class="mt-3 text-sm text-muted-foreground">{{ p.bio }}</p>
              <div class="mt-3 flex flex-wrap gap-1.5">
                <Badge v-for="t in p.tags" :key="t" variant="secondary">{{ t }}</Badge>
              </div>
              <Separator class="my-3" />
              <div class="flex items-center gap-4 text-xs text-muted-foreground">
                <span><b class="text-foreground">{{ p.posts }}</b> 文章</span>
                <span><b class="text-foreground">{{ p.followers }}</b> 关注者</span>
                <Button size="sm" class="ml-auto">关注</Button>
              </div>
            </HoverCardContent>
          </HoverCard>
        </span>
      </CardContent>
    </Card>

    <!-- 2. 链接预览 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">链接预览</h2>
        <CardDescription>
          触发器用 <code>as-child</code> 包住一个 <code>&lt;a&gt;</code>：悬停显示摘要，点进去还是正常跳转。
        </CardDescription>
      </CardHeader>
      <CardContent class="text-sm">
        <p class="text-muted-foreground">
          我们的文档在
          <HoverCard>
            <HoverCardTrigger as-child>
              <a href="https://reka-ui.com" target="_blank" rel="noreferrer" class="font-medium underline underline-offset-4 hover:text-primary">
                reka-ui.com
              </a>
            </HoverCardTrigger>
            <HoverCardContent side="top" class="w-80!">
              <p class="text-sm font-medium">reka-ui</p>
              <p class="mt-1 text-sm text-muted-foreground">
                无头（headless）Vue 组件库，提供完整的 WAI-ARIA 语义与键盘导航，本仓库的弹层类组件都基于它。
              </p>
              <p class="mt-2 text-xs text-muted-foreground">reka-ui.com</p>
            </HoverCardContent>
          </HoverCard>
          上有完整的 API 文档。
        </p>
      </CardContent>
    </Card>

    <!-- 3. 定位 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">定位：side / align</h2>
        <CardDescription>
          <code>side</code> 换弹出方向（空间不够会自动翻转），<code>align</code> 换对齐：
          <code>start</code> 左对齐 / <code>center</code> 居中 / <code>end</code> 右对齐。
          <br />
          卡片宽度来自主题 preset（带主题作用域，特异性更高），想改宽度要写成
          <code>class="w-80!"</code>（带 <code>!</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap gap-3">
        <HoverCard v-for="cfg in [
          { label: 'top + start', side: 'top', align: 'start' },
          { label: 'bottom + center', side: 'bottom', align: 'center' },
          { label: 'right + end', side: 'right', align: 'end' },
          { label: 'left + center', side: 'left', align: 'center' },
        ]" :key="cfg.label">
          <HoverCardTrigger as-child>
            <Button variant="outline" size="sm">{{ cfg.label }}</Button>
          </HoverCardTrigger>
          <HoverCardContent :side="cfg.side" :align="cfg.align" class="w-56!">
            <p class="text-sm">side=&quot;{{ cfg.side }}&quot;，align=&quot;{{ cfg.align }}&quot;</p>
            <p class="mt-1 text-xs text-muted-foreground">空间不够时 reka 会自己翻转方向。</p>
          </HoverCardContent>
        </HoverCard>
      </CardContent>
    </Card>

    <!-- 4. 延迟 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">延迟：open-delay / close-delay</h2>
        <CardDescription>
          默认延迟偏「保守」（防误触）；信息密度高的界面可以调小。下面两个只差延迟，可以对比手感。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap gap-6 text-sm">
        <span>
          默认延迟：
          <HoverCard>
            <HoverCardTrigger as-child>
              <Button variant="outline" size="sm">悬停我</Button>
            </HoverCardTrigger>
            <HoverCardContent class="w-56!">
              <p class="text-sm">用的是 reka 默认延迟。</p>
            </HoverCardContent>
          </HoverCard>
        </span>
        <span>
          灵敏（delay 0）：
          <HoverCard :open-delay="0" :close-delay="0">
            <HoverCardTrigger as-child>
              <Button variant="outline" size="sm">悬停我</Button>
            </HoverCardTrigger>
            <HoverCardContent class="w-56!">
              <p class="text-sm">open-delay=0，几乎立刻弹出。</p>
            </HoverCardContent>
          </HoverCard>
        </span>
      </CardContent>
    </Card>

    <!-- 5. 受控 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控开合（v-model:open）</h2>
        <CardDescription>状态拿到外面后，可以用代码控制展开（例如移动端点击代替悬停）。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <HoverCard v-model:open="ctrlOpen">
          <HoverCardTrigger as-child>
            <Button variant="outline">悬停或点右侧按钮</Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p class="text-sm font-medium">受控卡片</p>
            <p class="mt-1 text-xs text-muted-foreground">开合由外层 ref 决定。</p>
          </HoverCardContent>
        </HoverCard>
        <Button variant="outline" @click="ctrlOpen = !ctrlOpen">{{ ctrlOpen ? '关闭卡片' : '用代码打开' }}</Button>
        <code class="text-sm text-muted-foreground">open：{{ ctrlOpen }}</code>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <p class="mb-2 text-sm font-medium"><code>HoverCard</code>（根）</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">属性</th>
                  <th class="px-4 py-2 font-medium">类型</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in rootRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium"><code>HoverCardContent</code></p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="row in contentRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">子组件</p>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li v-for="row in partRows" :key="row.name">
              · <code>{{ row.name }}</code>：{{ row.desc }}
            </li>
          </ul>
        </div>

        <p class="text-sm text-muted-foreground">
          触屏注意：HoverCard 只响应悬停/聚焦（桌面端）。移动端可把关键信息做成点击展开，
          或直接用 Popover / Sheet —— 别把唯一入口藏在 hover 里。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
