<script setup lang="ts">
/**
 * ComboboxEmpty —— 搜索无结果时的空状态。
 *
 * 显隐完全由预设控制：`group-data-empty/combobox-content:flex`，
 * 也就是说它得待在带 `group/combobox-content` 的 ComboboxList 里（见 ComboboxList 注释），
 * 并且 reka 在内容元素上写了 `data-empty` 时才会出现。
 * 这里保留 `py-6 text-center text-sm` 作为没套预设时的兜底样式。
 */
import type { ComboboxEmptyProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ComboboxEmpty, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ComboboxEmptyProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <ComboboxEmpty data-slot="combobox-empty" v-bind="forwarded" :class="cn('py-6 text-center text-sm', props.class)" >
    <slot />
  </ComboboxEmpty>
</template>
