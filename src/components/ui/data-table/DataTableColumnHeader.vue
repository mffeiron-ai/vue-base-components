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
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-vue-next"
import { Button } from "../button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
</script>

<template>
  <div v-if="column.getCanSort?.()" :class="cn('flex items-center', props.class)">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="sm" class="-ml-2.5 h-8 data-[state=open]:bg-accent">
          <span>{{ title }}</span>
          <ArrowDown v-if="sorted() === 'desc'" />
          <ArrowUp v-else-if="sorted() === 'asc'" />
          <ChevronsUpDown v-else />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem @select="column.toggleSorting?.(false)">
          <ArrowUp />
          <span>升序</span>
        </DropdownMenuItem>
        <DropdownMenuItem @select="column.toggleSorting?.(true)">
          <ArrowDown />
          <span>降序</span>
        </DropdownMenuItem>
        <template v-if="column.getCanHide?.()">
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            :model-value="false"
            @select="column.toggleVisibility?.(false)"
          >
            <EyeOff />
            <span>隐藏该列</span>
          </DropdownMenuCheckboxItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  <!-- 不可排序时退化成纯文本表头 -->
  <span v-else>{{ title }}</span>
</template>
