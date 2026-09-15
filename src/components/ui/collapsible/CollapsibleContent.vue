<script setup lang="ts">
import type { CollapsibleContentProps } from "reka-ui"
// CollapsibleContentProps：forceMount / as / asChild
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { CollapsibleContent } from "reka-ui"
// CollapsibleContent：收起时不渲染内容（forceMount 可强制保留），
//   并把内容实际高度写到 --reka-collapsible-content-height（供高度动画使用）
import { cn } from "../../../lib/utils"

const props = defineProps<CollapsibleContentProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <!--
    默认自带高度动画（keyframes 在 src/styles/utilities.css 里，靠上面那个 CSS 变量算高度）：
      展开 data-[state=open]:animate-collapsible-down
      收起 data-[state=closed]:animate-collapsible-up
    overflow-hidden 是必须的，否则动画过程中内容会溢出。
    想换时长 / 关掉动画用 class 覆盖（经 cn 去重，后写的赢）：class="duration-300" 或 class="animate-none!"。
    注意：overflow-hidden 同时会裁掉超出内容框的东西（如内部弹层、聚焦环），这种场景自己去 class 里处理。
  -->
  <CollapsibleContent data-slot="collapsible-content" v-bind="delegatedProps" :class=" cn( 'overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up', props.class, ) " >
    <slot />
  </CollapsibleContent>
</template>
