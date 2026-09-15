<script setup lang="ts">
/**
 * ComboboxViewport —— 可选的滚动视口，放在 ComboboxList 里面包住选项列表。
 *
 * 什么时候用：
 * - 选项很多（上百条）需要固定滚动区域时；
 * - 准备搭配 reka 的 ComboboxVirtualizer 做虚拟滚动时（虚拟化的根必须是 Viewport）。
 * 普通几十条的列表不需要它，ComboboxList 自带的 max-h + overflow 就够了。
 *
 * 带默认 min-h-0：内容层是 flex 列，flex 子项默认 min-height:auto 会被内容撑开，
 * 补上它，max-height 才能真正把高度卡住。
 *
 * 注意：这个视口在内容层里是 flex 子项（flex: 1 1 0%），所以想改高度要用
 * max-h-* （如 max-h-40），传 h-* 会被拉伸掉，看不到效果。
 */
import type { ComboboxViewportProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ComboboxViewport, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ComboboxViewportProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <ComboboxViewport data-slot="combobox-viewport" v-bind="forwarded" :class="cn('max-h-[300px] min-h-0 scroll-py-1 overflow-x-hidden overflow-y-auto', props.class)" >
    <slot />
  </ComboboxViewport>
</template>
