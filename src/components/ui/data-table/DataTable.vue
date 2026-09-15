<script setup lang="ts">
/**
 * DataTable —— TanStack Table 的**渲染层**（headless 渲染器）。
 *
 * ⚠️ WIP（尚未接线）：方案已定，但这几点要按 @tanstack/vue-table v9 的实际导出确认后再对外用：
 *   1. `flexRender` 在 Vue 侧对「字符串 header/cell」的返回形态（字符串直渲还是转 VNode），
 *      决定用 `:is` 还是官方的 `<FlexRender>` 组件；
 *   2. v9 的 feature 需要显式注册（`rowSortingFeature` 等），官方示例里带的
 *      `DataTableFeatures` 类型要从 table-core 引；
 *   3. 列尺寸（拖拽宽度）要在注册 columnSizing feature 后 `header.getSize()` 才有值。
 * 在此之前不要从 index.ts 导出它，也不要在文档页引用。
 *
 * 设计原则：table 实例由使用方创建（`useVueTable`），本组件只负责把实例渲染成标记 ——
 * 这样使用方想开什么能力就注册什么（列显隐 / 拖拽宽度 / 分面筛选 / 服务端分页 / 虚拟滚动），
 * 组件侧一行都不用改，也不受 TanStack 版本与 feature API 变动影响。
 */
import { computed } from "vue"
import { flexRender } from "@tanstack/vue-table"
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
                <component :is="() => flexRender(header.column.columnDef.header, header.getContext())" />
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
              <component :is="() => flexRender(cell.column.columnDef.cell, cell.getContext())" />
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
