<template>
  <div class="m-0 p-0">
    <div class="flex gap-2 mb-4">
      <slot name="search"></slot>    
      <slot name="toolbar"></slot>
      <div class="relative">
        <DropdownMenu>
          <DropdownMenuTrigger
          class="flex items-center px-3 py-2 bg-secondary text-sm rounded-md cursor-pointer">
            显示/隐藏�?
            <ChevronDown class="ml-1 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" class="w-48 border-none bg-secondary">
            <div class="p-2 flex items-center space-x-2">
              <Checkbox 
                id="select-all-columns" 
                :model-value="isAllColumnsSelected" 
                @click="toggleAllColumns"
              />
              <label for="select-all-columns" class="text-sm cursor-pointer">全�?取消全�?/label>
            </div>
            <DropdownMenuSeparator />

            <div class="p-2 max-h-60 overflow-y-auto">
              <div v-for="(col, idx) in columns" :key="idx" class="flex items-center space-x-2 mb-1">
                <Checkbox 
                  :id="`col-${idx}`" 
                  :model-value="visibleColumns.includes(String(col.field))" 
                  @click="() => {
                    const newChecked = !visibleColumns.includes(String(col.field));
                    toggleColumn(String(col.field), newChecked);
                  }"
                />
                <label :for="`col-${idx}`" class="text-sm cursor-pointer">{{ col.label }}</label>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    <div ref="tableRef">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-for="(col, idx) in filteredColumns" :key="idx"
            :class="col.sortable ? 'cursor-pointer select-none hover:bg-muted/50' : ''"
            @click="handleSort(col)">
            {{ col.label }}<span v-if="col.sortable" class="text-muted-foreground">{{ sortIndicator(col) }}</span>
          </TableHead>
          <TableHead v-if="$slots.actions" class="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="internalLoading">
          <TableRow v-for="r in (pageSize || 5)" :key="'skel-'+r">
            <TableCell v-for="(_, ci) in filteredColumns" :key="ci" :style="{ height: cachedRowHeight + 'px' }">
              <div class="h-4 bg-muted rounded animate-pulse" :style="{ width: (['w-3/4','w-1/2','w-2/3','w-5/6','w-full','w-3/5','w-4/5','w-1/3'][(r*3+ci)%8]) }" />
            </TableCell>
            <TableCell v-if="$slots.actions" :style="{ height: cachedRowHeight + 'px' }"><div class="h-4 w-12 bg-muted rounded animate-pulse" /></TableCell>
          </TableRow>
        </template>
        <template v-else-if="!sortedData.length">
          <TableRow><TableCell :colspan="filteredColumns.length + ($slots.actions?1:0)" class="text-center text-muted-foreground h-24">{{ emptyText || '暂无数据' }}</TableCell></TableRow>
        </template>
        <template v-else>
          <TableRow v-for="row in sortedData" :key="row[idField]">
          <TableCell v-for="(col, idx) in filteredColumns" :key="idx" class="max-w-[250px]" :class="clickable && idx === 0 ? 'cursor-pointer text-primary hover:underline' : ''" @click="clickable && idx === 0 && onRowClick(row)">
            <template v-if="col.type === 'markdown'">
              <div class="max-w-[250px] max-h-[150px] overflow-hidden break-words">
                <MdPreview :modelValue="row[col.field]" />
              </div>
            </template>
            <template v-else-if="col.type === 'image'">
              <img :src="row[col.field]" alt="图片" class="max-w-[120px] max-h-[120px] object-contain" />
            </template>
            <template v-else-if="col.type === 'select' && col.options">
              <div class="max-h-[80px] overflow-hidden text-ellipsis line-clamp-3 break-words">
                {{ col.options.find(opt => opt.value === row[col.field])?.label ?? row[col.field] }}
              </div>
            </template>
            <template v-else>
              <slot :name="col.slot" v-bind="row">
                <div class="max-h-[80px] overflow-hidden text-ellipsis line-clamp-3 break-words">
                  {{ row[col.field] }}
                </div>
              </slot>
            </template>
          </TableCell>
          <TableCell v-if="$slots.actions" class="text-right">
            <slot name="actions" v-bind="row"></slot>
          </TableCell>
        </TableRow>
        </template>
      </TableBody>
    </Table>
    </div>
    <BasePagination
      v-if="showPagination"
      :page="localPage"
      :pageSize="localPageSize"
      :total="localTotal"      
      @page-change="(page: number) => {
        emit('update:page', page);
        emit('page-change', page);
      }"
      @pageSize-change="(pageSize: number) => {
        emit('update:pageSize', pageSize);
        emit('pageSizeChange', pageSize);
      }"
    />
  </div>

  <!-- 行详情侧滑面�?-->
  <Sheet v-if="detailFields?.length" :open="detailOpen" @update:open="detailOpen = $event">
    <SheetContent class="w-[480px] sm:max-w-[480px] overflow-y-auto flex flex-col pl-4" side="right">
      <SheetHeader class="text-center pl-0"><SheetTitle class="text-base">{{ detailTitle || '详情' }}</SheetTitle></SheetHeader>
      <div v-if="detailRow" class="flex-1 py-4 space-y-0 text-sm">
        <div v-for="f in detailFields" :key="f.field" class="flex items-center py-3 border-b border-border">
          <span class="w-[90px] shrink-0 text-muted-foreground">{{ f.label }}</span>
          <span class="flex-1 text-foreground break-all" :class="{ 'font-mono': f.type !== 'image' }">
            <template v-if="f.type === 'image' && detailRow[f.field]?.length">
              <div class="flex flex-wrap gap-2">
                <img v-for="(img, i) in (detailRow[f.field] || [])" :key="i" :src="detailImgUrl(img)" class="w-20 h-20 object-cover rounded border cursor-pointer hover:ring-2 ring-primary" @click="detailPreviewImage = detailImgUrl(img)" />
              </div>
            </template>
            <template v-else>{{ detailRow[f.field] || '-' }}</template>
          </span>
        </div>
      </div>
      <SheetFooter class="mt-auto pt-2"><SheetClose as-child><Button variant="outline" class="w-full">关闭</Button></SheetClose></SheetFooter>
    </SheetContent>
  </Sheet>

  <!-- 图片大图预览 -->
  <Dialog :open="!!detailPreviewImage" @update:open="detailPreviewImage = ''">
    <DialogContent class="sm:max-w-2xl p-2">
      <img v-if="detailPreviewImage" :src="detailPreviewImage" class="w-full h-auto rounded" />
    </DialogContent>
  </Dialog>
</template>


<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableEmpty } from './ui/table'
import { Skeleton } from './ui/skeleton'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from './ui/sheet'
import { Dialog, DialogContent } from './ui/dialog'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import BasePagination from './BasePagination.vue'

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu'
import { Checkbox } from './ui/checkbox'
import { ChevronDown } from 'lucide-vue-next'

// 泛型类型定义
export type Column<T = any> = {
  label: string
  field: keyof T | string
  slot?: string
  type?: string
  options?: { value: any; label: string }[] // 新增
  sortable?: boolean // 是否可排�?
}

const props = defineProps<{
  columns: Column<any>[]
  data: any[]
  idField: string
  sortFn?: ((a: any, b: any) => number) | null
  /** 服务端排序字�?*/
  sortField?: string
  /** 服务端排序方�?*/
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
  numPages?: number
  total?: number
  loading?: boolean
  /** 骨架屏最短展示时�?ms)，避免数据太快导致闪烁，默认 120 */
  minLoadingMs?: number
  emptyText?: string
  /** 行是否可点击，开启后鼠标悬停有反馈，并触�?row-click 事件 */
  clickable?: boolean
  /** 详情字段定义，提供后点击行自动弹出右侧详情面�?*/
  detailFields?: { label: string; field: string; type?: 'text' | 'image' }[]
  /** 详情面板标题 */
  detailTitle?: string
  /** 图片 URL 转换函数，例�?getAvatarUrl */
  resolveImageUrl?: (url: string) => string
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  'page-change': [page: number]
  'pageSizeChange': [pageSize: number]
  /** 点击数据行时触发，参数为行数�?*/
  'row-click': [row: any]
  /** 点击可排序列的表头时触发 */
  'sort-change': [payload: { field: string; order: 'asc' | 'desc' }]
}>()

// ========== 行点�?�?详情面板 ==========
const detailOpen = ref(false)
const detailRow = ref<any>(null)
const detailPreviewImage = ref('')

function onRowClick(row: any) {
  emit('row-click', row)
  if (props.detailFields?.length) {
    detailRow.value = row
    detailOpen.value = true
  }
}

function detailImgUrl(url: string): string {
  return props.resolveImageUrl ? props.resolveImageUrl(url) : url
}

const localPage = computed(() => props.page ?? 1)
const localPageSize = computed(() => props.pageSize ?? 10)
const localTotal = computed(() => props.total ?? 0)
const visibleColumns = ref(props.columns.map(col => String(col.field)))

// 计算属性：是否所有列都被选中
const isAllColumnsSelected = computed(() => {
  return visibleColumns.value.length === props.columns.length;
})

// 切换列显�?隐藏状�?
function toggleColumn(field: string, checked: boolean) 
{
  if (checked) {
    // 添加列到可见列表
    if (!visibleColumns.value.includes(field)) {
      visibleColumns.value.push(field)
    }
  } else {
    // 从可见列表中移除列，但至少保留一�?
    if (visibleColumns.value.length > 1) {
      visibleColumns.value = visibleColumns.value.filter(col => col !== field)
    }
  }
}

// 切换全�?取消全选状�?
function toggleAllColumns() {
  if (isAllColumnsSelected.value) {
    // 当前是全选状态，切换到最小选择状态（保留第一列）
    if (props.columns.length > 0) {
      visibleColumns.value = [String(props.columns[0].field)];
    } else {
      visibleColumns.value = [];
    }
  } else {
    // 当前不是全选状态，切换到全选状�?
    visibleColumns.value = props.columns.map(col => String(col.field));
  }
}

// ========== 排序逻辑 ==========
function handleSort(col: Column) {
  if (!col.sortable) return
  const field = String(col.field)
  if (props.sortField === field) {
    // 切换排序方向
    const nextOrder = props.sortOrder === 'asc' ? 'desc' : 'asc'
    emit('sort-change', { field, order: nextOrder })
  } else {
    emit('sort-change', { field, order: 'asc' })
  }
}

function sortIndicator(col: Column): string {
  if (!col.sortable) return ''
  if (props.sortField !== String(col.field)) return ' �?
  return props.sortOrder === 'asc' ? ' �? : ' �?
}

const filteredColumns = computed(() => {
  return props.columns.filter(col => visibleColumns.value.includes(String(col.field)))
})

const sortedData = computed(() => {
  const data = props.sortFn ? [...props.data].sort(props.sortFn) : [...props.data]
  return data.map((item, idx) => ({ ...item, _idx: idx }))
})

/** 仅当显式传了 total 时才显示分页 */
const showPagination = computed(() => props.total !== undefined)

// ========== 骨架屏最短展示延迟，避免闪现 ==========
const internalLoading = ref(props.loading ?? false)
let loadingStartAt = 0
let loadingTimer: ReturnType<typeof setTimeout> | null = null

/** 缓存上次渲染的数据行高度，骨架屏复用 */
const tableRef = ref<HTMLElement | null>(null)
const cachedRowHeight = ref(40) // 默认 40px = h-10

watch(() => props.loading, (val) => {
  if (val) {
    loadingStartAt = Date.now()
    internalLoading.value = true
  } else {
    const elapsed = Date.now() - loadingStartAt
    const remain = (props.minLoadingMs ?? 250) - elapsed
    if (remain > 0) {
      if (loadingTimer) clearTimeout(loadingTimer)
      loadingTimer = setTimeout(() => { internalLoading.value = false }, remain)
    } else {
      internalLoading.value = false
    }
  }
}, { immediate: true })

// 数据渲染完成后，测量第一条数据行�?td 高度缓存起来
watch(internalLoading, (val) => {
  if (!val && props.data?.length) {
    nextTick(() => {
      const td = tableRef.value?.querySelector('tbody tr td')
      if (td) cachedRowHeight.value = Math.round(td.getBoundingClientRect().height)
    })
  }
})

defineExpose({
  openDetail: (row: any) => {
    console.log('[BaseTable] openDetail called, row:', row?.[props.idField], 'detailFields:', !!props.detailFields?.length)
    if (props.detailFields?.length) {
      detailRow.value = row
      detailOpen.value = true
      console.log('[BaseTable] detailOpen set to true')
    }
  },
})
</script>