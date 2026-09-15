<script setup lang="ts">
/**
 * ComboboxInput —— 弹出层顶部的搜索框。
 *
 * - 输入内容由 reka 内部维护（searchTerm），会自动过滤 ComboboxItem 并高亮命中部分，
 *   不需要自己写 filter 逻辑；想清空搜索词用 ComboboxCancel。
 * - data-slot 沿用 Command 的名字（command-input-wrapper / command-input）：预设的
 *   「Command」段落已经定义好「带搜索图标的输入框」，Combobox 直接复用这套样式。
 *   所以这两个 data-slot 名不要手滑改掉，改了样式就丢。
 * - inheritAttrs:false 是有意的：外层 div 只是布局壳，$attrs 要合并给内层 ComboboxInput。
 */
import type { ComboboxInputEmits, ComboboxInputProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { SearchIcon } from "lucide-vue-next"
import { ComboboxInput, useForwardPropsEmits } from "reka-ui"
import { cn } from "../../../lib/utils"

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<ComboboxInputProps & {
  class?: HTMLAttributes["class"]
}>()

const emits = defineEmits<ComboboxInputEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <div
    data-slot="command-input-wrapper"
    class="flex h-9 items-center gap-2 border-b px-3"
  >
    <SearchIcon class="size-4 shrink-0 opacity-50" />
    <ComboboxInput
      data-slot="command-input"
      :class="cn(
        'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )"

      v-bind="{ ...$attrs, ...forwarded }"
    >
      <slot />
    </ComboboxInput>
  </div>
</template>
