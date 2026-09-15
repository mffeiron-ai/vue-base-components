<script setup lang="ts">
/**
 * ComboboxAnchor —— 弹出层的定位锚点。
 *
 * 常见写法是 as-child 包住 ComboboxTrigger，让「触发器本身就是锚点」：
 *   <ComboboxAnchor as-child>
 *     <ComboboxTrigger as-child><Button /></ComboboxTrigger>
 *   </ComboboxAnchor>
 * 配合 as-child 时，弹出层宽度取自锚点宽度（--reka-popper-anchor-width，见 ComboboxList），
 * 所以下拉框能和按钮严格等宽。这里默认的 w-[200px] 只是「不套 as-child」时的兜底宽度。
 *
 * 注意：这里故意【不加】data-slot。as-child 时组件的属性会覆盖到子元素上，
 * 一旦写上 data-slot="combobox-anchor"，子元素（通常是 Button）自己的
 * data-slot="button" 就被顶掉，预设里的按钮基础样式（如 outline 的 1px 边框）会整体失效；
 * 而锚点本身在预设里没有任何规则，写上只会損人不利己。
 */
import type { ComboboxAnchorProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ComboboxAnchor, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ComboboxAnchorProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <ComboboxAnchor
    v-bind="forwarded"
    :class="cn('w-[200px]', props.class)"
  >
    <slot />
  </ComboboxAnchor>
</template>
