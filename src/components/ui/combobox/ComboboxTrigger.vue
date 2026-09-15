<script setup lang="ts">
/**
 * ComboboxTrigger —— 开关下拉框的触发器。
 *
 * 惯例是 as-child 包一个 Button（样式全部交给 Button），这样点击范围、键盘态都对：
 *   <ComboboxTrigger as-child><Button variant="outline">...</Button></ComboboxTrigger>
 *
 * - tabindex="0"：即使外面套的元素本身不可聚焦，也能用 Tab 到触发器并回车展开。
 * - data-slot="combobox-trigger" 让预设统一控制「触发器里的 svg 尺寸」（通常是 1rem）。
 *   但它【只在没套 as-child 时】才输出：as-child 时属性会盖到子元素上，
 *   如果不让位，子元素（Button）自己的 data-slot="button" 会被顶掉，
 *   预设里的按钮样式（outline 的边框等）会整体失效。
 *   这里用条件对象而不是 :data-slot="asChild ? undefined : ..."：
 *   显式的 undefined 依然会在属性合并时把子元素的值覆写成空，等于没让位。
 */
import { computed } from "vue"
import type { ComboboxTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ComboboxTrigger, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ComboboxTriggerProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

/** as-child 时让位：连 key 都不传，否则会把子元素的 data-slot 覆写成空 */
const slotAttrs = computed(() =>
  props.asChild ? {} : { "data-slot": "combobox-trigger" },
)

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <ComboboxTrigger
    v-bind="{ ...slotAttrs, ...forwarded }"
    :class="cn(props.class)"
    tabindex="0"
  >
    <slot />
  </ComboboxTrigger>
</template>
