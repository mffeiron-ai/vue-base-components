<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

// ---------- 演示状态 ----------
/** 基础：受控开合 */
const basicOpen = ref(false)
/** 表单式弹层里的输入 */
const email = ref('')

const sides = ['top', 'right', 'bottom', 'left'] as const
const aligns = ['start', 'center', 'end'] as const

// ---------- API ----------
const rootRows = [
  { name: 'v-model:open', type: 'boolean', def: '—', desc: '受控开合；不传就是非受控，内部自己记' },
  { name: 'defaultOpen', type: 'boolean', def: 'false', desc: '非受控时的初始状态' },
  { name: 'modal', type: 'boolean', def: 'false', desc: '是否模态：<code>true</code> 时打开期间会锁页面滚动、屏蔽外部交互（像 Dialog 那样）；默认 <code>false</code>，所以弹层里能正常打字、页面照常可交互' },
]

const contentRows = [
  { name: 'side', type: "'top' | 'right' | 'bottom' | 'left'", def: "'bottom'", desc: '优先出现在触发器的哪一侧；空间不够时自动翻转（<code>avoid-collisions</code> 默认开启）' },
  { name: 'align', type: "'start' | 'center' | 'end'", def: "'center'", desc: '沿主轴的对齐方式（本组件把默认值改成了 <code>center</code>）' },
  { name: 'sideOffset', type: 'number', def: '4', desc: '与触发器的间距（px）' },
  { name: 'alignOffset', type: 'number', def: '0', desc: '沿主轴方向的偏移（px）' },
  { name: 'avoidCollisions', type: 'boolean', def: 'true', desc: '靠近视口边缘时自动翻转 / 平移，避免被裁掉' },
  { name: 'class', type: 'string', def: '—', desc: '面板类名；默认 <code>w-72 p-4</code>，要更宽写 <code>w-80</code> 之类的工具类即可（宽度不是预设写死的）' },
]

const partRows = [
  { name: 'Popover', slot: 'popover', desc: '状态容器：<b>不渲染任何节点</b>，只提供开合上下文；插槽把上下文透传出来（如 <code>{ open }</code>）' },
  { name: 'PopoverTrigger', slot: 'popover-trigger', desc: '触发器：默认渲染 <code>&lt;button&gt;</code>，支持 <code>as-child</code>（包 Button / RouterLink 都行）；点击开合，Esc 关闭' },
  { name: 'PopoverAnchor', slot: 'popover-anchor', desc: '自定义锚点：弹层对着<b>它</b>定位，而触发器可以放在别处（例如锚一个输入框、按钮在右侧）' },
  { name: 'PopoverContent', slot: 'popover-content', desc: '面板本体：Portal 到 body（<b>不受父级 overflow 裁剪</b>，这点和 NavigationMenu 不同）+ <code>z-50</code>、边框阴影、开合动画（淡入淡出 + 缩放 + 按 side 方向滑入）' },
  { name: 'PopoverHeader / Title / Description', slot: 'popover-header / -title / -description', desc: '排版三件套（可选，纯样式）：头部 <code>flex flex-col gap-1</code>、标题 <code>font-medium</code>、描述 <code>text-muted-foreground</code>' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Popover 气泡卡片</h1>
    <p class="mt-3 text-muted-foreground">
      点触发器弹出一块<b>可交互</b>的面板（不是纯展示的 Tooltip / HoverCard）：面板里能放表单、按钮、菜单，
      点面板内部不会关闭，点外面或按 Esc 才关。<br />
      结构：<code>Popover</code>（只提供状态）→ <code>PopoverTrigger</code>（触发器）+
      <code>PopoverContent</code>（Portal 到 body 的面板，可配 <code>PopoverHeader / Title / Description</code> 排版）。<br />
      定位走 floating-ui：<code>side</code> / <code>align</code> / <code>side-offset</code> 控制出现位置，贴边会自动翻转；
      要给别的元素定位就再加 <code>PopoverAnchor</code>。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          受控演示：用 <code>v-model:open</code> 记账。点外面 / 按 Esc 都会关（<code>PopoverContent</code> 自带这两条）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Popover v-model:open="basicOpen">
          <PopoverTrigger as-child>
            <Button variant="outline">打开设置</Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>尺寸</PopoverTitle>
              <PopoverDescription>面板宽度、内边距与圆角都由 class 决定，默认 w-72 / p-4。</PopoverDescription>
            </PopoverHeader>
            <div class="mt-3 grid gap-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">宽度</span>
                <code class="font-mono">w-72（18rem）</code>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">内边距</span>
                <code class="font-mono">p-4</code>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <p class="text-sm text-muted-foreground">
          当前状态：<code class="rounded bg-muted px-1.5 py-0.5 font-mono">{{ basicOpen ? 'open' : 'closed' }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 2. side / align -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">出现位置（side / align）</h2>
        <CardDescription>
          上面一行是 <code>side</code>（top / right / bottom / left），下面一行是 <code>align</code>（start / center / end）。<br />
          贴到视口边缘时会自动翻转或平移（<code>avoid-collisions</code> 默认开），所以怎么点都不会被裁掉。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex flex-wrap items-center gap-2">
          <Popover v-for="side in sides" :key="side">
            <PopoverTrigger as-child>
              <Button variant="outline" size="sm">{{ side }}</Button>
            </PopoverTrigger>
            <PopoverContent :side="side" class="w-56">
              <PopoverHeader>
                <PopoverTitle>side = {{ side }}</PopoverTitle>
                <PopoverDescription>侧边距 sideOffset 默认 4px。</PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Popover v-for="align in aligns" :key="align">
            <PopoverTrigger as-child>
              <Button variant="outline" size="sm">align = {{ align }}</Button>
            </PopoverTrigger>
            <PopoverContent :align="align" :side-offset="8">
              <PopoverHeader>
                <PopoverTitle>align = {{ align }}</PopoverTitle>
                <PopoverDescription>
                  这里是 <code>align="{{ align }}"</code>（sideOffset 调成 8）。
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>

    <!-- 3. Anchor -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">自定义锚点（PopoverAnchor）</h2>
        <CardDescription>
          <code>PopoverAnchor</code> 包住谁，面板就对着谁定位 —— 触发器可以完全在别处。
          典型场景：输入框旁边挂一个「说明 / 建议」，由右侧按钮控制开合。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Popover>
          <PopoverAnchor as-child>
            <div class="max-w-sm">
              <Label for="popover-anchor-input">收件邮箱</Label>
              <Input id="popover-anchor-input" placeholder="you@example.com" class="mt-1.5" />
            </div>
          </PopoverAnchor>
          <PopoverTrigger as-child>
            <Button variant="ghost" size="sm" class="mt-2">这个字段填什么？</Button>
          </PopoverTrigger>
          <PopoverContent side="right" :side-offset="12" class="w-64">
            <PopoverHeader>
              <PopoverTitle>收件邮箱</PopoverTitle>
              <PopoverDescription>会收到构建结果与告警，建议用团队邮箱而不是个人邮箱。</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>

    <!-- 4. 表单式面板 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">面板里放表单</h2>
        <CardDescription>
          Popover 默认<b>非模态</b>（<code>:modal="false"</code>）：面板里可以正常输入、选中文本，页面也照常能滚；
          点面板内部不会关闭，提交完自己关（下面按钮用 <code>@click</code> 手动关）。<br />
          需要「打开时锁住页面」时再传 <code>modal</code>。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline">订阅构建通知</Button>
          </PopoverTrigger>
          <PopoverContent class="w-80">
            <PopoverHeader>
              <PopoverTitle>接收邮件</PopoverTitle>
              <PopoverDescription>提交后需要到邮箱里点确认链接。</PopoverDescription>
            </PopoverHeader>
            <form class="mt-3 space-y-3" @submit.prevent>
              <div>
                <Label for="popover-email">邮箱</Label>
                <Input id="popover-email" v-model="email" type="email" placeholder="you@example.com" class="mt-1.5" />
              </div>
              <div class="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm">取消</Button>
                <Button type="submit" size="sm" :disabled="!email">保存</Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
        <p class="mt-3 text-sm text-muted-foreground">
          输入内容：<code class="rounded bg-muted px-1.5 py-0.5 font-mono">{{ email || '（空）' }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>根组件与面板的 props（触发器 / 锚点只透传 reka 的原生 props）。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">Popover</th>
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
                <th class="py-2 pr-4 font-medium">PopoverContent</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in contentRows" :key="row.name" class="border-b last:border-0">
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
                <th class="py-2 pr-4 font-medium">组件</th>
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
      </CardContent>
    </Card>
  </div>
</template>
