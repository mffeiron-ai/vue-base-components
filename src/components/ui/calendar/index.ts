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
