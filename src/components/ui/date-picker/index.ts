/**
 * 日期选择器：单日 / 输入框 + 日历 / 日期区间三种形态。
 *
 * 依赖 `@internationalized/date`（日期类型与时区安全的运算）和 reka-ui 的 Calendar，
 * 两者本仓库已经是必需依赖，所以这里不引入 date-fns / dayjs 之类的额外包。
 *
 * 值类型统一是 `CalendarDate`（区间是 `{ start, end }`）：
 *   - 交给接口：`formatDateISO(value)` → `'2026-09-15'`
 *   - 从接口来：`toCalendarDate('2026-09-15')` → CalendarDate
 *   - 给第三方库：`toDateOf(value)` → 原生 Date
 */
export { default as DatePicker } from "./DatePicker.vue"
export { default as DatePickerInput } from "./DatePickerInput.vue"
export { default as DatePickerRange } from "./DatePickerRange.vue"

export type { DateRange, DateRangePreset } from "./utils"
export {
  defaultRangePresets,
  formatDateISO,
  formatDateLabel,
  formatRangeLabel,
  isSameDate,
  parseDateInput,
  toCalendarDate,
  toDateOf,
} from "./utils"
