<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Command, Search } from 'lucide-vue-next'

// ---------- 演示数据 ----------
/** 快捷键列表（配 Item 用） */
const shortcuts = [
  { label: '打开命令面板', keys: ['⌘', 'K'] },
  { label: '保存', keys: ['⌘', 'S'] },
  { label: '全局搜索', keys: ['⌘', '⇧', 'F'] },
  { label: '关闭当前面板', keys: ['Esc'] },
  { label: '上下切换', keys: ['↑', '↓'] },
]

/** 单个按键的常见写法 */
const singleKeys = ['⌘', '⇧', '⌥', '⌃', 'Enter', 'Esc', 'Tab', 'Space', '↑', '↓', 'Del']

// ---------- API ----------
const kbdRows = [
  { name: 'class', type: 'string', def: '—', desc: '追加类名。字号 / 圆角 / 内边距 / 底色 / 文字色都由预设的 <code>.cn-kbd</code> 控制（特异性更高），覆盖要带 <code>!</code>，如 <code>class="text-xs!"</code>、<code>class="bg-primary!"</code>' },
]

const partRows = [
  { name: 'KbdGroup', slot: 'kbd-group', desc: '组合键容器：inline-flex + gap-1，渲染的也是 <code>&lt;kbd&gt;</code>（kbd 套 kbd 正是 HTML 规范里表示组合键的写法）' },
  { name: 'Kbd', slot: 'kbd', desc: '单个按键：h-5 / 最小宽 20px / 浅底 / font-sans / select-none；里面的 svg 自动 12×12' },
  { name: '（自动）', slot: '—', desc: '放进 <code>TooltipContent</code> 时自动切成半透明反色（预设的 in-data-[slot=tooltip-content]，组件里写作 [[data-slot=tooltip-content]_&]）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Kbd 键盘按键</h1>
    <p class="mt-3 text-muted-foreground">
      展示快捷键的按键标记，渲染成原生 <code>&lt;kbd&gt;</code> 标签。<br />
      单个按键用 <code>Kbd</code>，组合键用 <code>KbdGroup</code> 包一行；<br />
      放进 <code>Tooltip</code> 里会<b>自动换成半透明反色</b>，不用手动调。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          一个 <code>Kbd</code> 就是一个按键；宽度按下限 20px 走，所以单字符不会缩成一条。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <Kbd v-for="k in singleKeys" :key="k">{{ k }}</Kbd>
        </div>
        <p class="text-sm text-muted-foreground">
          正文里嵌一个也很自然：按 <Kbd>Esc</Kbd> 取消，按 <Kbd>Enter</Kbd> 确认。
        </p>
      </CardContent>
    </Card>

    <!-- 2. 组合键 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">组合键：KbdGroup</h2>
        <CardDescription>
          <code>KbdGroup</code> 只做「排成一行 + 小间距」。想加分隔符就在里面直接写文字节点。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-6">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>

          <KbdGroup>
            <Kbd>⌘</Kbd>
            +
            <Kbd>K</Kbd>
          </KbdGroup>

          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>

          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            +
            <Kbd>Alt</Kbd>
            +
            <Kbd>Del</Kbd>
          </KbdGroup>
        </div>
        <p class="text-muted-foreground text-xs">
          带「+」的版本就是中间插了一个文字节点，不需要额外组件
        </p>
      </CardContent>
    </Card>

    <!-- 3. 快捷键列表 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">快捷键列表（配 Item）</h2>
        <CardDescription>
          和 <code>Item</code> / <code>ItemGroup</code> 组合就是标准的「说明 + 按键」清单；
          <code>ItemActions</code> 会把它顶到右侧。
        </CardDescription>
      </CardHeader>
      <CardContent class="max-w-md">
        <ItemGroup>
          <template v-for="(s, i) in shortcuts" :key="s.label">
            <Item size="sm" variant="default" class="px-0">
              <ItemContent>
                <ItemTitle class="font-normal">{{ s.label }}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <KbdGroup>
                  <Kbd v-for="k in s.keys" :key="k">{{ k }}</Kbd>
                </KbdGroup>
              </ItemActions>
            </Item>
            <ItemSeparator v-if="i < shortcuts.length - 1" />
          </template>
        </ItemGroup>
      </CardContent>
    </Card>

    <!-- 4. Tooltip -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">在 Tooltip 里自动换色</h2>
        <CardDescription>
          深色 Tooltip 上如果还用浅底 <code>Kbd</code> 会很脏，所以组件内置了
          <code>[[data-slot=tooltip-content]_&]</code> —— 一进 Tooltip 就自动变成半透明反色，
          外面完全不用写额外样式。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <TooltipProvider>
          <div class="flex flex-wrap items-center gap-3">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  <Search />
                  悬停看我
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                打开全局搜索
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  <Command />
                  或者看我
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                保存当前内容
                <Kbd>⌘</Kbd>
                <Kbd>S</Kbd>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <p class="text-muted-foreground text-xs">
          对比一下：卡片里的 <Kbd>⌘</Kbd> 是浅底，Tooltip 里的会跟着变半透明
        </p>
      </CardContent>
    </Card>

    <!-- 5. 定制 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">定制字号与底色</h2>
        <CardDescription>
          <code>Kbd</code> 的字号 / 圆角 / 内边距 / <b>底色与文字色</b>都来自 8 套风格预设的
          <code>.cn-kbd</code>（那行写了 <code>bg-muted text-muted-foreground text-xs rounded-sm px-1 h-5</code>，
          能管到的几乎都管了），特异性比普通工具类高，所以<b>覆盖一律要带 <code>!</code></b>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <Kbd>默认</Kbd>
          <Kbd class="text-xs!">text-xs!（更小）</Kbd>
          <Kbd class="h-6! px-2!">h-6! px-2!（更大）</Kbd>
          <Kbd class="bg-primary! text-primary-foreground!">自定义配色（要带 !）</Kbd>
          <Kbd class="rounded-full!">rounded-full!</Kbd>
        </div>
        <div class="flex max-w-sm items-center gap-2">
          <Input placeholder="搜索组件…" class="h-8!" />
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>两个组件都只有 <code>class</code> 一个 prop，内容全走默认插槽。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">Prop</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in kbdRows" :key="row.name" class="border-b last:border-0">
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

        <p class="text-sm text-muted-foreground">
          注意：<code>Kbd</code> 是纯展示元素（<code>pointer-events-none</code>），
          不监听任何快捷键 —— 快捷键本身要自己在业务里监听 <code>keydown</code>。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
