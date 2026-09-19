/**
 * BaseTable · 表头筛选（服务端语义 + 分面懒加载）
 *
 * 拆出来是为了让 BaseTable 只留「编排」：这里管筛选的全部状态机
 * ——「草稿（弹窗里改）→ 生效（点确定才发请求）」、分面按需加载（防抖 + 竞态保护）、
 * 以及把生效筛选组装成后端参数（协议实现在 types.ts 的 buildFilterParams）。
 *
 * 三类筛选控件（分面多选 / 静态 options 多选 / 日期按天多选）本质是同一件事
 * ——「在一个候选列表上做 全选 / 反选 / 勾选 / 计数」—— 所以下面先写通用核心，
 * 再给三类各留一层薄封装（模板读的是薄封装，避免同样的逻辑抄三遍）。
 */
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import type { Column, FacetItem, FacetLoader, FilterParams } from './types'
import { buildFilterParams, facetLabelOf, filterKeyOf, isFilterActiveValue } from './types'

export interface UseTableFiltersOptions {
  columns: () => Column[]
  facetLoader?: () => FacetLoader | undefined
  /** 应用筛选前回调（组件用它把页码拉回第 1 页并同步 TanStack 状态） */
  onBeforeQuery: () => void
  /** 筛选参数变化时抛出（组件接 `filter-change`） */
  onChange: (params: FilterParams) => void
}

export function useTableFilters(options: UseTableFiltersOptions) {
  const filters = ref<Record<string, any>>({})
  const filterDraft = ref<Record<string, any>>({})
  const openFilterCol = ref<string | null>(null)
  const selectSearch = ref('')
  const facetItems = ref<FacetItem[]>([])
  const facetLoading = ref(false)
  const facetSearch = ref('')
  let facetTimer: ReturnType<typeof setTimeout> | undefined
  /** 请求序号：只让最新一次 facet 请求落地，防止慢的「全量」响应覆盖搜索快结果 */
  let facetSeq = 0

  const filterKey = (col: Column) => filterKeyOf(col)
  const facetLabel = (col: Column, value: any) => facetLabelOf(col, value)
  const isFilterActive = (col: Column) => isFilterActiveValue(filters.value[filterKeyOf(col)])

  /** 该列是否走分面（分组计数）模式 */
  function isFacetCol(col: Column): boolean {
    if (!options.facetLoader?.()) return false
    return col.filter?.type === 'text' || col.filter?.type === 'select'
  }

  // ── 分面加载 ────────────────────────────────────────────────

  async function loadFacet(col: Column, keyword: string) {
    const loader = options.facetLoader?.()
    if (!loader) return
    const seq = ++facetSeq
    facetLoading.value = true
    try {
      const items = (await loader(col, keyword)) || []
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

  /** 多选候选项：合并已选中的值（即使不在加载结果里），已选项不会因加载而消失 */
  const visibleFacetItems = computed<FacetItem[]>(() => {
    const base = facetItems.value
    const arr = openFilterCol.value ? filterDraft.value[openFilterCol.value] : null
    if (!Array.isArray(arr) || !arr.length) return base
    const seen = new Set(base.map(it => String(it.value)))
    const extra = arr.filter(v => !seen.has(String(v))).map(v => ({ value: v, count: 0 }))
    return extra.length ? [...base, ...extra] : base
  })

  // ── 通用核心：候选列表上的 勾选 / 全选 / 反选 / 计数 ────────

  /** 草稿里的已选数组（多选类型的列） */
  function draftList(col: Column): any[] {
    const v = filterDraft.value[filterKeyOf(col)]
    return Array.isArray(v) ? v : []
  }

  function setDraftList(col: Column, arr: any[]) {
    filterDraft.value[filterKeyOf(col)] = arr
  }

  function isOptSelected(col: Column, val: any): boolean {
    const arr = filterDraft.value[filterKeyOf(col)]
    if (Array.isArray(arr)) return arr.includes(val)
    return arr != null && arr !== '' && arr === val
  }

  function selectedCount(col: Column): number {
    const arr = filterDraft.value[filterKeyOf(col)]
    if (Array.isArray(arr)) return arr.length
    return arr == null || arr === '' ? 0 : 1
  }

  function toggleOpt(col: Column, val: any, checked: boolean) {
    const cur = [...draftList(col)]
    if (checked) {
      if (!cur.includes(val)) cur.push(val)
    } else {
      const i = cur.indexOf(val)
      if (i >= 0) cur.splice(i, 1)
    }
    setDraftList(col, cur)
  }

  function allOfSelected(col: Column, candidates: any[]): boolean {
    const arr = draftList(col)
    return candidates.length > 0 && candidates.every(v => arr.includes(v))
  }

  function toggleAllOf(col: Column, candidates: any[]) {
    if (allOfSelected(col, candidates)) {
      setDraftList(col, [])
      return
    }
    const cur = [...draftList(col)]
    for (const v of candidates) if (!cur.includes(v)) cur.push(v)
    setDraftList(col, cur)
  }

  function invertOf(col: Column, candidates: any[]) {
    const next = new Set(draftList(col))
    for (const v of candidates) {
      if (next.has(v)) next.delete(v)
      else next.add(v)
    }
    setDraftList(col, [...next])
  }

  /** 已选中的候选项排前面 */
  function sortSelectedFirst(col: Column, items: FacetItem[]): FacetItem[] {
    return [...items].sort((a, b) => Number(isOptSelected(col, b.value)) - Number(isOptSelected(col, a.value)))
  }

  // ── ① 分面多选 ──────────────────────────────────────────────

  const facetCandidates = (): any[] => visibleFacetItems.value.map(it => it.value)

  function toggleFacetAll(col: Column) {
    toggleAllOf(col, facetItems.value.map(it => it.value))
  }
  function facetAllSelected(col: Column): boolean {
    return allOfSelected(col, facetItems.value.map(it => it.value))
  }
  function toggleFacetInvert(col: Column) {
    invertOf(col, visibleFacetItems.value.map(it => it.value))
  }
  const sortBySelected = (col: Column, items: FacetItem[]) => sortSelectedFirst(col, items)

  // ── ② 静态 options 多选 ─────────────────────────────────────

  function filteredSelectOptions(col: Column): { label: string, value: any }[] {
    const f = col.filter
    const opts = f?.type === 'select' ? f.options : []
    const kw = selectSearch.value.trim().toLowerCase()
    const list = kw ? opts.filter(o => String(o.label).toLowerCase().includes(kw)) : [...opts]
    return list.sort((a, b) => Number(isOptSelected(col, b.value)) - Number(isOptSelected(col, a.value)))
  }
  const selectOptions = (col: Column) => filteredSelectOptions(col).map(o => o.value)
  function toggleAllSelect(col: Column) {
    toggleAllOf(col, selectOptions(col))
  }
  function selectAllSelected(col: Column): boolean {
    return allOfSelected(col, selectOptions(col))
  }
  function toggleSelectInvert(col: Column) {
    invertOf(col, selectOptions(col))
  }

  // ── ③ 日期：区间 + 按天多选 ─────────────────────────────────

  /** 区间草稿（number / date 共用）：返回可写对象 */
  function rangeDraft(col: Column): { gte: any, lte: any, days: string[] } {
    const k = filterKeyOf(col)
    const d = filterDraft.value[k]
    if (!d || typeof d !== 'object' || Array.isArray(d)) {
      filterDraft.value[k] = { gte: '', lte: '', days: [] }
    } else if (!Array.isArray(d.days)) {
      d.days = []
    }
    return filterDraft.value[k]
  }
  const dateDays = (col: Column): string[] => rangeDraft(col).days
  const dateCandidates = (): any[] => facetItems.value.map(it => it.value).filter(v => v != null && v !== '')

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
    const cands = dateCandidates().map(String)
    return cands.length > 0 && cands.every(d => days.includes(d))
  }
  function toggleDateAll(col: Column) {
    const days = dateDays(col)
    if (dateAllSelected(col)) {
      days.length = 0
      return
    }
    for (const it of facetItems.value) {
      if (it.value == null) continue
      const s = String(it.value)
      if (!days.includes(s)) days.push(s)
    }
  }
  function toggleDateInvert(col: Column) {
    const next = new Set(dateDays(col))
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
    const k = filterKeyOf(col)
    if (preset === 'yesterday') {
      d.setDate(d.getDate() - 1)
      filterDraft.value[k] = { gte: fmt(d), lte: fmt(d) }
    } else {
      const first = new Date(d.getFullYear(), d.getMonth(), 1)
      filterDraft.value[k] = { gte: fmt(first), lte: fmt(d) }
    }
    applyFilter(col)
  }

  // ── 弹窗开关（把生效值抄成草稿；分面此时才去计数） ──────────

  function onFilterPopover(col: Column, open: boolean) {
    if (!open) {
      openFilterCol.value = null
      return
    }
    const k = filterKeyOf(col)
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
      if (f?.type === 'date') {
        facetSearch.value = ''
        loadFacet(col, '')
      }
    } else if (f?.type === 'select') {
      filterDraft.value[k] = Array.isArray(cur) ? [...cur] : (cur != null && cur !== '' ? [cur] : [])
    } else {
      filterDraft.value[k] = cur == null ? '' : String(cur)
    }
    selectSearch.value = ''
  }

  // ── 生效 / 重置 / 对外 ─────────────────────────────────────

  function emitFilter() {
    options.onChange(buildFilterParams(options.columns(), filters.value))
  }

  /** 弹窗点「确定」：草稿 → 正式筛选，回第 1 页并发查询 */
  function applyFilter(col: Column) {
    const k = filterKeyOf(col)
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
    options.onBeforeQuery()
    emitFilter()
  }

  function resetFilter(col: Column) {
    const k = filterKeyOf(col)
    delete filters.value[k]
    delete filterDraft.value[k]
    selectSearch.value = ''
    facetItems.value = []
    openFilterCol.value = null
    options.onBeforeQuery()
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
    options.onBeforeQuery()
    emitFilter()
  }

  /** 外部设置某列筛选（如从看板卡片带参跳转到本列表），会自动重查 */
  function setColumnFilter(field: string, value: any) {
    const col = options.columns().find(c => String(c.field) === field)
    if (!col?.filter) return
    const k = filterKeyOf(col)
    const isEmpty = value == null || value === '' || (Array.isArray(value) && value.length === 0)
    if (isEmpty) {
      delete filters.value[k]
      delete filterDraft.value[k]
    } else {
      const v = Array.isArray(value) ? [...value] : value
      filters.value[k] = v
      filterDraft.value[k] = Array.isArray(v) ? [...v] : v
    }
    options.onBeforeQuery()
    emitFilter()
  }

  function dispose() {
    if (facetTimer) clearTimeout(facetTimer)
  }
  // 卸载时自动清掉防抖定时器（调用方不需要记得手动 dispose）
  onBeforeUnmount(dispose)

  /**
   * 用 `reactive` 包一层：这些 ref 被「当成属性」访问时（父组件传下去、子组件 `f.facetItems`）
   * 会自动解包，模板里不必写 `.value`。
   */
  return reactive({
    // 状态（filterDraft / filterKey 是模板在用的「内部细节」，后续改由 draftOf/setDraft 包装）
    filters,
    filterDraft,
    filterKey,
    openFilterCol,
    selectSearch,
    facetItems,
    facetLoading,
    facetSearch,
    visibleFacetItems,
    // 判定与文案
    isFacetCol,
    isFilterActive,
    facetLabel,
    // 通用
    isOptSelected,
    selectedCount,
    toggleOpt,
    // 分面
    toggleFacetAll,
    facetAllSelected,
    toggleFacetInvert,
    sortBySelected,
    onFacetSearch,
    // 静态 options
    filteredSelectOptions,
    toggleAllSelect,
    selectAllSelected,
    toggleSelectInvert,
    // 日期 / 区间
    rangeDraft,
    dateDays,
    toggleDateDay,
    dateAllSelected,
    toggleDateAll,
    toggleDateInvert,
    applyDatePreset,
    // 生命周期
    onFilterPopover,
    applyFilter,
    resetFilter,
    resetAllFilters,
    setColumnFilter,
    dispose,
  })
}

/** 筛选状态机的对外类型（子组件拿它当 prop 类型） */
export type UseTableFiltersApi = ReturnType<typeof useTableFilters>
