/**
 * Table 表格（纯 HTML 语义标签 + 样式包装，无 headless 依赖）
 *
 *   Table（外层容器 div 负责滚动 + 内层 <table>）
 *   ├─ TableCaption    底部说明文字
 *   ├─ TableHeader ─ TableRow ─ TableHead
 *   ├─ TableBody   ─ TableRow ─ TableCell
 *   ├─ TableFooter  ─ TableRow ─ TableCell（合计行）
 *   └─ TableEmpty      整行空状态（筛选无结果时用）
 *
 * 数据表格（排序 / 筛选 / 分页 / 行选择）不是单独组件：上游 shadcn 那份 Data Table
 * 指南基于 @tanstack/vue-table，本仓库**没有内置该依赖**，所以文档页里的实践是纯 Vue 写的。
 * （utils.ts 是当初随数据表格一起留下的，依赖 TanStack，目前没人引用。）
 */
export { default as Table } from "./Table.vue"
export { default as TableBody } from "./TableBody.vue"
export { default as TableCaption } from "./TableCaption.vue"
export { default as TableCell } from "./TableCell.vue"
export { default as TableEmpty } from "./TableEmpty.vue"
export { default as TableFooter } from "./TableFooter.vue"
export { default as TableHead } from "./TableHead.vue"
export { default as TableHeader } from "./TableHeader.vue"
export { default as TableRow } from "./TableRow.vue"
