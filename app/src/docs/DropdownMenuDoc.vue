<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ---------- 演示状态 ----------
const lastAction = ref('（还没点过）')
const ctrlOpen = ref(false)

/** 勾选项：演示「列显隐」 */
const columns = ref<Record<string, boolean>>({ 状态: true, 邮箱: true, 金额: false })
const visibleColumns = computed(() => Object.entries(columns.value).filter(([, v]) => v).map(([k]) => k))

/** 单选项：演示「密度」 */
const density = ref('comfortable')

// ---------- API ----------
const rootRows = [
  { name: 'v-model:open', type: 'boolean', def: '—', desc: '受控开合；不传就是非受控（点 Trigger 自己开关）' },
  { name: 'default-open', type: 'boolean', def: 'false', desc: '非受控时的初始状态' },
  { name: 'modal', type: 'boolean', def: 'true', desc: '打开时锁住背景滚动与交互；传 false 允许页面继续滚动' },
  { name: 'dir', type: "'ltr' | 'rtl'", def: "'ltr'", desc: '文字方向，键盘左右方向键也会跟着反' },
]

const contentRows = [
  { name: 'align', type: "'start' | 'center' | 'end'", def: "'center'", desc: '相对触发器的水平对齐' },
  { name: 'side / side-offset', type: "'top' | 'right' | 'bottom' | 'left' / number", def: "bottom / 4", desc: '从哪边弹出、与触发器留多少间距' },
  { name: 'class', type: 'string', def: '—', desc: '宽度常改成 w-56；空间不够时面板会自动变矮并内部滚动' },
]

const itemRows = [
  { name: 'inset', type: 'boolean', def: 'false', desc: '菜单项 / 子菜单项 / 标题 左侧多留 8px，与带勾选圆点的项对齐' },
  { name: 'variant', type: "'default' | 'destructive'", def: "'default'", desc: 'destructive 用于删除这类危险操作（文字与焦点态转红）' },
  { name: '@select', type: '(e) => void', def: '—', desc: '选中时触发；`@select.prevent` 可阻止菜单自动关闭（勾选项常用）' },
  { name: 'CheckboxItem v-model', type: 'boolean', def: 'false', desc: '可勾选项（多选），勾号固定在左侧，图标可用 #indicator-icon 插槽换' },
  { name: 'RadioGroup v-model + RadioItem value', type: 'string | number', def: '—', desc: '单选组：选中项左侧显示实心圆点' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '任意项都支持禁用（变淡且不可点）' },
]

const partRows = [
  { name: 'DropdownMenuTrigger', type: 'as-child', desc: '触发器，默认渲染 <button>；as-child 可包住自己的 Button' },
  { name: 'DropdownMenuLabel', type: 'inset', desc: '分组标题（不可点）' },
  { name: 'DropdownMenuGroup', type: '—', desc: '一组菜单项，通常配一个 Label' },
  { name: 'DropdownMenuSeparator', type: '—', desc: '分隔线' },
  { name: 'DropdownMenuShortcut', type: '—', desc: '右侧快捷键提示（纯样式，不会真的注册快捷键）' },
  { name: 'DropdownMenuSub / SubTrigger / SubContent', type: 'inset', desc: '二级子菜单；弹出方向由 reka 自动计算' },
  { name: 'DropdownMenuPortal', type: '—', desc: '直接透出 reka 的 Portal，需要自定义挂载位置时用' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Dropdown Menu 下拉菜单</h1>
    <p class="mt-3 text-muted-foreground">
      点击触发的菜单面板（右键触发的场景用 Context Menu）。<br />
      <code>DropdownMenu</code> 包住 <code>DropdownMenuTrigger</code> + <code>DropdownMenuContent</code>，<br />
      内容里可以混用普通项、可勾选项、单选组、二级子菜单、分隔线与快捷键提示；<br />
      面板会自动做「空间不够就变矮并内部滚动」和碰撞翻转，不用手调位置。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>标题 + 普通项 + 分隔线 + 快捷键提示；点任意一项都会关闭菜单。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">打开菜单</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56" align="start">
            <DropdownMenuLabel>我的账号</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem @select="lastAction = '个人资料'">
                个人资料
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem @select="lastAction = '账单'">
                账单
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem @select="lastAction = '设置'">
                设置
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem inset @select="lastAction = '退出登录'">退出登录</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <code class="text-sm text-muted-foreground">最近操作：{{ lastAction }}</code>
      </CardContent>
    </Card>

    <!-- 2. 勾选项 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">可勾选项（多选）</h2>
        <CardDescription>
          典型场景是控制列表显示哪些列。注意要加 <code>@select.prevent</code>，否则勾一下菜单就关了。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">显示列</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-48" align="start">
            <DropdownMenuLabel>表格列</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              v-for="(v, key) in columns"
              :key="key"
              v-model="columns[key]"
              @select.prevent
            >
              {{ key }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div class="flex flex-wrap items-center gap-2">
          <Badge v-for="c in visibleColumns" :key="c" variant="secondary">{{ c }}</Badge>
          <code class="text-sm text-muted-foreground">{{ visibleColumns.length }} 列可见</code>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 单选组 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">单选组（RadioGroup）</h2>
        <CardDescription>一组里只能选一个，选中项左侧显示实心圆点；配合 Label 显示当前值。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">表格密度</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-48" align="start">
            <DropdownMenuLabel inset>行高</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup v-model="density">
              <DropdownMenuRadioItem value="compact">紧凑</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="comfortable">舒适</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="loose">宽松</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <code class="text-sm text-muted-foreground">当前：{{ density }}</code>
      </CardContent>
    </Card>

    <!-- 4. 子菜单 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">二级子菜单</h2>
        <CardDescription>悬停或按右方向键展开；面板方向会按剩余空间自动翻转。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">更多操作</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56" align="start">
            <DropdownMenuItem @select="lastAction = '重命名'">重命名</DropdownMenuItem>
            <DropdownMenuItem @select="lastAction = '复制链接'">复制链接</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>导出为</DropdownMenuSubTrigger>
              <DropdownMenuSubContent class="w-40">
                <DropdownMenuItem @select="lastAction = '导出 CSV'">CSV</DropdownMenuItem>
                <DropdownMenuItem @select="lastAction = '导出 Excel'">Excel</DropdownMenuItem>
                <DropdownMenuItem @select="lastAction = '导出 JSON'">JSON</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>移动到</DropdownMenuSubTrigger>
              <DropdownMenuSubContent class="w-40">
                <DropdownMenuItem @select="lastAction = '移动到归档'">归档</DropdownMenuItem>
                <DropdownMenuItem inset @select="lastAction = '移动到回收站'">回收站</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
        <code class="text-sm text-muted-foreground">最近操作：{{ lastAction }}</code>
      </CardContent>
    </Card>

    <!-- 5. 危险项 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">危险操作与禁用项</h2>
        <CardDescription>
          <code>variant="destructive"</code> 让删除这类操作变红；任意项都可以 <code>disabled</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">行操作</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-52" align="start">
            <DropdownMenuItem @select="lastAction = '编辑'">编辑</DropdownMenuItem>
            <DropdownMenuItem disabled>移动（无权限）</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" @select="lastAction = '已删除'">删除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>

    <!-- 6. 受控 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控开合（v-model:open）</h2>
        <CardDescription>状态拿到外面后，可以用代码打开菜单（例如引导流程、快捷键唤起）。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <DropdownMenu v-model:open="ctrlOpen">
          <DropdownMenuContent class="w-44" align="start">
            <DropdownMenuItem @select="lastAction = '受控项'">受控菜单里的项</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" @click="ctrlOpen = !ctrlOpen">{{ ctrlOpen ? '关闭菜单' : '用代码打开' }}</Button>
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
          <p class="mb-2 text-sm font-medium"><code>DropdownMenu</code>（根）</p>
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
          <p class="mb-2 text-sm font-medium"><code>DropdownMenuContent</code></p>
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
          <p class="mb-2 text-sm font-medium">菜单项</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="row in itemRows" :key="row.name" class="border-b border-border last:border-0">
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
          <p class="mb-2 text-sm font-medium">其余子组件</p>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li v-for="row in partRows" :key="row.name">
              · <code>{{ row.name }}</code>：{{ row.desc }}
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
