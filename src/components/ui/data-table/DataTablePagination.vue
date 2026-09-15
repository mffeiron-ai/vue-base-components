<script setup lang="ts">
/**
 * DataTablePagination —— 分页条（页大小 + 首/上/下/尾 + 计数）。
 *
 * 用法：`<DataTablePagination :table="table" />`，一般放进 DataTable 的 `#footer` 插槽。
 * 服务端分页时把 `manualPagination: true` 打开、自己维护 rowCount，
 * 这里显示的「共 N 行」就会以你的 rowCount 为准（组件只读 table 上的这几个方法）。
 *
 * 依赖 TanStack 实例上的惯用接口：getState().pagination / getPageCount /
 * getCanPreviousPage / getCanNextPage / setPageIndex / setPageSize /
 * previousPage / nextPage / getFilteredRowModel / getFilteredSelectedRowModel。
 */
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-vue-next"
import { Button } from "../button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select"

interface PaginationTable {
  /** TanStack 实例：兼容 v8 / v9 以及自己实现的薄壳（字段都按需读） */
  getState?: () => { pagination?: { pageIndex: number, pageSize: number } }
  pagination?: { pageIndex: number, pageSize: number }
  getPageCount: () => number
  getCanPreviousPage?: () => boolean
  getCanNextPage?: () => boolean
  setPageIndex?: (index: number) => void
  setPageSize?: (size: number) => void
  previousPage?: () => void
  nextPage?: () => void
  getFilteredRowModel?: () => { rows: unknown[] }
  getFilteredSelectedRowModel?: () => { rows: unknown[] }
  getRowCount?: () => number
}

const props = withDefaults(defineProps<{
  table: PaginationTable
  /** 页大小选项 */
  pageSizeOptions?: number[]
}>(), {
  pageSizeOptions: () => [5, 10, 20, 50],
})

const state = () => props.table.getState?.().pagination ?? props.table.pagination ?? { pageIndex: 0, pageSize: 10 }
const pageCount = () => Math.max(1, props.table.getPageCount())
const total = () => props.table.getRowCount?.() ?? props.table.getFilteredRowModel?.().rows.length ?? 0
const selectedCount = () => props.table.getFilteredSelectedRowModel?.().rows.length ?? 0
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 px-1">
    <p class="text-muted-foreground text-sm">
      已选 {{ selectedCount() }} / 共 {{ total() }} 行
    </p>

    <div class="flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <span>每页</span>
        <Select
          :model-value="String(state().pageSize)"
          @update:model-value="(v) => table.setPageSize?.(Number(v))"
        >
          <SelectTrigger class="h-8 w-[76px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="s in pageSizeOptions" :key="s" :value="String(s)">{{ s }}</SelectItem>
          </SelectContent>
        </Select>
        <span>条</span>
      </div>

      <div class="text-sm text-muted-foreground">
        第 {{ state().pageIndex + 1 }} / {{ pageCount() }} 页
      </div>

      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          :disabled="!(table.getCanPreviousPage?.() ?? state().pageIndex > 0)"
          aria-label="第一页"
          @click="table.setPageIndex?.(0)"
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          :disabled="!(table.getCanPreviousPage?.() ?? false)"
          aria-label="上一页"
          @click="table.previousPage?.()"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          :disabled="!(table.getCanNextPage?.() ?? false)"
          aria-label="下一页"
          @click="table.nextPage?.()"
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          :disabled="!(table.getCanNextPage?.() ?? state().pageIndex < pageCount() - 1)"
          aria-label="最后一页"
          @click="table.setPageIndex?.(pageCount() - 1)"
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  </div>
</template>
