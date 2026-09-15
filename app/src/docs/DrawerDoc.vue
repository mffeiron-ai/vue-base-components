<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

// ---------- 演示状态 ----------
const ctrlOpen = ref(false)
const directions = ['bottom', 'top', 'right', 'left'] as const

// ---------- API ----------
const rootRows = [
  { name: 'direction', type: "'bottom' | 'top' | 'right' | 'left'", def: "'bottom'", desc: '从哪边滑出；换方向时圆角与外边距会自动跟着变' },
  { name: 'v-model:open', type: 'boolean', def: '—', desc: '受控开合；不传就是非受控（DrawerTrigger 自己开）' },
  { name: 'default-open', type: 'boolean', def: 'false', desc: '非受控时的初始状态' },
  { name: 'dismissible', type: 'boolean', def: 'true', desc: '传 false 后向下拖拽与点遮罩都不关闭，只能点明确按钮' },
  { name: 'handle-only', type: 'boolean', def: 'false', desc: '只有顶部把手能拖，内容区不响应拖拽（内部有滚动列表时必开）' },
  { name: 'should-scale-background', type: 'boolean', def: 'true', desc: '打开时把背景整体缩小一点，vaul 的招牌观感' },
  { name: 'nested', type: 'boolean', def: 'false', desc: '抽屉里再开抽屉时必须打开，否则手势会串' },
]

const rootEmits = [
  { name: 'update:open', desc: '开合状态变化' },
]

const partRows = [
  { name: 'DrawerTrigger', type: 'as-child', desc: '打开抽屉的触发器，默认渲染 <button>' },
  { name: 'DrawerContent', type: 'class', desc: '抽屉主体：自带 Portal + 遮罩 + 顶部把手（把手只在 bottom 方向显示）；上下方向最高 80vh，尺寸与内边距用 class 改' },
  { name: 'DrawerClose', type: 'as-child', desc: '关闭按钮；vaul 不给它定位样式，放哪就在哪（右上角 × 要自己加 absolute）' },
  { name: 'DrawerHeader / DrawerFooter', type: 'class', desc: '头尾分区；Footer 的 mt-auto 会把它顶到最底部' },
  { name: 'DrawerTitle', type: '—', desc: '标题（必填）：vaul 用它生成 aria-labelledby' },
  { name: 'DrawerDescription', type: '—', desc: '说明文字，挂到 aria-describedby' },
  { name: 'DrawerOverlay', type: 'class', desc: '遮罩（Content 已自带）；关闭态额外加了不拦截点击的兜底' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Drawer 抽屉</h1>
    <p class="mt-3 text-muted-foreground">
      带手势的抽屉面板，底层是 <code>vaul-vue</code>：向下拖拽关闭、拖顶部把手、打开时背景缩放，移动端体验比 Dialog 自然。<br />
      组合方式和 Dialog 几乎一样：<code>Drawer</code> 包住 <code>DrawerTrigger</code> + <code>DrawerContent</code>，<br />
      里面放 <code>DrawerHeader</code> / <code>DrawerTitle</code> / <code>DrawerDescription</code> / <code>DrawerFooter</code>。<br />
      额外能力：<code>direction</code> 换方向、<code>handle-only</code> 只拖把手、<code>dismissible=false</code> 禁止手势关闭。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>默认从底部滑出，顶部有把手（可以按住往下拖关掉）。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Drawer>
          <DrawerTrigger as-child>
            <Button variant="outline">打开抽屉</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>确认提交</DrawerTitle>
              <DrawerDescription>提交后工单会进入队列，预计 2 分钟内完成。</DrawerDescription>
            </DrawerHeader>
            <div class="px-4 pb-2 text-sm text-muted-foreground">
              拖顶部把手往下、或点遮罩都能关闭。
            </div>
            <DrawerFooter>
              <Button>提交工单</Button>
              <DrawerClose as-child>
                <Button variant="outline">取消</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>

    <!-- 2. 方向 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">四个方向</h2>
        <CardDescription><code>direction</code> 决定从哪边滑出；左右方向默认 w-3/4、sm 以上 max-w-sm。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Drawer v-for="dir in directions" :key="dir" :direction="dir">
          <DrawerTrigger as-child>
            <Button variant="outline">{{ dir }}</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>来自 {{ dir }}</DrawerTitle>
              <DrawerDescription>方向不同，圆角与贴边位置会自动适配。</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose as-child>
                <Button variant="outline">关闭</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>

    <!-- 3. 受控 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控开合（v-model:open）</h2>
        <CardDescription>状态拿到外面后，外部按钮能直接打开，也能读到当前是否展开。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Button variant="outline" @click="ctrlOpen = true">从外面打开</Button>
        <code class="text-sm text-muted-foreground">open：{{ ctrlOpen }}</code>

        <Drawer v-model:open="ctrlOpen">
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>受控抽屉</DrawerTitle>
              <DrawerDescription>开合由外层 ref 决定。</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button variant="outline" @click="ctrlOpen = false">在内部关掉</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>

    <!-- 4. 禁止手势关闭 / 只拖把手 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁止手势关闭、只拖把手</h2>
        <CardDescription>
          <code>:dismissible="false"</code> 后拖拽与点遮罩都不关，必须点按钮；
          <code>handle-only</code> 让只有把手能拖（内容区有滚动列表时必开，否则滚动会跟拖拽打架）。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Drawer :dismissible="false">
          <DrawerTrigger as-child>
            <Button variant="outline">必须点按钮关闭</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>请选择处理方式</DrawerTitle>
              <DrawerDescription>往下拖、点遮罩都不会关，只能点下面两个按钮之一。</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>重新分配</Button>
              <DrawerClose as-child>
                <Button variant="outline">稍后处理</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer handle-only>
          <DrawerTrigger as-child>
            <Button variant="outline">只拖把手</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>只拖把手</DrawerTitle>
              <DrawerDescription>内容区可以正常滚动，不会误触拖拽关闭（点遮罩仍可关）。</DrawerDescription>
            </DrawerHeader>
            <div class="max-h-[40vh] overflow-y-auto px-4 pb-2 text-sm text-muted-foreground">
              <p v-for="i in 20" :key="i" class="py-1">列内容 {{ i }} —— 在内容区上下滚动不会拖动抽屉。</p>
            </div>
            <DrawerFooter>
              <DrawerClose as-child>
                <Button variant="outline">关闭</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>

    <!-- 6. 表单 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">抽屉里放表单</h2>
        <CardDescription>移动端常见的「底部弹出填写」，提交后自动关闭。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Drawer>
          <DrawerTrigger as-child>
            <Button variant="outline">新建标签</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>新建标签</DrawerTitle>
              <DrawerDescription>标签名会显示在列表左侧。</DrawerDescription>
            </DrawerHeader>
            <div class="grid gap-2 px-4 pb-2">
              <Label for="drawer-tag-name">标签名</Label>
              <Input id="drawer-tag-name" placeholder="例如：待回访" />
            </div>
            <DrawerFooter>
              <DrawerClose as-child>
                <Button>保存</Button>
              </DrawerClose>
              <DrawerClose as-child>
                <Button variant="outline">取消</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <p class="mb-2 text-sm font-medium"><code>Drawer</code>（根，底层是 vaul-vue 的 DrawerRoot）</p>
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
          <ul class="mt-3 space-y-1 text-sm text-muted-foreground">
            <li v-for="e in rootEmits" :key="e.name">
              · <code>{{ e.name }}</code>：{{ e.desc }}
            </li>
          </ul>
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
          vaul-vue 的其他能力（<code>close-threshold</code>、<code>nested</code>、<code>reposition-inputs</code> 等）
          都能直接作为 props 传；子组件同样是薄封装，reka / vaul 原生属性不会被吃掉。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
