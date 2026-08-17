// ============================================================
// @rionstudio/ui — RionStudio 组件库统一入口
//
// 注意：`src/components/ui/` 已迁移为 Registry 源码分发模式
// （通过 CLI 复制到消费项目，而非 npm 包导出）。
// 业务组件仍通过本入口以 npm 包形式导出。
// ============================================================

// ── 业务组件 ──────────────────────────────────────────────
export { default as BaseTable } from './components/BaseTable.vue'
export type { Column } from './components/BaseTable.vue'
export { default as BaseEdit } from './components/BaseEdit.vue'
export { default as BasePagination } from './components/BasePagination.vue'
export { default as EditDialog } from './components/EditDialog.vue'
export type { FieldConfig } from './components/EditDialog.vue'
export { default as ImportDialog } from './components/ImportDialog.vue'
export { default as GlobalSearch } from './components/GlobalSearch.vue'
export { default as ComboboxField } from './components/ComboboxField.vue'
export { default as MarkDown } from './components/MarkDown.vue'
export { default as TrendChart } from './components/TrendChart.vue'
export { default as BlurText } from './components/BlurText.vue'

// ── 工具函数 ──────────────────────────────────────────────
export { cn } from './lib/utils'

// ── UI 组件 ───────────────────────────────────────────────
// 已迁移到 Registry 分发模式：`npx rionstudio add <name>`
// 从本仓库 src/components/ui/ 复制到消费项目，不再从此处导出。
// 详见 docs/ 与 packages/cli/。
