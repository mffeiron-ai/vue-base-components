<script setup lang="ts">
/**
 * RichTable —— 业务组件（分子组件）· 数据表格
 *
 * 定位：把原子组件按「后台列表页」这一生产场景组合 + 强化出来的成品。
 *   · 状态机交给 TanStack（`@tanstack/vue-table` v9，可选依赖）：排序 / 分页 / 列显隐 /
 *     列宽 / 列序，一次注册 `tableFeatures`，不再手写这些状态；
 *   · 渲染全部用库内原子：Table / TableHeader / TableRow / TableHead / TableBody /
 *     TableCell / TableEmpty / TableFooter、Checkbox、Button、Input、
 *     DropdownMenu、Select、Pagination、Skeleton、Sheet、Dialog —— 所以 8 套风格预设
 *     （`.cn-table*` + `data-slot` 钩子）直接生效，组件里不写死颜色与圆角；
 *   · 业务强化（原子层没有的部分）：服务端分页 / 服务端筛选 + 分面懒加载 /
 *     跨页「全选所有匹配」/ 列宽列序列显隐持久化 / 行详情侧滑 / 表尾汇总 / 可点击行进详情。
 *
 * 与 `ui/data-table`（TanStack 渲染层）的分工：
 *   DataTable = headless，列定义与能力全由使用方注册，适合虚拟滚动、复杂表格；
 *   RichTable = 约定式开箱即用（columns 配置 + 服务端协议），适合后台列表页。
 *   两者共用同一套 Table 原子与命名（`#toolbar` / `#empty` / `#footer`、`data-state="selected"`）。
 *
 * 本目录（重构后，组件只留编排）：
 *   RichTable.vue          模板 + 动作函数（排序 / 分页 / 行详情）
 *   RichTableFilter.vue    表头筛选弹层（5 种输入形态，只驱动 useTableFilters）
 *   RichTableCell.vue      单元格内置形态（markdown / 图片 / 枚举 / 文本裁切）
 *   types.ts               列定义与协议（筛选参数组装、跨页选中语义）
 *   useTableState.ts       TanStack 状态 + props → state 单向同步
 *   useTableSelection.ts   跨页选中语义（'__all__' / '__except__:<id>'）
 *   useTableFilters.ts     表头筛选状态机（分面懒加载 / 草稿→生效 / 参数组装）
 *   列显隐 / 列序 / 列宽（含拖拽与持久化）与原子层共用 `ui/data-table/useTableColumns`。
 *
 * API 规范化（相对老版本的破坏性变更，见组件文档）：
 *   · 事件统一 kebab-case：`page-size-change`（旧 `pageSizeChange`）、`sort-change`、
 *     `filter-change`、`update:selected`、`update:page`、`update:pageSize`
 *   · `resizeKey` → `persistKey`（现在一并持久化 列宽 + 列序 + 列显隐）
 *   · 所有外向事件只发「语义」，不发内部状态（选中请用 resolveSelected() 解码）
 */
import { computed, onBeforeUnmount, ref, useSlots, watch } from 'vue'
import type { CSSProperties } from 'vue'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronsUpDown,
  GripVertical,
} from 'lucide-vue-next'
import { Button } from '../../ui/button'
import { Checkbox } from '../../ui/checkbox'
import { useTableColumns } from '../../ui/data-table'
import { Dialog, DialogContent } from '../../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import { Input } from '../../ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '../../ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '../../ui/sheet'
import { Skeleton } from '../../ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table'
import type { Column, FacetLoader, SelectionSummary } from './types'
import { guessColumnWidth } from './types'
import RichTableCell from './RichTableCell.vue'
import RichTableFilter from './RichTableFilter.vue'
import { useTableState } from './useTableState'
import { useTableSelection } from './useTableSelection'
import { useTableFilters } from './useTableFilters'

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
// 1. 状态：TanStack + 列状态（实现见 useTableState / useTableColumns）
// ============================================================

/** 具名插槽（search / toolbar / actions / footer / empty）用在多处判断里 */
const slots = useSlots()

/** 排序 / 分页 / 列状态容器，以及 props → state 的单向同步（都收在 composable 里） */
const { tableState, table, rowCount, pageCount, currentPage } = useTableState({
  columns: () => props.columns,
  data: () => props.data,
  total: () => props.total,
  page: () => props.page,
  pageSize: () => props.pageSize,
  sortField: () => props.sortField,
  sortOrder: () => props.sortOrder,
  idField: () => props.idField,
  minColumnWidth: () => props.minColumnWidth,
})

/** 列标识：RichTable 用 field 当列 id（与 TanStack 的列 id 保持一致） */
const colId = (col: Column) => String(col.field)

/**
 * 列显隐 / 列序 / 列宽（含拖拽与持久化）由原子层的设施统一实现，这里只接线。
 * ⚠️ `bt-state:` 前缀别改 —— 老用户已存的列宽 / 列序就放在这个 key 下。
 */
const {
  orderedColumns,
  visibleColumns: filteredColumns,
  isVisible: columnVisible,
  canHide: canHideColumn,
  toggleColumn,
  toggleAllColumns,
  isAllVisible: isAllColumnsSelected,
  widthOf,
  styleOf,
  startResize: resizeStart,
  draggingId: dragColField,
  dragOverId: dragOverField,
  onHandlePointerDown: onColPointerDown,
} = useTableColumns({
  table,
  columns: () => props.columns,
  idOf: colId,
  state: tableState,
  storageKey: () => (props.persistKey ? `bt-state:${props.persistKey}` : ''),
  minWidth: () => props.minColumnWidth,
  defaultSize: col => guessColumnWidth(col),
})

/** 模板以「列对象」为参数取宽度 / 样式，这里做一层 id 适配 */
const colSize = (col: Column) => widthOf(colId(col))
const colStyle = (col: Column) => styleOf(colId(col))
function startResize(e: MouseEvent, col: Column) {
  resizeStart(e, colId(col))
}

// ⚠️ 这里以前是「props → state 的 3 个 watch + 列状态持久化 + 列宽/列序的 DOM 交互」，
// 已分别搬进 useTableState（同步）、useTableColumns（持久化 + 拖拽 + 显隐）。

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

/** 跨页选中语义（'__all__' / '__except__'）实现在 composable 里，这里只接线 */
const {
  isRowSelected,
  headerState: headerCheckboxState,
  toggleAll: toggleSelectAll,
  toggleRow,
  summary: selectedSummary,
} = useTableSelection<any>({
  rows: () => sortedData.value,
  idField: () => props.idField,
  selected: () => props.selected,
  selectAll: () => props.selectAll,
  onChange: marks => emit('update:selected', marks),
})

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

// 只清自己的定时器：列拖拽 / 筛选防抖 / 列状态持久化由各自的 composable 负责
onBeforeUnmount(() => {
  if (skeletonHideTimer) clearTimeout(skeletonHideTimer)
})

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
// 8. 表头筛选（服务端语义 + 分面懒加载，实现见 useTableFilters）
// ============================================================

/**
 * 筛选状态机（实现在 `useTableFilters`，UI 在 `RichTableFilter.vue`）。
 * 这里只留一个句柄：模板里只需要判断「这一列有没有筛选」，其余全交给子组件。
 */
const filterApi = useTableFilters({
  columns: () => props.columns,
  facetLoader: () => props.facetLoader,
  onBeforeQuery: goToFirstPage,
  onChange: params => emit('filter-change', params),
})

// ============================================================
// 9. 分页动作（状态在 TanStack，UI 用库内 Pagination 原语）
// ============================================================

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

defineExpose({
  /** 行详情面板（业务方在别处触发时用） */
  openDetail: (row: any) => {
    if (!props.detailFields?.length) return
    detailRow.value = row
    detailOpen.value = true
  },
  resetAllFilters: filterApi.resetAllFilters,
  /** 外部设置某列筛选（如从看板卡片带参跳转到本列表），会自动重查 */
  setColumnFilter: filterApi.setColumnFilter,
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
              :class="filterApi.isFilterActive(col) ? 'rounded-md bg-primary/10 px-1.5 py-0.5 text-primary' : ''"
            >
              <slot v-if="col.headerSlot" :name="col.headerSlot" :col="col" :columns="filteredColumns"></slot>
              <span v-else class="truncate">{{ col.label }}</span>

              <template v-if="col.sortable">
                <ArrowUp v-if="sortStateOf(col) === 'asc'" class="size-3.5 shrink-0 text-foreground" />
                <ArrowDown v-else-if="sortStateOf(col) === 'desc'" class="size-3.5 shrink-0 text-foreground" />
                <ChevronsUpDown v-else class="size-3.5 shrink-0 text-muted-foreground" />
              </template>

              <!-- 筛选：弹层与 5 种输入形态都在子组件里，这里只把「列 + 状态机」递进去 -->
              <RichTableFilter v-if="col.filter" :col="col" :f="filterApi" />
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
              <!-- 内置形态（markdown / 图片 / 枚举 / 文本裁切）走子组件；自定义渲染由消费方插槽接住 -->
              <RichTableCell
                :col="col"
                :row="row"
                :clamp-style="clampStyle"
                :max-lines="cellMaxLines"
                :resolve-image-url="detailImgUrl"
              >
                <slot :name="col.slot" v-bind="row" :row="row" :_idx="ri">
                  <div class="break-words" :style="clampStyle">{{ row[col.field] }}</div>
                </slot>
              </RichTableCell>
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
