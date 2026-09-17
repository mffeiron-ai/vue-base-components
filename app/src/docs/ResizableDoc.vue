<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

// 把 @layout 抛出的百分比数组格式化成「40% / 60%」
const layoutText = ref<Record<string, string>>({})
function onBasicLayout(sizes: number[]) {
  layoutText.value = { ...layoutText.value, basic: sizes.map(n => `${n.toFixed(0)}%`).join(' / ') }
}
function onLimitedLayout(sizes: number[]) {
  layoutText.value = { ...layoutText.value, limited: sizes.map(n => `${n.toFixed(0)}%`).join(' / ') }
}
function onCollapsibleLayout(sizes: number[]) {
  layoutText.value = { ...layoutText.value, collapsible: sizes.map(n => `${n.toFixed(0)}%`).join(' / ') }
}

// 自动保存布局：换一个 id 重新挂载，配合 localStorage 演示持久化
const saveKey = ref('doc-resizable-layout')
const remount = ref(0)

const groupRows = [
  { name: 'direction', type: "'horizontal' | 'vertical'", def: "'horizontal'", desc: '分割方向；纵向时面板上下排（组件会自动加 <code>flex-col</code>）' },
  { name: 'autoSaveId', type: 'string', def: '—', desc: '给了就把各面板尺寸写进 <code>localStorage</code>（key 是 <code>reka:&lt;autoSaveId&gt;</code>，值是各面板的 layout 数组），刷新后自动恢复' },
  { name: 'storage', type: 'Storage', def: 'localStorage', desc: '配合 <code>auto-save-id</code> 换存储介质（比如换成 <code>sessionStorage</code>）' },
  { name: 'keyboardResizeBy', type: 'number', def: '10', desc: '分割线聚焦后按方向键，每次调整的<b>百分比</b>步长' },
  { name: 'id', type: 'string', def: '自动生成', desc: '面板组标识；同一页多个组要各自唯一' },
]

const panelRows = [
  { name: 'defaultSize', type: 'number', def: '均分', desc: '初始尺寸（百分比）。不传则所有面板均分' },
  { name: 'minSize / maxSize', type: 'number', def: '—', desc: '拖拽时的上下限（百分比）；到边界就拖不动了' },
  { name: 'collapsible', type: 'boolean', def: 'false', desc: '允许被<b>折叠</b>：拖到 <code>collapsedSize</code> 以下会吸附成折叠态，面板上会出 <code>data-state="collapsed"</code>' },
  { name: 'collapsedSize', type: 'number', def: '0', desc: '折叠后的尺寸（百分比）' },
  { name: 'order', type: 'number', def: 'DOM 顺序', desc: '面板顺序；一般不传，按模板里的先后排列' },
  { name: 'id', type: 'string', def: '自动生成', desc: '面板标识（配 <code>auto-save-id</code> 恢复布局用）' },
]

const handleRows = [
  { name: '默认插槽', type: 'slot', def: '—', desc: '分割线内可以塞内容（默认什么都不渲染，就是一条线）；前面的 <code>after:*</code> 类已经撑出了 4px 的透明命中区，所以细也好拖' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用这条分割线：拖不动、也不能聚焦' },
  { name: 'hitAreaMargins', type: '{ coarse, fine }', def: '{ coarse: 15, fine: 5 }', desc: '扩大命中区域（触屏用 <code>coarse</code>），让 1px 的线更好拖' },
  { name: 'class / data-slot', type: '—', def: "'resizable-handle'", desc: '1px 的线本身；纵向组里会自动变成横线（<code>data-[orientation=vertical]</code> 那一串类在管）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Resizable 可调整面板</h1>
    <p class="mt-3 text-muted-foreground">
      用拖拽分割线的方式布局两块或多块内容：<code>ResizablePanelGroup</code> 给方向，
      <code>ResizablePanel</code> 是面板（尺寸按<b>百分比</b>分配），中间的 <code>ResizableHandle</code> 就是那条可拖的线。<br />
      分割线可以聚焦后用方向键微调，面板还能声明 <code>min-size</code> / <code>max-size</code> / <code>collapsible</code>。
    </p>

    <!-- 1. 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          横向两栏，中间一条分割线。<b>拖那条竖线</b>试试，下面会实时显示两侧百分比；
          线聚焦后按 <code>←</code> <code>→</code> 也能调（每次 10%）。<br />
          注意面板组自身是 <code>h-full</code>，所以外层要给一个高度（这里是 <code>h-56</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-muted-foreground">当前布局：</span>
          <Badge variant="secondary">{{ layoutText.basic ?? '50% / 50%' }}</Badge>
        </div>

        <div class="h-56 overflow-hidden rounded-md border border-input">
          <ResizablePanelGroup direction="horizontal" @layout="onBasicLayout">
            <ResizablePanel :default-size="40">
              <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
                左侧面板
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel :default-size="60">
              <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
                右侧面板
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </CardContent>
    </Card>

    <!-- 2. 纵向与嵌套 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">纵向布局与嵌套</h2>
        <CardDescription>
          左边是 <code>direction="vertical"</code>（上下分割，分割线自动变成横线）；
          右边是经典的「IDE 布局」—— 横向组里套一个纵向组，任意一层都能独立拖。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="space-y-2">
            <p class="text-sm font-medium text-muted-foreground">纵向</p>
            <div class="h-56 overflow-hidden rounded-md border border-input">
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel :default-size="35">
                  <div class="flex h-full items-center justify-center text-sm text-muted-foreground">上</div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel :default-size="65">
                  <div class="flex h-full items-center justify-center text-sm text-muted-foreground">下</div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-sm font-medium text-muted-foreground">嵌套（左右 → 右再上下）</p>
            <div class="h-56 overflow-hidden rounded-md border border-input">
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel :default-size="30">
                  <div class="flex h-full items-center justify-center text-sm text-muted-foreground">侧栏</div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel :default-size="70">
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel :default-size="60">
                      <div class="flex h-full items-center justify-center text-sm text-muted-foreground">主区</div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel :default-size="40">
                      <div class="flex h-full items-center justify-center text-sm text-muted-foreground">控制台</div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 尺寸限制 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">初始尺寸与拖拽范围</h2>
        <CardDescription>
          <code>default-size</code> 给初值，<code>min-size</code> / <code>max-size</code> 卡住拖拽范围 ——
          这里三栏分别是「15% 固定窄栏（20~25）」「40% 弹性」「45% 上限 60%」，怎么拖都不会越过限制。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-muted-foreground">当前布局：</span>
          <Badge variant="secondary">{{ layoutText.limited ?? '20% / 40% / 40%' }}</Badge>
        </div>

        <div class="h-56 overflow-hidden rounded-md border border-input">
          <ResizablePanelGroup direction="horizontal" @layout="onLimitedLayout">
            <ResizablePanel :default-size="20" :min-size="20" :max-size="25">
              <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
                20~25%
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel :default-size="40" :min-size="30">
              <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
                ≥30%
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel :default-size="40" :max-size="60">
              <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
                ≤60%
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 折叠 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">可折叠面板</h2>
        <CardDescription>
          给面板加 <code>collapsible</code> 后，把它拖到 <code>min-size</code>（20%）以下就会<b>吸附折叠</b>成
          <code>collapsed-size</code>（这里 6%，只剩一条窄边），再拖回来就展开 —— 面板上会同步出现
          <code>data-state="collapsed / expanded"</code>，可以据此换内容。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-muted-foreground">当前布局：</span>
          <Badge variant="secondary">{{ layoutText.collapsible ?? '30% / 70%' }}</Badge>
        </div>

        <div class="h-56 overflow-hidden rounded-md border border-input">
          <ResizablePanelGroup direction="horizontal" @layout="onCollapsibleLayout">
            <ResizablePanel :default-size="30" :min-size="20" collapsible :collapsed-size="6">
              <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
                可折叠
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel :default-size="70">
              <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
                内容区
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 自动保存 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">记住布局（auto-save-id）</h2>
        <CardDescription>
          传了 <code>auto-save-id</code> 后，面板尺寸会写进 <code>localStorage</code>（key = <code>reka:&lt;id&gt;</code>）：
          拖一下、刷新页面，布局会恢复。点下面的按钮换个 id 重新挂载，就能看到「换 id = 换一份布局」。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{{ saveKey }}（第 {{ remount + 1 }} 次挂载）</Badge>
          <Button size="sm" variant="outline" @click="remount += 1">
            重新挂载
          </Button>
          <Button
            size="sm"
            variant="outline"
            @click="saveKey = saveKey === 'doc-resizable-layout' ? 'doc-resizable-layout-b' : 'doc-resizable-layout'"
          >
            换成另一份 id
          </Button>
        </div>

        <div :key="`${saveKey}-${remount}`" class="h-56 overflow-hidden rounded-md border border-input">
          <ResizablePanelGroup direction="horizontal" :auto-save-id="saveKey">
            <ResizablePanel :default-size="25">
              <div class="flex h-full items-center justify-center text-sm text-muted-foreground">25%</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel :default-size="75">
              <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
                拖动后刷新页面看看
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          尺寸单位统一是<b>百分比</b>（同名 prop 的 pixel 单位在 reka 里是 <code>sizeUnit</code>，本仓库未额外封装）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">ResizablePanelGroup</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in groupRows" :key="row.name" class="border-b last:border-0">
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
                <th class="py-2 pr-4 font-medium">ResizablePanel</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in panelRows" :key="row.name" class="border-b last:border-0">
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
                <th class="py-2 pr-4 font-medium">ResizableHandle</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in handleRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-sm text-muted-foreground">
          事件：面板组抛 <code>@layout</code>（当前各面板的百分比数组），分割线抛 <code>@dragging</code>
          （拖拽开始/结束，可用来临时关掉 iframe 的 pointer-events）；面板组还提供
          <code>collapse()</code> / <code>expand()</code> / <code>resize()</code> 等命令式方法（通过 ref 调用）。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
