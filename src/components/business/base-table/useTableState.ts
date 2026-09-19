/**
 * BaseTable · TanStack 状态与受控同步
 *
 * 单一来源：排序 / 分页 / 列显隐 / 列宽 / 列序 全部交给 TanStack 的 table 实例，
 * 本文件负责①能力注册（一次，放模块作用域）②状态容器③与 props 的单向同步。
 *
 * ⚠️ v9 的 Vue 适配器不会解包传进 `state` 的 ref —— 这里必须是**普通 reactive 对象**，
 * 传 ref 会让内部拿到 Ref，`getIsSorted()` 之类直接报错。
 */
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
import { computed, reactive, watch } from 'vue'
import type { Column } from './types'
import { guessColumnWidth } from './types'

/**
 * 能力一次注册（模块作用域，避免每次渲染重建）。
 * `stockFeatures` 已含 排序/筛选/分面/分页/列显隐/列宽/列序/行选择，这里只补
 * 「用哪个 row model」与排序函数登记表。
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

export interface UseTableStateOptions<T> {
  columns: () => Column<T>[]
  data: () => T[]
  total?: () => number | undefined
  page?: () => number | undefined
  pageSize?: () => number | undefined
  sortField?: () => string | null | undefined
  sortOrder?: () => 'asc' | 'desc' | null | undefined
  idField: () => string
  minColumnWidth?: () => number
}

export function useTableState<T>(options: UseTableStateOptions<T>) {
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

  /** 列定义 → TanStack 列定义（初始列宽在这里给，运行时覆盖走 columnSizing） */
  const columnDefs = computed(() => options.columns().map(col => ({
    id: String(col.field),
    accessorKey: String(col.field),
    header: col.label,
    enableSorting: !!col.sortable,
    enableHiding: true,
    size: guessColumnWidth(col),
  })) as any[])

  const rowCount = computed(() => options.total?.() ?? options.data().length)

  const table = useTable({
    features: TABLE_FEATURES,
    data: computed(() => options.data()),
    columns: columnDefs,
    state: tableState,
    // 数据、排序、筛选全部由服务端负责，TanStack 只持有状态（不发请求）
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount,
    getRowId: (row: any) => String(row[options.idField()]),
    enableColumnResizing: true,
    defaultColumn: { size: 150, minSize: options.minColumnWidth?.() ?? 60, maxSize: 800 },
    onSortingChange: (u: any) => applyState('sorting', u),
    onPaginationChange: (u: any) => applyState('pagination', u),
    onColumnVisibilityChange: (u: any) => applyState('columnVisibility', u),
    onColumnSizingChange: (u: any) => applyState('columnSizing', u),
    onColumnOrderChange: (u: any) => applyState('columnOrder', u),
  })

  // ── props → state（单向同步；向外发事件由调用方的动作函数负责） ──

  watch(() => options.page?.(), (v) => {
    const idx = Math.max(0, (v ?? 1) - 1)
    if (tableState.pagination.pageIndex !== idx) tableState.pagination.pageIndex = idx
  }, { immediate: true })

  watch(() => options.pageSize?.(), (v) => {
    const size = v ?? 10
    if (tableState.pagination.pageSize !== size) tableState.pagination.pageSize = size
  }, { immediate: true })

  watch([() => options.sortField?.(), () => options.sortOrder?.()], ([f, o]) => {
    const next = f ? [{ id: String(f), desc: o === 'desc' }] : []
    const cur = tableState.sorting
    if (next.length !== cur.length || next.some((n, i) => n.id !== cur[i]?.id || n.desc !== cur[i]?.desc)) {
      tableState.sorting = next
    }
  }, { immediate: true })

  const pageCount = computed(() => Math.max(1, table.getPageCount?.() ?? 1))
  const currentPage = computed(() => tableState.pagination.pageIndex + 1)

  return { tableState, table, columnDefs, rowCount, pageCount, currentPage }
}
