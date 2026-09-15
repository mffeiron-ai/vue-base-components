/**
 * Date Picker 的共用工具层（三个选择器组件都从这里取格式化 / 解析 / 预设）。
 *
 * 日期类型统一用 `@internationalized/date` 的 `CalendarDate`（reka-ui 的原生类型）：
 * 它是「年月日」的纯日期值，不带时分秒、不受时区偏移影响，跨时区不会差一天，
 * 比原生 `Date` 更适合做「选日期」这件事。需要给接口/后端时用 `formatDateISO` 出 `yyyy-MM-dd`，
 * 需要变回原生 `Date` 用 `toDateOf`。
 */
import type { CalendarDate as CalendarDateType, DateValue } from "@internationalized/date"
import { CalendarDate, endOfMonth, getLocalTimeZone, today } from "@internationalized/date"
import { toDate } from "reka-ui/date"

/** 一个日期区间（闭区间，含首尾两天）；用户只点了开始日时 `end` 为 null */
export interface DateRange {
  start: DateValue | null
  end: DateValue | null
}

/** 快捷预设：点一下就套用一段区间（label 上屏，value 现场算，避免跨天时数据过期） */
export interface DateRangePreset {
  label: string
  value: () => DateRange
}

/** 把 reka 的 DateValue 转成原生 Date（需要交给第三方库 / 做时间比较时用） */
export function toDateOf(value: DateValue | null | undefined): Date | null {
  return value ? toDate(value, getLocalTimeZone()) : null
}

/**
 * 把「原生 Date / 'yyyy-MM-dd' 字符串 / CalendarDate」统一成 CalendarDate。
 * 解析失败返回 null（不抛错，方便直接喂给 v-model）。
 */
export function toCalendarDate(input: Date | string | DateValue | null | undefined): CalendarDateType | null {
  if (!input) return null
  if (typeof input === "string") return parseDateInput(input)
  if (input instanceof Date) {
    return new CalendarDate(input.getFullYear(), input.getMonth() + 1, input.getDate())
  }
  // 已经是 DateValue（CalendarDate / ZonedDateTime …）：取出年月日重新构造成纯日期
  const d = input as DateValue
  return new CalendarDate(d.year, d.month, d.day)
}

/**
 * 解析手输的日期文本，认这几种写法：
 *   `2026-09-15` / `2026/9/5` / `2026.9.5`
 * 空串返回 null；格式不对或日期非法（如 2 月 30 日）返回 null。
 */
export function parseDateInput(text: string): CalendarDateType | null {
  const t = text.trim()
  if (!t) return null
  const m = t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  const value = new CalendarDate(year, month, day)
  // 注意：CalendarDate 对越界值（2026-02-30、2026-13-01）不会报错，而是「就近夹取」成 2026-02-28 / 2026-12-01。
  // 这种悄悄改日期的行为对用户是灾难，所以回读核对：跟敲进去的不一致就当作解析失败。
  if (value.year !== year || value.month !== month || value.day !== day) return null
  return value
}

/** 出 `yyyy-MM-dd`：给接口 / input value / 存储用 */
export function formatDateISO(value: DateValue | null | undefined): string {
  if (!value) return ""
  const p = (n: number) => String(n).padStart(2, "0")
  return `${value.year}-${p(value.month)}-${p(value.day)}`
}

/**
 * 人类可读的展示文案，默认「2026年9月15日」（中文）——用 Intl 按 locale 出，
 * 换语言不用改代码；想换样式传 options（如 `{ month: 'short' }`）。
 */
export function formatDateLabel(
  value: DateValue | null | undefined,
  locale = "zh-CN",
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = toDateOf(value)
  if (!d) return ""
  return new Intl.DateTimeFormat(locale, options ?? { year: "numeric", month: "long", day: "numeric" }).format(d)
}

/** 区间展示文案：`2026年9月1日 ~ 2026年9月15日` */
export function formatRangeLabel(
  range: DateRange | null | undefined,
  locale = "zh-CN",
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!range?.start || !range?.end) return ""
  return `${formatDateLabel(range.start, locale, options)} ~ ${formatDateLabel(range.end, locale, options)}`
}

/** 两个日期是否是同一天（比较年月日，不看时区/时间） */
export function isSameDate(a: DateValue | null | undefined, b: DateValue | null | undefined): boolean {
  if (!a || !b) return false
  return a.year === b.year && a.month === b.month && a.day === b.day
}

/**
 * 默认的区间快捷预设：今天 / 昨天 / 近 7 天 / 近 30 天 / 本月 / 上月。
 * 传 `presets` 可整体替换，传 `presets="[]"` 则不要这一列。
 */
export const defaultRangePresets: DateRangePreset[] = [
  {
    label: "今天",
    value: () => {
      const t = today(getLocalTimeZone())
      return { start: t, end: t }
    },
  },
  {
    label: "昨天",
    value: () => {
      const t = today(getLocalTimeZone()).subtract({ days: 1 })
      return { start: t, end: t }
    },
  },
  {
    label: "近 7 天",
    value: () => {
      const end = today(getLocalTimeZone())
      return { start: end.subtract({ days: 6 }), end }
    },
  },
  {
    label: "近 30 天",
    value: () => {
      const end = today(getLocalTimeZone())
      return { start: end.subtract({ days: 29 }), end }
    },
  },
  {
    label: "本月",
    value: () => {
      const t = today(getLocalTimeZone())
      return { start: t.set({ day: 1 }), end: endOfMonth(t) }
    },
  },
  {
    label: "上月",
    value: () => {
      const last = today(getLocalTimeZone()).subtract({ months: 1 })
      return { start: last.set({ day: 1 }), end: endOfMonth(last) }
    },
  },
]
