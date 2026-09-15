<script setup lang="ts">
/**
 * DataTableColumnHeader —— 表头里的「排序菜单」（点在标题上弹 DropdownMenu）。
 *
 * 用法（TanStack 列定义里）：
 *   { accessorKey: 'amount', header: ({ column }) => h(DataTableColumnHeader, { column, title: '金额' }) }
 *
 * 依赖 TanStack 实例上的惯用接口（`getCanSort` / `getIsSorted` / `toggleSorting` /
 * `getCanHide` / `toggleVisibility`）；为了不被 TanStack 版本的类型签名绑住，
 * 这里用结构化最小类型，注册 sorting / columnVisibility feature 后即可直接用。
 */
/**
 * DataTableColumnHeader —— 表头里的「排序菜单」（点标题弹 DropdownMenu：升序 / 降序 / 清除排序）。
 *
 * 列定义里这样用：
 *   { accessorKey: 'amount', header: ({ column }) => h(DataTableColumnHeader, { column, title: '金额' }) }
 *
 * 不想写列定义的话，DataTable 渲染层会给「字符串表头 + 可排序」的列自动配一个循环排序按钮
 * （升序 → 降序 → 取消，Shift = 多列排序），两者可以混用。
 * 列显隐交给 DataTableViewOptions。
 */
import { ArrowDown, ArrowUp, Check, ChevronsUpDown } from "lucide-vue-next"
import { Button } from "../button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu"
import { cn } from "../../../lib/utils"

/** TanStack Column 的最小结构（只需排序 + 显隐相关方法） */
interface SortableColumn {
  getCanSort?: () => boolean
  getIsSorted?: () => false | "asc" | "desc"
  toggleSorting?: (desc?: boolean, multi?: boolean) => void
  clearSorting?: () => void
  getCanHide?: () => boolean
  getIsVisible?: () => boolean
  toggleVisibility?: (visible?: boolean) => void
}

const props = defineProps<{
  column: SortableColumn
  title: string
  class?: string
}>()

const sorted = () => props.column.getIsSorted?.() ?? false

/** 升序 / 降序（multi = true 时为多列排序，菜单里固定单列） */
function setSort(desc: boolean, multi = false) {
  props.column.toggleSorting?.(desc, multi)
}

/** 清掉这一列的排序 */
function clearSort() {
  props.column.clearSorting?.()
}
</script>

<template>
  <DropdownMenu v-if="column.getCanSort?.()">
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="sm"
        :class="cn('-ml-2.5 h-8 gap-1 data-[state=open]:bg-accent', props.class)"
      >
        <span>{{ title }}</span>
        <ArrowDown v-if="sorted() === 'desc'" class="size-4" />
        <ArrowUp v-else-if="sorted() === 'asc'" class="size-4" />
        <ChevronsUpDown v-else class="size-4 opacity-50" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" class="w-36">
      <DropdownMenuItem @select="setSort(false)">
        <ArrowUp class="mr-2 size-4" />升序
      </DropdownMenuItem>
      <DropdownMenuItem @select="setSort(true)">
        <ArrowDown class="mr-2 size-4" />降序
      </DropdownMenuItem>
      <template v-if="sorted()">
        <DropdownMenuSeparator />
        <DropdownMenuItem @select="clearSort()">
          <Check class="mr-2 size-4" />清除排序
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>

  <span v-else :class="props.class">{{ title }}</span>
</template>
