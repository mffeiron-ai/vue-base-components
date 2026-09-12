// 日历（单日选择）。子组件按表格结构拆开，可自由组合／替换其中任意一块
export { default as Calendar } from "./Calendar.vue"
export { default as CalendarCell } from "./CalendarCell.vue"
export { default as CalendarCellTrigger } from "./CalendarCellTrigger.vue"
export { default as CalendarGrid } from "./CalendarGrid.vue"
export { default as CalendarGridBody } from "./CalendarGridBody.vue"
export { default as CalendarGridHead } from "./CalendarGridHead.vue"
export { default as CalendarGridRow } from "./CalendarGridRow.vue"
export { default as CalendarHeadCell } from "./CalendarHeadCell.vue"
export { default as CalendarHeader } from "./CalendarHeader.vue"
export { default as CalendarHeading } from "./CalendarHeading.vue"
export { default as CalendarNextButton } from "./CalendarNextButton.vue"
export { default as CalendarPrevButton } from "./CalendarPrevButton.vue"

/** 标题区形式：月+年下拉 / 仅月下拉 / 仅年下拉；不传则为纯文本标题 */
export type LayoutTypes = "month-and-year" | "month-only" | "year-only" | undefined

/**
 * 换页（换月/翻页）动画，**不传默认滑入（slide）**：
 *  - slide：横向滑入滑出（按翻页方向自动换向）
 *  - fade：淡入淡出
 *  - zoom：缩放
 *  - flip：3D 翻转
 * 传 none 关掉动画，直接切换（此时网格不会卸载重建）
 */
export type PageAnimationTypes = "none" | "slide" | "fade" | "zoom" | "flip" | undefined
