<script setup lang="ts">
/**
 * CommandItem —— 单个可执行项。
 *
 * 过滤与选中靠三件事：
 * - value：**必填**（reka 的 ListboxItem 要求）。过滤不依赖它（过滤看文本），
 *   但选中值、高亮定位和 @select 的载荷都用它；不传的话 TS 会报错。
 * - 挂载时把 id → textContent 注册到 Command 的 allItems（所以「过滤依据就是项里的文本」，
 *   包括 CommandShortcut 的快捷键文字，想不被搜索到就把文字挪出选项）；
 * - isRender：本次搜索自己是否命中 —— 不命中时整个节点被 v-if 卸载（注意：卸载即重建，
 *   选项内的局部状态会丢）；
 * - 选中（回车 / 点击）后把搜索词清空，与上游 cmdk 行为一致。
 *
 * 键盘上下 + 回车、高亮态（data-[highlighted]）、aria 语义都由 reka 的 ListboxItem 提供。
 */
import type { ListboxItemEmits, ListboxItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit, useCurrentElement } from "@vueuse/core"
import { ListboxItem, useForwardPropsEmits, useId } from "reka-ui"
import { computed, onMounted, onUnmounted, ref } from "vue"
import { cn } from "../../../lib/utils"
import { useCommand, useCommandGroup } from "."

const props = defineProps<ListboxItemProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<ListboxItemEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)

const id = useId()
const { filterState, allItems, allGroups } = useCommand()
// 所在分组的 id（不在 Group 里时为 undefined）
const groupContext = useCommandGroup()

// 命中判定：首帧没进 allItems 时先渲染一次（挂了才有文本可匹配）
const isRender = computed(() => {
  if (!filterState.search) {
    return true
  }
  else {
    const filteredCurrentItem = filterState.filtered.items.get(id)
    // If the filtered items is undefined means not in the all times map yet
    // Do the first render to add into the map
    if (filteredCurrentItem === undefined) {
      return true
    }

    // Check with filter
    return filteredCurrentItem > 0
  }
})

const itemRef = ref()
const currentElement = useCurrentElement(itemRef)
onMounted(() => {
  if (!(currentElement.value instanceof HTMLElement))
    return

  // 用文本做过滤依据；没有 DOM 文本时退回 value，再退回空串
  allItems.value.set(id, currentElement.value.textContent ?? (props.value?.toString() ?? ""))

  const groupId = groupContext?.id
  if (groupId) {
    if (!allGroups.value.has(groupId)) {
      allGroups.value.set(groupId, new Set([id]))
    }
    else {
      allGroups.value.get(groupId)?.add(id)
    }
  }
})
onUnmounted(() => {
  allItems.value.delete(id)
})
</script>

<template>
  <ListboxItem v-if="isRender" data-slot="command-item" v-bind="forwarded" :id="id" ref="itemRef" :class="cn('data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*=\'text-\'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4', props.class)" @select="() => {
      // 选中后清空搜索词（回调里改 ref 即可，Command 会监听并重新过滤）
      filterState.search = ''
    }"
  >
    <slot />
  </ListboxItem>
</template>
