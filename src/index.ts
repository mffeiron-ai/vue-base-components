// ============================================================
// @rionstudio/ui — RionStudio 组件库统一入口
//
// 注意：`src/components/ui/` 已迁移为 Registry 源码分发模式
// （通过 CLI 复制到消费项目，而非 npm 包导出）。
// 业务组件仍通过本入口以 npm 包形式导出。
// ============================================================

// ── 业务组件（分子组件）────────────────────────────────────
// 目录：src/components/business/，命名 Base*，类型与协议放各自 types.ts
export { BaseTable } from './components/business'
export type { Column, ColumnFilter, FacetItem, FacetLoader, SelectionSummary } from './components/business'
export { ALL_SELECT_MARK, EXCLUDE_PREFIX, excludedMark, summarizeSelection } from './components/business'

// 迁移中（原先从 src/components/*.vue 直接导出，那批文件已清理，等按新结构重写后再挂回来）：
//   BaseEdit / BasePagination / EditDialog / ImportDialog / GlobalSearch /
//   ComboboxField / MarkDown / TrendChart / BlurText
// 分页不再单独提供业务组件：BaseTable 内部已直接用 `ui/pagination` 原语；
// 需要独立分页时也直接用原子（`ui/pagination`）而不是再包一层。

// ── 工具函数 ──────────────────────────────────────────────
export { cn } from './lib/utils'

// ── UI 组件 ───────────────────────────────────────────────
// 已迁移到 Registry 分发模式：`npx rionstudio add <name>`
// 从本仓库 src/components/ui/ 复制到消费项目，不再从此处导出。
// 详见 docs/ 与 packages/cli/。
