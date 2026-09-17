<script setup lang="ts">
import { ref } from 'vue'
import type { DateValue } from '@internationalized/date'
import { CalendarDate, getLocalTimeZone, isWeekend, today } from '@internationalized/date'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import type { DateRange } from '@/components/ui/date-picker'
import { formatRangeLabel } from '@/components/ui/date-picker'
import { RangeCalendar } from '@/components/ui/range-calendar'
import type { PageAnimationTypes } from '@/components/ui/range-calendar'

const now = today(getLocalTimeZone())

/** 区间文案：只有一端时也要能看出「还差一半」。 */
function describe(range: DateRange | null | undefined) {
  if (!range?.start && !range?.end)
    return '（未选择）'
  if (range.start && !range.end)
    return `${formatRangeLabel({ start: range.start, end: range.start })} 起，请再点结束日`
  if (!range.start && range.end)
    return `请再点开始日，结束日 ${formatRangeLabel({ start: range.end, end: range.end })}`
  return formatRangeLabel(range)
}

const days = (n: number) => now.add({ days: n })

// 1. 基础：默认选一周
const range = ref<DateRange>({ start: days(0), end: days(6) })

// 2. 单月 / 多月
const monthCount = ref(2)
const multi = ref<DateRange>({ start: days(3), end: days(20) })

// 3. 限定可选范围（本月 5 号 ~ 25 号）
const minValue = new CalendarDate(now.year, now.month, 5)
const maxValue = new CalendarDate(now.year, now.month, 25)
const limited = ref<DateRange | null>(null)

// 4. 不可选日期：禁用周末
const weekdaysOnly = ref<DateRange | null>(null)
// 注意：`isWeekend(date, locale)` 的 locale 是**必传**的（不传会走到
// `new Intl.Locale('')` 直接抛错），而 reka 回调给的第二参可能是空串，
// 所以这里要兜一个默认值。
const isUnavailable = (date: DateValue, locale?: string) => isWeekend(date, locale || 'zh-CN')

// 5. 只读 / 禁用
const readonlyRange = ref<DateRange>({ start: days(1), end: days(5) })
const disabledRange = ref<DateRange>({ start: days(1), end: days(5) })

// 6. 周起始与星期格式
const isoWeek = ref<DateRange | null>(null)
const sundayFirst = ref<DateRange | null>(null)

// 7. 换页动画（与单日日历 Calendar 共用同一套实现）
const pageAnimation = ref<PageAnimationTypes>('slide')
const animationTypes: Array<{ label: string, value: PageAnimationTypes }> = [
  { label: '滑入 slide', value: 'slide' },
  { label: '淡入 fade', value: 'fade' },
  { label: '缩放 zoom', value: 'zoom' },
  { label: '翻转 flip', value: 'flip' },
  { label: '关闭 none', value: 'none' },
]
const animatedRange = ref<DateRange | null>(null)

const rootRows = [
  { name: 'v-model', type: 'DateRange | null', def: '—', desc: '当前区间 <code>{ start, end }</code>，两端都是 <code>CalendarDate</code>（来自 <code>@internationalized/date</code>）；<b>只点了一端时另一端是 <code>undefined</code></b>' },
  { name: 'defaultValue', type: 'DateRange', def: '—', desc: '非受控初始区间' },
  { name: 'numberOfMonths', type: 'number', def: '1', desc: '并排显示几个月。选跨天区间基本都配 <code>2</code>' },
  { name: 'placeholder', type: 'DateValue', def: '—', desc: '当前<b>显示</b>哪个月（只影响视图，不影响选中）；受控时配 <code>v-model:placeholder</code>' },
  { name: 'minValue / maxValue', type: 'DateValue', def: '—', desc: '可选范围上下限，范围外的日子自动带上 <code>data-disabled</code>' },
  { name: 'isDateUnavailable', type: '(date, locale) => boolean', def: '—', desc: '逐日判定「不可选」（如禁用周末）：样式是删除线 + 灰字、不能作为端点，<b>而且会让跨过它的区间整段失效</b>（需配 <code>allow-non-contiguous-ranges</code>）' },
  { name: 'isDateDisabled', type: '(date, locale) => boolean', def: '—', desc: '同上的另一种口径：它连<b>键盘导航</b>也会跳过（<code>unavailable</code> 仍可聚焦查看）' },
  { name: 'disabled / readonly', type: 'boolean', def: 'false', desc: '整块禁用（不可交互）／只读（能看能翻月，不能改选中）' },
  { name: 'weekStartsOn', type: '0–6', def: '跟随 locale', desc: '每周第一天，<code>0</code> 是周日、<code>1</code> 是周一。<b>不传时听 locale 的</b>（<code>zh-CN</code> 下就是周一），所以想改成周日得显式传 <code>0</code>' },
  { name: 'weekdayFormat', type: "'narrow' | 'short' | 'long'", def: "'narrow'", desc: '表头星期的写法：日 / 周日 / 星期日' },
  { name: 'fixedWeeks', type: 'boolean', def: 'false', desc: '每月固定 6 行，避免翻月时格子数变化导致高度跳动' },
  { name: 'preventDeselect', type: 'boolean', def: 'false', desc: '选完整段后再点「同一天」是否禁止取消（默认允许清空）' },
  { name: 'allowNonContiguousRanges', type: 'boolean', def: 'false', desc: '允许区间跨越不可选日（例如「5 号到 20 号，中间跳过周末」也能算一段）。<b>不打开时跨过 unavailable 的日子选不了</b>' },
  { name: 'pageBehavior', type: "'single' | 'visible'", def: "'visible'", desc: '翻月按钮前进 1 个月还是 1 屏（双月视图下是 2 个月）' },
  { name: 'pageAnimation', type: "'slide' | 'fade' | 'zoom' | 'flip' | 'none'", def: "'slide'", desc: '换月/翻页时月份网格的过渡动画，<b>与单日日历 Calendar 共用同一套实现</b>（slide 会按翻页方向自动换向）；<code>none</code> 直切且不卸载重建节点' },
  { name: 'locale', type: 'string', def: "'zh-CN'", desc: '组件默认中文；需要别的语言直接传 <code>locale</code> 覆盖即可' },
]

const partRows = [
  { name: 'RangeCalendarHeader / Heading', slot: 'range-calendar-header / -heading', desc: '顶部标题行与「当前月份」文案（含 <code>aria-live</code>，翻月时读屏会播报）' },
  { name: 'RangeCalendarPrevButton / NextButton', slot: 'range-calendar-prev-button / -next-button', desc: '翻月按钮，超范围时自动禁用' },
  { name: 'RangeCalendarGrid / GridHead / GridBody / GridRow', slot: 'range-calendar-grid / -grid-head / -grid-body / -grid-row', desc: '表格骨架；<code>v-slot</code> 的 <code>grid</code> 是月份数组，几个 <code>number-of-months</code> 就渲染几个 <code>RangeCalendarGrid</code>' },
  { name: 'RangeCalendarHeadCell', slot: 'range-calendar-head-cell', desc: '表头星期格（文案来自组件的 <code>weekDays</code>）' },
  { name: 'RangeCalendarCell', slot: 'range-calendar-cell', desc: '<b>区间底色画在这一层</b>：<code>[&:has([data-selected])]:bg-accent</code>，并对首尾自动补圆角，所以中间的日期是一整条带状高亮' },
  { name: 'RangeCalendarCellTrigger', slot: 'range-calendar-trigger', desc: '单个日期按钮。关键 data 属性：<code>data-selected</code>（在区间内）、<code>data-selection-start</code> / <code>-end</code>（两端，实心主色）、<code>data-today</code>、<code>data-outside-view</code>、<code>data-disabled</code>、<code>data-unavailable</code>' },
]

const typeRows = [
  { name: 'DateRange', type: '{ start: DateValue | undefined, end: DateValue | undefined }', desc: '区间形状；<b>两个字段都可能为 undefined</b>（选到一半），所以取值前一定要判空' },
  { name: 'CalendarDate', type: 'class', desc: '纯年月日、不带时区；与 <code>today(getLocalTimeZone())</code> 配合拿「今天」' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Range Calendar 范围日历</h1>
    <p class="mt-3 text-muted-foreground">
      选一段日期：点第一下是<b>开始</b>，点第二下是<b>结束</b>，中间自动连成一条高亮带（底色画在单元格上，所以首尾还会自动补圆角）。<br />
      值类型是 <code>@internationalized/date</code> 的 <code>CalendarDate</code>（纯年月日，不受时区影响），
      区间形状是 <code>{ start, end }</code>，两端都可能暂时是 <code>undefined</code>。
    </p>

    <!-- 1. 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>v-model</code> 绑一个 <code>{ start, end }</code>，<code>number-of-months="2"</code> 并排两个月 ——
          这是选区间最顺手的配置：一次能看到跨月的完整范围。<br />
          点一下开始日、再点一下结束日试试；先只点一下，看下面文案怎么描述「选到一半」。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="text-muted-foreground">当前区间：</span>
          <Badge variant="secondary">{{ describe(range) }}</Badge>
        </div>

        <RangeCalendar v-model="range" :number-of-months="2" class="border-input rounded-md border" />
      </CardContent>
    </Card>

    <!-- 2. 月数 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">单月与多月</h2>
        <CardDescription>
          <code>number-of-months</code> 控制并排显示几个月（这里点按钮切换 1 / 2 / 3）。
          配合 <code>page-behavior</code> 决定翻页一次走一个月还是一屏。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <Button
            v-for="n in [1, 2, 3]"
            :key="n"
            size="sm"
            :variant="monthCount === n ? 'default' : 'outline'"
            @click="monthCount = n"
          >
            {{ n }} 个月
          </Button>
          <Badge variant="secondary">{{ describe(multi) }}</Badge>
        </div>

        <RangeCalendar v-model="multi" :number-of-months="monthCount" class="border-input rounded-md border" />
      </CardContent>
    </Card>

    <!-- 3. 可选范围 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">限定可选范围</h2>
        <CardDescription>
          <code>min-value</code> / <code>max-value</code> 卡住两端（本演示限制在<b>本月 5 号 ~ 25 号</b>），
          范围外的日子自动禁用、翻月按钮到边界也会变灰。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="text-muted-foreground">可选：</span>
          <Badge variant="secondary">{{ formatRangeLabel({ start: minValue, end: maxValue }) }}</Badge>
          <span class="text-muted-foreground">已选：</span>
          <Badge variant="secondary">{{ describe(limited) }}</Badge>
        </div>

        <RangeCalendar
          v-model="limited"
          :min-value="minValue"
          :max-value="maxValue"
          class="border-input rounded-md border"
        />
      </CardContent>
    </Card>

    <!-- 4. 不可选日期 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁用特定日期（周末）</h2>
        <CardDescription>
          <code>is-date-unavailable</code> 逐日判断，返回 <code>true</code> 的日子会带 <code>data-unavailable</code>，
          样式是<b>删除线</b> + 灰字，并且不能作为区间端点。<br />
          ⚠️ <b>这个回调还会让「跨过这些日子」的区间整段失效</b>：reka 要求待选区间的每一天都可用，
          所以不打开 <code>allow-non-contiguous-ranges</code> 时，选完起点再点一个隔着周末的日期会「没反应」。
          下面这个例子打开了它，所以能跨周末选；想让它同时被键盘跳过，把回调换成
          <code>is-date-disabled</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="text-muted-foreground">已选：</span>
          <Badge variant="secondary">{{ describe(weekdaysOnly) }}</Badge>
        </div>

        <RangeCalendar
          v-model="weekdaysOnly"
          :is-date-unavailable="isUnavailable"
          allow-non-contiguous-ranges
          class="border-input rounded-md border"
        />
      </CardContent>
    </Card>

    <!-- 5. 只读 / 禁用 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">只读与禁用</h2>
        <CardDescription>
          <code>readonly</code> 能翻月、能聚焦，但点不动日期（适合「只展示某段已被占用的档期」）；
          <code>disabled</code> 整块变灰、完全不响应。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <p class="mb-2 text-sm font-medium text-muted-foreground">
              readonly：{{ describe(readonlyRange) }}
            </p>
            <RangeCalendar v-model="readonlyRange" readonly class="border-input rounded-md border" />
          </div>
          <div>
            <p class="mb-2 text-sm font-medium text-muted-foreground">
              disabled：{{ describe(disabledRange) }}
            </p>
            <RangeCalendar v-model="disabledRange" disabled class="border-input rounded-md border" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 6. 周起始与格式 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">周起始日与表头格式</h2>
        <CardDescription>
          <code>week-starts-on</code> <b>不传时听 locale 的</b> —— <code>zh-CN</code> 下周一是第一天，所以左边那个默认日历
          是从「一」开始；右边显式传 <code>week-starts-on="0"</code> 才是周日打头。<br />
          <code>weekday-format="long"</code> 把表头写成「星期日」，<code>fixed-weeks</code>
          让每月固定 6 行（翻月时高度不跳）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <p class="mb-2 text-sm font-medium text-muted-foreground">
              默认（zh-CN 即周一）：{{ describe(isoWeek) }}
            </p>
            <RangeCalendar
              v-model="isoWeek"
              weekday-format="long"
              fixed-weeks
              class="border-input rounded-md border"
            />
          </div>
          <div>
            <p class="mb-2 text-sm font-medium text-muted-foreground">
              week-starts-on="0"（周日）：{{ describe(sundayFirst) }}
            </p>
            <RangeCalendar
              v-model="sundayFirst"
              :week-starts-on="0"
              weekday-format="long"
              fixed-weeks
              class="border-input rounded-md border"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 7. 换页动画 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">换页动画</h2>
        <CardDescription>
          <code>page-animation</code> 控制换月/翻页时月份网格的过渡，四种动画与单日日历
          <code>Calendar</code> <b>完全共用同一套实现</b>：<code>slide</code>（默认，按翻页方向自动换向）、
          <code>fade</code>、<code>zoom</code>、<code>flip</code>，<code>none</code> 直切。<br />
          选一个再点左右翻页按钮（或者直接点标题旁的前后箭头）；选完日期不会触发动画，只有换月才播。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-muted-foreground">动画：</span>
          <Button
            v-for="option in animationTypes"
            :key="option.value"
            size="sm"
            :variant="pageAnimation === option.value ? 'default' : 'outline'"
            @click="pageAnimation = option.value"
          >
            {{ option.label }}
          </Button>
          <code class="text-xs text-muted-foreground">:page-animation="{{ pageAnimation }}"</code>
        </div>

        <RangeCalendar
          v-model="animatedRange"
          :page-animation="pageAnimation"
          :number-of-months="2"
          class="border-input rounded-md border"
        />
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          下面是常用项；其余 <code>CalendarRoot</code> 属性（<code>initialFocus</code>、<code>dir</code> 等）都能透传。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">RangeCalendar</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rootRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">子部件</th>
                <th class="py-2 pr-4 font-medium">data-slot</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in partRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground"><code>{{ row.slot }}</code></td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">形状</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in typeRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-sm text-muted-foreground">
          事件：<code>@update:model-value</code>（区间变化）、<code>@update:placeholder</code>（显示的月份变化）；
          翻月按钮、键盘方向键、<code>Home</code>/<code>End</code> 等都在组件内部处理好了。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
