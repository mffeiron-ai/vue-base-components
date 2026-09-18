<script setup lang="ts">
/* 默认插槽内容是任意的，但两件小事注意：
   1. 气泡里那个视觉隐藏的 span 会拿到一份文字副本（所以气泡的 textContent 会看起来重复）
   2. 气泡自带 inline-flex + gap-1.5，多个 Kbd 会自动留间距 */
import { ref } from 'vue'
import { Info, Keyboard, MousePointerClick, Settings, Share2, Trash2 } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Kbd } from '@/components/ui/kbd'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/* ── 演示状态 ── */
const hoverCount = ref(0)
const sides = ['top', 'right', 'bottom', 'left'] as const
const aligns = ['start', 'center', 'end'] as const
const tools = [
  { icon: Info, label: '详情' },
  { icon: Share2, label: '分享' },
  { icon: Trash2, label: '删除' },
]

/* ── API 表 ── */
const providerRows = [
  { name: 'delayDuration', type: 'number', def: '<b>0</b>', desc: '悬停多久后显示（毫秒）。<b>本库默认 0</b> —— reka 原生默认是 <code>700</code>，这里改成「立刻显示」' },
  { name: 'skipDelayDuration', type: 'number', def: '300', desc: '从一个 tooltip 移到另一个时，多久内不再等待延迟' },
  { name: 'disableHoverableContent', type: 'boolean', def: 'false', desc: '禁止鼠标移进内容区继续停留' },
  { name: 'disableClosingTrigger', type: 'boolean', def: 'false', desc: '关闭时不要自动重新聚焦触发器' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '全局禁用（组内所有 tooltip）' },
  { name: 'ignoreNonKeyboardFocus', type: 'boolean', def: 'false', desc: '只有键盘聚焦才显示（鼠标点进来不显示）' },
]

const rootRows = [
  { name: 'v-model:open', type: 'boolean', def: '—', desc: '受控开合。非受控时用 <code>default-open</code>' },
  { name: 'defaultOpen', type: 'boolean', def: 'false', desc: '非受控初始状态' },
  { name: 'delayDuration', type: 'number', def: '继承 Provider', desc: '单独给这一个 tooltip 设置延迟（优先级高于 Provider）' },
  { name: 'disableHoverableContent / disableClosingTrigger / disabled / ignoreNonKeyboardFocus', type: 'boolean', def: '继承 Provider', desc: '同上，可逐个覆盖 Provider 的默认' },
]

const contentRows = [
  { name: 'side', type: "'top' | 'right' | 'bottom' | 'left'", def: "'top'", desc: '显示在触发器的哪一侧。也可以传逻辑方向 <code>inline-start</code> / <code>inline-end</code>（随书写方向翻转）' },
  { name: 'sideOffset', type: 'number', def: '<b>4</b>', desc: '与触发器之间的距离（px）。本库把默认值设成了 4' },
  { name: 'align', type: "'start' | 'center' | 'end'", def: "'center'", desc: '沿另一轴的对齐方式' },
  { name: 'alignOffset', type: 'number', def: '0', desc: '对齐方向的偏移' },
  { name: 'avoidCollisions', type: 'boolean', def: 'true', desc: '贴边时自动换边（默认开）' },
  { name: 'collisionPadding / arrowPadding / sticky / hideWhenDetached', type: '—', def: '—', desc: '碰撞留白、箭头与边缘留白、滚动时贴住触发器、离开视口就隐藏' },
  { name: 'class', type: 'string', def: '—', desc: '内容块样式。8 套预设都会重写圆角 / 字号，覆盖要带 <code>!</code>' },
]

const presetRows = [
  { style: 'Vega', radius: '6px', font: '12px', note: '' },
  { style: 'Luma', radius: '12px', font: '12px', note: '左右方向的箭头额外补 1.5px 偏移' },
  { style: 'Lyra', radius: '0（直角）', font: '12px', note: '' },
  { style: 'Maia', radius: '16px', font: '12px', note: '箭头有额外偏移' },
  { style: 'Mira', radius: '6px', font: '12px', note: '' },
  { style: 'Nova', radius: '6px', font: '12px', note: '' },
  { style: 'Rhea', radius: '12px', font: '12px', note: '箭头有额外偏移' },
  { style: 'Sera', radius: '0（直角）', font: '12px', note: '' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <!--
      Provider 放在根 div 里面（不要当模板根节点）：
      reka 的 TooltipProvider 只渲染插槽，根节点是「片段」
      → 会让页面根节点不是单一元素，文档站的 <Transition> 会报
      「Component inside <Transition> renders non-element root node that cannot be animated」。
    -->
    <TooltipProvider>
      <h1 class="text-3xl font-bold tracking-tight">
        Tooltip 文字提示
      </h1>
      <p class="mt-3 text-muted-foreground">
        鼠标悬停 / 键盘聚焦时弹出的短提示，基于 reka-ui 的 <code>TooltipRoot</code>。
        内容块默认是<b>深底浅字</b>的反色气泡，右侧带一个旋转 45° 的方形做箭头。<br />
        <b>必须包在 <code>TooltipProvider</code> 里</b> —— reka 的上下文注入在缺失时会直接抛
        <code>Injection … not found. Component must be used within `TooltipProvider`</code>，
        所以别省这一步（放布局层包一次即可）。
      </p>

      <!-- 1. 基础用法 -->
      <Card class="mt-8">
        <CardHeader>
          <h2 class="text-xl font-semibold">基础用法</h2>
          <CardDescription>
            <code>Tooltip</code>（管开合）+ <code>TooltipTrigger</code>（触发器）+
            <code>TooltipContent</code>（内容）。<br />
            触发器默认渲染成 <code>&lt;button&gt;</code>；要套在自己的组件上就加
            <code>as-child</code>（注意：reka 会把 <code>data-slot</code> 一起合并过去，
            必要时像 <code>SidebarMenuButton</code> 那样把 <code>data-slot</code> 再写回来）。
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  悬停我
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                这是一条普通提示
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline" size="icon-sm" aria-label="设置">
                  <Settings />
                </Button>
              </TooltipTrigger>
              <TooltipContent>设置</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger as-child>
                <Badge variant="secondary" class="cursor-default">
                  <Info class="size-3" />
                  也可以挂在徽标上
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="right">
                触发器可以是任意元素
              </TooltipContent>
            </Tooltip>
          </div>
          <p class="text-xs text-muted-foreground">
            鼠标移入 / 键盘 Tab 聚焦都会打开，<code>Esc</code> 或移开即关闭。
          </p>
        </CardContent>
      </Card>

      <!-- 2. 延迟 -->
      <Card class="mt-8">
        <CardHeader>
          <h2 class="text-xl font-semibold">延迟：本库默认 0（立刻显示）</h2>
          <CardDescription>
            reka 原生的 <code>delayDuration</code> 默认是 <b>700ms</b>，但本库的
            <code>TooltipProvider</code> 把它改成了 <b>0</b> —— 所以默认行为是「一悬停就出现」。<br />
            想恢复「停顿一下再显示」，在 Provider 或单个 Tooltip 上给 <code>delay-duration</code> 即可。
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="flex flex-wrap items-center gap-3">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  默认（0ms）
                </Button>
              </TooltipTrigger>
              <TooltipContent>立刻显示</TooltipContent>
            </Tooltip>

            <Tooltip :delay-duration="800">
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  延迟 800ms
                </Button>
              </TooltipTrigger>
              <TooltipContent>停顿一下才显示</TooltipContent>
            </Tooltip>

            <Tooltip :delay-duration="1500">
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  延迟 1500ms
                </Button>
              </TooltipTrigger>
              <TooltipContent>要等更久</TooltipContent>
            </Tooltip>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              也可以整块换一个 Provider（下面这组是 500ms），并演示
              <code>skipDelayDuration</code>：先在两个按钮间来回移动，第二次会明显更快
            </p>
            <TooltipProvider :delay-duration="500" :skip-delay-duration="300">
              <div class="flex flex-wrap items-center gap-3">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button variant="outline" size="sm">
                      左侧
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>500ms 后出现</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button variant="outline" size="sm">
                      右侧
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>刚关掉一个，这个会更快</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <!-- 3. 方向 -->
      <Card class="mt-8">
        <CardHeader>
          <h2 class="text-xl font-semibold">方向与对齐</h2>
          <CardDescription>
            <code>side</code> 四个方向、<code>align</code> 三档对齐，加上
            <code>side-offset</code>（本库默认 <code>4</code>，比 reka 的默认更贴近触发器）。
            贴边时 <code>avoidCollisions</code> 会自动换边。
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-8">
          <div class="flex flex-wrap items-center gap-3">
            <Tooltip v-for="s in sides" :key="s">
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  {{ s }}
                </Button>
              </TooltipTrigger>
              <TooltipContent :side="s">
                side="{{ s }}"
              </TooltipContent>
            </Tooltip>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <Tooltip v-for="a in aligns" :key="a">
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  align={{ a }}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" :align="a">
                align="{{ a }}"
              </TooltipContent>
            </Tooltip>
          </div>

          <div class="flex flex-wrap items-center gap-6">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  sideOffset 默认 4
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                贴得比较近
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  sideOffset 20
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" :side-offset="20">
                离得远一些（注意箭头仍贴在气泡上）
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      <!-- 4. 受控 -->
      <Card class="mt-8">
        <CardHeader>
          <h2 class="text-xl font-semibold">受控开合</h2>
          <CardDescription>
            <code>v-model:open</code> 可以自己控制显示时机（例如「点一下显示 3 秒」这种引导提示）。
            注意：受控时鼠标移开不会自动关闭，得自己写关闭逻辑。
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <Tooltip :open="hoverCount > 0">
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  <MousePointerClick />
                  点这个按钮
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                我用 <code>v-model:open</code> 打开的
              </TooltipContent>
            </Tooltip>
            <Button variant="outline" size="sm" @click="hoverCount++">
              打开提示（第 {{ hoverCount }} 次）
            </Button>
            <Button variant="ghost" size="sm" @click="hoverCount = 0">
              关闭
            </Button>
            <Badge variant="secondary">open = {{ hoverCount > 0 }}</Badge>
          </div>
          <p class="text-xs text-muted-foreground">
            因为传了 <code>:open</code>，它变成受控组件 —— 悬停不再能改它的状态，只有上面两个按钮能。
          </p>
        </CardContent>
      </Card>

      <!-- 5. 快捷键 -->
      <Card class="mt-8">
        <CardHeader>
          <h2 class="text-xl font-semibold">内容里放快捷键</h2>
          <CardDescription>
            预设给内容块写了 <code>has-data-[slot=kbd]:pr-1.5</code> 与
            <code>**:data-[slot=kbd]:…</code> 一组规则：只要把 <code>Kbd</code> 放进去，
            它会自动换成半透明反色、并且右下角内边距收窄 —— 不用手动调色。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap items-center gap-3">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  <Keyboard />
                  保存
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                保存当前文件
                <Kbd>⌘S</Kbd>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button variant="outline" size="sm">
                  <Share2 />
                  分享
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                分享给协作者
                <Kbd>⌘</Kbd>
                <Kbd>⇧</Kbd>
                <Kbd>K</Kbd>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      <!-- 6. 禁用 -->
      <Card class="mt-8">
        <CardHeader>
          <h2 class="text-xl font-semibold">禁用与「只键盘聚焦才显示」</h2>
          <CardDescription>
            <code>disabled</code> 让某个 tooltip 完全不出现；
            <code>ignoreNonKeyboardFocus</code> 则只在键盘聚焦时出现（鼠标点进来的聚焦不算）——
            适合避免「鼠标点完按钮后提示挡住界面」。
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap items-center gap-6">
            <div class="space-y-2">
              <p class="text-xs font-medium text-muted-foreground">
                <code>disabled</code>：悬停没有提示
              </p>
              <Tooltip disabled>
                <TooltipTrigger as-child>
                  <Button variant="outline" size="sm">
                    <Trash2 />
                    已禁用
                  </Button>
                </TooltipTrigger>
                <TooltipContent>看不到我</TooltipContent>
              </Tooltip>
            </div>

            <div class="space-y-2">
              <p class="text-xs font-medium text-muted-foreground">
                <code>ignore-non-keyboard-focus</code>：用 Tab 聚焦才有提示
              </p>
              <Tooltip ignore-non-keyboard-focus>
                <TooltipTrigger as-child>
                  <Button variant="outline" size="sm">
                    试试 Tab 聚焦 / 鼠标点击
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  只有键盘聚焦才显示
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 7. 组合 -->
      <Card class="mt-8">
        <CardHeader>
          <h2 class="text-xl font-semibold">组合：图标工具栏</h2>
          <CardDescription>
            最常见的用法 —— 一排纯图标按钮，各自一条提示说明用途。
            本库的 <code>Sidebar</code> 内部已经包了 <code>TooltipProvider</code>
            （延迟 0），所以在侧边栏里不用再套一层。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="inline-flex items-center gap-1 rounded-lg border border-input p-1">
            <Tooltip v-for="item in tools" :key="item.label">
              <TooltipTrigger as-child>
                <Button variant="ghost" size="icon-sm" :aria-label="item.label">
                  <component :is="item.icon" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {{ item.label }}
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      <!-- 8. 无障碍 -->
      <Card class="mt-8">
        <CardHeader>
          <h2 class="text-xl font-semibold">无障碍与实现细节</h2>
          <CardDescription>
            reka 的无障碍模型有点特别：<b>可见的气泡本身没有 <code>role</code></b>（就是个普通 div）；
            气泡<b>内部</b>会额外渲染一个视觉隐藏的 <code>&lt;span role="tooltip"&gt;</code>，
            触发器的 <code>aria-describedby</code> 指向的正是这个 span —— 而不是外面那个气泡。
            两者都只在打开时存在，关闭后属性与节点一起消失。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul class="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
            <li>内容块会被 <code>Teleport</code> 到 <code>body</code>，所以不受父级 <code>overflow: hidden</code> 裁剪</li>
            <li>触发时机：<code>pointerenter</code>（按 <code>delayDuration</code> 延迟）+ 键盘 <code>focus</code>；关闭：移开 / <code>Esc</code> / <code>blur</code></li>
            <li>内容块上还有 <code>data-state</code>（<code>instant-open</code> / <code>delayed-open</code> / <code>closed</code>，延迟为 0 时是前者）、<code>data-side</code>、<code>data-align</code>、<code>dir</code>，以及一组 <code>--reka-tooltip-content-*</code> / <code>--reka-tooltip-trigger-*</code> CSS 变量（可在自定义样式里直接引用触发器尺寸）</li>
            <li><b>提示内容里不要放交互元素</b>（按钮 / 链接）—— 鼠标移过去会触发关闭；要放可交互内容请用 <code>HoverCard</code> 或 <code>Popover</code></li>
            <li>纯图标触发器记得给 <code>aria-label</code>，否则读屏只能念出提示文本</li>
            <li>内容块默认 <code>inline-flex items-center gap-1.5</code>（预设提供的），所以塞多个 <code>Kbd</code> 会自动留间距</li>
          </ul>
        </CardContent>
      </Card>

      <!-- 9. API -->
      <Card class="mt-8">
        <CardHeader>
          <h2 class="text-xl font-semibold">API / Props</h2>
          <CardDescription>四个部件的属性表。</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div>
            <p class="mb-2 text-sm font-medium">
              TooltipProvider
            </p>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b text-left">
                    <th class="py-2 pr-4 font-medium">
                      属性
                    </th>
                    <th class="py-2 pr-4 font-medium">
                      类型
                    </th>
                    <th class="py-2 pr-4 font-medium">
                      默认
                    </th>
                    <th class="py-2 font-medium">
                      说明
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in providerRows" :key="r.name" class="border-b last:border-0">
                    <td class="py-2 pr-4 align-top">
                      <code>{{ r.name }}</code>
                    </td>
                    <td class="py-2 pr-4 align-top text-muted-foreground">
                      {{ r.type }}
                    </td>
                    <td class="py-2 pr-4 align-top text-muted-foreground" v-html="r.def" />
                    <td class="py-2 align-top" v-html="r.desc" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p class="mb-2 text-sm font-medium">
              Tooltip
            </p>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b text-left">
                    <th class="py-2 pr-4 font-medium">
                      属性
                    </th>
                    <th class="py-2 pr-4 font-medium">
                      类型
                    </th>
                    <th class="py-2 pr-4 font-medium">
                      默认
                    </th>
                    <th class="py-2 font-medium">
                      说明
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in rootRows" :key="r.name" class="border-b last:border-0">
                    <td class="py-2 pr-4 align-top">
                      <code>{{ r.name }}</code>
                    </td>
                    <td class="py-2 pr-4 align-top text-muted-foreground">
                      {{ r.type }}
                    </td>
                    <td class="py-2 pr-4 align-top text-muted-foreground">
                      {{ r.def }}
                    </td>
                    <td class="py-2 align-top" v-html="r.desc" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p class="mb-2 text-sm font-medium">
              TooltipContent
            </p>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b text-left">
                    <th class="py-2 pr-4 font-medium">
                      属性
                    </th>
                    <th class="py-2 pr-4 font-medium">
                      类型
                    </th>
                    <th class="py-2 pr-4 font-medium">
                      默认
                    </th>
                    <th class="py-2 font-medium">
                      说明
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in contentRows" :key="r.name" class="border-b last:border-0">
                    <td class="py-2 pr-4 align-top">
                      <code>{{ r.name }}</code>
                    </td>
                    <td class="py-2 pr-4 align-top text-muted-foreground">
                      {{ r.type }}
                    </td>
                    <td class="py-2 pr-4 align-top text-muted-foreground" v-html="r.def" />
                    <td class="py-2 align-top" v-html="r.desc" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="rounded-lg border border-input p-3 text-xs text-muted-foreground">
            <p class="mb-1 font-medium text-foreground">
              样式钩子
            </p>
            <ul class="list-disc space-y-1 pl-4">
              <li><code>data-slot="tooltip" / "tooltip-trigger" / "tooltip-content"</code></li>
              <li>预设里另有三个<b>纯类名钩子</b>（没有 data-slot 回退）：<code>.cn-tooltip-content-logical</code>（逻辑方向的滑入）、<code>.cn-tooltip-arrow</code>（箭头尺寸）、<code>.cn-tooltip-arrow-logical</code>（逻辑方向的箭头定位）—— 组件已把它们写上，否则这些规则永远不生效</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <!-- 10. 各风格 -->
      <Card class="mt-8">
        <CardHeader>
          <h2 class="text-xl font-semibold">各风格外观（实测）</h2>
          <CardDescription>
            气泡的底色与文字色（深底浅字）各风格一致；<b>圆角与字号由预设决定</b>。
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b text-left">
                  <th class="py-2 pr-4 font-medium">
                    设计系统
                  </th>
                  <th class="py-2 pr-4 font-medium">
                    圆角
                  </th>
                  <th class="py-2 pr-4 font-medium">
                    字号
                  </th>
                  <th class="py-2 font-medium">
                    备注
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in presetRows" :key="r.style" class="border-b last:border-0">
                  <td class="py-2 pr-4 align-top font-medium">
                    {{ r.style }}
                  </td>
                  <td class="py-2 pr-4 align-top text-muted-foreground">
                    {{ r.radius }}
                  </td>
                  <td class="py-2 pr-4 align-top text-muted-foreground">
                    {{ r.font }}
                  </td>
                  <td class="py-2 align-top text-muted-foreground">
                    {{ r.note }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs text-muted-foreground">
            组件自带类写的是 <code>rounded-md</code> + <code>text-sm</code>，但 8 套预设都会改成
            <code>text-xs</code>（并各自换圆角）—— 所以<b>脱离预设时字号会大一档</b>。
            内边距 <code>px-3 py-1.5</code> 与深色气泡配色则由组件提供。
          </p>
        </CardContent>
      </Card>
    </TooltipProvider>
  </div>
</template>
