<script setup lang="ts">
/**
 * ComboboxGroup —— 把选项分组，并在组首渲染一个小标题。
 *
 * - heading 是本库补的便捷 prop：传了就自动渲染一个 reka 的 ComboboxLabel
 *   （等价于手写 <ComboboxLabel>），不传就只做分组、不占高度。
 * - heading 属于本地私有 prop，必须从转发给 reka 的 props 里剔除，
 *   否则会作为无意义的 DOM 属性渲染到 grup 元素上。
 * - 分组之间想加线用 ComboboxSeparator。
 */
import type { ComboboxGroupProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ComboboxGroup, ComboboxLabel, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ComboboxGroupProps & {
  class?: HTMLAttributes["class"]
  heading?: string
}>()

const delegatedProps = reactiveOmit(props, "class", "heading")
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <ComboboxGroup data-slot="combobox-group" v-bind="forwarded" :class="cn('p-1 text-foreground', props.class)" >
    <ComboboxLabel v-if="heading" class="px-2 py-1.5 text-sm font-medium text-muted-foreground">
      {{ heading }}
    </ComboboxLabel>
    <slot />
  </ComboboxGroup>
</template>
