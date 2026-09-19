<script setup lang="ts">
/**
 * RichTable 的「纯组件」演示（文档页第一个 Tab）
 *
 * 布局：组件本体留在正文里（就是它该待的位置），「能力开关」是**侧栏卡片** ——
 * 通过 Teleport 塞进 DocsLayout 右栏的 `#docs-aside-extra` 挂载点，
 * 跟「业务组件」「交互」那些分类卡同级；x 以下没有右栏时，回退到表格下方。
 *
 * 数据侧仍然是假数据 + 模拟服务端（./mock-table-server.ts）：
 * 筛选 / 排序 / 分页 / 分面计数都走异步接口，页面只维护「服务端状态」并把事件接起来。
 */
import { computed, reactive, ref, watch } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RichTable, summarizeSelection } from '@/components/business'
import type { Column } from '@/components/business'
import TableCapabilityPanel from './TableCapabilityPanel.vue'
import {
  CHANNEL_OPTIONS,
  STATUS_OPTIONS,
  fetchOrderFacets,
  fetchOrderPage,
  type AfterSaleRow,
} from './mock-table-server'

// ============================================================
// 1. 能力开关（侧栏面板里操作，全部平移到组件的 props / 列定义上）
// ============================================================

const DEFAULT_CAPS = {
  selectable: true,
  selectAll: true,
  sortable: true,
  filterable: true,
  columnSettings: true,
  resizable: true,
  rowDetail: true,
  pagination: true,
  fixedHeight: true,
}

const caps = reactive({ ...DEFAULT_CAPS })

type CapKey = keyof typeof DEFAULT_CAPS

const CAPS: { key: CapKey, label: string, hint: string, dep?: CapKey }[] = [
  { key: 'selectable', label: '行选择', hint: '左侧勾选框列 + 半选' },
  { key: 'selectAll', label: '跨页全选', hint: '表头勾选 = 全部匹配', dep: 'selectable' },
  { key: 'sortable', label: '表头排序', hint: '点表头：升 → 降 → 取消' },
  { key: 'filterable', label: '表头筛选', hint: '筛选图标 + 分面面板' },
  { key: 'columnSettings', label: '列显隐菜单', hint: '含拖拽调列序' },
  { key: 'resizable', label: '列宽拖拽', hint: '鼠标移到表头右缘' },
  { key: 'rowDetail', label: '行详情', hint: '点首列开右侧面板' },
  { key: 'pagination', label: '分页条', hint: '不传 total 就没有' },
  { key: 'fixedHeight', label: '固定高度', hint: '超高时表头吸顶滚动' },
]

// ============================================================
// 2. 列定义（sortable / filter 由开关决定，其余不变）
// ============================================================

const baseColumns: Column<AfterSaleRow>[] = [
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

const columns = computed<Column<AfterSaleRow>[]>(() => baseColumns.map((col) => {
  const next: Column<AfterSaleRow> = { ...col }
  if (!caps.sortable) delete next.sortable
  if (!caps.filterable) delete next.filter
  return next
}))

// ============================================================
// 3. 「服务端」状态：页面自己维护，组件只发语义事件
// ============================================================

const tableRef = ref<InstanceType<typeof RichTable> | null>(null)
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

// 关掉某项能力时，顺手把依赖它的状态清掉（否则会出现「看不见但还在生效」的筛选/选中）
watch(() => caps.filterable, (on) => {
  if (!on) {
    filters.value = {}
    tableRef.value?.resetAllFilters()
  }
})
watch(() => caps.selectable, (on) => {
  if (!on) selected.value = []
})
watch(() => caps.sortable, (on) => {
  if (!on) {
    sortField.value = null
    sortOrder.value = null
  }
})

function resetCaps() {
  Object.assign(caps, DEFAULT_CAPS)
  filters.value = {}
  selected.value = []
  sortField.value = null
  sortOrder.value = null
  tableRef.value?.resetAllFilters()
}

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
</script>

<template>
  <div class="m-0 p-0">
    <RichTable
      ref="tableRef"
      v-model:page="page"
      v-model:page-size="pageSize"
      v-model:selected="selected"
      id-field="id"
      persist-key="doc-rich-table"
      :columns="columns"
      :data="rows"
      :total="caps.pagination ? total : undefined"
      :loading="loading"
      :sort-field="sortField"
      :sort-order="sortOrder"
      :facet-loader="facetLoader"
      :detail-fields="caps.rowDetail ? detailFields : undefined"
      :clickable="caps.rowDetail"
      :selectable="caps.selectable"
      :select-all="caps.selectAll"
      :resizable="caps.resizable"
      :column-settings="caps.columnSettings"
      :max-height="caps.fixedHeight ? '58vh' : ''"
      detail-title="售后单详情"
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
    </RichTable>

    <!-- 调试信息：把「组件往外发了什么」直接摆出来 -->
    <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="outline">请求：{{ filters }}</Badge>
      <Badge variant="outline">本页 {{ rows.length }} 行 / 共 {{ total }} 条</Badge>
      <Badge variant="outline">
        选中语义：{{ selection.mode === 'all' ? `全部（排除 ${selection.excluded.length} 条）` : `${selection.ids.length} 条` }}
      </Badge>
    </div>

    <!-- 能力开关：主位置是右侧栏卡片（跟分类卡同级）；x 以下没有右栏，回退到表格下方。
         defer：右栏在主内容之后挂载，目标元素此刻还不存在，推迟到本轮渲染后再解析（Vue 3.5+） -->
    <Teleport defer to="#docs-aside-extra">
      <TableCapabilityPanel :items="CAPS" :state="caps" @reset="resetCaps" />
    </Teleport>

    <TableCapabilityPanel class="mt-6 xl:hidden" :items="CAPS" :state="caps" @reset="resetCaps" />
  </div>
</template>
