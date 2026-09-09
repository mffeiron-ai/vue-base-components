<script setup lang="ts">
import type { AccordionTriggerProps } from "reka-ui"
/**
 * AccordionTriggerProps：
 * 继承 PrimitiveProps：as / asChild。
 * 它的全部作用 = 定义 Accordion 触发器（标题按钮）接收的 props。
 */
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ChevronDown } from "lucide-vue-next"
import {
  AccordionHeader,
  AccordionTrigger,
} from "reka-ui"
/**
 * AccordionHeader：reka-ui 的标题容器（一般渲染为 h3）。
 * AccordionTrigger：reka-ui 的触发器（点击切换展开/收起，自动处理
 *   aria-expanded / aria-disabled / data-state 等）。
 */
import { cn } from "../../../lib/utils"

const props = defineProps<AccordionTriggerProps & { class?: HTMLAttributes["class"] }>()
// 定义组件的 props = reka-ui 的 AccordionTriggerProps，外加一个可选的 class

const delegatedProps = reactiveOmit(props, "class")
// 从 props 里剔除 class，剩下的（as / asChild...）用于透传给 AccordionTrigger
</script>

<template>
  <!-- AccordionHeader: 标题容器，包住触发器 -->
  <AccordionHeader class="flex">
    <!-- AccordionTrigger: 标题按钮
     data-slot="accordion-trigger" 标识插槽，便于样式按 data-slot 定位
     v-bind="delegatedProps" 透传 as / asChild 给 reka-ui
     :class="..." 默认样式 + 合并用户传入的 props.class
     默认插槽放标题文本，name="icon" 插槽放箭头图标（默认 ChevronDown） -->
    <AccordionTrigger
      data-slot="accordion-trigger"
      v-bind="delegatedProps"
      :class="
        cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          props.class,
        )
      "
    >
      <slot />
      <slot name="icon">
        <ChevronDown
          class="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200"
        />
      </slot>
    </AccordionTrigger>
  </AccordionHeader>
</template>
