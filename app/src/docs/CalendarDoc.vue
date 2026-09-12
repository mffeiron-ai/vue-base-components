<script setup lang="ts">
import { ref } from 'vue'
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const tz = getLocalTimeZone()
const todayDate = today(tz)

// 受控示例：选中的日期
const picked = ref<any>(new CalendarDate(todayDate.year, todayDate.month, todayDate.day))

// 可选中范围：本月 5 号 ~ 25 号
const minDate = new CalendarDate(todayDate.year, todayDate.month, 5)
const maxDate = new CalendarDate(todayDate.year, todayDate.month, 25)

// 禁用规则：偶数日不可选（演示 isDateUnavailable）
const isUnavailable = (d: any) => d.day % 2 === 0

const fmt = (d: any) => (d ? `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}` : '(未选择)')

const rows = [
  { name: 'v-model', type: 'DateValue | null', def: '—', desc: '选中的日期（受控）；类型来自 @internationalized/date，如 new CalendarDate(2026, 9, 11)' },
  { name: 'default-value', type: 'DateValue', def: '—', desc: '非受控时的初始选中日期' },
  { name: 'placeholder', type: 'DateValue', def: '今天', desc: '「当前显示哪个月」（v-model:placeholder 可受控）' },
  { name: 'layout', type: "'month-and-year' | 'month-only' | 'year-only'", def: '—', desc: '标题区改成下拉；不传则显示纯文本标题' },
  { name: 'year-range', type: 'DateValue[]', def: '自动推算', desc: '自定义年份下拉的可选年份；不传则按 min/max（或当前月份）前后推 100 / 10 年' },
  { name: 'min-value / max-value', type: 'DateValue', def: '—', desc: '可选日期范围；超出范围的格子会置灰不可点' },
  { name: 'is-date-unavailable', type: '(date) => boolean', def: '—', desc: '自定义「哪些日期不可选」，返回 true 的格子带删除线' },
  { name: 'number-of-months', type: 'number', def: '1', desc: '同时显示几个月；配合 paged-navigation 整屏翻月' },
  { name: 'paged-navigation', type: 'boolean', def: 'false', desc: '多月份时按「屏」翻页，而不是按月平移' },
  { name: 'weekday-format', type: "'narrow' | 'short' | 'long'", def: 'narrow', desc: '表头星期名的详细程度' },
  { name: 'locale', type: 'string', def: "'en'", desc: '界面语言与历法（如 zh-CN）；@internationalized/date 支持 13 种历法' },
  { name: 'disabled / readonly', type: 'boolean', def: 'false', desc: '整块禁用 / 只读（只读仍可翻月，但不能选）' },
  { name: 'class', type: 'string', def: '—', desc: '追加自定义类，经 tailwind-merge 去重' },
]

const slots = [
  { name: 'calendar-heading', desc: '替换标题区；插槽参数 { date, month, year }，month / year 是「月份 / 年份下拉」组件，用 <component :is="month" :date="date" /> 渲染' },
  { name: 'calendar-prev-icon / calendar-next-icon', desc: '替换上/下月按钮里的图标' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Calendar 日历</h1>
    <p class="mt-3 text-muted-foreground">
      用于选择单个日期。日期类型来自 <code class="font-mono text-sm">@internationalized/date</code>，自带键盘导航与无障碍语义。
    </p>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">基础用法</CardTitle>
        <CardDescription>不传任何 props 就是「今天所在月」，点击日期即可选择。</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar class="rounded-md border border-input" />
      </CardContent>
    </Card>

    <!-- 受控 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">选中值（受控）</CardTitle>
        <CardDescription>用 `v-model` 拿到选中的日期；下面是当前值（DateValue 对象，带 year / month / day）。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="text-muted-foreground">当前选中：</span>
          <code class="rounded bg-muted px-2 py-0.5 font-mono">{{ fmt(picked) }}</code>
          <Button variant="outline" size="sm" @click="picked = today(getLocalTimeZone())">回到今天</Button>
          <Button variant="ghost" size="sm" @click="picked = null">清空</Button>
        </div>
        <Calendar v-model="picked" class="rounded-md border border-input" />
      </CardContent>
    </Card>

    <!-- 标题下拉 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">标题下拉（layout）</CardTitle>
        <CardDescription>
          用 `layout` 把标题变成下拉：`month-and-year` 月份+年份都可选、`month-only` 只选月份、`year-only` 只选年份。
          外观是文本，底层是原生 select —— 所以键盘和移动端都能正常用。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-6">
          <div class="space-y-2">
            <p class="text-sm font-medium">month-and-year</p>
            <Calendar layout="month-and-year" class="rounded-md border border-input" />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium">month-only</p>
            <Calendar layout="month-only" class="rounded-md border border-input" />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium">year-only</p>
            <Calendar layout="year-only" class="rounded-md border border-input" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 多月份 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">多个月份</CardTitle>
        <CardDescription>`number-of-months` 同时显示多个月；加 `paged-navigation` 后翻页按“屏”走（一次翻 2 个月而非 1 个）。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <p class="mb-2 text-sm font-medium">number-of-months="2"</p>
          <Calendar :number-of-months="2" class="rounded-md border border-input" />
        </div>
        <div>
          <p class="mb-2 text-sm font-medium">number-of-months="2" + paged-navigation</p>
          <Calendar :number-of-months="2" paged-navigation class="rounded-md border border-input" />
        </div>
      </CardContent>
    </Card>

    <!-- 限制范围 / 禁用日期 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">限制范围与禁用日期</CardTitle>
        <CardDescription>
          `min-value` / `max-value` 限制可选区间（超出置灰）；`is-date-unavailable` 可自定义规则 ——
          这里禁掉了所有偶数日，它们会带删除线。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-6">
          <div class="space-y-2">
            <p class="text-sm font-medium">本月 5 号 ~ 25 号可选</p>
            <Calendar :min-value="minDate" :max-value="maxDate" class="rounded-md border border-input" />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium">偶数日不可选</p>
            <Calendar :is-date-unavailable="isUnavailable" class="rounded-md border border-input" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 中文界面 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">语言与历法</CardTitle>
        <CardDescription>
          `locale` 决定界面语言与历法；`weekday-format` 控制星期名的详细程度（narrow / short / long）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-6">
          <div class="space-y-2">
            <p class="text-sm font-medium">locale="zh-CN"</p>
            <Calendar locale="zh-CN" class="rounded-md border border-input" />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-medium">zh-CN + weekday-format="short"</p>
            <Calendar locale="zh-CN" weekday-format="short" class="rounded-md border border-input" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 自定义标题与尺寸 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">自定义标题、格子尺寸与图标</CardTitle>
        <CardDescription>
          标题区用 `#calendar-heading` 插槽替换（插槽给的 `month` / `year` 就是现成的下拉组件）；
          格子尺寸用 `**:data-[slot=calendar-cell-trigger]:size-11!` 覆盖；切换按钮的图标用具名插槽换。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar class="rounded-md border border-input **:data-[slot=calendar-cell-trigger]:size-11!">
          <template #calendar-heading="{ date, month, year }">
            <div class="flex items-center gap-1 text-sm font-medium">
              <span>选择日期：</span>
              <component :is="year" :date="date" />
              <component :is="month" :date="date" />
            </div>
          </template>
          <template #calendar-prev-icon>
            <span class="text-xs">◀◀</span>
          </template>
          <template #calendar-next-icon>
            <span class="text-xs">▶▶</span>
          </template>
        </Calendar>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">API / Props</CardTitle>
      </CardHeader>
      <CardContent class="space-y-5">
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
              <tr v-for="row in rows" :key="row.name" class="border-b border-border last:border-0">
                <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">插槽</p>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li v-for="s in slots" :key="s.name">
              · <code class="font-mono text-foreground">{{ s.name }}</code>：{{ s.desc }}
            </li>
          </ul>
        </div>

        <p class="text-sm text-muted-foreground">
          子组件 <code class="font-mono">CalendarCell</code> / <code class="font-mono">CalendarGrid</code> /
          <code class="font-mono">CalendarHeader</code> 等都可单独引入，替换表格结构里的任意一块。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
