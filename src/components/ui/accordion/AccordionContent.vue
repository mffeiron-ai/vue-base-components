<script setup lang="ts">
import type { AccordionContentProps } from "reka-ui"
/**
 * AccordionContentProps：
 * 继承 CollapsibleContentProps（即 PrimitiveProps）：
 *   as?: 渲染的元素标签
 *   asChild?: 是否以子元素作为渲染根
 *   forceMount?: 是否强制挂载
 * 它的全部作用 = 定义 Accordion 内容区接收的 props。
 */
import type { HTMLAttributes } from "vue"
import { AccordionContent } from "reka-ui"
/**
 * AccordionContent:
 * 它的全部作用 = 渲染 Accordion 内容区组件。会读取 item/root 上下文
 *   （triggerId、dataState、dataOrientation）来决定展开/收起状态。
 * 用法：
 * <AccordionContent v-bind="delegatedProps"> ... </AccordionContent>
 */
import { reactiveOmit } from "@vueuse/core"
import { cn } from "../../../lib/utils"

const props = defineProps<AccordionContentProps & { class?: HTMLAttributes["class"] }>()
// 定义组件的 props = reka-ui 的 AccordionContentProps，外加一个可选的 class

const delegatedProps = reactiveOmit(props, "class")
// 从 props 里剔除 class，剩下的（as / asChild / forceMount...）用于透传给 AccordionContent
</script>

<template>
  <!-- AccordionContent: 内容面板
   data-slot="accordion-content" 标识插槽，便于样式按 data-slot 定位
   v-bind="delegatedProps" 透传 as / asChild / forceMount 给 reka-ui
   class="..." 固定收起/展开动画 + 溢出隐藏
   内部 div 把用户传入的 props.class 与默认内边距（pt-0 pb-4）合并 -->
  <AccordionContent
    data-slot="accordion-content"
    v-bind="delegatedProps"
    class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
  >
    <div :class="cn('pt-0 pb-4', props.class)">
      <!-- 默认插槽：使用者在这里放实际内容 -->
      <slot />
    </div>
  </AccordionContent>
</template>
