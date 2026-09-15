<script setup lang="ts">
/**
 * DataTable —— TanStack Table 的**渲染层**（headless 渲染器）。
 *
 * 设计原则：table 实例由使用方创建（`useTable`），本组件只负责把实例渲染成标记 ——
 * 这样使用方想开什么能力就注册什么（列显隐 / 拖拽宽度 / 分面筛选 / 服务端分页 / 虚拟滚动），
 * 组件侧一行都不用改，也不受 TanStack 版本与 feature API 变动影响。
 *
 * 渲染约定（与上游 shadcn 的 Data Table 一致，所以样式全部吃预设）：
 * - 表头：`table.getHeaderGroups()` → TableHead，宽度用 `header.getSize()`（注册列尺寸 feature 后生效）；
 * - 表体：`table.getRowModel().rows` → TableRow（选中态自动接 `data-state="selected"`）；
 * - 空态：行数为 0 时渲染占满整行的提示（文案用 `empty-text` 或 `#empty` 插槽）。
 * - 单元格内容用官方的 `<FlexRender :header="header" />` / `<FlexRender :cell="cell" />`，
 *   它同时支持字符串、模板函数与组件三种列定义。
 *
 * 插槽：`toolbar`（表格上方）、`empty`、`footer`（表格下方，放分页）。
 */
import { computed } from "vue"
import { FlexRender } from "@tanstack/vue-table"
import { cn } from "../../../lib/utils"

/** TanStack 实例的结构化最小约定（不绑定具体版本的类型名） */
interface TableLike {
  getHeaderGroups: () => Array<{
    id: string
    headers: Array<{
      id: string
      colSpan: number
      isPlaceholder: boolean
      column: { columnDef: { header?: unknown }, getCanSort?: () => boolean, getIsSorted?: () => false | 'asc' | 'desc', getSize?: () => number }
      getContext: () => unknown
    }>
  }>
  getRowModel: () => {
    rows: Array<{
      id: string
      getIsSelected?: () => boolean
      getVisibleCells: () => Array<{
        id: string
        column: { columnDef: { cell?: unknown } }
        getContext: () => unknown
      }>
    }>
  }
  getAllColumns?: () => Array<{ id: string, getCanHide?: () => boolean, getIsVisible?: () => boolean, toggleVisibility?: (v?: boolean) => void, columnDef: { header?: unknown } }>
}

const props = withDefaults(defineProps<{
  /** `useVueTable(...)` 返回的实例 */
  table: TableLike
  class?: string
  /** 容器最大高度（触发内部滚动），如 "20rem" */
  maxHeight?: string
  /** 表头吸顶（容器滚动时） */
  stickyHeader?: boolean
  /** 空数据文案 */
  emptyText?: string
  /** 空状态占几列；默认取表头列数 */
  emptyColspan?: number
}>(), {
  stickyHeader: true,
  emptyText: '暂无数据',
})

const emit = defineEmits<{ (e: 'rowClick', row: unknown): void }>()

const headerGroups = computed(() => props.table.getHeaderGroups())
const rows = computed(() => props.table.getRowModel().rows)
const colCount = computed(() => headerGroups.value[0]?.headers.filter((h) => !h.isPlaceholder).length ?? 1)
const cellKey = (rowId: string, cellId: string) => `${rowId}:${cellId}`
</script>

<template>
  <div class="space-y-4">
    <slot name="toolbar" />

    <div
      data-slot="table-container"
      class="relative w-full overflow-auto rounded-lg border border-input"
      :style="{ maxHeight: maxHeight || undefined }"
    >
      <table data-slot="table" :class="cn('w-full caption-bottom text-sm', props.class)">
        <thead data-slot="table-header" :class="stickyHeader && maxHeight ? 'sticky top-0 z-10 bg-background' : undefined">
          <tr
            v-for="hg in headerGroups"
            :key="hg.id"
            data-slot="table-row"
            class="hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors"
          >
            <th
              v-for="header in hg.headers"
              :key="header.id"
              data-slot="table-head"
              :colspan="header.colSpan"
              :style="header.column.getSize && header.column.getSize() ? { width: `${header.column.getSize()}px` } : undefined"
              class="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
            >
              <template v-if="!header.isPlaceholder">
                <FlexRender :header="header" />
              </template>
            </th>
          </tr>
        </thead>

        <tbody data-slot="table-body" class="[&_tr:last-child]:border-0">
          <tr
            v-for="row in rows"
            :key="row.id"
            data-slot="table-row"
            :data-state="row.getIsSelected && row.getIsSelected() ? 'selected' : undefined"
            class="hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors"
            @click="emit('rowClick', row)"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cellKey(row.id, cell.id)"
              data-slot="table-cell"
              class="p-2 align-middle whitespace-normal break-words [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
            >
              <FlexRender :cell="cell" />
            </td>
          </tr>

          <tr v-if="!rows.length" data-slot="table-row">
            <td
              data-slot="table-cell"
              :colspan="emptyColspan ?? colCount"
              class="p-2 align-middle"
            >
              <div class="text-muted-foreground flex items-center justify-center py-10 text-sm">
                <slot name="empty">{{ emptyText }}</slot>
              </div>
            </td>
          </tr>
        </tbody>

        <slot name="tbody-extra" />
      </table>
    </div>

    <slot name="footer" />
  </div>
</template>
