<script setup lang="ts">
import { ref } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  Copy,
  FileText,
  FolderOpen,
  History,
  Link2,
  Mail,
  MessageSquare,
  Pencil,
  RefreshCw,
  Share2,
  Scissors,
  Settings,
  Sidebar,
  SortAsc,
  Star,
  Trash2,
  Wrench,
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

// ---------- 1. 基础用法 ----------
const lastAction = ref('（还没操作过）')
function run(label: string) {
  lastAction.value = label
}

// ---------- 2. 勾选 / 单选 ----------
const showSidebar = ref(true)
const showToolbar = ref(false)
const sortBy = ref('name')

// ---------- 3. 触发区 ----------
const items = [
  { name: '季度汇报.pptx', meta: '今天 09:20 · 2.4 MB' },
  { name: '设计规范.pdf', meta: '昨天 18:03 · 8.1 MB' },
  { name: '会议纪要.md', meta: '2 天前 · 12 KB' },
]

// ---------- API ----------
const rootRows = [
  { name: 'v-model:open', type: 'boolean', def: '—', desc: '受控开合（右键后菜单是否展开）' },
  { name: 'modal', type: 'boolean', def: 'true', desc: '展开时锁住页面其余交互，点外面即关闭' },
  { name: 'dir', type: "'ltr' | 'rtl'", def: '—', desc: '书写方向（影响子菜单展开方向与动画）' },
]

const partRows = [
  { name: 'ContextMenuTrigger', type: 'as-child', def: 'false', desc: '右键 / 长按触发区；默认渲染 div，可用 as-child 换成自己的元素。左键点击它不会展开菜单' },
  { name: 'ContextMenuContent', type: 'class / sideOffset 等', def: '—', desc: '菜单本体：Portal + 定位到光标坐标，高度被可用空间限制，超出滚动' },
  { name: 'ContextMenuGroup', type: 'class', def: '—', desc: '分组容器（纯语义分组，要分隔线用 Separator）' },
  { name: 'ContextMenuLabel', type: 'inset', def: 'false', desc: '小标题；预设会收成 muted 色 + text-xs' },
  { name: 'ContextMenuItem', type: 'inset / variant / disabled', def: "variant: 'default'", desc: '普通项；variant="destructive" 走危险色；高亮态 data-[highlighted]' },
  { name: 'ContextMenuCheckboxItem', type: 'v-model: boolean', def: 'false', desc: '可勾选项，勾选后才渲染指示器（Check 图标），可用 indicator-icon 插槽替换' },
  { name: 'ContextMenuRadioGroup', type: 'v-model', def: '—', desc: '单选组，组内 RadioItem 只给 value' },
  { name: 'ContextMenuRadioItem', type: 'value / disabled', def: '—', desc: '单选项（默认小圆点指示器）' },
  { name: 'ContextMenuSeparator', type: 'class', def: '—', desc: '分隔线' },
  { name: 'ContextMenuShortcut', type: 'class', def: '—', desc: '右侧快捷键提示，需放在 ContextMenuItem 内才跟随高亮变色' },
  { name: 'ContextMenuSub', type: 'open / defaultOpen', def: '—', desc: '子菜单根' },
  { name: 'ContextMenuSubTrigger', type: 'inset / disabled', def: 'false', desc: '子菜单父项（自带右箭头），鼠标划过或 ArrowRight 展开' },
  { name: 'ContextMenuSubContent', type: 'class', def: '—', desc: '子菜单弹出层（向右展开，动画与 Content 同一套）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Context Menu 右键菜单</h1>
    <p class="mt-3 text-muted-foreground">
      右键（移动端长按）唤出的菜单，基于 <code>reka-ui</code> 的 <code>ContextMenuRoot</code>。
      和 <code>DropdownMenu</code> 的区别：没有触发器按钮，菜单直接开在<strong>光标位置</strong>；
      多一层子菜单（<code>ContextMenuSub</code>）。键盘、aria、焦点归还都是现成的。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>ContextMenu</code> 里放 <code>ContextMenuTrigger</code>（右键区）和
          <code>ContextMenuContent</code>（菜单）；项与项之间用 <code>ContextMenuSeparator</code> 分组。
          在下面这块区域里右键试试。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <ContextMenu>
          <ContextMenuTrigger
            class="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-input text-sm text-muted-foreground transition-colors select-none hover:bg-muted/40"
          >
            在这里右键（或长按）
          </ContextMenuTrigger>

          <ContextMenuContent class="w-56">
            <ContextMenuItem @select="run('返回')">
              <ArrowLeft />
              <span>返回</span>
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem @select="run('前进')">
              <ArrowRight />
              <span>前进</span>
              <ContextMenuShortcut>⌘]</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem @select="run('刷新')">
              <RefreshCw />
              <span>刷新</span>
              <ContextMenuShortcut>⌘R</ContextMenuShortcut>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem @select="run('剪切')">
              <Scissors />
              <span>剪切</span>
              <ContextMenuShortcut>⌘X</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem @select="run('复制')">
              <Copy />
              <span>复制</span>
              <ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem @select="run('粘贴')" disabled>
              <Clipboard />
              <span>粘贴（禁用）</span>
              <ContextMenuShortcut>⌘V</ContextMenuShortcut>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem variant="destructive" @select="run('删除')">
              <Trash2 />
              <span>删除</span>
              <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <p class="text-sm text-muted-foreground">
          最近操作：<Badge variant="secondary">{{ lastAction }}</Badge>
          <span class="ml-2">（「粘贴」是禁用项：不会高亮，键盘也会跳过）</span>
        </p>
      </CardContent>
    </Card>

    <!-- 2. 勾选 / 单选 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">勾选项与单选组</h2>
        <CardDescription>
          <code>ContextMenuCheckboxItem</code> 直接写 <code>v-model</code>（布尔，各自独立）；
          单选用 <code>ContextMenuRadioGroup</code> 管一个值，组内的
          <code>ContextMenuRadioItem</code> 只给 <code>value</code>。
          勾选状态会实时反映到下面。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <ContextMenu>
          <ContextMenuTrigger
            class="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-input text-sm text-muted-foreground transition-colors select-none hover:bg-muted/40"
          >
            右键打开视图设置
          </ContextMenuTrigger>

          <ContextMenuContent class="w-56">
            <ContextMenuLabel>视图</ContextMenuLabel>
            <ContextMenuCheckboxItem v-model="showSidebar">
              <Sidebar />
              <span>显示侧边栏</span>
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem v-model="showToolbar">
              <Wrench />
              <span>显示工具栏</span>
            </ContextMenuCheckboxItem>

            <ContextMenuSeparator />

            <ContextMenuLabel>排序方式</ContextMenuLabel>
            <ContextMenuRadioGroup v-model="sortBy">
              <ContextMenuRadioItem value="name">
                <SortAsc />
                <span>名称</span>
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="time">
                <History />
                <span>修改时间</span>
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="size">
                <Settings />
                <span>大小</span>
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>

        <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>侧边栏：<Badge :variant="showSidebar ? 'default' : 'secondary'">{{ showSidebar ? '显示' : '隐藏' }}</Badge></span>
          <span>工具栏：<Badge :variant="showToolbar ? 'default' : 'secondary'">{{ showToolbar ? '显示' : '隐藏' }}</Badge></span>
          <span>排序：<code>{{ sortBy }}</code></span>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 子菜单 + inset + 自定义触发区 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">子菜单、inset 与自定义触发区</h2>
        <CardDescription>
          用 <code>ContextMenuSub</code> + <code>SubTrigger</code> + <code>SubContent</code> 做二级菜单
          （鼠标划过或按 <code>→</code> 展开）。右侧列表把每一行都做成右键区 —— 用
          <code>ContextMenuTrigger as-child</code>，触发区就是你自己写的那行元素。
          <code>inset</code> 用来让文字与带勾选指示器的项左对齐。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- 自定义触发区：整行右键 -->
        <ContextMenu v-for="item in items" :key="item.name">
          <ContextMenuTrigger as-child>
            <div class="flex cursor-default items-center gap-3 rounded-md border border-input px-3 py-2 text-sm select-none hover:bg-muted/40">
              <FileText class="size-4 text-muted-foreground" />
              <span class="flex-1">{{ item.name }}</span>
              <span class="text-muted-foreground text-xs">{{ item.meta }}</span>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent class="w-56">
            <ContextMenuItem inset @select="run(`打开 ${item.name}`)">
              <FolderOpen />
              <span>打开</span>
            </ContextMenuItem>
            <ContextMenuItem inset @select="run(`重命名 ${item.name}`)">
              <Pencil />
              <span>重命名</span>
              <ContextMenuShortcut>F2</ContextMenuShortcut>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuSub>
              <ContextMenuSubTrigger inset>
                <Share2 />
                <span>分享</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent class="w-48">
                <ContextMenuItem @select="run('复制链接')">
                  <Link2 />
                  <span>复制链接</span>
                </ContextMenuItem>
                <ContextMenuItem @select="run('发送邮件')">
                  <Mail />
                  <span>发送邮件</span>
                </ContextMenuItem>
                <ContextMenuItem @select="run('发送消息')">
                  <MessageSquare />
                  <span>发送消息</span>
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuItem inset @select="run(`收藏 ${item.name}`)">
              <Star />
              <span>加入收藏</span>
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem inset variant="destructive" @select="run(`删除 ${item.name}`)">
              <Trash2 />
              <span>删除</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <p class="text-sm text-muted-foreground">
          最近操作：<Badge variant="secondary">{{ lastAction }}</Badge>
        </p>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription>
          全部是 reka-ui 的薄封装，props 透传；本库额外补了
          <code>data-slot</code> 钩子、<code>inset</code> / <code>variant</code> 便捷 prop 和默认图标。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <p class="mb-2 text-sm font-medium">ContextMenu</p>
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
                <tr v-for="r in rootRows" :key="r.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ r.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ r.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">其余部件</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">组件</th>
                  <th class="px-4 py-2 font-medium">关键 prop</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in partRows" :key="r.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ r.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ r.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-2 text-sm text-muted-foreground">
            预设（style-*.css）里的钩子：<code>context-menu-content</code>、
            <code>context-menu-item</code>、<code>context-menu-checkbox-item</code>、
            <code>context-menu-radio-item</code>、<code>context-menu-label</code>、
            <code>context-menu-separator</code>、<code>context-menu-shortcut</code>、
            <code>context-menu-sub-trigger</code>、<code>context-menu-sub-content</code>。
            <code>ContextMenuPortal</code> 与指示器没有单独导出（Content 已内置 Portal，
            指示器由勾选/单选项内部渲染）。
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
