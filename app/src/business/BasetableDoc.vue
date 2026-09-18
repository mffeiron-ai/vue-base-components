<script setup lang="ts">
/**
 * 业务组件文档 · BaseTable
 *
 * 本页 demo 完全跑在「假数据 + 模拟服务端」上（app/src/business/mock-table-server.ts）：
 * 筛选 / 排序 / 分页 / 分面计数都走异步接口，能真实看到骨架屏、请求竞态与持久化行为。
 */
import { computed, ref, watch } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BaseTable, summarizeSelection } from '@/components/business'
import type { Column } from '@/components/business'
import {
  CHANNEL_OPTIONS,
  STATUS_OPTIONS,
  fetchOrderFacets,
  fetchOrderPage,
  type AfterSaleRow,
} from './mock-table-server'

// ── 列定义（筛选类型 + 是否可排序 + 初始列宽）──
const columns: Column<AfterSaleRow>[] = [
  { field: 'orderNo', label: '售后单号', width: 160, sortable: true, filter: { type: 'text' } },
  { field: 'productTitle', label: '商品', width: 210, filter: { type: 'text', matchFields: ['orderNo', 'buyer'] } },
  { field: 'channel', label: '渠道', width: 110, type: 'select', options: CHANNEL_OPTIONS, filter: { type: 'select', options: CHANNEL_OPTIONS } },
  { field: 'status', label: '状态', width: 120, sortable: true, type: 'select', options: STATUS_OPTIONS, filter: { type: 'select', options: STATUS_OPTIONS } },
  { field: 'amount', label: '退款金额', width: 120, sortable: true, filter: { type: 'number' }, slot: 'amount' },
  { field: 'commission', label: '佣金', width: 110, sortable: true },
  { field: 'createdAt', label: '申请时间', width: 170, sortable: true, filter: { type: 'date' } },
  { field: 'remark', label: '处理备注', width: 240, type: 'markdown' },
  { field: 'thumb', label: '商品图', width: 100, type: 'image' },
]

// ── 「服务端」状态：demo 自己维护，组件只发语义事件 ──
const tableRef = ref<InstanceType<typeof BaseTable> | null>(null)
const rows = ref<AfterSaleRow[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const sortField = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc' | null>(null)
const filters = ref<Record<string, any>>({})
const selected = ref<(string | number)[]>([])
const keyword = ref('')

// 请求竞态保护：只让最新一次请求落地
let seq = 0
async function load() {
  const my = ++seq
  loading.value = true
  try {
    const res = await fetchOrderPage({
      page: page.value,
      pageSize: pageSize.value,
      sortField: sortField.value,
      sortOrder: sortOrder.value,
      filters: filters.value,
    })
    if (my !== seq) return
    rows.value = res.rows
    total.value = res.total
  } finally {
    if (my === seq) loading.value = false
  }
}
watch([page, pageSize, sortField, sortOrder, filters], load, { deep: true, immediate: true })

/** 分面加载器：mock 内部会排除本列自己的筛选（Excel 语义） */
const facetLoader = (col: Column, kw: string) => fetchOrderFacets(String(col.field), kw, filters.value)

/** 顶部关键词搜索：演示组件暴露的 setColumnFilter（等价「从别的页面带参跳转过来」） */
let kwTimer: ReturnType<typeof setTimeout> | undefined
watch(keyword, (v) => {
  if (kwTimer) clearTimeout(kwTimer)
  kwTimer = setTimeout(() => tableRef.value?.setColumnFilter('productTitle', v.trim()), 300)
})

const detailFields = [
  { label: '售后单号', field: 'orderNo' },
  { label: '商品', field: 'productTitle' },
  { label: '买家', field: 'buyer' },
  { label: '退款金额', field: 'amount' },
  { label: '佣金', field: 'commission' },
  { label: '申请时间', field: 'createdAt' },
  { label: '商品图', field: 'thumb', type: 'image' as const },
]

const selection = computed(() => summarizeSelection(selected.value))
const pageAmountSum = computed(() => rows.value.reduce((sum, r) => sum + r.amount, 0))

// ── 文档表格数据 ──
const propsRows = [
  ['columns', 'Column[]', '—', '列定义：label / field / sortable / filter / type / width / slot…'],
  ['data', 'any[]', '—', '当前页数据（只给这一页，分页交给服务端）'],
  ['idField', 'string', '—', '行主键字段，用于选中与 key'],
  ['page', 'number', '1', '当前页（1 起），配 `v-model:page`'],
  ['pageSize', 'number', '10', '每页条数，配 `v-model:page-size`'],
  ['total', 'number', '—', '匹配总行数（服务端返回）；**传了才显示分页条**，同时决定页数'],
  ['pageSizeOptions', 'number[]', '[10,20,50,100]', '每页条数下拉选项'],
  ['sortField / sortOrder', 'string / "asc"|"desc"|null', 'null', '受控排序；组件只发 `sort-change`，排序本身由服务端做'],
  ['sortFn', '(a,b)=>number', '—', '给了就地排当前 data（客户端模式）；不给则纯服务端'],
  ['loading', 'boolean', 'false', '显示骨架屏（含 minLoadingMs 最短展示，防闪烁）'],
  ['emptyText', 'string', '暂无数据', '空态文案（也可用 `#empty` 插槽）'],
  ['maxHeight', 'string', '72vh', '滚动容器高度，超出后表头固定、表体内部滚动'],
  ['cellMaxLines', 'number', '3', '单元格最多显示行数，超出裁切'],
  ['minColumnWidth', 'number', '60', '列宽拖拽下限（px）'],
  ['clickable', 'boolean', 'false', '首列可点并高亮，点击发 `row-click` / 开详情面板'],
  ['selectable', 'boolean', 'false', '显示行选择列（表头支持半选）'],
  ['selectAll', 'boolean', 'false', '表头勾选 = 跨页全选所有匹配（发 `__all__` 标记）'],
  ['selected', '(string|number)[]', '[]', '已选标记（配 `v-model:selected`），用 `resolveSelected()` 解码'],
  ['detailFields', '{label,field,type?}[]', '—', '提供后点击行弹右侧详情（type: image 走多图 + 大图预览）'],
  ['facetLoader', '(col, kw) => Promise', '—', '分面分组计数（Excel 式），打开筛选面板时懒加载'],
  ['persistKey', 'string', '—', '列宽 + 列序 + 列显隐持久化到 localStorage 的 key'],
]

const eventsRows = [
  ['update:page / page-change', 'number', '页码变化（页大小变化导致回第 1 页时也会发）'],
  ['update:pageSize / page-size-change', 'number', '每页条数变化（旧版本是 `pageSizeChange`，已规范化）'],
  ['sort-change', '{ field, order }', '表头点击循环：升序 → 降序 → 取消（field/order 为 null 表示取消）'],
  ['filter-change', 'Record<string, any>', '筛选参数，协议见下表；收到后请重新请求第 1 页数据'],
  ['update:selected', '(string|number)[]', '选中标记数组，可能含 `__all__` / `__except__:<id>`'],
  ['row-click', 'row', '点击可点击行（clickable）时触发'],
]

const slotsRows = [
  ['search', '—', '工具栏最左侧（放关键词输入框）'],
  ['toolbar', '—', '工具栏自定义按钮区'],
  ['actions', '{ row, ...row }', '行尾操作列（提供后自动多一列）'],
  ['footer', '{ col, columns }', '表尾汇总行，按列渲染（每个 td 都会拿到自己的 col）'],
  ['empty', '—', '空态内容（默认用 emptyText）'],
  ['<col.slot>', 'row / _idx', '列定义里 `slot: "xx"` 对应的单元格插槽'],
]

const exposeRows = [
  ['openDetail(row)', '打开行详情面板（外部触发）'],
  ['setColumnFilter(field, value)', '外部设置某列筛选并重查（带参跳转场景）'],
  ['resetAllFilters()', '清空全部列筛选并重发 filter-change'],
  ['resolveSelected()', '选中语义解码 → { mode, ids, excluded }'],
  ['table', 'TanStack 实例（逃生舱：自定义列 / 直读状态）'],
]

const protocolRows = [
  ['数值区间', '`amount__gte` / `amount__lte`', '列定义 `filter: { type: "number", scale: 100 }` 时前端按倍数换算后再发'],
  ['集合命中', '`status__in=[...]`', '下拉多选、文本分面（勾选值）'],
  ['按天多选', '`createdAt__date__in=[\'2026-08-01\']`', '日期列「按天分布」勾选'],
  ['日期区间', '`createdAt__date__gte` / `__lte`', '日期列手动区间 / 昨天 / 当月快捷键'],
  ['文本模糊', '`productTitle=keyword`', '配 `matchFields: ["orderNo","buyer"]` 时后端一起匹配这些字段'],
]

const migrateRows = [
  ['事件大小写', '`@pageSizeChange`', '`@page-size-change`（同时支持 `v-model:page-size`）'],
  ['分页', '自研 `BasePagination` 业务组件', '直接用 `ui/pagination` 原语，状态由 TanStack 持有'],
  ['表状态', '手写排序 / 列宽 / 列序 / 列显隐', 'TanStack `tableFeatures` 一次注册；列宽列序列显隐走同一份 state'],
  ['持久化', '`bt-cw:` + `bt-co:` 两个 key', '单个 `bt-state:<persistKey>`（含列宽 / 列序 / 列显隐）'],
  ['列宽拖拽起点', '写死 `|| 160`，与推断列宽不一致会跳变', '取「当前真实宽度」，不再跳变'],
  ['空态', '手写 `<TableRow><TableCell :colspan>`', '用库内 `TableEmpty`（自带整行 + 居中，吃预设样式）'],
  ['行内动画', '每行 `ri * 0.03s`，100 行时最后一行等 3 秒', '延迟封顶 + `prefers-reduced-motion` 直接关掉'],
  ['图片详情', '字符串字段会被 `v-for` 逐字符渲染 `<img>`', '`imageList()` 归一化成数组'],
  ['markdown', "`import 'md-editor-v3'` 进首屏", '异步组件：真出现 md 列才加载'],
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">BaseTable 数据表格（业务组件）</h1>
    <p class="mt-3 text-muted-foreground">
      业务组件层的第一块：把 <code>Table</code> / <code>Checkbox</code> / <code>Popover</code> /
      <code>DropdownMenu</code> / <code>Pagination</code> / <code>Sheet</code> 这些原子，按「后台列表页」
      这个场景组合 + 强化出来的成品。<br />
      状态机交给 <strong>TanStack Table</strong>（排序 / 分页 / 列宽 / 列序 / 列显隐），
      渲染全部走库内原子，所以 <strong>8 套风格预设直接生效</strong>；<br />
      业务侧额外的部分：服务端分页与筛选协议、Excel 式分面懒加载、跨页「全选所有匹配」、
      列状态持久化、行详情侧滑。<br />
      本页 demo 跑在<strong>假数据 + 模拟服务端</strong>上（137 条售后单，带随机延迟），
      筛选 / 排序 / 分页都真的走异步接口。
    </p>

    <!-- 1. 快速开始 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">快速开始</h2>
        <CardDescription>
          组件不自己发请求：只把「用户改了什么」发成事件，取数、分页、筛选都留在业务侧。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre v-pre class="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed"><code>&lt;BaseTable
  id-field="id"
  v-model:page="page"
  v-model:page-size="pageSize"
  v-model:selected="selected"
  :columns="columns"
  :data="rows"
  :total="total"
  :loading="loading"
  :facet-loader="facetLoader"
  selectable
  select-all
  clickable
  @sort-change="(p) =&gt; { sortField = p.field; sortOrder = p.order }"
  @filter-change="(f) =&gt; { filters = f }"
/&gt;</code></pre>
        <p class="mt-3 text-sm text-muted-foreground">
          <code>columns</code> 里声明 <code>sortable</code> / <code>filter</code> 就会出现排序与筛选控件；
          <code>total</code> 决定分页条，<code>facetLoader</code> 决定筛选面板是否走「值 + 命中数」。
        </p>
      </CardContent>
    </Card>

    <!-- 2. 可交互 demo -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">可交互 demo（假数据 + 模拟服务端）</h2>
        <CardDescription>
          试试：点表头排序、点筛选图标（分面面板带命中数）、拖动列宽、在「显示/隐藏列」里拖拽换序、
          勾选表头做跨页全选、点首列开详情。刷新页面后<strong>列宽 / 列序 / 列显隐会保留</strong>（persistKey）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BaseTable
          ref="tableRef"
          v-model:page="page"
          v-model:page-size="pageSize"
          v-model:selected="selected"
          id-field="id"
          persist-key="doc-basetable"
          :columns="columns"
          :data="rows"
          :total="total"
          :loading="loading"
          :sort-field="sortField"
          :sort-order="sortOrder"
          :facet-loader="facetLoader"
          :detail-fields="detailFields"
          detail-title="售后单详情"
          max-height="58vh"
          selectable
          select-all
          clickable
          @sort-change="(p) => { sortField = p.field; sortOrder = p.order }"
          @filter-change="(f) => { filters = f }"
        >
          <template #search>
            <Input v-model="keyword" placeholder="商品 / 单号 / 买家" class="w-56" />
          </template>

          <template #toolbar>
            <Button variant="outline" size="sm" @click="tableRef?.resetAllFilters()">重置筛选</Button>
            <Button v-if="selected.length" variant="ghost" size="sm" @click="selected = []">清空选择</Button>
          </template>

          <template #amount="{ row }">
            <span class="tabular-nums">¥{{ Number(row.amount).toFixed(2) }}</span>
          </template>

          <template #actions="{ row }">
            <Button variant="ghost" size="sm" @click.stop="tableRef?.openDetail(row)">详情</Button>
          </template>

          <template #footer="{ col }">
            <span v-if="col.field === 'amount'" class="tabular-nums text-muted-foreground">
              当页合计 ¥{{ pageAmountSum.toFixed(2) }}
            </span>
          </template>
        </BaseTable>

        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">请求：{{ filters }}</Badge>
          <Badge variant="outline">本页 {{ rows.length }} 行 / 共 {{ total }} 条</Badge>
          <Badge variant="outline">
            选中语义：{{ selection.mode === 'all' ? `全部（排除 ${selection.excluded.length} 条）` : `${selection.ids.length} 条` }}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 服务端协议 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">服务端协议（<code>filter-change</code> 发什么）</h2>
        <CardDescription>
          组件只负责把界面上的筛选翻译成参数，参数本身与后端约定；下表的实现就在
          <code>app/src/business/mock-table-server.ts</code> 里，可当接口说明看。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="py-2 pr-4 text-left font-medium">语义</th>
                <th class="py-2 pr-4 text-left font-medium">参数</th>
                <th class="py-2 text-left font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in protocolRows" :key="r[1]" class="border-b last:border-0">
                <td class="py-2 pr-4 whitespace-nowrap">{{ r[0] }}</td>
                <td class="py-2 pr-4"><code class="text-xs">{{ r[1] }}</code></td>
                <td class="py-2 text-muted-foreground">{{ r[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- 4. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">Props</h2>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="py-2 pr-4 text-left font-medium">属性</th>
                <th class="py-2 pr-4 text-left font-medium">类型</th>
                <th class="py-2 pr-4 text-left font-medium">默认</th>
                <th class="py-2 text-left font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in propsRows" :key="r[0]" class="border-b last:border-0">
                <td class="py-2 pr-4 whitespace-nowrap"><code class="text-xs">{{ r[0] }}</code></td>
                <td class="py-2 pr-4 whitespace-nowrap text-muted-foreground"><code class="text-xs">{{ r[1] }}</code></td>
                <td class="py-2 pr-4 whitespace-nowrap text-muted-foreground">{{ r[2] }}</td>
                <td class="py-2 text-muted-foreground" v-html="r[3]"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">事件 / 插槽 / 暴露方法</h2>
        <CardDescription>事件一律 kebab-case；选中语义用 <code>resolveSelected()</code> 解码。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="py-2 pr-4 text-left font-medium">事件</th>
                <th class="py-2 pr-4 text-left font-medium">参数</th>
                <th class="py-2 text-left font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in eventsRows" :key="r[0]" class="border-b last:border-0">
                <td class="py-2 pr-4 whitespace-nowrap"><code class="text-xs">{{ r[0] }}</code></td>
                <td class="py-2 pr-4 whitespace-nowrap text-muted-foreground"><code class="text-xs">{{ r[1] }}</code></td>
                <td class="py-2 text-muted-foreground">{{ r[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="py-2 pr-4 text-left font-medium">插槽</th>
                <th class="py-2 pr-4 text-left font-medium">作用域</th>
                <th class="py-2 text-left font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in slotsRows" :key="r[0]" class="border-b last:border-0">
                <td class="py-2 pr-4 whitespace-nowrap"><code class="text-xs">{{ r[0] }}</code></td>
                <td class="py-2 pr-4 whitespace-nowrap text-muted-foreground"><code class="text-xs">{{ r[1] }}</code></td>
                <td class="py-2 text-muted-foreground">{{ r[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="py-2 pr-4 text-left font-medium">defineExpose</th>
                <th class="py-2 text-left font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in exposeRows" :key="r[0]" class="border-b last:border-0">
                <td class="py-2 pr-4 whitespace-nowrap"><code class="text-xs">{{ r[0] }}</code></td>
                <td class="py-2 text-muted-foreground">{{ r[1] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 升级说明 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">相对老版本的变化</h2>
        <CardDescription>
          老组件（生产里那份）主要是「手写状态 + 自研分页」；这一版把状态交给 TanStack、分页用原子、
          顺手修掉几个已知问题。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="py-2 pr-4 text-left font-medium">方面</th>
                <th class="py-2 pr-4 text-left font-medium">老版本</th>
                <th class="py-2 text-left font-medium">现在</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in migrateRows" :key="r[0]" class="border-b last:border-0">
                <td class="py-2 pr-4 whitespace-nowrap">{{ r[0] }}</td>
                <td class="py-2 pr-4 text-muted-foreground" v-html="r[1]"></td>
                <td class="py-2 text-muted-foreground" v-html="r[2]"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
