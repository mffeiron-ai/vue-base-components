<script setup lang="ts">
/**
 * Command 根组件 —— reka-ui ListboxRoot + 本目录自建的过滤逻辑。
 *
 * 过滤是「命令面板」的核心，流程：
 *   1. 每个 CommandItem 挂载时把自己的文本注册到 allItems；
 *   2. 搜索词变化 → filterItems()：用 reka 的 contains 逐个打分（分值只区分命中/不命中）；
 *   3. Item 按分数决定自己去渲染（v-if），Group 按「组内还有没有命中」整组隐藏；
 *   4. CommandEmpty 在「有搜索词且命中数为 0」时出现。
 *
 * v-model(modelValue) 是 ListboxRoot 的高亮项（键盘上下选中的那一项），
 * 不是搜索词 —— 搜索词在 filterState.search 里。data-slot="command" 供预设挂钩。
 */
import type { ListboxRootEmits, ListboxRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ListboxRoot, useFilter, useForwardPropsEmits } from "reka-ui"
import { reactive, ref, watch } from "vue"
import { cn } from "../../../lib/utils"
import { provideCommandContext } from "."

const props = withDefaults(defineProps<ListboxRootProps & { class?: HTMLAttributes["class"] }>(), {
  modelValue: "",
})

const emits = defineEmits<ListboxRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)

// 注册表：所有 Item / Group 在这里登记，过滤时只跑这两张表
const allItems = ref<Map<string, string>>(new Map())
const allGroups = ref<Map<string, Set<string>>>(new Map())

// reka 的文本匹配器，sensitivity: "base" = 忽略大小写与重音
const { contains } = useFilter({ sensitivity: "base" })
const filterState = reactive({
  search: "",
  filtered: {
    /** The count of all visible items. */
    count: 0,
    /** Map from visible item id to its search score. */
    items: new Map() as Map<string, number>,
    /** Set of groups with at least one visible item. */
    groups: new Set() as Set<string>,
  },
})

/**
 * 搜索词变化时重算命中（复杂度 O(选项数)，所以不做防抖也能跟手）。
 * 搜索词为空时直接认为全命中，交给 Item 自己显示（省一次遍历）。
 */
function filterItems() {
  if (!filterState.search) {
    filterState.filtered.count = allItems.value.size
    // Do nothing, each item will know to show itself because search is empty
    return
  }

  // Reset the groups
  filterState.filtered.groups = new Set()
  let itemCount = 0

  // Check which items should be included
  for (const [id, value] of allItems.value) {
    const score = contains(value, filterState.search)
    filterState.filtered.items.set(id, score ? 1 : 0)
    if (score)
      itemCount++
  }

  // Check which groups have at least 1 item shown
  for (const [groupId, group] of allGroups.value) {
    for (const itemId of group) {
      if (filterState.filtered.items.get(itemId)! > 0) {
        filterState.filtered.groups.add(groupId)
        break
      }
    }
  }

  filterState.filtered.count = itemCount
}

watch(() => filterState.search, () => {
  filterItems()
})

// 交给后代组件用：Item 注册文本 / Group 判断要不要隐藏 / Empty 判断要不要出现
provideCommandContext({
  allItems,
  allGroups,
  filterState,
})
</script>

<template>
  <ListboxRoot
    data-slot="command"
    v-bind="forwarded"
    :class="cn('bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md', props.class)"
  >
    <slot />
  </ListboxRoot>
</template>
