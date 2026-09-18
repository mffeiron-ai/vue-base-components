<script setup lang="ts">
/**
 * BaseTable —— 业务组件（分子组件）· 数据表格
 *
 * 定位：把原子组件按「后台列表页」这一生产场景组合 + 强化出来的成品。
 *   · 状态机交给 TanStack（`@tanstack/vue-table` v9，可选依赖）：排序 / 分页 / 列显隐 /
 *     列宽 / 列序，一次注册 `tableFeatures`，不再手写这些状态；
 *   · 渲染全部用库内原子：Table / TableHeader / TableRow / TableHead / TableBody /
 *     TableCell / TableEmpty / TableFooter、Checkbox、Button、Input、Popover、
 *     DropdownMenu、Select、Pagination、Skeleton、Sheet、Dialog —— 所以 8 套风格预设
 *     （`.cn-table*` + `data-slot` 钩子）直接生效，组件里不写死颜色与圆角；
 *   · 业务强化（原子层没有的部分）：服务端分页 / 服务端筛选 + 分面懒加载 /
 *     跨页「全选所有匹配」/ 列宽列序列显隐持久化 / 行详情侧滑 / 表尾汇总 / 可点击行进详情。
 *
 * 与 `ui/data-table`（TanStack 渲染层）的分工：
 *   DataTable = headless，列定义与能力全由使用方注册，适合虚拟滚动、复杂表格；
 *   BaseTable = 约定式开箱即用（columns 配置 + 服务端协议），适合后台列表页。
 *   两者共用同一套 Table 原子与命名（`#toolbar` / `#empty` / `#footer`、`data-state="selected"`）。
 *
 * API 规范化（相对老版本的破坏性变更，见组件文档）：
 *   · 事件统一 kebab-case：`page-size-change`（旧 `pageSizeChange`）、`sort-change`、
 *     `filter-change`、`update:selected`、`update:page`、`update:pageSize`
 *   · `resizeKey` → `persistKey`（现在一并持久化 列宽 + 列序 + 列显隐）
 *   · 所有外向事件只发「语义」，不发内部状态（选中请用 resolveSelected() 解码）
 */
import { computed, defineAsyncComponent, onBeforeUnmount, reactive, ref, useSlots, watch } from 'vue'
import type { CSSProperties } from 'vue'
import {
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  sortFn_alphanumeric,
  sortFn_text,
  stockFeatures,
  tableFeatures,
  useTable,
} from '@tanstack/vue-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  GripVertical,
  Loader2,
} from 'lucide-vue-next'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Dialog, DialogContent } from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet'
import { Skeleton } from '../ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import type { Column, FacetItem, FacetLoader, SelectionSummary } from './types'
import { ALL_SELECT_MARK, excludedMark, summarizeSelection } from './types'

/** markdown 单元格：只有真出现 md 列时才异步拉 md-editor-v3（含样式），不给列表页背体积 */
const MdPreview = defineAsyncComponent(async () => {
  await import('md-editor-v3/lib/style.css')
  const mod = await import('md-editor-v3')
  return mod.MdPreview
})

/**
 * TanStack v9：能力一次注册（放模块作用域，避免每次渲染重建）。
 * `stockFeatures` 已包含 排序/筛选/分面/分页/列显隐/列宽/列序/行选择 等全部 feature，
 * 这里只补「用哪个 row model」与排序函数登记表。
 */
const TABLE_FEATURES = tableFeatures({
  ...stockFeatures,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  sortFns: { text: sortFn_text, alphanumeric: sortFn_alphanumeric },
})

const props = withDefaults(defineProps<{
  /** 列定义 */
  columns: Column<any>[]
  /** 当前页数据（服务端分页时只给这一页；不给 total 时为纯客户端模式） */
  data: any[]
  /** 行主键字段 */
  idField: string
  // ── 分页（服务端语义；传了 total 才显示分页条） ──
  /** 当前页，从 1 开始 */
  page?: number
  pageSize?: number
  /** 匹配总行数（服务端返回），决定页数 */
  total?: number
  pageSizeOptions?: number[]
  // ── 排序 ──
  /** 受控排序字段（null = 未排序） */
  sortField?: string | null
  sortOrder?: 'asc' | 'desc' | null
  /** 客户端排序函数：给了就地排序 data；不给则只发 sort-change 交给服务端 */
  sortFn?: ((a: any, b: any) => number) | null
  // ── 展示 ──
  loading?: boolean
  /** 骨架屏最短展示时长(ms)，避免数据太快导致闪烁 */
  minLoadingMs?: number
  emptyText?: string
  /** 滚动容器最大高度，超出后表头固定、表体内部滚动 */
  maxHeight?: string
  /** 单元格最多显示行数（超出裁切），默认 3 */
  cellMaxLines?: number
  /** 列宽拖拽下限 px */
  minColumnWidth?: number
  /** 是否显示列宽拖拽手柄（表头右缘） */
  resizable?: boolean
  /** 是否显示「显示/隐藏列」菜单（含列序拖拽） */
  columnSettings?: boolean
  /** 行是否可点击（首列高亮 + 发 row-click） */
  clickable?: boolean
  // ── 行选择 ──
  selectable?: boolean
  /** 开启「跨页全选所有匹配」（表头勾选时发 '__all__' 标记） */
  selectAll?: boolean
  /** 已选标记数组（含 '__all__' / '__except__:<id>'，用 resolveSelected() 解码） */
  selected?: (string | number)[]
  // ── 行详情侧滑 ──
  detailFields?: { label: string, field: string, type?: 'text' | 'image' }[]
  detailTitle?: string
  /** 图片 URL 转换（如拼 CDN 前缀） */
  resolveImageUrl?: (url: string) => string
  // ── 筛选 ──
  /** 分面（Excel 式分组计数）加载器：打开筛选弹窗时懒加载该列候选值 + 命中数 */
  facetLoader?: FacetLoader
  /** 列状态持久化 key：提供后 列宽 + 列序 + 列显隐 存 localStorage */
  persistKey?: string
}>(), {
  page: 1,
  pageSize: 10,
  pageSizeOptions: () => [10, 20, 50, 100],
  minColumnWidth: 60,
  resizable: true,
  columnSettings: true,
  cellMaxLines: 3,
  maxHeight: '72vh',
  minLoadingMs: 120,
})

const emit = defineEmits<{  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  /** 页码变化（含页大小变化导致的回到第 1 页） */
  'page-change': [page: number]
  'page-size-change': [pageSize: number]
  'sort-change': [payload: { field: string | null, order: 'asc' | 'desc' | null }]
  'update:selected': [marks: (string | number)[]]
  'filter-change': [filters: Record<string, any>]
  'row-click': [row: any]
}>()

// ============================================================
// 1. TanStack 状态（单一来源）
// ============================================================

/** 具名插槽（search / toolbar / actions / footer / empty）用在多处判断里 */
const slots = useSlots()

/**
 * 受控状态容器。
 * 注意：v9 的 Vue 适配器不会解包传进 state 的 ref —— 这里必须是**普通 reactive 对象**，
 * 传 ref 会让内部拿到 Ref，`getIsSorted()` 之类直接报错。
 */
const tableState = reactive({
  sorting: [] as { id: string, desc: boolean }[],
  pagination: { pageIndex: 0, pageSize: 10 },
  columnVisibility: {} as Record<string, boolean>,
  columnSizing: {} as Record<string, number>,
  columnOrder: [] as string[],
})

/** TanStack 的 onXxxChange 收到的是 Updater（值或函数），统一在这里落地 */
function applyState<K extends keyof typeof tableState>(key: K, updater: any) {
  const cur = tableState[key]
  tableState[key] = (typeof updater === 'function' ? updater(cur) : updater) as typeof tableState[K]
}

/** 初始列宽：拖拽值（columnSizing）优先，其次 Column.width，最后按字段名启发式推断 */
function guessDefaultWidth(col: Column): number {
  if (col.width) return col.width
  const f = String(col.field).toLowerCase()
  if (/^(id|.*_id)$/.test(f) || /status|num$|count|price|fee|amount|rate|ratio|pct|percent|commission/.test(f)) return 110
  if (/time|date|created|updated|synced|paid|settle/.test(f)) return 150
  if (/title|name|desc|remark|reason|content|address|img|link|url|detail/.test(f)) return 220
  return 150
}

/** 列定义 → TanStack 列定义（列宽初值在这里给，运行时覆盖走 columnSizing） */
const columnDefs = computed(() => props.columns.map(col => ({
  id: String(col.field),
  accessorKey: String(col.field),
  header: col.label,
  enableSorting: !!col.sortable,
  enableHiding: true,
  size: guessDefaultWidth(col),
})) as any[])

const rowCount = computed(() => props.total ?? props.data.length)

const table = useTable({
  features: TABLE_FEATURES,
  data: computed(() => props.data),
  columns: columnDefs,
  state: tableState,
  // 数据、排序、筛选全部由服务端负责，TanStack 只持有状态（不发请求）
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  rowCount,
  getRowId: (row: any) => String(row[props.idField]),
  enableColumnResizing: true,
  defaultColumn: { size: 150, minSize: props.minColumnWidth, maxSize: 800 },
  onSortingChange: (u: any) => applyState('sorting', u),
  onPaginationChange: (u: any) => applyState('pagination', u),
  onColumnVisibilityChange: (u: any) => applyState('columnVisibility', u),
  onColumnSizingChange: (u: any) => applyState('columnSizing', u),
  onColumnOrderChange: (u: any) => applyState('columnOrder', u),
})

/** 列宽：TanStack 是唯一来源 */
function colSize(col: Column): number {
  const c = table.getColumn(String(col.field))
  return c?.getSize?.() ?? guessDefaultWidth(col)
}
function colStyle(col: Column) {
  const w = colSize(col)
  return { width: `${w}px`, minWidth: `${w}px` }
}

const pageCount = computed(() => Math.max(1, table.getPageCount?.() ?? 1))
const visibleColumnsCount = computed(() => table.getVisibleLeafColumns().length)

// ============================================================
// 2. props ⇄ 状态（受控同步：只做 props → state，发出交给下面的动作函数）
// ============================================================

watch(() => props.page, (v) => {
  const idx = Math.max(0, (v ?? 1) - 1)
  if (tableState.pagination.pageIndex !== idx) tableState.pagination.pageIndex = idx
}, { immediate: true })

watch(() => props.pageSize, (v) => {
  const size = v ?? 10
  if (tableState.pagination.pageSize !== size) tableState.pagination.pageSize = size
}, { immediate: true })

watch([() => props.sortField, () => props.sortOrder], ([f, o]) => {
  const next = f ? [{ id: String(f), desc: o === 'desc' }] : []
  const cur = tableState.sorting
  if (next.length !== cur.length || next.some((n, i) => n.id !== cur[i]?.id || n.desc !== cur[i]?.desc)) {
    tableState.sorting = next
  }
}, { immediate: true })

// ============================================================
// 3. 列状态持久化（列宽 + 列序 + 列显隐，取代老版本的两套 key）
// ============================================================

const storageKey = computed(() => (props.persistKey ? `bt-state:${props.persistKey}` : ''))

function loadPersisted() {
  if (!storageKey.value) return
  try {
    const raw = localStorage.getItem(storageKey.value)
    if (!raw) return
    const saved = JSON.parse(raw) as Partial<typeof tableState>
    if (saved.columnSizing && typeof saved.columnSizing === 'object') tableState.columnSizing = { ...saved.columnSizing }
    if (saved.columnVisibility && typeof saved.columnVisibility === 'object') tableState.columnVisibility = { ...saved.columnVisibility }
    if (Array.isArray(saved.columnOrder)) {
      // 只保留仍然存在的列，并把新增列补到末尾（列定义变了也不会错位）
      const cur = columnDefs.value.map((d: any) => d.id)
      const merged = saved.columnOrder.filter((id: string) => cur.includes(id))
      for (const id of cur) if (!merged.includes(id)) merged.push(id)
      tableState.columnOrder = merged
    } else {
      tableState.columnOrder = columnDefs.value.map((d: any) => d.id)
    }
  } catch { /* 存储不可用就当没有 */ }
}
function savePersisted() {
  if (!storageKey.value) return
  try {
    localStorage.setItem(storageKey.value, JSON.stringify({
      columnSizing: tableState.columnSizing,
      columnVisibility: tableState.columnVisibility,
      columnOrder: tableState.columnOrder,
    }))
  } catch { /* ignore */ }
}

watch(storageKey, () => { loadPersisted() }, { immediate: true })
watch(() => [tableState.columnSizing, tableState.columnVisibility, tableState.columnOrder], savePersisted, { deep: true })

/** 按 columnOrder 排好的全部列（含被隐藏的） */
const orderedColumns = computed(() => {
  const byId = new Map(props.columns.map(c => [String(c.field), c]))
  const order = tableState.columnOrder.length ? tableState.columnOrder : [...byId.keys()]
  const list = order.map(id => byId.get(id)).filter((c): c is Column => !!c)
  for (const c of props.columns) if (!order.includes(String(c.field))) list.push(c)
  return list
})

/** 可见列（按 columnOrder 顺序） */
const filteredColumns = computed(() => orderedColumns.value.filter(c => columnVisible(String(c.field))))

function columnVisible(field: string): boolean {
  return table.getColumn(field)?.getIsVisible?.() ?? true
}

// ── 列宽拖拽（写入 TanStack columnSizing，天然被持久化） ──
const resizing = ref<{ field: string, startX: number, startW: number } | null>(null)

function startResize(e: MouseEvent, col: Column) {
  e.preventDefault()
  e.stopPropagation()
  const field = String(col.field)
  // 起点取「当前真实宽度」，避免从推断值与硬编码值不一致处跳变
  resizing.value = { field, startX: e.clientX, startW: colSize(col) }
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeEnd)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}
function onResizeMove(e: MouseEvent) {
  if (!resizing.value) return
  const w = Math.max(props.minColumnWidth, resizing.value.startW + (e.clientX - resizing.value.startX))
  tableState.columnSizing = { ...tableState.columnSizing, [resizing.value.field]: w }
}
function onResizeEnd() {
  resizing.value = null
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}
onBeforeUnmount(() => {
  onResizeEnd()
  if (facetTimer) clearTimeout(facetTimer)
  if (skeletonHideTimer) clearTimeout(skeletonHideTimer)
  if (dragPointerId !== null) onColPointerUp()
})

// ── 列显隐 / 列序 ──
const isAllColumnsSelected = computed(() => table.getIsAllColumnsVisible?.() ?? true)

/** 最后一列不允许取消勾选（否则表格会空掉），所以用 disabled 表达，而不是静默失败 */
function canHideColumn(field: string): boolean {
  return !(columnVisible(field) && visibleColumnsCount.value <= 1)
}
function toggleColumn(field: string, checked: boolean) {
  if (!checked && !canHideColumn(field)) return
  table.getColumn(field)?.toggleVisibility(checked)
}
function toggleAllColumns() {
  table.toggleAllColumnsVisible(!isAllColumnsSelected.value)
}

const dragColField = ref<string | null>(null)
const dragOverField = ref<string | null>(null)
let dragPointerId: number | null = null

function onColPointerDown(e: PointerEvent, field: string) {
  if (e.button !== 0) return
  e.preventDefault() // 阻止拖动时选中文本
  dragColField.value = field
  dragOverField.value = null
  dragPointerId = e.pointerId
  window.addEventListener('pointermove', onColPointerMove)
  window.addEventListener('pointerup', onColPointerUp)
  window.addEventListener('pointercancel', onColPointerUp)
}
function onColPointerMove(e: PointerEvent) {
  if (!dragColField.value || e.pointerId !== dragPointerId) return
  e.preventDefault()
  const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
  const rowEl = el?.closest?.('[data-col-row]') as HTMLElement | null
  dragOverField.value = rowEl ? rowEl.getAttribute('data-col-row') : null
}
function onColPointerUp() {
  window.removeEventListener('pointermove', onColPointerMove)
  window.removeEventListener('pointerup', onColPointerUp)
  window.removeEventListener('pointercancel', onColPointerUp)
  dragPointerId = null
  const from = dragColField.value
  const to = dragOverField.value
  dragColField.value = null
  dragOverField.value = null
  if (!from || !to || from === to) return
  const arr = orderedColumns.value.map(c => String(c.field))
  const i = arr.indexOf(from)
  const j = arr.indexOf(to)
  if (i < 0 || j < 0) return
  arr.splice(i, 1)
  arr.splice(j, 0, from)
  tableState.columnOrder = arr
}

// ============================================================
// 4. 排序（表头点击循环：未排序 → 升序 → 降序 → 取消）
// ============================================================

function handleSort(col: Column) {
  if (!col.sortable) return
  const field = String(col.field)
  const cur = props.sortField === field ? props.sortOrder : null
  const next: 'asc' | 'desc' | null = cur === null ? 'asc' : cur === 'asc' ? 'desc' : null
  emit('sort-change', next ? { field, order: next } : { field: null, order: null })
}

function sortStateOf(col: Column): false | 'asc' | 'desc' {
  if (props.sortField !== String(col.field)) return false
  return props.sortOrder === 'asc' ? 'asc' : props.sortOrder === 'desc' ? 'desc' : false
}

const sortedData = computed(() => (props.sortFn ? [...props.data].sort(props.sortFn) : props.data))

// ============================================================
// 5. 行选择（语义见 types.ts：'__all__' / '__except__:<id>'）
// ============================================================

function isRowSelected(row: any): boolean {
  const sel = props.selected || []
  const id = row[props.idField]
  if (props.selectAll && sel.includes(ALL_SELECT_MARK)) return !sel.includes(excludedMark(id))
  return sel.includes(id)
}
const allSelected = computed(() => {
  const sel = props.selected || []
  if (!sortedData.value.length) return false
  if (props.selectAll && sel.includes(ALL_SELECT_MARK)) {
    return !sortedData.value.some(row => sel.includes(excludedMark(row[props.idField])))
  }
  return sortedData.value.every(row => isRowSelected(row))
})

const someSelected = computed(() => sortedData.value.some(isRowSelected))

/** reka 的三态勾选：用 modelValue='indeterminate' 表达半选（不是单独 prop） */
const headerCheckboxState = computed<boolean | 'indeterminate'>(() => {
  if (allSelected.value) return true
  return someSelected.value ? 'indeterminate' : false
})
function toggleSelectAll() {
  if (allSelected.value) {
    emit('update:selected', [])
  } else if (props.selectAll) {
    emit('update:selected', [ALL_SELECT_MARK]) // 跨页：标记「全部匹配」
  } else {
    emit('update:selected', sortedData.value.map(row => row[props.idField]))
  }
}
function toggleRow(id: string | number) {
  const current = [...(props.selected || [])]
  if (props.selectAll && current.includes(ALL_SELECT_MARK)) {
    // 全选模式下点某行 = 加/减一条排除标记，保留跨页全选
    const mark = excludedMark(id)
    emit('update:selected', current.includes(mark) ? current.filter(x => x !== mark) : [...current, mark])
    return
  }
  const idx = current.indexOf(id)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(id)
  emit('update:selected', current)
}

// ============================================================
// 6. 行详情侧滑 + 图片预览
// ============================================================

const detailOpen = ref(false)
const detailRow = ref<any>(null)
const detailPreviewImage = ref('')

function onRowClick(row: any) {
  emit('row-click', row)
  if (props.detailFields?.length) {
    detailRow.value = row
    detailOpen.value = true
  }
}
function detailImgUrl(url: string): string {
  return props.resolveImageUrl ? props.resolveImageUrl(url) : url
}
/** 图片字段归一化成数组（字符串也能用，避免 v-for 逐字符遍历） */
function imageList(v: any): string[] {
  if (!v) return []
  if (Array.isArray(v)) return v.filter(Boolean).map((x: any) => detailImgUrl(String(x)))
  return [detailImgUrl(String(v))]
}

// ============================================================
// 7. 骨架屏（最短展示时长，防闪烁）
// ============================================================

const showLoading = ref(false)
let skeletonHideTimer: ReturnType<typeof setTimeout> | undefined

watch(() => props.loading, (v) => {
  if (v) {
    if (skeletonHideTimer) clearTimeout(skeletonHideTimer)
    skeletonHideTimer = undefined
    showLoading.value = true
  } else {
    skeletonHideTimer = setTimeout(() => { showLoading.value = false }, props.minLoadingMs)
  }
}, { immediate: true })

const skeletonRows = 6
const skeletonWidths = [90, 70, 82, 60, 88, 74]
function skeletonStyle(idx: number) {
  return { width: `${skeletonWidths[idx % skeletonWidths.length]}%` }
}

/**
 * 单元格多行裁切：行数由 cellMaxLines 控制。
 * 注意用 camelCase 写 Webkit 前缀属性 —— Vue 的 `CSSProperties` 只认 camelCase，
 * 写成 `'-webkit-line-clamp'` 会直接类型报错（kebab-case 只剩为数不多的几个键）。
 */
const clampStyle = computed<CSSProperties>(() => ({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: String(props.cellMaxLines),
  overflow: 'hidden',
}))

const colspanCount = computed(() => filteredColumns.value.length + (props.selectable ? 1 : 0) + (slots.actions ? 1 : 0))

// ============================================================
// 8. 表头筛选（服务端语义 + 分面懒加载）
// ============================================================

const filters = ref<Record<string, any>>({})
const openFilterCol = ref<string | null>(null)
const filterDraft = ref<Record<string, any>>({})
const selectSearch = ref('')
const facetItems = ref<FacetItem[]>([])
const facetLoading = ref(false)
const facetSearch = ref('')
let facetTimer: ReturnType<typeof setTimeout> | undefined
/** 请求序号：只让最新一次 facet 请求落地，防止慢的「全量」响应覆盖搜索快结果 */
let facetSeq = 0

/** 多选候选项：合并已选中的值（即使不在加载结果里），已选项不会因加载而消失 */
const visibleFacetItems = computed<FacetItem[]>(() => {
  const base = facetItems.value
  const arr = openFilterCol.value ? filterDraft.value[openFilterCol.value] : null
  if (!Array.isArray(arr) || !arr.length) return base
  const seen = new Set(base.map(it => String(it.value)))
  const extra = arr.filter(v => !seen.has(String(v))).map(v => ({ value: v, count: 0 }))
  return extra.length ? [...base, ...extra] : base
})

/** 该列是否走分面（分组计数）模式 */
function isFacetCol(col: Column): boolean {
  if (!props.facetLoader) return false
  return col.filter?.type === 'text' || col.filter?.type === 'select'
}

async function loadFacet(col: Column, keyword: string) {
  if (!props.facetLoader) return
  const seq = ++facetSeq
  facetLoading.value = true
  try {
    const items = (await props.facetLoader(col, keyword)) || []
    if (seq === facetSeq) facetItems.value = items
  } catch {
    if (seq === facetSeq) facetItems.value = []
  } finally {
    if (seq === facetSeq) facetLoading.value = false
  }
}

function onFacetSearch(col: Column, v: string) {
  facetSearch.value = v
  if (facetTimer) clearTimeout(facetTimer)
  facetTimer = setTimeout(() => loadFacet(col, v), 350)
}

/** 筛选参数用的字段名（默认取 col.field，可被 filter.field 覆盖） */
function filterKey(col: Column): string {
  const f = col.filter
  return String(f && 'field' in f && f.field ? f.field : col.field)
}

/** 候选值显示名：优先列 options 映射；空值显示「（空 · 未设置）」 */
function facetLabel(col: Column, value: any): string {
  const f = col.filter
  if (f?.type === 'select') {
    const hit = f.options.find(o => String(o.value) === String(value))
    if (hit) return hit.label
  }
  return value == null || value === '' ? '（空 · 未设置）' : String(value)
}

function isFilterActive(col: Column): boolean {
  const v = filters.value[filterKey(col)]
  if (v == null || v === '') return false
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.values(v as any).some(x => x !== '' && x != null)
  return true
}

function onFilterPopover(col: Column, open: boolean) {
  if (!open) {
    openFilterCol.value = null
    return
  }
  const k = filterKey(col)
  const f = col.filter
  openFilterCol.value = k
  const cur = filters.value[k]
  if (isFacetCol(col)) {
    filterDraft.value[k] = Array.isArray(cur) ? [...cur] : (cur != null && cur !== '' ? [cur] : [])
    facetSearch.value = ''
    loadFacet(col, '') // 点开筛选按钮才分组计数
  } else if (f?.type === 'number' || f?.type === 'date') {
    const c = (cur && typeof cur === 'object') ? cur as any : {}
    filterDraft.value[k] = { gte: c.gte ?? '', lte: c.lte ?? '', days: Array.isArray(c.days) ? [...c.days] : [] }
    if (f?.type === 'date') { facetSearch.value = ''; loadFacet(col, '') }
  } else if (f?.type === 'select') {
    filterDraft.value[k] = Array.isArray(cur) ? [...cur] : (cur != null && cur !== '' ? [cur] : [])
  } else {
    filterDraft.value[k] = cur == null ? '' : String(cur)
  }
  selectSearch.value = ''
}

/** 区间草稿（number / date 共用）：返回可写对象 */
function rangeDraft(col: Column): { gte: any, lte: any, days: string[] } {
  const k = filterKey(col)
  const d = filterDraft.value[k]
  if (!d || typeof d !== 'object' || Array.isArray(d)) {
    filterDraft.value[k] = { gte: '', lte: '', days: [] }
  } else if (!Array.isArray(d.days)) {
    d.days = []
  }
  return filterDraft.value[k]
}
function dateDays(col: Column): string[] {
  return rangeDraft(col).days
}
function toggleDateDay(col: Column, day: any) {
  if (day == null) return
  const days = dateDays(col)
  const s = String(day)
  const i = days.indexOf(s)
  if (i >= 0) days.splice(i, 1)
  else days.push(s)
}
function dateAllSelected(col: Column): boolean {
  const days = dateDays(col)
  const cands = facetItems.value.map(it => String(it.value)).filter(s => s !== 'null' && s !== '')
  return cands.length > 0 && cands.every(d => days.includes(d))
}
function toggleDateAll(col: Column) {
  const days = dateDays(col)
  if (dateAllSelected(col)) { days.length = 0; return }
  for (const it of facetItems.value) {
    if (it.value == null) continue
    const s = String(it.value)
    if (!days.includes(s)) days.push(s)
  }
}
function toggleDateInvert(col: Column) {
  const days = dateDays(col)
  const next = new Set(days)
  for (const it of facetItems.value) {
    if (it.value == null) continue
    const s = String(it.value)
    if (next.has(s)) next.delete(s)
    else next.add(s)
  }
  rangeDraft(col).days = [...next]
}
/** 快捷：昨天 / 当月 */
function applyDatePreset(col: Column, preset: 'yesterday' | 'currentMonth') {
  const d = new Date()
  const fmt = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
  const k = filterKey(col)
  if (preset === 'yesterday') {
    d.setDate(d.getDate() - 1)
    filterDraft.value[k] = { gte: fmt(d), lte: fmt(d) }
  } else {
    const first = new Date(d.getFullYear(), d.getMonth(), 1)
    filterDraft.value[k] = { gte: fmt(first), lte: fmt(d) }
  }
  applyFilter(col)
}

function isOptSelected(col: Column, val: any): boolean {
  const arr = filterDraft.value[filterKey(col)]
  return Array.isArray(arr) ? arr.includes(val) : (arr != null && arr !== '' && arr === val)
}
function selectedCount(col: Column): number {
  const arr = filterDraft.value[filterKey(col)]
  return Array.isArray(arr) ? arr.length : (arr == null || arr === '' ? 0 : 1)
}
function toggleOpt(col: Column, val: any, checked: boolean) {
  const k = filterKey(col)
  const cur = Array.isArray(filterDraft.value[k]) ? [...filterDraft.value[k]] : []
  if (checked) {
    if (!cur.includes(val)) cur.push(val)
  } else {
    const i = cur.indexOf(val)
    if (i >= 0) cur.splice(i, 1)
  }
  filterDraft.value[k] = cur
}
/** 已选中的候选项排前面 */
function sortBySelected(col: Column, items: FacetItem[]): FacetItem[] {
  return [...items].sort((a, b) => Number(isOptSelected(col, b.value)) - Number(isOptSelected(col, a.value)))
}
function allCandidateSelected(col: Column, candidates: any[]): boolean {
  const arr = filterDraft.value[filterKey(col)]
  const arr2 = Array.isArray(arr) ? arr : []
  return candidates.length > 0 && candidates.every(v => arr2.includes(v))
}
function toggleAllCandidates(col: Column, candidates: any[]) {
  const k = filterKey(col)
  const cur = Array.isArray(filterDraft.value[k]) ? [...filterDraft.value[k]] : []
  if (allCandidateSelected(col, candidates)) {
    filterDraft.value[k] = []
  } else {
    for (const v of candidates) if (!cur.includes(v)) cur.push(v)
    filterDraft.value[k] = cur
  }
}
function toggleFacetAll(col: Column) {
  toggleAllCandidates(col, facetItems.value.map(it => it.value))
}
function facetAllSelected(col: Column): boolean {
  return allCandidateSelected(col, facetItems.value.map(it => it.value))
}
function toggleFacetInvert(col: Column) {
  const k = filterKey(col)
  const cur = Array.isArray(filterDraft.value[k]) ? [...filterDraft.value[k]] : []
  const next = new Set(cur)
  for (const it of visibleFacetItems.value) {
    if (next.has(it.value)) next.delete(it.value)
    else next.add(it.value)
  }
  filterDraft.value[k] = [...next]
}

function filteredSelectOptions(col: Column): { label: string, value: any }[] {
  const f = col.filter
  const opts = f?.type === 'select' ? f.options : []
  const kw = selectSearch.value.trim().toLowerCase()
  const list = kw ? opts.filter(o => String(o.label).toLowerCase().includes(kw)) : [...opts]
  return list.sort((a, b) => Number(isOptSelected(col, b.value)) - Number(isOptSelected(col, a.value)))
}
function toggleAllSelect(col: Column) {
  toggleAllCandidates(col, filteredSelectOptions(col).map(o => o.value))
}
function selectAllSelected(col: Column): boolean {
  return allCandidateSelected(col, filteredSelectOptions(col).map(o => o.value))
}
function toggleSelectInvert(col: Column) {
  const k = filterKey(col)
  const cur = Array.isArray(filterDraft.value[k]) ? [...filterDraft.value[k]] : []
  const next = new Set(cur)
  for (const o of filteredSelectOptions(col)) {
    if (next.has(o.value)) next.delete(o.value)
    else next.add(o.value)
  }
  filterDraft.value[k] = [...next]
}

/** 把当前 filters 组装成后端参数并抛出（协议见 types.ts） */
function emitFilter() {
  const params: Record<string, any> = {}
  for (const col of props.columns) {
    const f = col.filter
    if (!f) continue
    const k = filterKey(col)
    const v = filters.value[k]
    if (v === '' || v == null) continue
    if (f.type === 'number') {
      const obj = (v as any) || {}
      const scaleVal = (x: any) => (f.scale != null && x !== '' && x != null ? Number(x) * f.scale : x)
      if (obj.gte !== '' && obj.gte != null) params[`${k}__gte`] = scaleVal(obj.gte)
      if (obj.lte !== '' && obj.lte != null) params[`${k}__lte`] = scaleVal(obj.lte)
    } else if (f.type === 'date') {
      const obj = (v as any) || {}
      if (Array.isArray(obj.days) && obj.days.length) params[`${k}__date__in`] = obj.days
      if (obj.gte !== '' && obj.gte != null) params[`${k}__date__gte`] = obj.gte
      if (obj.lte !== '' && obj.lte != null) params[`${k}__date__lte`] = obj.lte
    } else if (f.type === 'select' || (f.type === 'text' && Array.isArray(v))) {
      params[`${k}__in`] = Array.isArray(v) ? v : [v]
    } else {
      params[k] = v // 文本：模糊匹配（matchFields 交给后端）
    }
  }
  emit('filter-change', params)
}

/** 弹窗点「确定」：草稿 → 正式筛选，回第 1 页并发查询 */
function applyFilter(col: Column) {
  const k = filterKey(col)
  const f = col.filter
  const d = filterDraft.value[k]
  if (f?.type === 'number' || f?.type === 'date') {
    const obj = (d && typeof d === 'object') ? d as any : {}
    const days = Array.isArray(obj.days) ? obj.days.filter((x: any) => x !== '' && x != null) : []
    const hasVal = days.length > 0 || ['gte', 'lte'].some(op => obj[op] !== '' && obj[op] != null)
    if (hasVal) filters.value[k] = { gte: obj.gte ?? '', lte: obj.lte ?? '', days }
    else delete filters.value[k]
  } else if (f?.type === 'select' || (f?.type === 'text' && isFacetCol(col))) {
    // 保留 null（「空 · 未设置」选项），仅剔除空串
    const arr = Array.isArray(d) ? d.filter(v => v !== '') : []
    if (arr.length) filters.value[k] = arr
    else delete filters.value[k]
  } else {
    const t = String(d ?? '').trim()
    if (t) filters.value[k] = t
    else delete filters.value[k]
  }
  openFilterCol.value = null
  goToFirstPage()
  emitFilter()
}

function resetFilter(col: Column) {
  const k = filterKey(col)
  delete filters.value[k]
  delete filterDraft.value[k]
  selectSearch.value = ''
  facetItems.value = []
  openFilterCol.value = null
  goToFirstPage()
  emitFilter()
}

/** 清空全部列筛选并通知父组件（也通过 ref 暴露） */
function resetAllFilters() {
  filters.value = {}
  filterDraft.value = {}
  selectSearch.value = ''
  facetSearch.value = ''
  facetItems.value = []
  openFilterCol.value = null
  goToFirstPage()
  emitFilter()
}

// ============================================================
// 9. 分页动作（状态在 TanStack，UI 用库内 Pagination 原语）
// ============================================================

const currentPage = computed(() => tableState.pagination.pageIndex + 1)

function goToFirstPage() {
  if (tableState.pagination.pageIndex !== 0) {
    tableState.pagination.pageIndex = 0
    emit('update:page', 1)
    emit('page-change', 1)
  }
}

function onPageUpdate(page: unknown) {
  const n = Math.min(pageCount.value, Math.max(1, Number(page) || 1))
  if (n === currentPage.value) return
  tableState.pagination.pageIndex = n - 1
  emit('update:page', n)
  emit('page-change', n)
}

/** reka 的 Select 抛出的是 AcceptableValue（可能是 null / boolean），这里统一归一化 */
function onPageSizeUpdate(size: unknown) {
  const n = Number(size) || 10
  if (n === tableState.pagination.pageSize) return
  tableState.pagination.pageSize = n
  emit('update:pageSize', n)
  emit('page-size-change', n)
  goToFirstPage()
}

const jumpTo = ref('')
function onJump() {
  const n = Number(jumpTo.value)
  if (!n) return
  onPageUpdate(n)
  jumpTo.value = ''
}

const showPagination = computed(() => props.total !== undefined)
const selectedSummary = computed<SelectionSummary>(() => summarizeSelection(props.selected))

defineExpose({
  /** 行详情面板（业务方在别处触发时用） */
  openDetail: (row: any) => {
    if (!props.detailFields?.length) return
    detailRow.value = row
    detailOpen.value = true
  },
  resetAllFilters,
  /** 外部设置某列筛选（如从看板卡片带参跳转到本列表），会自动重查 */
  setColumnFilter: (field: string, value: any) => {
    const col = props.columns.find(c => String(c.field) === field)
    if (!col?.filter) return
    const k = filterKey(col)
    const isEmpty = value == null || value === '' || (Array.isArray(value) && value.length === 0)
    if (isEmpty) {
      delete filters.value[k]
      delete filterDraft.value[k]
    } else {
      const v = Array.isArray(value) ? [...value] : value
      filters.value[k] = v
      filterDraft.value[k] = Array.isArray(v) ? [...v] : v
    }
    goToFirstPage()
    emitFilter()
  },
  /** 选中语义解码（'__all__' / '__except__:<id>' → { mode, ids, excluded }） */
  resolveSelected: (): SelectionSummary => selectedSummary.value,
  /** TanStack 实例（逃生舱：需要自定义列 / 直读状态时用） */
  table,
})
</script>

<template>
  <div class="m-0 p-0">
    <!-- 工具栏：搜索 / 自定义工具 / 列显隐 -->
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <slot name="search"></slot>
      <slot name="toolbar"></slot>

      <div v-if="columnSettings" class="relative flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm" class="gap-2">
              显示/隐藏列
              <ChevronDown class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-56 p-0">
            <div class="flex items-center gap-2 p-2">
              <Checkbox
                id="bt-select-all-columns"
                :model-value="isAllColumnsSelected"
                @update:model-value="toggleAllColumns"
              />
              <label for="bt-select-all-columns" class="cursor-pointer text-sm">全选/取消全选</label>
            </div>
            <DropdownMenuSeparator />

            <div class="max-h-60 overflow-y-auto p-2">
              <div
                v-for="col in orderedColumns"
                :key="String(col.field)"
                :data-col-row="String(col.field)"
                class="mb-1 flex select-none items-center gap-2"
                :class="[
                  dragColField === String(col.field) ? 'opacity-50' : '',
                  dragColField && dragOverField === String(col.field) ? 'bg-primary/10 rounded-md' : '',
                ]"
              >
                <Checkbox
                  :id="`bt-col-${String(col.field)}`"
                  :model-value="columnVisible(String(col.field))"
                  :disabled="!canHideColumn(String(col.field))"
                  @update:model-value="(v: any) => toggleColumn(String(col.field), !!v)"
                />
                <label
                  :for="`bt-col-${String(col.field)}`"
                  class="flex-1 truncate text-sm"
                  :class="canHideColumn(String(col.field)) ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'"
                >{{ col.label }}</label>
                <!-- 拖拽手柄：按住这里调整列顺序 -->
                <span
                  class="ml-auto shrink-0 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing touch-none"
                  title="拖拽调整列顺序"
                  @pointerdown="onColPointerDown($event, String(col.field))"
                ><GripVertical class="size-4" /></span>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <Table :max-height="maxHeight" class="min-w-full table-fixed">
      <!-- 表头：sticky 用 bg-background（token，8 套风格通用） -->
      <TableHeader class="sticky top-0 z-10 bg-background">
        <TableRow>
          <TableHead v-if="selectable" class="sticky left-0 z-20 w-10 bg-background">
            <Checkbox
              :model-value="headerCheckboxState"
              aria-label="全选本页"
              @update:model-value="toggleSelectAll"
            />
          </TableHead>

          <TableHead
            v-for="col in filteredColumns"
            :key="String(col.field)"
            class="relative"
            :class="col.sortable ? 'cursor-pointer select-none hover:bg-muted/50' : ''"
            :style="colStyle(col)"
            :aria-sort="sortStateOf(col) === 'asc' ? 'ascending' : sortStateOf(col) === 'desc' ? 'descending' : undefined"
            @click="handleSort(col)"
          >
            <div
              class="flex min-w-0 items-center gap-1"
              :class="isFilterActive(col) ? 'rounded-md bg-primary/10 px-1.5 py-0.5 text-primary' : ''"
            >
              <slot v-if="col.headerSlot" :name="col.headerSlot" :col="col" :columns="filteredColumns"></slot>
              <span v-else class="truncate">{{ col.label }}</span>

              <template v-if="col.sortable">
                <ArrowUp v-if="sortStateOf(col) === 'asc'" class="size-3.5 shrink-0 text-foreground" />
                <ArrowDown v-else-if="sortStateOf(col) === 'desc'" class="size-3.5 shrink-0 text-foreground" />
                <ChevronsUpDown v-else class="size-3.5 shrink-0 text-muted-foreground" />
              </template>

              <Popover
                v-if="col.filter"
                :open="openFilterCol === filterKey(col)"
                @update:open="(o: boolean) => onFilterPopover(col, o)"
              >
                <PopoverTrigger as-child>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="size-5 shrink-0 p-0"
                    :class="isFilterActive(col) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
                    :aria-label="`筛选 ${col.label}`"
                    @click.stop
                  >
                    <Filter class="size-3.5" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  class="w-max min-w-72 max-w-[min(34rem,calc(100vw-2rem))] p-0"
                  align="start"
                  @click.stop
                >
                  <div class="border-b px-3 py-2 text-xs font-semibold">{{ col.label }} 筛选</div>

                  <div class="space-y-2 p-2">
                    <!-- 分面：列值 + 命中计数 -->
                    <template v-if="isFacetCol(col)">
                      <Input
                        :model-value="facetSearch"
                        placeholder="搜索关键字"
                        class="h-8 text-xs"
                        @update:model-value="(v: any) => onFacetSearch(col, String(v ?? ''))"
                      />
                      <div class="flex items-center justify-between text-xs text-muted-foreground">
                        <span>已选 {{ selectedCount(col) }} · 共 {{ visibleFacetItems.length }} 项</span>
                        <div class="flex shrink-0 items-center gap-2">
                          <button
                            v-if="visibleFacetItems.length"
                            type="button"
                            class="text-primary hover:underline"
                            @click="toggleFacetAll(col)"
                          >{{ facetAllSelected(col) ? '取消全选' : '全选' }}</button>
                          <button
                            v-if="visibleFacetItems.length"
                            type="button"
                            class="text-primary hover:underline"
                            @click="toggleFacetInvert(col)"
                          >反选</button>
                        </div>
                      </div>

                      <div v-if="facetLoading && !visibleFacetItems.length" class="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                        <Loader2 class="size-3.5 animate-spin" />加载中…
                      </div>
                      <div v-else-if="visibleFacetItems.length" class="max-h-48 overflow-auto rounded-md border">
                        <label
                          v-for="it in sortBySelected(col, visibleFacetItems)"
                          :key="String(it.value)"
                          class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs hover:bg-muted/50"
                          :class="isOptSelected(col, it.value) ? 'bg-primary/10 font-medium' : ''"
                          @click="toggleOpt(col, it.value, !isOptSelected(col, it.value))"
                        >
                          <Checkbox
                            :model-value="isOptSelected(col, it.value)"
                            @click.stop
                            @update:model-value="(c: any) => toggleOpt(col, it.value, !!c)"
                          />
                          <span class="min-w-0 flex-1 whitespace-normal break-words">{{ facetLabel(col, it.value) }}</span>
                          <span v-if="it.count" class="shrink-0 tabular-nums text-muted-foreground">{{ it.count }}</span>
                        </label>
                      </div>
                      <div v-else class="py-3 text-center text-xs text-muted-foreground">无匹配项</div>
                    </template>

                    <!-- 数字区间 -->
                    <template v-else-if="col.filter?.type === 'number'">
                      <div class="flex items-center gap-1">
                        <Input :model-value="rangeDraft(col).gte" type="number" placeholder="≥" class="h-8 text-xs" @update:model-value="(v: any) => rangeDraft(col).gte = v" />
                        <Input :model-value="rangeDraft(col).lte" type="number" placeholder="≤" class="h-8 text-xs" @update:model-value="(v: any) => rangeDraft(col).lte = v" />
                      </div>
                    </template>

                    <!-- 日期区间 + 按天多选 -->
                    <template v-else-if="col.filter?.type === 'date'">
                      <div class="space-y-1">
                        <Input :model-value="rangeDraft(col).gte" type="date" class="h-8 text-xs" @update:model-value="(v: any) => rangeDraft(col).gte = v" />
                        <Input :model-value="rangeDraft(col).lte" type="date" class="h-8 text-xs" @update:model-value="(v: any) => rangeDraft(col).lte = v" />
                      </div>
                      <div class="mt-2 border-t pt-2">
                        <div class="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                          <span>按天分布（勾选多选）</span>
                          <div class="flex shrink-0 items-center gap-2">
                            <button v-if="facetItems.length" type="button" class="text-primary hover:underline" @click="toggleDateAll(col)">{{ dateAllSelected(col) ? '取消全选' : '全选' }}</button>
                            <button v-if="facetItems.length" type="button" class="text-primary hover:underline" @click="toggleDateInvert(col)">反选</button>
                            <button type="button" class="text-primary hover:underline" @click="applyDatePreset(col, 'yesterday')">昨天</button>
                            <button type="button" class="text-primary hover:underline" @click="applyDatePreset(col, 'currentMonth')">当月</button>
                          </div>
                        </div>
                        <div v-if="facetLoading" class="py-3 text-center text-xs text-muted-foreground">加载中…</div>
                        <div v-else-if="facetItems.length" class="max-h-40 overflow-auto rounded-md border">
                          <label
                            v-for="it in facetItems"
                            :key="String(it.value)"
                            class="flex cursor-pointer items-center gap-2 px-2 py-1 text-xs hover:bg-muted/50"
                            :class="dateDays(col).includes(String(it.value)) ? 'bg-primary/10 font-medium' : ''"
                            @click="toggleDateDay(col, it.value)"
                          >
                            <Checkbox
                              :model-value="dateDays(col).includes(String(it.value))"
                              @click.stop
                              @update:model-value="(c: any) => { if (c) toggleDateDay(col, it.value) }"
                            />
                            <span class="flex-1 tabular-nums">{{ it.value ?? '（空 · 未设置）' }}</span>
                            <span class="shrink-0 tabular-nums text-muted-foreground">{{ it.count }}</span>
                          </label>
                        </div>
                        <div v-else class="py-2 text-center text-xs text-muted-foreground">无数据</div>
                      </div>
                    </template>

                    <!-- 文本包含 -->
                    <template v-else-if="col.filter?.type === 'text'">
                      <Input
                        :model-value="filterDraft[filterKey(col)] ?? ''"
                        placeholder="输入关键字…"
                        class="h-8 text-xs"
                        @update:model-value="(v: any) => { filterDraft[filterKey(col)] = v }"
                        @keyup.enter="applyFilter(col)"
                      />
                    </template>

                    <!-- 静态下拉多选 -->
                    <template v-else-if="col.filter?.type === 'select'">
                      <Input :model-value="selectSearch" placeholder="搜索关键字" class="h-8 text-xs" @update:model-value="(v: any) => selectSearch = String(v ?? '')" />
                      <div class="flex items-center justify-between text-xs text-muted-foreground">
                        <span>已选 {{ selectedCount(col) }} · 共 {{ filteredSelectOptions(col).length }} 项</span>
                        <div class="flex shrink-0 items-center gap-2">
                          <button v-if="filteredSelectOptions(col).length" type="button" class="text-primary hover:underline" @click="toggleAllSelect(col)">
                            {{ selectAllSelected(col) ? '取消全选' : '全选' }}
                          </button>
                          <button v-if="filteredSelectOptions(col).length" type="button" class="text-primary hover:underline" @click="toggleSelectInvert(col)">反选</button>
                        </div>
                      </div>
                      <div class="max-h-48 overflow-auto rounded-md border">
                        <label
                          v-for="opt in filteredSelectOptions(col)"
                          :key="String(opt.value)"
                          class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs hover:bg-muted/50"
                          :class="isOptSelected(col, opt.value) ? 'bg-primary/10 font-medium' : ''"
                          @click="toggleOpt(col, opt.value, !isOptSelected(col, opt.value))"
                        >
                          <Checkbox
                            :model-value="isOptSelected(col, opt.value)"
                            @click.stop
                            @update:model-value="(c: any) => toggleOpt(col, opt.value, !!c)"
                          />
                          <span class="min-w-0 whitespace-normal break-words">{{ opt.label }}</span>
                        </label>
                      </div>
                    </template>
                  </div>

                  <div class="flex items-center justify-between border-t px-3 py-2">
                    <Button variant="ghost" size="sm" class="h-8 px-2 text-xs" @click="resetFilter(col)">重置</Button>
                    <div class="flex gap-1">
                      <Button variant="outline" size="sm" class="h-8 px-3 text-xs" @click="openFilterCol = null">取消</Button>
                      <Button size="sm" class="h-8 px-3 text-xs" @click="applyFilter(col)">确定</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <!-- 列宽拖拽手柄 -->
            <div
              v-if="resizable"
              class="absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none hover:bg-primary/40 active:bg-primary/60"
              @mousedown.stop="startResize($event, col)"
              @click.stop
            ></div>
          </TableHead>

          <TableHead v-if="slots.actions" class="w-[140px] whitespace-nowrap text-right"></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <!-- 骨架屏 -->
        <template v-if="showLoading">
          <TableRow v-for="i in skeletonRows" :key="`sk-${i}`" class="animate-pulse">
            <TableCell v-if="selectable" class="sticky left-0 z-10 w-10 bg-background"><Skeleton class="size-4 rounded" /></TableCell>
            <TableCell v-for="(col, idx) in filteredColumns" :key="`sk-${String(col.field)}`">
              <Skeleton class="h-4 rounded" :style="skeletonStyle(idx)" />
            </TableCell>
            <TableCell v-if="slots.actions" class="text-right"><Skeleton class="ml-auto h-6 w-14 rounded" /></TableCell>
          </TableRow>
        </template>

        <!-- 空态：用库内 TableEmpty（自带整行 + 居中） -->
        <TableEmpty v-else-if="!sortedData.length" :colspan="colspanCount">
          <slot name="empty">{{ emptyText || '暂无数据' }}</slot>
        </TableEmpty>

        <template v-else>
          <TableRow
            v-for="(row, ri) in sortedData"
            :key="row[idField]"
            class="cn-anim-enter"
            :data-state="isRowSelected(row) ? 'selected' : undefined"
            :style="{ animationDelay: `${Math.min(ri, 10) * 0.02}s` }"
          >
            <TableCell v-if="selectable" class="sticky left-0 z-10 w-10 bg-background">
              <Checkbox
                :model-value="isRowSelected(row)"
                :aria-label="`选择 ${row[idField]}`"
                @update:model-value="toggleRow(row[idField])"
              />
            </TableCell>

            <TableCell
              v-for="(col, idx) in filteredColumns"
              :key="String(col.field)"
              :style="{ maxWidth: `${colSize(col)}px` }"
              :class="clickable && idx === 0 ? 'cursor-pointer font-medium text-primary hover:underline' : ''"
              @click="clickable && idx === 0 ? onRowClick(row) : undefined"
            >
              <template v-if="col.type === 'markdown'">
                <div class="overflow-hidden break-words" :style="{ maxHeight: `${cellMaxLines * 1.5}em` }">
                  <MdPreview :model-value="row[col.field]" />
                </div>
              </template>
              <template v-else-if="col.type === 'image'">
                <img :src="detailImgUrl(String(row[col.field] ?? ''))" alt="" class="max-h-24 max-w-28 object-contain" />
              </template>
              <template v-else-if="col.type === 'select' && col.options">
                <div class="break-words" :style="clampStyle">
                  {{ col.options.find(opt => opt.value === row[col.field])?.label ?? row[col.field] }}
                </div>
              </template>
              <template v-else>
                <slot :name="col.slot" v-bind="row" :row="row" :_idx="ri">
                  <div class="break-words" :style="clampStyle">{{ row[col.field] }}</div>
                </slot>
              </template>
            </TableCell>

            <TableCell v-if="slots.actions" class="whitespace-nowrap text-right">
              <slot name="actions" :row="row" v-bind="row"></slot>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>

      <!-- 表尾汇总（可选 #footer 插槽，收到 col / columns） -->
      <TableFooter v-if="slots.footer">
        <TableRow>
          <TableCell v-if="selectable" class="sticky left-0 z-10 bg-background"></TableCell>
          <TableCell v-for="col in filteredColumns" :key="`footer-${String(col.field)}`">
            <slot name="footer" :col="col" :columns="filteredColumns"></slot>
          </TableCell>
          <TableCell v-if="slots.actions"></TableCell>
        </TableRow>
      </TableFooter>
    </Table>

    <!-- 分页条：分页原语来自 ui/pagination，状态来自 TanStack -->
    <div v-if="showPagination" class="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
      <p class="text-sm text-muted-foreground">
        已选
        <span class="tabular-nums text-foreground">{{ selectedSummary.mode === 'all' ? `全部（排除 ${selectedSummary.excluded.length}）` : selectedSummary.ids.length }}</span>
        / 共 <span class="tabular-nums text-foreground">{{ rowCount }}</span> 行
      </p>

      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span>每页</span>
          <Select :model-value="String(tableState.pagination.pageSize)" @update:model-value="onPageSizeUpdate">
            <SelectTrigger class="h-8 w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="s in pageSizeOptions" :key="s" :value="String(s)">{{ s }}</SelectItem>
            </SelectContent>
          </Select>
          <span>条</span>
        </div>

        <Pagination
          class="mx-0 w-auto"
          :page="currentPage"
          :items-per-page="tableState.pagination.pageSize"
          :total="rowCount"
          :sibling-count="1"
          show-edges
          @update:page="onPageUpdate"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationFirst>首页</PaginationFirst>
            <PaginationPrevious>上一页</PaginationPrevious>
            <template v-for="(item, i) in items" :key="`p-${i}`">
              <PaginationItem
                v-if="item.type === 'page'"
                :value="item.value"
                :is-active="item.value === currentPage"
              >{{ item.value }}</PaginationItem>
              <PaginationEllipsis v-else />
            </template>
            <PaginationNext>下一页</PaginationNext>
            <PaginationLast>末页</PaginationLast>
          </PaginationContent>
        </Pagination>

        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span class="whitespace-nowrap">共 {{ pageCount }} 页，跳至</span>
          <Input
            v-model="jumpTo"
            type="number"
            min="1"
            :max="pageCount"
            class="h-8 w-16 px-2 text-sm"
            @keyup.enter="onJump"
          />
          <Button size="sm" variant="outline" class="h-8" @click="onJump">确定</Button>
        </div>
      </div>
    </div>
  </div>

  <!-- 行详情侧滑 -->
  <Sheet v-if="detailFields?.length" :open="detailOpen" @update:open="(o: boolean) => detailOpen = o">
    <SheetContent side="right" class="flex w-[480px] flex-col overflow-y-auto pl-4 sm:max-w-[480px]">
      <SheetHeader class="pl-0 text-center">
        <SheetTitle class="text-base">{{ detailTitle || '详情' }}</SheetTitle>
      </SheetHeader>
      <div v-if="detailRow" class="flex-1 space-y-0 py-4 text-sm">
        <div v-for="f in detailFields" :key="f.field" class="flex items-center border-b border-border py-3">
          <span class="w-[90px] shrink-0 text-muted-foreground">{{ f.label }}</span>
          <span class="flex-1 break-all text-foreground" :class="{ 'font-mono': f.type !== 'image' }">
            <template v-if="f.type === 'image' && imageList(detailRow[f.field]).length">
              <div class="flex flex-wrap gap-2">
                <img
                  v-for="(img, i) in imageList(detailRow[f.field])"
                  :key="i"
                  :src="img"
                  class="size-20 cursor-pointer rounded border object-cover hover:ring-2 hover:ring-ring"
                  @click="detailPreviewImage = img"
                />
              </div>
            </template>
            <template v-else>{{ detailRow[f.field] || '-' }}</template>
          </span>
        </div>
      </div>
      <SheetFooter class="mt-auto pt-2">
        <SheetClose as-child>
          <Button variant="outline" class="w-full">关闭</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>

  <!-- 图片大图预览 -->
  <Dialog :open="!!detailPreviewImage" @update:open="(o: boolean) => { if (!o) detailPreviewImage = '' }">
    <DialogContent class="p-2 sm:max-w-2xl">
      <img v-if="detailPreviewImage" :src="detailPreviewImage" class="h-auto w-full rounded" />
    </DialogContent>
  </Dialog>
</template>
