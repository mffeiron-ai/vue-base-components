<script setup lang="ts">
/**
 * ComboboxList —— Portal 里的弹出内容层（reka 的 ComboboxPortal + ComboboxContent）。
 *
 * 两个容易踩坑的点：
 * 1. 必须带 `group/combobox-content`。预设里 ComboboxEmpty 靠
 *    `group-data-empty/combobox-content:flex` 显隐，而 reka 只会在「内容元素」上写
 *    `data-empty`；少了这个 group 名，空状态会永远停在 `hidden`（看起来像没实现）。
 * 2. 宽度用 `--reka-popper-anchor-width`（= 锚点宽度）。默认 position="popper"、
 *    align="center"、sideOffset=4，即紧贴触发器下方弹出。
 *
 * data-slot="combobox-list" 由预设统一接管 max-height / 滚动 / 内边距（p-1，空态 p-0）。
 * 列表内部再放 ComboboxInput + ComboboxEmpty + ComboboxGroup，不要放别的容器。
 */
import type { ComboboxContentEmits, ComboboxContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ComboboxContent, ComboboxPortal, useForwardPropsEmits } from "reka-ui"
import { cn } from "../../../lib/utils"

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ComboboxContentProps & { class?: HTMLAttributes["class"] }>(), {
  position: "popper",
  align: "center",
  sideOffset: 4,
})
const emits = defineEmits<ComboboxContentEmits>()

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ComboboxPortal>
    <ComboboxContent
      data-slot="combobox-list"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="cn('group/combobox-content z-50 w-[var(--reka-popper-anchor-width)] rounded-md border bg-popover text-popover-foreground origin-(--reka-combobox-content-transform-origin) shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-h-60 overflow-auto', props.class)"
    >
      <slot />
    </ComboboxContent>
  </ComboboxPortal>
</template>
