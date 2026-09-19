/**
 * RichTable —— 共享类型与协议
 *
 * 业务组件 = 把若干「原子组件」（src/components/ui/*）按生产场景组合 / 强化出来的成品，
 * 所以这里只放**约定**（列定义、筛选协议、选中协议）与**纯函数**，不放 UI 实现。
 *
 * 这里同时也是「服务端参数协议」的唯一定义处：`buildFilterParams()` 负责把界面上的筛选
 * 组装成后端参数，配套的解析（`fetchOrderPage` 那类）由使用方按同一份文档实现 ——
 * 组件、假数据服务、文档页三处共用一套说法。
 */

// ── 列定义 ────────────────────────────────────────────────────

/**
 * 列筛选配置。
 *
 * `filter-change` 事件发出的参数协议（与后端约定一致，`k` = filterKeyOf(col)）：
 *   number → `${k}__gte` / `${k}__lte`（配 `scale` 时自动乘以倍数，如「元 ↔ 分」）
 *   date   → `${k}__date__in`（按天多选，yyyy-MM-dd[]）/ `${k}__date__gte` / `${k}__date__lte`
 *   select、text(分面) → `${k}__in`（数组）
 *   text（普通）→ `${k}`（模糊匹配；配 matchFields 时同时匹配这些附加字段）
 */
export type ColumnFilter =
  | {
      type: 'text'
      /** 覆盖筛选参数用的字段名（默认取 col.field） */
      field?: string
      placeholder?: string
      /** 附加匹配字段：筛选框搜索时同时匹配这些字段（如商品标题、机制商品名） */
      matchFields?: string[]
    }
  | {
      type: 'select'
      field?: string
      placeholder?: string
      options: { label: string, value: any }[]
    }
  | {
      type: 'number'
      field?: string
      /** 前端值 → 后端值的倍数（如界面填「元」、接口要「分」则填 100） */
      scale?: number
    }
  | { type: 'date', field?: string }

/** 列定义（`T` 为行类型；不写泛型时退化为 any，老用法照样能用） */
export type Column<T = any> = {
  /** 表头文案（配 headerSlot 时作为兜底 / 列显隐菜单里的名字） */
  label: string
  /**
   * 取值字段。
   *
   * 写法是 `(keyof T & string) | string` 而不是 `keyof T | string` —— 后者在 `T = any`（默认泛型）
   * 时会带上 `number | symbol`（`keyof any` 全部三样），于是 `row[col.field]` 这类索引会报
   * 「类型"symbol"不能作为索引类型使用」；`& string` 把它收敛回字符串键。
   */
  field: (keyof T & string) | string
  /** 单元格自定义插槽名：`<template #mySlot="{ row }">`（插槽收到整行 + row） */
  slot?: string
  /** 自定义表头插槽名：收到 `{ col, columns }`，替代默认 label */
  headerSlot?: string
  /** 单元格类型：markdown（异步加载 md 预览）/ image / select（按 options 映射文案） */
  type?: 'text' | 'markdown' | 'image' | 'select' | (string & {})
  /** type='select' 时的值 → 文案映射 */
  options?: { value: any, label: string }[]
  /** 是否可排序（表头点击循环：升序 → 降序 → 取消） */
  sortable?: boolean
  /** 表头筛选控件 */
  filter?: ColumnFilter
  /** 初始列宽 px（缺省会按字段名启发式推断）；拖拽调整后会覆盖它 */
  width?: number
}

/** 分面（Excel 式分组计数）候选项 */
export type FacetItem = { value: any, count: number }

/** 分面加载器：打开筛选弹窗 / 搜索时调用（关键词防抖 350ms） */
export type FacetLoader = (col: Column, keyword: string) => Promise<FacetItem[]>

/** 筛选参数（`filter-change` 事件载荷）：键即上面文档里的协议名 */
export type FilterParams = Record<string, any>

// ── 纯函数：列宽 / 筛选键 / 文案 ──────────────────────────────

/** 筛选参数用的字段名（默认 col.field，可被 filter.field 覆盖） */
export function filterKeyOf(col: Column): string {
  return String(col.filter?.field ?? col.field)
}

/** 候选值显示名：优先列 options 映射；空值显示「（空 · 未设置）」 */
export const EMPTY_VALUE_LABEL = '（空 · 未设置）'

export function facetLabelOf(col: Column, value: any): string {
  const f = col.filter
  if (f?.type === 'select') {
    const hit = f.options.find(o => String(o.value) === String(value))
    if (hit) return hit.label
  }
  return value == null || value === '' ? EMPTY_VALUE_LABEL : String(value)
}

/**
 * 初始列宽推断：没显式给 width 时按字段名猜一档合理值。
 * （字段名语义有限，猜错也只是初始宽度——用户拖一下就存进 columnSizing 了）
 */
export function guessColumnWidth(col: Column): number {
  if (col.width) return col.width
  const f = String(col.field).toLowerCase()
  if (/^(id|.*_id)$/.test(f) || /status|num$|count|price|fee|amount|rate|ratio|pct|percent|commission/.test(f)) return 110
  if (/time|date|created|updated|synced|paid|settle/.test(f)) return 150
  if (/title|name|desc|remark|reason|content|address|img|link|url|detail/.test(f)) return 220
  return 150
}

/** 判断某列当前是否带着筛选值（用于表头高亮） */
export function isFilterActiveValue(v: any): boolean {
  if (v == null || v === '') return false
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.values(v as Record<string, any>).some(x => x !== '' && x != null)
  return true
}

/**
 * 把界面筛选组装成后端参数（**协议唯一实现处**，见 ColumnFilter 的文档）。
 * 空值 / 空数组一律不发，避免后端收到一堆「没筛」的参数。
 */
export function buildFilterParams(columns: Column[], filters: Record<string, any>): FilterParams {
  const params: FilterParams = {}
  for (const col of columns) {
    const f = col.filter
    if (!f) continue
    const k = filterKeyOf(col)
    const v = filters[k]
    if (v === '' || v == null) continue

    if (f.type === 'number') {
      const obj = (v as any) || {}
      const scaleVal = (x: any) => (f.scale != null && x !== '' && x != null ? Number(x) * f.scale : x)
      if (obj.gte !== '' && obj.gte != null) params[`${k}__gte`] = scaleVal(obj.gte)
      if (obj.lte !== '' && obj.lte != null) params[`${k}__lte`] = scaleVal(obj.lte)
      continue
    }

    if (f.type === 'date') {
      const obj = (v as any) || {}
      if (Array.isArray(obj.days) && obj.days.length) params[`${k}__date__in`] = obj.days
      if (obj.gte !== '' && obj.gte != null) params[`${k}__date__gte`] = obj.gte
      if (obj.lte !== '' && obj.lte != null) params[`${k}__date__lte`] = obj.lte
      continue
    }

    if (f.type === 'select' || (f.type === 'text' && Array.isArray(v))) {
      params[`${k}__in`] = Array.isArray(v) ? v : [v]
      continue
    }

    params[k] = v // 文本：模糊匹配（matchFields 交给后端）
  }
  return params
}

// ── 行选中协议 ────────────────────────────────────────────────
//
// 「跨页全选所有匹配」没法用 id 数组表达（服务端不知道全集），所以 selected 里可能出现两种标记：
//   '__all__'                → 所有匹配项都已选中
//   '__except__:<id>'        → 在全选基础上，排除某行
// 业务方请不要直接用这个数组，用 summarizeSelection() / RichTable#resolveSelected() 解码。

/** 全选标记：表示「所有匹配」而非某一页的 ids */
export const ALL_SELECT_MARK = '__all__'

/** 排除标记前缀：`__except__:<id>` = 跨页全选时排除某行 */
export const EXCLUDE_PREFIX = '__except__:'

/** 构造某行的排除标记 */
export function excludedMark(id: string | number): string {
  return `${EXCLUDE_PREFIX}${id}`
}

/** 解码后的选中语义 */
export type SelectionSummary = {
  /** all = 全选所有匹配（配合 excluded 使用）；ids = 只选了列出的这些行 */
  mode: 'all' | 'ids'
  /** mode='ids' 时是全部选中项；mode='all' 时为空数组 */
  ids: (string | number)[]
  /** mode='all' 时被排除的行 */
  excluded: (string | number)[]
}

/**
 * 把 selected 标记解码成可用的语义。
 *
 * 例：`['__all__', '__except__:12']` → `{ mode: 'all', ids: [], excluded: [12] }`
 */
export function summarizeSelection(marks?: (string | number)[] | null): SelectionSummary {
  const list = Array.isArray(marks) ? marks : []
  const all = list.includes(ALL_SELECT_MARK)
  const excluded = list
    .filter((m): m is string => typeof m === 'string' && m.startsWith(EXCLUDE_PREFIX))
    .map(m => m.slice(EXCLUDE_PREFIX.length))
  if (all) return { mode: 'all', ids: [], excluded }
  return { mode: 'ids', ids: list.filter(m => m !== ALL_SELECT_MARK), excluded: [] }
}
