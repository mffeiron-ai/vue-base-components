/**
 * 业务组件（分子组件）
 *
 * 与 `ui/` 的分工：
 *   `ui/`   = 原子组件，走 Registry 源码分发（`npx rionstudio add <name>`），只吃预设样式不做业务假设；
 *   `business/` = 分子组件，把原子按生产场景组合 / 强化出来，通过 npm 导出（`@rionstudio/ui`）。
 *
 * 命名约定：业务组件一律 `Base*` 前缀（BaseTable、BaseForm…），
 * 每个业务组件一个目录（组件 + types + 同目录 composable）。
 */
export { default as BaseTable } from './base-table/BaseTable.vue'
export * from './base-table/types'
