<script setup lang="ts">
import { FileText, FileSpreadsheet, FileArchive, Download, X, Image as ImageIcon } from 'lucide-vue-next'
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from '@/components/ui/attachment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const states = [
  { state: 'idle', desc: '等待上传' },
  { state: 'uploading', desc: '上传中' },
  { state: 'processing', desc: '处理中' },
  { state: 'error', desc: '上传失败' },
  { state: 'done', desc: '已完成' },
] as const

const propsRows = [
  { name: 'state', type: `'idle' | 'uploading' | 'processing' | 'error' | 'done'`, desc: '上传状态（默认 done），驱动样式与 shimmer 动画' },
  { name: 'size', type: `'default' | 'sm' | 'xs'`, desc: '尺寸（默认 default）' },
  { name: 'orientation', type: `'horizontal' | 'vertical'`, desc: '媒体在内容左侧或上方（默认 horizontal）' },
  { name: 'class', type: 'string', desc: '追加 / 覆盖类名' },
]

const mediaRows = [
  { name: 'variant', type: `'icon' | 'image'`, desc: '媒体区放图标或 <img>（默认 icon）' },
  { name: 'class', type: 'string', desc: '追加 / 覆盖类名' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Attachment 附件</h1>
    <p class="mt-3 text-muted-foreground">展示文件或图片附件，含媒体、名称、元信息、上传状态与操作按钮。</p>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">基础用法</CardTitle>
        <CardDescription>由 `AttachmentMedia` + `AttachmentContent` + `AttachmentActions` 组合而成。</CardDescription>
      </CardHeader>
      <CardContent>
        <Attachment>
          <AttachmentMedia>
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
            <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="移除 sales-dashboard.pdf">
              <X />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </CardContent>
    </Card>

    <!-- 图片 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">图片</CardTitle>
        <CardDescription>在 `AttachmentMedia` 上设 `variant="image"`，用 `orientation="vertical"` 让媒体位于内容上方。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-start gap-4">
          <Attachment orientation="vertical">
            <AttachmentMedia variant="image">
              <img
                src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=400&dpr=2&q=80"
                alt="Photo"
              >
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>workspace.png</AttachmentTitle>
              <AttachmentDescription>PNG · 820 KB</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label="移除 workspace.png">
                <X />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        </div>
      </CardContent>
    </Card>

    <!-- 上传状态 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">上传状态</CardTitle>
        <CardDescription>用 `state` 表达上传生命周期，`error` 会切到危险色。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-3">
          <Attachment v-for="s in states" :key="s.state" :state="s.state">
            <AttachmentMedia>
              <FileArchive />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>archive.zip</AttachmentTitle>
              <AttachmentDescription>{{ s.desc }}</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </div>
      </CardContent>
    </Card>

    <!-- 尺寸 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">尺寸</CardTitle>
        <CardDescription>通过 `size` 在 `default` / `sm` / `xs` 之间切换。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-3">
          <Attachment size="default">
            <AttachmentMedia><FileSpreadsheet /></AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>report.xlsx</AttachmentTitle>
              <AttachmentDescription>default</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <Attachment size="sm">
            <AttachmentMedia><FileSpreadsheet /></AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>report.xlsx</AttachmentTitle>
              <AttachmentDescription>sm</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <Attachment size="xs">
            <AttachmentMedia><FileSpreadsheet /></AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>report.xlsx</AttachmentTitle>
              <AttachmentDescription>xs</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </div>
      </CardContent>
    </Card>

    <!-- 分组 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">分组</CardTitle>
        <CardDescription>用 `AttachmentGroup` 把多个附件排成横向可滚动的一行。</CardDescription>
      </CardHeader>
      <CardContent>
        <AttachmentGroup>
          <Attachment>
            <AttachmentMedia><FileText /></AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>brief.pdf</AttachmentTitle>
              <AttachmentDescription>PDF · 1.1 MB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <Attachment>
            <AttachmentMedia variant="image">
              <img src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=200&q=80" alt="Photo">
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>cover.png</AttachmentTitle>
              <AttachmentDescription>PNG · 320 KB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <Attachment>
            <AttachmentMedia><FileSpreadsheet /></AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>data.xlsx</AttachmentTitle>
              <AttachmentDescription>XLSX · 88 KB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <Attachment>
            <AttachmentMedia><FileArchive /></AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>assets.zip</AttachmentTitle>
              <AttachmentDescription>ZIP · 6.4 MB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <Attachment>
            <AttachmentMedia><FileText /></AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>notes.md</AttachmentTitle>
              <AttachmentDescription>MD · 12 KB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <Attachment>
            <AttachmentMedia><FileSpreadsheet /></AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>metrics.xlsx</AttachmentTitle>
              <AttachmentDescription>XLSX · 240 KB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </AttachmentGroup>
      </CardContent>
    </Card>

    <!-- 触发器 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">触发器</CardTitle>
        <CardDescription>`AttachmentTrigger` 会铺满整张卡片，点击卡片即触发；操作按钮仍可独立点击。</CardDescription>
      </CardHeader>
      <CardContent>
        <Attachment>
          <AttachmentMedia><FileText /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>research-summary.pdf</AttachmentTitle>
            <AttachmentDescription>PDF · 3.2 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="下载 research-summary.pdf">
              <Download />
            </AttachmentAction>
          </AttachmentActions>
          <AttachmentTrigger as-child>
            <a
              href="https://reka-ui.com"
              target="_blank"
              rel="noreferrer"
              aria-label="打开 research-summary.pdf"
            />
          </AttachmentTrigger>
        </Attachment>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">API / Props</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <p class="text-sm font-medium">Attachment</p>
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
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">AttachmentMedia</p>
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
                <tr v-for="row in mediaRows" :key="row.name" class="border-b border-border last:border-0">
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
