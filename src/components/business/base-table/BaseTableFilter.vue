<script setup lang="ts">
/**
 * BaseTable · 表头筛选弹层
 *
 * 只负责「长什么样 + 什么时候调用」：5 种输入形态（分面多选 / 静态下拉多选 /
 * 数字区间 / 日期区间 + 按天多选 / 文本包含）走的是同一套状态机 —— 也就是父组件
 * 那份 `useTableFilters` 的返回值 `f`，这里**不复制状态**，只驱动它。
 *
 * 弹层开合也归它管（`f.openFilterCol === f.filterKey(col)`），父组件因此只需要知道
 * 「这一列有没有筛选」。
 */
import { Filter, Loader2 } from 'lucide-vue-next'
import { Button } from '../../ui/button'
import { Checkbox } from '../../ui/checkbox'
import { Input } from '../../ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import type { Column } from './types'
import type { UseTableFiltersApi } from './useTableFilters'

defineProps<{
  /** 当前列（读 `col.label` / `col.filter` 决定形态） */
  col: Column
  /** 父组件那份筛选状态机（`useTableFilters` 的返回值） */
  f: UseTableFiltersApi
}>()
</script>

<template>
  <Popover
    :open="f.openFilterCol === f.filterKey(col)"
    @update:open="(o: boolean) => f.onFilterPopover(col, o)"
  >
    <PopoverTrigger as-child>
      <Button
        variant="ghost"
        size="sm"
        class="size-5 shrink-0 p-0"
        :class="f.isFilterActive(col) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'"
        :aria-label="`筛选 ${col.label}`"
        @click.stop
      >
        <Filter class="size-3.5" />
      </Button>
    </PopoverTrigger>

    <PopoverContent
      class="w-max min-w-72 max-w-[min(34rem,calc(100vw-2rem))] p-0"
      align="start"
      @click.stop
    >
      <div class="border-b px-3 py-2 text-xs font-semibold">{{ col.label }} 筛选</div>

      <div class="space-y-2 p-2">
        <!-- 分面：列值 + 命中计数 -->
        <template v-if="f.isFacetCol(col)">
          <Input
            :model-value="f.facetSearch"
            placeholder="搜索关键字"
            class="h-8 text-xs"
            @update:model-value="(v: unknown) => f.onFacetSearch(col, String(v ?? ''))"
          />
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>已选 {{ f.selectedCount(col) }} · 共 {{ f.visibleFacetItems.length }} 项</span>
            <div class="flex shrink-0 items-center gap-2">
              <button
                v-if="f.visibleFacetItems.length"
                type="button"
                class="text-primary hover:underline"
                @click="f.toggleFacetAll(col)"
              >{{ f.facetAllSelected(col) ? '取消全选' : '全选' }}</button>
              <button
                v-if="f.visibleFacetItems.length"
                type="button"
                class="text-primary hover:underline"
                @click="f.toggleFacetInvert(col)"
              >反选</button>
            </div>
          </div>

          <div v-if="f.facetLoading && !f.visibleFacetItems.length" class="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
            <Loader2 class="size-3.5 animate-spin" />加载中…
          </div>
          <div v-else-if="f.visibleFacetItems.length" class="max-h-48 overflow-auto rounded-md border">
            <label
              v-for="it in f.sortBySelected(col, f.visibleFacetItems)"
              :key="String(it.value)"
              class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs hover:bg-muted/50"
              :class="f.isOptSelected(col, it.value) ? 'bg-primary/10 font-medium' : ''"
              @click="f.toggleOpt(col, it.value, !f.isOptSelected(col, it.value))"
            >
              <Checkbox
                :model-value="f.isOptSelected(col, it.value)"
                @click.stop
                @update:model-value="(c: unknown) => f.toggleOpt(col, it.value, !!c)"
              />
              <span class="min-w-0 flex-1 whitespace-normal break-words">{{ f.facetLabel(col, it.value) }}</span>
              <span v-if="it.count" class="shrink-0 tabular-nums text-muted-foreground">{{ it.count }}</span>
            </label>
          </div>
          <div v-else class="py-3 text-center text-xs text-muted-foreground">无匹配项</div>
        </template>

        <!-- 数字区间 -->
        <template v-else-if="col.filter?.type === 'number'">
          <div class="flex items-center gap-1">
            <Input :model-value="f.rangeDraft(col).gte" type="number" placeholder="≥" class="h-8 text-xs" @update:model-value="(v: unknown) => f.rangeDraft(col).gte = v" />
            <Input :model-value="f.rangeDraft(col).lte" type="number" placeholder="≤" class="h-8 text-xs" @update:model-value="(v: unknown) => f.rangeDraft(col).lte = v" />
          </div>
        </template>

        <!-- 日期区间 + 按天多选 -->
        <template v-else-if="col.filter?.type === 'date'">
          <div class="space-y-1">
            <Input :model-value="f.rangeDraft(col).gte" type="date" class="h-8 text-xs" @update:model-value="(v: unknown) => f.rangeDraft(col).gte = v" />
            <Input :model-value="f.rangeDraft(col).lte" type="date" class="h-8 text-xs" @update:model-value="(v: unknown) => f.rangeDraft(col).lte = v" />
          </div>
          <div class="mt-2 border-t pt-2">
            <div class="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>按天分布（勾选多选）</span>
              <div class="flex shrink-0 items-center gap-2">
                <button v-if="f.facetItems.length" type="button" class="text-primary hover:underline" @click="f.toggleDateAll(col)">{{ f.dateAllSelected(col) ? '取消全选' : '全选' }}</button>
                <button v-if="f.facetItems.length" type="button" class="text-primary hover:underline" @click="f.toggleDateInvert(col)">反选</button>
                <button type="button" class="text-primary hover:underline" @click="f.applyDatePreset(col, 'yesterday')">昨天</button>
                <button type="button" class="text-primary hover:underline" @click="f.applyDatePreset(col, 'currentMonth')">当月</button>
              </div>
            </div>
            <div v-if="f.facetLoading" class="py-3 text-center text-xs text-muted-foreground">加载中…</div>
            <div v-else-if="f.facetItems.length" class="max-h-40 overflow-auto rounded-md border">
              <label
                v-for="it in f.facetItems"
                :key="String(it.value)"
                class="flex cursor-pointer items-center gap-2 px-2 py-1 text-xs hover:bg-muted/50"
                :class="f.dateDays(col).includes(String(it.value)) ? 'bg-primary/10 font-medium' : ''"
                @click="f.toggleDateDay(col, it.value)"
              >
                <Checkbox
                  :model-value="f.dateDays(col).includes(String(it.value))"
                  @click.stop
                  @update:model-value="(c: unknown) => { if (c) f.toggleDateDay(col, it.value) }"
                />
                <span class="flex-1 tabular-nums">{{ it.value ?? '（空 · 未设置）' }}</span>
                <span class="shrink-0 tabular-nums text-muted-foreground">{{ it.count }}</span>
              </label>
            </div>
            <div v-else class="py-2 text-center text-xs text-muted-foreground">无数据</div>
          </div>
        </template>

        <!-- 文本包含 -->
        <template v-else-if="col.filter?.type === 'text'">
          <Input
            :model-value="f.filterDraft[f.filterKey(col)] ?? ''"
            placeholder="输入关键字…"
            class="h-8 text-xs"
            @update:model-value="(v: unknown) => { f.filterDraft[f.filterKey(col)] = v }"
            @keyup.enter="f.applyFilter(col)"
          />
        </template>

        <!-- 静态下拉多选 -->
        <template v-else-if="col.filter?.type === 'select'">
          <Input :model-value="f.selectSearch" placeholder="搜索关键字" class="h-8 text-xs" @update:model-value="(v: unknown) => f.selectSearch = String(v ?? '')" />
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>已选 {{ f.selectedCount(col) }} · 共 {{ f.filteredSelectOptions(col).length }} 项</span>
            <div class="flex shrink-0 items-center gap-2">
              <button v-if="f.filteredSelectOptions(col).length" type="button" class="text-primary hover:underline" @click="f.toggleAllSelect(col)">
                {{ f.selectAllSelected(col) ? '取消全选' : '全选' }}
              </button>
              <button v-if="f.filteredSelectOptions(col).length" type="button" class="text-primary hover:underline" @click="f.toggleSelectInvert(col)">反选</button>
            </div>
          </div>
          <div class="max-h-48 overflow-auto rounded-md border">
            <label
              v-for="opt in f.filteredSelectOptions(col)"
              :key="String(opt.value)"
              class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs hover:bg-muted/50"
              :class="f.isOptSelected(col, opt.value) ? 'bg-primary/10 font-medium' : ''"
              @click="f.toggleOpt(col, opt.value, !f.isOptSelected(col, opt.value))"
            >
              <Checkbox
                :model-value="f.isOptSelected(col, opt.value)"
                @click.stop
                @update:model-value="(c: unknown) => f.toggleOpt(col, opt.value, !!c)"
              />
              <span class="min-w-0 whitespace-normal break-words">{{ opt.label }}</span>
            </label>
          </div>
        </template>
      </div>

      <div class="flex items-center justify-between border-t px-3 py-2">
        <Button variant="ghost" size="sm" class="h-8 px-2 text-xs" @click="f.resetFilter(col)">重置</Button>
        <div class="flex gap-1">
          <Button variant="outline" size="sm" class="h-8 px-3 text-xs" @click="f.openFilterCol = null">取消</Button>
          <Button size="sm" class="h-8 px-3 text-xs" @click="f.applyFilter(col)">确定</Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
