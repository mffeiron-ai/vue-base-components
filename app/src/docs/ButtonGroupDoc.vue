<script setup lang="ts">
import { ArrowLeft, ArrowRight, Bold, ChevronDown, Clipboard, Italic, Scissors, Search, Underline } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const rows = [
  { name: 'ButtonGroup', props: 'orientation, class', def: 'horizontal', desc: '组容器；相邻子元素的圆角与边框会自动拼接成一个整体' },
  { name: 'ButtonGroupSeparator', props: 'orientation, decorative, class', def: 'vertical', desc: '组内分隔线；默认竖向、纯装饰（不加无障碍角色）' },
  { name: 'ButtonGroupText', props: 'as / asChild, orientation, class', def: "as='div'", desc: '组内文本标签，可与 Input 搭配；as-child 可把 Label 当成标签' },
  { name: 'Button / Input / Select 等', props: '—', def: '—', desc: '直接放进组的默认插槽即可，组负责对齐与拼接' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Button Group 按钮组</h1>
    <p class="mt-3 text-muted-foreground">把相关按钮（也可混入 Input / Select / Dropdown）拼成一个整体，自动合并接缝处的圆角与边框。</p>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">基础用法</CardTitle>
        <CardDescription>把若干 `Button` 放进组的默认插槽，接缝处会自动去掉内侧圆角与边框。</CardDescription>
      </CardHeader>
      <CardContent>
        <ButtonGroup>
          <Button variant="outline">复制</Button>
          <Button variant="outline">粘贴</Button>
          <Button variant="outline">剪切</Button>
        </ButtonGroup>
      </CardContent>
    </Card>

    <!-- 方向 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">方向</CardTitle>
        <CardDescription>`orientation="vertical"` 改为纵向拼接（合并的是上下两端的圆角与上边框）。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-start gap-8">
          <ButtonGroup>
            <Button variant="outline">上一页</Button>
            <Button variant="outline">下一页</Button>
          </ButtonGroup>
          <ButtonGroup orientation="vertical">
            <Button variant="outline">
              <ArrowLeft /> 上一页
            </Button>
            <Button variant="outline">
              下一页 <ArrowRight />
            </Button>
          </ButtonGroup>
        </div>
      </CardContent>
    </Card>

    <!-- 尺寸 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">尺寸</CardTitle>
        <CardDescription>尺寸写在各个 `Button` 上；建议同一组内保持相同尺寸。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-4">
          <ButtonGroup>
            <Button variant="outline" size="sm">Small</Button>
            <Button variant="outline" size="sm">Small</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline">Default</Button>
            <Button variant="outline">Default</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline" size="lg">Large</Button>
            <Button variant="outline" size="lg">Large</Button>
          </ButtonGroup>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <ButtonGroup>
            <Button variant="outline" size="icon" aria-label="加粗"><Bold /></Button>
            <Button variant="outline" size="icon" aria-label="斜体"><Italic /></Button>
            <Button variant="outline" size="icon" aria-label="下划线"><Underline /></Button>
          </ButtonGroup>
        </div>
      </CardContent>
    </Card>

    <!-- 分隔符 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">分隔符</CardTitle>
        <CardDescription>`outline` 本身有边框、不需要分隔符；其他变体用 `ButtonGroupSeparator` 划分层次。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-4">
          <ButtonGroup>
            <Button variant="secondary">左对齐</Button>
            <ButtonGroupSeparator />
            <Button variant="secondary">居中</Button>
            <ButtonGroupSeparator />
            <Button variant="secondary">右对齐</Button>
          </ButtonGroup>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <ButtonGroup>
            <Button>复制链接</Button>
            <ButtonGroupSeparator />
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button size="icon" aria-label="更多操作"><ChevronDown /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>复制</DropdownMenuItem>
                <DropdownMenuItem>剪切</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Clipboard /> 粘贴
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Scissors /> 剪切全部
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
          <span class="text-sm text-muted-foreground">拆分按钮（split button）</span>
        </div>
      </CardContent>
    </Card>

    <!-- 嵌套 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">嵌套</CardTitle>
        <CardDescription>组里再放组，外层会自动给内层之间留出间距 —— 用来做「同组但语义不同」的两段。</CardDescription>
      </CardHeader>
      <CardContent>
        <ButtonGroup>
          <ButtonGroup>
            <Button variant="outline" size="icon" aria-label="撤销"><ArrowLeft /></Button>
            <Button variant="outline" size="icon" aria-label="重做"><ArrowRight /></Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline" size="icon" aria-label="复制"><Clipboard /></Button>
            <Button variant="outline" size="icon" aria-label="剪切"><Scissors /></Button>
          </ButtonGroup>
        </ButtonGroup>
      </CardContent>
    </Card>

    <!-- 组合 Input -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">组合 Input</CardTitle>
        <CardDescription>组内的 `Input` 会自动占满剩余宽度；配 `ButtonGroupText` 可做前置标签（`as-child` 时甚至能直接套 `Label`）。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <ButtonGroup>
          <Input placeholder="搜索组件…" />
          <Button variant="outline" aria-label="搜索"><Search /></Button>
        </ButtonGroup>
        <ButtonGroup>
          <ButtonGroupText as-child>
            <Label for="bg-site">https://</Label>
          </ButtonGroupText>
          <Input id="bg-site" placeholder="example.com" />
          <Button variant="outline">访问</Button>
        </ButtonGroup>
      </CardContent>
    </Card>

    <!-- 组合 Select -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">组合 Select</CardTitle>
        <CardDescription>组内的 `Select` 触发器宽度自动收缩为内容宽，和相邻按钮拼在一起。</CardDescription>
      </CardHeader>
      <CardContent>
        <ButtonGroup>
          <Select default-value="vue">
            <SelectTrigger aria-label="框架">
              <SelectValue placeholder="选择框架" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vue">Vue</SelectItem>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="svelte">Svelte</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">查看文档</Button>
        </ButtonGroup>
      </CardContent>
    </Card>

    <!-- 无障碍 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">无障碍</CardTitle>
        <CardDescription>组容器带 `role="group"`；当组内按钮是纯图标、或整组需要上下文时，补一个 `aria-label`。</CardDescription>
      </CardHeader>
      <CardContent>
        <ButtonGroup aria-label="文本格式化">
          <Button variant="outline" size="icon" aria-label="加粗"><Bold /></Button>
          <Button variant="outline" size="icon" aria-label="斜体"><Italic /></Button>
          <Button variant="outline" size="icon" aria-label="下划线"><Underline /></Button>
        </ButtonGroup>
      </CardContent>
    </Card>

    <!-- 与 ToggleGroup 的区别 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">Button Group 还是 Toggle Group？</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2 text-sm text-muted-foreground">
        <p>· 一组按钮各自触发一个「动作」→ 用 <span class="font-medium text-foreground">Button Group</span>（本组件）。</p>
        <p>· 按钮代表「有选中/未选中状态」的选项（类似单选 / 多选）→ 用 <span class="font-medium text-foreground">Toggle Group</span>，它自带 `type`、`model-value` 等状态能力。</p>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">API / Props</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="overflow-x-auto rounded-lg">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/40 text-left">
                <th class="px-4 py-2 font-medium">组件</th>
                <th class="px-4 py-2 font-medium">属性</th>
                <th class="px-4 py-2 font-medium">默认值</th>
                <th class="px-4 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.name" class="border-b border-border last:border-0">
                <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.props }}</td>
                <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm text-muted-foreground">
          组的拼接依赖子元素的 `data-slot`：`Button` / `Input` / `SelectTrigger` 等已内置，自定义元素请补上 `data-slot`。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
