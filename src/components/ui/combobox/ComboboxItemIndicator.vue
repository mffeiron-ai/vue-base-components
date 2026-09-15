<script setup lang="ts">
/**
 * ComboboxItemIndicator —— 选中项右侧的对勾容器（reka 只在选中时渲染它）。
 *
 * 定位交给预设：`[data-slot="combobox-item-indicator"]` 是 `absolute right-2 size-4`，
 * 因为 ComboboxItem 自身是 relative 的，所以这里的 ml-auto 只是没套预设时的兜底。
 */
import type { ComboboxItemIndicatorProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ComboboxItemIndicator, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ComboboxItemIndicatorProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <ComboboxItemIndicator
    data-slot="combobox-item-indicator"
    v-bind="forwarded"
    :class="cn('ml-auto', props.class)"
  >
    <slot />
  </ComboboxItemIndicator>
</template>
