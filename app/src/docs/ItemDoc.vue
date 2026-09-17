<script setup lang="ts">
import { ref } from 'vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Bell,
  ChevronRight,
  Download,
  FileText,
  Play,
  Plus,
  Star,
  ThumbsUp,
} from 'lucide-vue-next'

// ---------- 演示状态 ----------
/** 整块可点：说明点了几次 */
const clickCount = ref(0)
/** Header/Footer 的开关 */
const notifyOn = ref(true)

/** 列表场景：一组「文件」 */
const files = [
  { name: '设计规范.pdf', size: '2.4 MB', icon: FileText },
  { name: '组件清单.xlsx', size: '128 KB', icon: FileText },
  { name: '演示录屏.mp4', size: '36 MB', icon: Play },
]

/** 媒体类型对比 */
const mediaDemo = [
  { variant: 'icon' as const, label: 'icon：32×32 方块，svg 自动缩到 16', text: '图标媒体' },
  { variant: 'image' as const, label: 'image：40×40 圆角缩略图，img 自动铺满', text: '图片媒体' },
  { variant: 'default' as const, label: 'default：什么都不加，里面自己放', text: '自定义媒体' },
]

// ---------- API ----------
const itemRows = [
  { name: 'variant', type: "'default' | 'outline' | 'muted'", def: "'default'", desc: '透明 / 带边框 / 浅底色；条目的整体强调程度' },
  { name: 'size', type: "'default' | 'sm' | 'xs'", def: "'default'", desc: 'p-4 gap-4 / py-3 px-4 gap-2.5 / gap-2 px-2.5 py-2（xs 是下拉菜单那种紧凑档）' },
  { name: 'as / as-child', type: '—', def: "'div'", desc: '换根标签或把样式交给子元素 —— 用 as-child 包 <a> / <button> 就能整块可点' },
]

const mediaRows = [
  { name: 'variant', type: "'default' | 'icon' | 'image'", def: "'default'", desc: 'default 无样式 / icon 32×32 浅底方块 / image 40×40 圆角缩略图' },
  { name: '（自动行为）', type: '—', desc: '同一条目里出现 ItemDescription 时，媒体自动改成顶部对齐并下移 0.5' },
]

const partRows = [
  { name: 'ItemGroup', type: 'role="list" 的竖排容器；条目间插 ItemSeparator 做分隔线' },
  { name: 'ItemHeader / ItemFooter', type: '带 basis-full，各自独占一行；内部 flex justify-between，适合「左标题右状态」「左价格右按钮」' },
  { name: 'ItemContent', type: 'flex-1 吃掉剩余宽度（把 Actions 顶到最右）；放两个时第二个变 flex-none，可做「左标题右数值」两栏' },
  { name: 'ItemTitle / ItemDescription', type: '标题 14px 中等字重；描述灰色小字默认截断两行（要完整传 class="line-clamp-none"）' },
  { name: 'ItemActions', type: '右侧操作区（按钮 / 菜单 / 开关）' },
  { name: 'ItemSeparator', type: '就是上下 margin 清零的 Separator，放在相邻条目之间' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Item 条目</h1>
    <p class="mt-3 text-muted-foreground">
      通用「条目」容器：<b>左侧媒体 + 中间内容 + 右侧操作</b>，也能换成上下结构（Header / Content / Footer）。<br />
      文件列表、通知条目、商品行、设置项都能用它拼，不用每次调 flex。<br />
      用 <code>Item</code> 里放 <code>ItemMedia</code> + <code>ItemContent</code> +
      <code>ItemActions</code>；多个条目放进 <code>ItemGroup</code>，中间插
      <code>ItemSeparator</code>。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          媒体 / 内容 / 操作三段；<code>ItemContent</code> 是 <code>flex-1</code>，
          所以操作区会被自动顶到最右。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Bell />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>新版本可用</ItemTitle>
            <ItemDescription>v0.4.0 已发布，修了 12 个问题并新增 Item 组件。</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="outline">查看</Button>
          </ItemActions>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon">
            <Star />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>收藏这个组件库</ItemTitle>
          </ItemContent>
          <ItemActions>
            <Button size="icon" variant="ghost" aria-label="收藏">
              <Star />
            </Button>
            <Button size="icon" variant="ghost" aria-label="下载">
              <Download />
            </Button>
          </ItemActions>
        </Item>
      </CardContent>
    </Card>

    <!-- 2. variant -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">三种 variant</h2>
        <CardDescription>
          <code>default</code> 透明（适合放在卡片里靠分隔线区分）、
          <code>outline</code> 带边框（适合单独成块）、<code>muted</code> 浅底（适合强调）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Item v-for="v in (['default', 'outline', 'muted'] as const)" :key="v" :variant="v">
          <ItemMedia variant="icon">
            <FileText />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>variant="{{ v }}"</ItemTitle>
          </ItemContent>
          <ItemActions>
            <Badge variant="secondary">{{ v }}</Badge>
          </ItemActions>
        </Item>
      </CardContent>
    </Card>

    <!-- 3. 尺寸与媒体 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">尺寸与媒体类型</h2>
        <CardDescription>
          <code>size</code> 有 <code>default</code> / <code>sm</code> / <code>xs</code>；
          <code>ItemMedia</code> 的 <code>variant</code> 决定左边那块长什么样。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="space-y-3">
          <Item v-for="s in (['default', 'sm', 'xs'] as const)" :key="s" :size="s" variant="muted">
            <ItemContent>
              <ItemTitle>size="{{ s }}"</ItemTitle>
            </ItemContent>
            <ItemActions>
              <span class="text-xs text-muted-foreground">右侧操作</span>
            </ItemActions>
          </Item>
        </div>

        <div class="space-y-3">
          <Item v-for="m in mediaDemo" :key="m.variant" variant="outline">
            <ItemMedia :variant="m.variant">
              <template v-if="m.variant === 'image'">
                <img src="https://picsum.photos/seed/rion/80/80" alt="" />
              </template>
              <component :is="m.variant === 'image' ? FileText : Star" v-else />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{{ m.text }}</ItemTitle>
              <ItemDescription>{{ m.label }}</ItemDescription>
            </ItemContent>
          </Item>
        </div>

        <div class="space-y-3">
          <Item variant="muted">
            <ItemMedia>
              <Avatar>
                <AvatarFallback>陈</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>陈可</ItemTitle>
              <ItemDescription>把 Avatar 放进 default 媒体位就行。</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="sm">关注</Button>
            </ItemActions>
          </Item>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 整块可点 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">整块可点：as-child</h2>
        <CardDescription>
          <code>Item</code> 上带了 <code>[a]:hover:bg-accent/50</code>：用
          <code>as-child</code> 把样式交给里面的 <code>&lt;a&gt;</code>，hover 时整块变色。
          要键盘可达记得让子元素本身可聚焦（<code>a</code> / <code>button</code> 天然可以）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Item as-child variant="outline">
          <a href="#" @click.prevent="clickCount++">
            <ItemMedia variant="icon">
              <ThumbsUp />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>点我试试（整块都是链接）</ItemTitle>
              <ItemDescription>hover 有底色，Tab 也能聚焦到。</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRight class="size-4 text-muted-foreground" />
            </ItemActions>
          </a>
        </Item>
        <p class="text-sm text-muted-foreground">
          点击次数：<code>{{ clickCount }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 5. 列表：Group / Separator / Header · Footer -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">列表场景：ItemGroup + Separator</h2>
        <CardDescription>
          <code>ItemGroup</code> 是 <code>role="list"</code>；<code>ItemHeader</code> /
          <code>ItemFooter</code> 带 <code>basis-full</code>，会各自独占一行。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <ItemGroup>
          <template v-for="(f, i) in files" :key="f.name">
            <Item size="sm">
              <ItemMedia variant="icon">
                <component :is="f.icon" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{{ f.name }}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <span class="text-xs text-muted-foreground">{{ f.size }}</span>
                <Button size="icon-xs" variant="ghost" aria-label="下载">
                  <Download />
                </Button>
              </ItemActions>
            </Item>
            <ItemSeparator v-if="i < files.length - 1" />
          </template>
        </ItemGroup>

        <Item variant="outline">
          <ItemHeader>
            <ItemTitle>通知偏好</ItemTitle>
            <Badge :variant="notifyOn ? 'default' : 'secondary'">{{ notifyOn ? '已开启' : '已关闭' }}</Badge>
          </ItemHeader>
          <ItemContent>
            <ItemDescription>Header 独占一行，Content 在中间，Footer 再独占一行。</ItemDescription>
          </ItemContent>
          <ItemFooter>
            <span class="text-xs text-muted-foreground">左说明 · 右操作</span>
            <div class="flex items-center gap-2">
              <Label :for="'item-notify'" class="text-xs">接收推送</Label>
              <Switch id="item-notify" v-model="notifyOn" />
            </div>
          </ItemFooter>
        </Item>

        <Item size="sm" variant="outline">
          <ItemContent>
            <ItemTitle>两个 ItemContent</ItemTitle>
            <ItemDescription>第二个会变 flex-none，做「左标题右数值」。</ItemDescription>
          </ItemContent>
          <ItemContent class="items-end">
            <ItemTitle>¥ 128.00</ItemTitle>
          </ItemContent>
          <ItemActions>
            <Button size="xs" variant="outline">
              <Plus />
              加入
            </Button>
          </ItemActions>
        </Item>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>一共 10 个组件：1 个根 + 6 个部位 + 1 个容器 + 1 条分隔线 + 1 个媒体位。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">Item</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in itemRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">ItemMedia</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in mediaRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.def ?? '' }}</td>
                <td class="py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">其它部位</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in partRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top"><code>{{ row.name }}</code></td>
                <td class="py-2 text-muted-foreground">{{ row.type }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
