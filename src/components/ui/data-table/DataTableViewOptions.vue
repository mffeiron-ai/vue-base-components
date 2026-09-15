<script setup lang="ts">
/**
 * DataTableViewOptions —— 列显隐菜单（右上角一个小按钮）。
 *
 * 用法：`<DataTableViewOptions :table="table" />`，放在 DataTable 的 `#toolbar` 插槽里。
 * 需要注册 columnVisibility feature；组件只读 `getAllColumns()` 上的
 * `getCanHide` / `getIsVisible` / `toggleVisibility` 与 `getAllLeafColumns` 无关，
 * 所以隐藏列不会丢状态（TanStack 自己记住）。
 */
import { Settings2 } from "lucide-vue-next"
import { Button } from "../button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu"

interface HideableColumn {
  id: string
  getCanHide?: () => boolean
  getIsVisible?: () => boolean
  toggleVisibility?: (visible?: boolean) => void
  columnDef?: { header?: unknown }
}

interface ViewOptionsTable {
  getAllColumns?: () => HideableColumn[]
  getIsAllColumnsVisible?: () => boolean
  toggleAllColumnsVisible?: (visible?: boolean) => void
}

const props = defineProps<{ table: ViewOptionsTable, label?: string }>()

const columns = () => (props.table.getAllColumns?.() ?? []).filter((c) => c.getCanHide?.())

/** 列名：列定义里 header 是字符串就直接用，否则退回列 id */
const labelOf = (c: HideableColumn) =>
  typeof c.columnDef?.header === "string" ? c.columnDef.header : c.id
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm" class="gap-2">
        <Settings2 />
        <span>{{ label ?? '列' }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-44">
      <DropdownMenuLabel>显示的列</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem
        v-for="column in columns()"
        :key="column.id"
        :model-value="column.getIsVisible?.() ?? true"
        @update:model-value="(v) => column.toggleVisibility?.(!!v)"
      >
        {{ labelOf(column) }}
      </DropdownMenuCheckboxItem>
      <template v-if="props.table.getIsAllColumnsVisible">
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          :model-value="props.table.getIsAllColumnsVisible()"
          @update:model-value="(v) => props.table.toggleAllColumnsVisible?.(!!v)"
        >
          全选
        </DropdownMenuCheckboxItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
