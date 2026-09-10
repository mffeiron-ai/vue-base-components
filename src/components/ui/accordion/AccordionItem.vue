<script setup lang="ts">
import type { AccordionItemProps } from "reka-ui"
/**
 * AccordionItemProps：
 * 继承 CollapsibleRootProps（去掉 open / defaultOpen / onOpenChange）：
 *   value: string 必填，每个 item 的唯一值
 *   disabled?: boolean 禁用该 item
 *   as / asChild / unmountOnHide 等继承自 reka-ui
 * 它的全部作用 = 定义 Accordion 单个面板（item）接收的 props。
 */
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { AccordionItem, useForwardProps } from "reka-ui"
/**
 * AccordionItem：reka-ui 真正的 item 组件，负责提供 item 上下文并渲染面板。
 * useForwardProps：返回一个 computed，包含实际传入的 props（camelize + 默认值），
 *   供 v-bind 透传给 AccordionItem。
 * 用法：
 * const forwardedProps = useForwardProps(delegatedProps)
 */
import { cn } from "../../../lib/utils"

const props = defineProps<AccordionItemProps & { class?: HTMLAttributes["class"] }>()
// 定义组件的 props = reka-ui 的 AccordionItemProps，外加一个可选的 class

const delegatedProps = reactiveOmit(props, "class")
// 从 props 里剔除 class，剩下的（value / disabled / as ...）用于透传给 AccordionItem

const forwardedProps = useForwardProps(delegatedProps)
// 把剔除 class 后的 props 转成可直接 v-bind 的响应式对象
</script>

<template>
  <!-- AccordionItem: 单个面板
   v-slot="slotProps" 接收 AccordionItem 透传的插槽属性（如 open）
   data-slot="accordion-item" 标识插槽，便于样式按 data-slot 定位
   v-bind="forwardedProps" 透传 value / disabled / as 等给 reka-ui
   :class="..." 默认底部边框 + 合并用户传入的 props.class -->
  <AccordionItem
    v-slot="slotProps"
    data-slot="accordion-item"
    v-bind="forwardedProps"
    :class="cn('border-input last:border-b-0', props.class)"
  >
    <!-- 把 AccordionItem 的 slot scope（open）透传给使用方 -->
    <slot v-bind="slotProps" />
  </AccordionItem>
</template>
