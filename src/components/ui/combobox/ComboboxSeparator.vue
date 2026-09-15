<script setup lang="ts">
/**
 * ComboboxSeparator —— 选项之间的分隔线（1px 高、左右出界 1px）。
 *
 * data-slot="combobox-separator" 由预设负责 `bg-border -mx-1 my-1 h-px`，
 * 这里的 -mx-1 只是无预设时的兜底。
 */
import type { ComboboxSeparatorProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ComboboxSeparator, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ComboboxSeparatorProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <ComboboxSeparator data-slot="combobox-separator" v-bind="forwarded" :class="cn('bg-border -mx-1 h-px', props.class)" >
    <slot />
  </ComboboxSeparator>
</template>
