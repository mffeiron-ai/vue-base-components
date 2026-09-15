<script setup lang="ts">
/**
 * CommandInput —— 面板顶部的搜索框（reka 的 ListboxFilter）。
 *
 * - v-model 直接绑 `filterState.search`：输入即触发 Command 里的过滤，不需要自己写逻辑。
 * - auto-focus：面板弹出（含 CommandDialog 打开）时自动聚焦，键盘党可以直接打字。
 * - data-slot 的 wrapper / input 名字和预设里的 Command 段对应；
 *   预设里还有一个 `command-input-icon`，所以搜索图标也带上该钩子。
 * - inheritAttrs:false + 手动合并 $attrs：外层 div 只是布局壳，attrs 要落到内层过滤输入框上。
 */
import type { ListboxFilterProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Search } from "lucide-vue-next"
import { ListboxFilter, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"
import { useCommand } from "."

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<ListboxFilterProps & {
  class?: HTMLAttributes["class"]
}>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)

const { filterState } = useCommand()
</script>

<template>
  <div
    data-slot="command-input-wrapper"
    class="flex h-9 items-center gap-2 border-b px-3"
  >
    <Search data-slot="command-input-icon" class="size-4 shrink-0 opacity-50" />
    <ListboxFilter
      v-bind="{ ...forwardedProps, ...$attrs }"
      v-model="filterState.search"
      data-slot="command-input"
      auto-focus
      :class="cn('placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50', props.class)"
    />
  </div>
</template>
