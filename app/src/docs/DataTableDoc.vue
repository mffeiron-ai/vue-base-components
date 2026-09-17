<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import {
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  stockFeatures,
  tableFeatures,
  useTable,
} from '@tanstack/vue-table'
import { sortFn_alphanumeric, sortFn_text } from '@tanstack/vue-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableViewOptions,
} from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { valueUpdater } from '@/components/ui/table/utils'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ---------- 1. 基础用法 ----------
const invoices = [
  { id: 'INV-001', status: '已支付', method: '信用卡', amount: 316 },
  { id: 'INV-002', status: '待处理', method: '微信支付', amount: 242 },
  { id: 'INV-003', status: '已支付', method: '对公转账', amount: 837 },
  { id: 'INV-004', status: '已取消', method: '信用卡', amount: 99 },
]
const total = computed(() => invoices.reduce((sum, i) => sum + i.amount, 0))

// ---------- 2. 数据表格：排序 / 筛选 / 分页 ----------
type Row = { id: string, name: string, email: string, amount: number, status: '已支付' | '待处理' | '已取消' }
const people: Row[] = [
  { id: 'T-1001', name: '林舟', email: 'linzhou@example.com', amount: 1280, status: '已支付' },
  { id: 'T-1002', name: '陈见山', email: 'chenjs@example.com', amount: 860, status: '待处理' },
  { id: 'T-1003', name: '苏晓', email: 'suxiao@example.com', amount: 2340, status: '已支付' },
  { id: 'T-1004', name: '徐一鸣', email: 'xuym@example.com', amount: 420, status: '已取消' },
  { id: 'T-1005', name: '何洲', email: 'hezhou@example.com', amount: 1580, status: '待处理' },
  { id: 'T-1006', name: '顾南', email: 'gunan@example.com', amount: 990, status: '已支付' },
  { id: 'T-1007', name: '郑怀', email: 'zhenghuai@example.com', amount: 1760, status: '已支付' },
  { id: 'T-1008', name: '白露', email: 'bailu@example.com', amount: 640, status: '已取消' },
  { id: 'T-1009', name: '沈青禾', email: 'shenqh@example.com', amount: 3020, status: '待处理' },
  { id: 'T-1010', name: '袁野', email: 'yuanye@example.com', amount: 1180, status: '已支付' },
  { id: 'T-1011', name: '骆书文', email: 'luosw@example.com', amount: 380, status: '已取消' },
  { id: 'T-1012', name: '季明', email: 'jiming@example.com', amount: 2050, status: '已支付' },
]

const keyword = ref('')
const sortKey = ref<'name' | 'amount' | ''>('')
const sortDesc = ref(false)
const pageSize = ref('5')
const page = ref(1)
const selected = ref<string[]>([])

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  const list = k
    ? people.filter((p) => p.name.toLowerCase().includes(k) || p.email.toLowerCase().includes(k) || p.status.includes(k))
    : [...people]
  if (sortKey.value) {
    list.sort((a, b) => {
      const x = a[sortKey.value as 'name' | 'amount']
      const y = b[sortKey.value as 'name' | 'amount']
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))
      return sortDesc.value ? -r : r
    })
  }
  return list
})
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / Number(pageSize.value))))
const paged = computed(() => {
  const size = Number(pageSize.value)
  const start = (Math.min(page.value, pageCount.value) - 1) * size
  return filtered.value.slice(start, start + size)
})

function toggleSort(key: 'name' | 'amount') {
  if (sortKey.value === key) sortDesc.value = !sortDesc.value
  else {
    sortKey.value = key
    sortDesc.value = false
  }
}
function sortIcon(key: 'name' | 'amount') {
  if (sortKey.value !== key) return ChevronsUpDown
  return sortDesc.value ? ArrowDown : ArrowUp
}

const allChecked = computed(() => paged.value.length > 0 && paged.value.every((r) => selected.value.includes(r.id)))
const someChecked = computed(() => paged.value.some((r) => selected.value.includes(r.id)) && !allChecked.value)
function toggleAll(checked: boolean) {
  const ids = paged.value.map((r) => r.id)
  selected.value = checked
    ? [...new Set([...selected.value, ...ids])]
    : selected.value.filter((id) => !ids.includes(id))
}
function toggleRow(id: string, checked: boolean) {
  selected.value = checked ? [...selected.value, id] : selected.value.filter((x) => x !== id)
}

// ---------- 3. 固定高度滚动 ----------
const logs = Array.from({ length: 14 }, (_, i) => ({
  time: `09:${String(i * 3 + 2).padStart(2, '0')}`,
  level: i % 4 === 0 ? 'WARN' : 'INFO',
  message: `同步任务 #${1000 + i} 完成，写入 ${(i + 1) * 12} 条记录`,
}))

// ---------- 4. TanStack 驱动（排序 / 分面筛选 / 分页 / 列显隐 / 行选择） ----------
// TanStack 状态用 reactive 容器直接持有：v9 的 Vue 适配器不会解包传进 state 的 ref（
// 传 ref 会让内部拿到 Ref 对象，getIsSorted() 之类直接报 "x.find is not a function"）
const tsState: any = reactive({
  sorting: [] as { id: string, desc: boolean }[],
  columnFilters: [] as { id: string, value: unknown }[],
  columnVisibility: {} as Record<string, boolean>,
  rowSelection: {} as Record<string, boolean>,
  pagination: { pageIndex: 0, pageSize: 5 },
})

// TanStack 的 onXxxChange 回调收到的是 Updater（值或函数），统一在这里落地
function applyTs<K extends keyof typeof tsState>(key: K, updater: any) {
  const cur = tsState[key]
  tsState[key] = typeof updater === 'function' ? updater(cur) : updater
}

// 列定义就是 TanStack 那套：header / cell 支持字符串、模板函数或组件
const tsColumns: any[] = [
  {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }: any) => h(Checkbox, {
      modelValue: table.getIsAllPageRowsSelected(),
      indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (v: any) => table.toggleAllPageRowsSelected(!!v),
      'aria-label': '全选',
    }),
    cell: ({ row }: any) => h(Checkbox, {
      modelValue: row.getIsSelected(),
      'onUpdate:modelValue': (v: any) => row.toggleSelected(!!v),
      'aria-label': `选择 ${row.getValue('name')}`,
    }),
  },
  {
    accessorKey: 'name',
    header: '姓名',
    cell: ({ row }: any) => h('span', { class: 'font-medium' }, row.getValue('name')),
  },
  { accessorKey: 'email', header: '邮箱', cell: ({ row }: any) => h('span', { class: 'text-muted-foreground' }, row.getValue('email')) },
  {
    accessorKey: 'status',
    header: '状态',
    // 自定义筛选：相等匹配（分面选项就是拿它算出来的）
    filterFn: (row: any, id: string, value: string) => !value || row.getValue(id) === value,
    cell: ({ row }: any) => h(Badge, {
      variant: row.getValue('status') === '已支付' ? 'default' : row.getValue('status') === '待处理' ? 'secondary' : 'outline',
    }, () => row.getValue('status')),
  },
  {
    accessorKey: 'amount',
    // 自定义表头组件：DataTableColumnHeader 里是排序菜单（升序 / 降序 / 清除）
    header: ({ column }: any) => h(DataTableColumnHeader, { column, title: '金额' }),
    cell: ({ row }: any) => h('span', { class: 'tabular-nums' }, row.getValue('amount')),
  },
]

// TanStack v9：功能区（排序 / 筛选 / 分面 / 分页 / 列显隐 / 行选择）与各 row model 都在
// tableFeatures({...}) 里一次性注册，就地放在组件外，避免每次渲染重建
const tsFeatures = tableFeatures({
  ...stockFeatures,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  // 排序函数登记表：列定义里 sortingFn 用这些名字（不登记会有 "sortFn 'text' is not registered" 警告）
  sortFns: { text: sortFn_text, alphanumeric: sortFn_alphanumeric },
})

const tanstackTable = useTable({
  features: tsFeatures,
  data: people,
  columns: tsColumns,
  state: tsState,
  onSortingChange: (u: any) => applyTs('sorting', u),
  onColumnFiltersChange: (u: any) => applyTs('columnFilters', u),
  onColumnVisibilityChange: (u: any) => applyTs('columnVisibility', u),
  onRowSelectionChange: (u: any) => applyTs('rowSelection', u),
  onPaginationChange: (u: any) => applyTs('pagination', u),
})

// 分面筛选：候选值 + 计数直接来自 faceted unique values
const statusColumn = () => tanstackTable.getAllColumns?.().find((c: any) => c.id === 'status')
const statusOptions = computed(() =>
  [...(statusColumn()?.getFacetedUniqueValues?.() ?? new Map()).entries()].map(([value, count]) => ({ value: String(value), count: Number(count) })),
)
const activeStatus = computed(() => (tsState.columnFilters.find((f: any) => f.id === 'status')?.value as string) ?? '')
function setStatus(value: string) {
  const next = value === activeStatus.value ? '' : value
  tsState.columnFilters = next ? [{ id: 'status', value: next }] : []
  tsState.pagination.pageIndex = 0
}

// ---------- API ----------
const rows = [
  { name: 'Table', prop: 'maxHeight', def: '—', desc: '容器最大高度（如 "20rem"）：超出只在容器内滚动，配 TableHeader 的 sticky 可固定表头' },
  { name: 'TableHeader', prop: 'class', def: '—', desc: 'thead；固定表头加 sticky top-0 z-10 bg-background' },
  { name: 'TableBody', prop: 'class', def: '—', desc: 'tbody，最后一行自动去掉下边框' },
  { name: 'TableFooter', prop: 'class', def: '—', desc: 'tfoot，常用于合计行（浅底 + 上边框 + 加粗）' },
  { name: 'TableRow', prop: 'data-state', def: '—', desc: "选中行传 data-state=\"selected\" 即套用 bg-muted（自带 hover 底色）" },
  { name: 'TableHead', prop: 'class', def: '—', desc: 'th；内置「放 Checkbox 时」的右内边距收紧与垂直微调' },
  { name: 'TableCell', prop: 'class', def: '—', desc: 'td；长文本默认换行断词，不会撑爆表格' },
  { name: 'TableCaption', prop: 'class', def: '—', desc: 'caption，放在表格底部当说明' },
  { name: 'TableEmpty', prop: 'colspan', def: '1', desc: '空状态整行（自带 TableRow + TableCell，内容居中）；colspan 要传表格列数' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Data Table 数据表格</h1>
    <p class="mt-3 text-muted-foreground">
      表格由一组纯 HTML 语义标签的包装组件组成（<code>Table</code> / <code>TableHead</code> …），<br />
      本身不依赖任何 headless 库。数据表格有两种用法：<br />
      第 2 节是<strong>不引依赖</strong>的最小实现（纯 Vue 的排序 / 筛选 / 分页 / 行选择，几十到几百行数据够用）；<br />
      第 4 节是 <strong>TanStack 驱动</strong>——本仓库已把 <code>@tanstack/vue-table</code><br />
      作为<strong>可选 peer 依赖</strong>（不用数据表格的项目不必安装），<br />
      <code>src/components/ui/data-table/</code> 提供渲染层与配套组件，<br />
      列显隐、拖拽宽度、分面筛选、服务端分页、虚拟滚动都能直接接。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>Table</code> → <code>TableHeader</code> / <code>TableBody</code> /
          <code>TableFooter</code> → <code>TableRow</code> → <code>TableHead</code> /
          <code>TableCell</code>，底部说明用 <code>TableCaption</code>。
          行自带 hover 底色，最后一行自动去边框。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table class="rounded-lg border border-input">
          <TableCaption>示例数据，金额单位：元</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[120px]">单号</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>支付方式</TableHead>
              <TableHead class="text-right">金额</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="i in invoices" :key="i.id">
              <TableCell class="font-medium">{{ i.id }}</TableCell>
              <TableCell>
                <Badge :variant="i.status === '已支付' ? 'default' : i.status === '待处理' ? 'secondary' : 'outline'">
                  {{ i.status }}
                </Badge>
              </TableCell>
              <TableCell class="text-muted-foreground">{{ i.method }}</TableCell>
              <TableCell class="text-right tabular-nums">{{ i.amount.toFixed(2) }}</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colspan="3">合计</TableCell>
              <TableCell class="text-right tabular-nums">{{ total.toFixed(2) }}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>

    <!-- 2. 数据表格 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">排序、筛选、分页与行选择</h2>
        <CardDescription>
          纯 Vue 实现：表头点一下切换升 / 降序（图标跟着变），输入框同时过滤姓名 / 邮箱 / 状态，
          每页条数用 <code>Select</code> 切换；勾选行后行底色变浅（<code>data-state="selected"</code>），
          表头复选框支持半选。筛不出结果时走 <code>TableEmpty</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <Input v-model="keyword" placeholder="搜索姓名 / 邮箱 / 状态…" class="max-w-xs" />
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span>每页</span>
            <Select v-model="pageSize">
              <SelectTrigger class="w-[84px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
            <span>条</span>
          </div>
        </div>

        <Table class="rounded-lg border border-input">
          <TableHeader>
            <TableRow>
              <TableHead class="w-[44px]">
                <Checkbox
                  :model-value="allChecked"
                  :indeterminate="someChecked"
                  aria-label="全选"
                  @update:model-value="(v) => toggleAll(!!v)"
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" class="-ml-2.5 h-8" @click="toggleSort('name')">
                  姓名
                  <component :is="sortIcon('name')" class="size-4" />
                </Button>
              </TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" class="-ml-2.5 h-8" @click="toggleSort('amount')">
                  金额
                  <component :is="sortIcon('amount')" class="size-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="r in paged"
              :key="r.id"
              :data-state="selected.includes(r.id) ? 'selected' : undefined"
            >
              <TableCell>
                <Checkbox
                  :model-value="selected.includes(r.id)"
                  :aria-label="`选择 ${r.name}`"
                  @update:model-value="(v) => toggleRow(r.id, !!v)"
                />
              </TableCell>
              <TableCell class="font-medium">{{ r.name }}</TableCell>
              <TableCell class="text-muted-foreground">{{ r.email }}</TableCell>
              <TableCell>
                <Badge :variant="r.status === '已支付' ? 'default' : r.status === '待处理' ? 'secondary' : 'outline'">
                  {{ r.status }}
                </Badge>
              </TableCell>
              <TableCell class="text-right tabular-nums">{{ r.amount }}</TableCell>
            </TableRow>
            <TableEmpty v-if="!paged.length" :colspan="5">
              没有匹配的记录，换个关键词试试。
            </TableEmpty>
          </TableBody>
        </Table>

        <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            共 {{ filtered.length }} 条 · 已选 <Badge variant="secondary">{{ selected.length }}</Badge> 条 ·
            第 {{ Math.min(page, pageCount) }} / {{ pageCount }} 页
          </span>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" :disabled="page <= 1" @click="page--">上一页</Button>
            <Button variant="outline" size="sm" :disabled="page >= pageCount" @click="page++">下一页</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 固定高度滚动 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">固定高度滚动 + 固定表头</h2>
        <CardDescription>
          给 <code>Table</code> 传 <code>max-height</code> 后滚动只发生在容器内，
          再给 <code>TableHeader</code> 加 <code>sticky top-0 z-10 bg-background</code> 就能固定表头。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table class="rounded-lg border border-input" max-height="16rem">
          <TableHeader class="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead class="w-[80px]">时间</TableHead>
              <TableHead class="w-[90px]">级别</TableHead>
              <TableHead>内容</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="l in logs" :key="l.time">
              <TableCell class="tabular-nums text-muted-foreground">{{ l.time }}</TableCell>
              <TableCell>
                <Badge :variant="l.level === 'WARN' ? 'destructive' : 'secondary'">{{ l.level }}</Badge>
              </TableCell>
              <TableCell>{{ l.message }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- 4. TanStack 驱动 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">TanStack 驱动：排序 / 分面筛选 / 分页 / 列显隐 / 行选择</h2>
        <CardDescription>
          这一节用 <code>@tanstack/vue-table</code>（本仓库的<strong>可选依赖</strong>）：状态全交给它，
          <code>DataTable</code> 只负责渲染。列头点开有排序菜单（按住 Shift 点第二列可多列排序），
          下面那排状态标签是从数据里算出来的<strong>分面选项 + 计数</strong>，
          右侧按钮管列显隐；分页条里的 <code>pageIndex / pageSize</code> 就是服务端分页要的参数
          （服务端分页时把 <code>manualPagination</code> 打开、自己给 <code>rowCount</code> 即可）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable :table="tanstackTable" max-height="22rem">
          <template #toolbar>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <Button
                  v-for="opt in statusOptions"
                  :key="opt.value"
                  size="sm"
                  :variant="activeStatus === opt.value ? 'default' : 'outline'"
                  class="gap-1.5"
                  @click="setStatus(opt.value)"
                >
                  {{ opt.value }}
                  <Badge variant="secondary">{{ opt.count }}</Badge>
                </Button>
                <Button v-if="activeStatus" variant="ghost" size="sm" @click="setStatus('')">
                  清除筛选
                </Button>
              </div>
              <DataTableViewOptions :table="tanstackTable" />
            </div>
          </template>

          <template #footer>
            <DataTablePagination :table="tanstackTable" />
          </template>
        </DataTable>

        <p class="mt-3 text-sm text-muted-foreground">
          当前排序：<code>{{ tsState.sorting.map((s: any) => `${s.id} ${s.desc ? 'desc' : 'asc'}`).join(' → ') || '（无）' }}</code>
          · 筛选：<code>{{ tsState.columnFilters.length ? JSON.stringify(tsState.columnFilters) : '（无）' }}</code>
          · 每页 <code>{{ tsState.pagination.pageSize }}</code> / 第 <code>{{ tsState.pagination.pageIndex + 1 }}</code> 页
        </p>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription>
          全部是原生标签的样式包装，除 <code>Table</code> 的 <code>maxHeight</code> 与
          <code>TableEmpty</code> 的 <code>colspan</code> 外都只有 <code>class</code>；
          props / 属性会透传到对应标签上。
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              <tr v-for="r in rows" :key="r.name" class="border-b border-border last:border-0">
                <td class="px-4 py-2 font-mono text-foreground">{{ r.name }}</td>
                <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.prop }}</td>
                <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.def }}</td>
                <td class="px-4 py-2 text-muted-foreground">{{ r.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-2 text-sm text-muted-foreground">
          预设（style-*.css）里的钩子：<code>table-container</code>、<code>table</code>、
          <code>table-header</code>、<code>table-body</code>、<code>table-footer</code>、
          <code>table-row</code>、<code>table-head</code>、<code>table-cell</code>、
          <code>table-caption</code>。
          另外 <code>src/components/ui/table/utils.ts</code> 里的 <code>valueUpdater</code>
          是受控状态的桥接工具（把 TanStack 的 updater 写回 ref），第 4 节的 TanStack 表格就用它；
          它依赖的可选包 <code>@tanstack/vue-table</code> 已随 data-table 组件一起装好。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
