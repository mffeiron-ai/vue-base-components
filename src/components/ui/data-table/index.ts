/**
 * DataTable —— 基于 @tanstack/vue-table 的数据表格（可选依赖，装了才用）
 *
 * 分工：**TanStack 管状态（排序 / 筛选 / 分面 / 分页 / 列显隐 / 行选择 / 列尺寸…），
 * 本目录只做渲染**。所以：
 *  - 实例由使用方 `useTable({ ... })` 创建（v9 起 feature 要显式注册），
 *    在 `features` 里给什么能力，就有对应能力，组件侧不写死任何一项；
 *  - `DataTable` 只认 getHeaderGroups() / getRowModel() 两条稳定接口，
 *    因此不受 TanStack 版本与 feature API 变动影响；
 *  - 三个配套组件（列头排序菜单 / 分页条 / 列显隐菜单）同样只依赖惯用方法名，
 *    服务端分页、虚拟滚动、拖拽宽度都能直接接。
 *
 * 典型用法：
 *   const table = useTable({ features: stockFeatures, data, columns,
 *     getCoreRowModel: createCoreRowModel(), getSortedRowModel: createSortedRowModel(), ... })
 *   <DataTable :table="table">
 *     <template #toolbar>…筛选 / 列显隐…</template>
 *     <template #footer><DataTablePagination :table="table" /></template>
 *   </DataTable>
 *
 * peerDependencies 里 `@tanstack/vue-table` 是 **optional** 的：不用数据表格的项目不必安装。
 */
export { default as DataTable } from "./DataTable.vue"
export { default as DataTableColumnHeader } from "./DataTableColumnHeader.vue"
export { default as DataTablePagination } from "./DataTablePagination.vue"
export { default as DataTableViewOptions } from "./DataTableViewOptions.vue"
