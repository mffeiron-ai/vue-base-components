<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarDate, endOfMonth, getLocalTimeZone, today } from '@internationalized/date'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import type { DateRange, DateRangePreset } from '@/components/ui/date-picker'
import {
  DatePicker,
  DatePickerInput,
  DatePickerRange,
  defaultRangePresets,
  formatDateISO,
  formatRangeLabel,
} from '@/components/ui/date-picker'

const tz = getLocalTimeZone()
const todayDate = today(tz)

// ---------- 演示状态 ----------
/** 空态（看占位文案） */
const empty = ref<any>(null)
/** 有初始值：今天 */
const picked = ref<any>(new CalendarDate(todayDate.year, todayDate.month, todayDate.day))
/** 限定范围 / 禁用日期 */
const limited = ref<any>(null)
/** 输入框形态 */
const typed = ref<any>(null)
const invalidText = ref('')
/** 区间 */
const range = ref<DateRange | null>(null)

// 可选中范围：本月 5 号 ~ 25 号
const minDate = new CalendarDate(todayDate.year, todayDate.month, 5)
const maxDate = new CalendarDate(todayDate.year, todayDate.month, 25)
// 禁用规则：偶数日不可选
const isUnavailable = (d: any) => d.day % 2 === 0

// 自定义区间预设：默认那组之后再加一个「本季度」
const quarterPreset: DateRangePreset = {
  label: '本季度',
  value: () => {
    const q = Math.floor((todayDate.month - 1) / 3) * 3 + 1
    return {
      start: new CalendarDate(todayDate.year, q, 1),
      end: endOfMonth(new CalendarDate(todayDate.year, q + 2, 1)),
    }
  },
}
const rangePresets: DateRangePreset[] = [...defaultRangePresets, quarterPreset]

/** 模拟「直接喂给后端」的参数 */
const payload = computed(() =>
  range.value?.start && range.value?.end
    ? `{ start: '${formatDateISO(range.value.start)}', end: '${formatDateISO(range.value.end)}' }`
    : '（区间未选完整）',
)

// ---------- API ----------
const pickerRows = [
  { name: 'v-model', type: 'CalendarDate | null', def: 'null', desc: '选中的日期；类型来自 @internationalized/date（纯年月日，不受时区偏移影响）' },
  { name: 'placeholder', type: 'string', def: "'选择日期'", desc: '未选值时的占位文案' },
  { name: 'clearable', type: 'boolean', def: 'false', desc: '有值时右侧显示清空按钮' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用整个选择器' },
  { name: 'align', type: "'start' | 'center' | 'end'", def: "'start'", desc: '弹层相对触发按钮的对齐方式' },
  { name: 'format', type: '(value) => string', def: '按 locale', desc: '自定义展示文案，默认按 locale 出「2026年9月15日」' },
  { name: 'v-model:open', type: 'boolean', def: '内部自管', desc: '受控展开状态；选完日期会自动收起' },
  { name: 'variant / size', type: 'Button 的变体', def: 'outline', desc: '透传给触发按钮的视觉变体与尺寸' },
  { name: '（透传）min-value / max-value / is-date-unavailable / layout / page-animation / locale / number-of-months …', type: 'Calendar 的 props', def: '—', desc: '日历本身的能力全部原样透传，不用再包一层' },
]

const pickerEmits = [
  { name: 'update:modelValue', desc: '选中 / 清空时同步新值' },
  { name: 'change', desc: '值真的变了才触发（清空也算）' },
  { name: 'update:open', desc: '弹层展开状态变化' },
]

const inputRows = [
  { name: 'v-model', type: 'CalendarDate | null', def: 'null', desc: '与上面同一个值；输入框与日历是同一份状态的两种入口' },
  { name: 'input-placeholder', type: 'string', def: "'yyyy-MM-dd'", desc: '输入框占位提示（默认就是可输入的格式示例）' },
  { name: 'invalid 事件', type: '(text: string) => void', def: '—', desc: '手输内容解析不出来时触发，可据此拦提交 / 弹提示' },
  { name: '（其余 props）', type: '同 DatePicker', def: '—', desc: '同样透传 Calendar 的全部 props；解析失败时输入框带 aria-invalid（Input 自带错误态样式）' },
]

const rangeRows = [
  { name: 'v-model', type: '{ start, end } | null', def: 'null', desc: '区间；用户只点了开始日时 end 为 null，两端都有才算「选完」' },
  { name: 'presets', type: 'DateRangePreset[]', def: '常用六项', desc: '左侧快捷预设；每项是 { label, value: () => ({ start, end }) }，用函数是为了跨天不拿到旧日期' },
  { name: 'show-presets', type: 'boolean', def: 'true', desc: '是否显示左侧预设列，传 false 就是纯日历' },
  { name: '（透传）', type: 'RangeCalendar 的 props', def: '—', desc: 'min-value / max-value / is-date-unavailable / number-of-months / locale ……' },
]

const utilRows = [
  { name: 'toCalendarDate', type: "(Date | string | DateValue) => CalendarDate | null", def: '—', desc: '把手边的 Date / "2026-09-15" / 别的日期值统一成 CalendarDate' },
  { name: 'parseDateInput', type: '(text: string) => CalendarDate | null', def: '—', desc: '解析手输文本，认 2026-09-15 / 2026/9/5 / 2026.9.5；非法日期返回 null' },
  { name: 'formatDateISO', type: '(value) => string', def: '—', desc: "出 `yyyy-MM-dd`，给接口 / 存储用" },
  { name: 'formatDateLabel', type: '(value, locale?, options?) => string', def: '—', desc: '按 locale 出可读文案，options 就是 Intl.DateTimeFormat 的选项' },
  { name: 'formatRangeLabel', type: '(range, locale?, options?) => string', def: '—', desc: '区间文案：2026年9月1日 ~ 2026年9月15日' },
  { name: 'toDateOf', type: '(value) => Date | null', def: '—', desc: '转回原生 Date（交给第三方库 / 做时间比较时用）' },
  { name: 'isSameDate', type: '(a, b) => boolean', def: '—', desc: '是否同一天（只比年月日）' },
  { name: 'defaultRangePresets', type: 'DateRangePreset[]', def: '—', desc: '默认预设：今天 / 昨天 / 近 7 天 / 近 30 天 / 本月 / 上月' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Date Picker 日期选择器</h1>
    <p class="mt-3 text-muted-foreground">
      三种形态：<strong>单日</strong>（<code>DatePicker</code>）、
      <strong>输入框 + 日历</strong>（<code>DatePickerInput</code>）、
      <strong>日期区间</strong>（<code>DatePickerRange</code>）。<br />
      底层是 reka-ui 的 Calendar，值类型统一为 <code>@internationalized/date</code> 的 <code>CalendarDate</code>
      —— 纯年月日、不受时区偏移影响。<br />
      日历自身的能力（可选范围、禁用日期、月份/年份下拉标题、换页动画、多语言、多月份并排 …）全部可透传，
      日期与文本互转、区间预设等公共逻辑都在 <code>date-picker/utils</code> 里。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>点按钮弹日历，选完自动收起。左边是空态，右边带初始值。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-4">
        <DatePicker v-model="empty" />
        <DatePicker v-model="picked" />
        <code class="text-sm text-muted-foreground">空态：{{ empty ? formatDateISO(empty) : '(null)' }} / 已选：{{ formatDateISO(picked) }}</code>
      </CardContent>
    </Card>

    <!-- 2. 清空 / 禁用 / 自定义格式 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">清空、禁用与自定义格式</h2>
        <CardDescription>
          <code>clearable</code> 给一个有值时的清空按钮；<code>disabled</code> 整体禁用；
          <code>format</code> 换成自己的文案（这里改成 ISO，方便直接看后端拿到什么）。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-4">
        <DatePicker v-model="picked" clearable />
        <DatePicker :model-value="picked" disabled />
        <DatePicker v-model="picked" :format="formatDateISO" />
      </CardContent>
    </Card>

    <!-- 3. 范围与禁用日期 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">限定范围、禁用某些日期</h2>
        <CardDescription>
          本月 5 ~ 25 号可选（<code>min-value</code> / <code>max-value</code>），偶数日禁用（<code>is-date-unavailable</code>）；
          标题区换成「月 + 年」下拉（<code>layout</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-4">
        <DatePicker
          v-model="limited"
          :min-value="minDate"
          :max-value="maxDate"
          :is-date-unavailable="isUnavailable"
          layout="month-and-year"
          placeholder="本月 5 ~ 25 号的单号"
        />
        <code class="text-sm text-muted-foreground">已选：{{ limited ? formatDateISO(limited) : '(null)' }}</code>
      </CardContent>
    </Card>

    <!-- 4. 输入框形态 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">输入框形态（手输 + 日历）</h2>
        <CardDescription>
          直接敲 <code>2026-09-15</code>（也认 <code>2026/9/5</code>、<code>2026.9.5</code>），回车或失焦时解析；
          解不出来只把框标红、不会清掉你敲的内容，同时抛出 <code>invalid</code> 事件。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-4">
        <DatePickerInput v-model="typed" @invalid="(t) => (invalidText = t)" @change="invalidText = ''" />
        <code class="text-sm text-muted-foreground">已选：{{ typed ? formatDateISO(typed) : '(null)' }}</code>
        <Badge v-if="invalidText" variant="destructive">解析失败：{{ invalidText }}</Badge>
      </CardContent>
    </Card>

    <!-- 5. 日期区间 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">日期区间与快捷预设</h2>
        <CardDescription>
          左侧预设默认给「今天 / 昨天 / 近 7 天 / 近 30 天 / 本月 / 上月」，这里再追加一个自定义的「本季度」；
          双月并排显示，两端都选完才收起。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-4">
        <DatePickerRange v-model="range" :presets="rangePresets" />
        <code class="text-sm text-muted-foreground">
          {{ range?.start && range?.end ? formatRangeLabel(range) : '(未选完整)' }}
        </code>
      </CardContent>
      <CardContent class="pt-0">
        <p class="text-sm text-muted-foreground">
          喂给后端：<code>{{ payload }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <p class="mb-2 text-sm font-medium"><code>DatePicker</code>（单日）</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">属性</th>
                  <th class="px-4 py-2 font-medium">类型</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in pickerRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul class="mt-3 space-y-1 text-sm text-muted-foreground">
            <li v-for="e in pickerEmits" :key="e.name">
              · <code>{{ e.name }}</code>：{{ e.desc }}
            </li>
          </ul>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium"><code>DatePickerInput</code>（输入框 + 日历）</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="row in inputRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium"><code>DatePickerRange</code>（区间）</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="row in rangeRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">工具函数（<code>@/components/ui/date-picker</code> 一并导出）</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="row in utilRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
