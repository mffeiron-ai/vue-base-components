/**
 * 业务组件（分子组件）—— 共享类型与协议
 *
 * 业务组件 = 把若干「原子组件」（src/components/ui/*）按生产场景组合 / 强化出来的成品，
 * 所以这里只放**约定**（列定义、筛选协议、选中协议），不放 UI 实现。
 */

/**
 * 列筛选配置。
 *
 * `filter-change` 事件发出的参数协议（与后端约定一致，`k` = filterKey(col)）：
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
      options: { label: string; value: any }[]
    }
  | {
      type: 'number'
      field?: string
      /** 前端值 → 后端值的倍数（如界面填「元」、接口要「分」则填 100） */
      scale?: number
    }
  | { type: 'date', field?: string }

/** 列定义 */
export type Column<T = any> = {
  /** 表头文案（配 headerSlot 时作为兜底 / 列显隐菜单里的名字） */
  label: string
  /** 取值字段 */
  field: keyof T | string
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

// ── 行选中协议 ──────────────────────────────────────────────
//
// 「跨页全选所有匹配」没法用 id 数组表达（服务端不知道全集），所以 selected 里可能出现两种标记：
//   '__all__'                → 所有匹配项都已选中
//   '__except__:<id>'        → 在全选基础上，排除某行
// 业务方请不要直接用这个数组，用 summarizeSelection() / BaseTable#resolveSelected() 解码。

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
