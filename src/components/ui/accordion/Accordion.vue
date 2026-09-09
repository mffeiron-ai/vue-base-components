<script setup lang="ts">
import type { AccordionRootEmits} from "reka-ui"
/**
 * AccordionRootEmits：
 * export type AccordionRootEmits<T> = {
  'update:modelValue': [value: (T extends 'single' ? string : string[]) | undefined]
}
 * 它的全部作用 = 让 Accordion 支持 v-model。
 */
import type { AccordionRootProps } from "reka-ui"
/**
 * AccordionRootProps：
 * export type AccordionRootProps<T> = {
 *   modelValue?: (T extends 'single' ? string : string[]) | undefined
 *   multiple?: boolean
 * }
 * 它的全部作用 = 定义 Accordion 根组件的 props。
 * props：
 *   modelValue?: (T extends 'single' ? string : string[]) | undefined 决定当前展开的面板
 *   multiple?: boolean 决定多选
 */
import { AccordionRoot } from "reka-ui"
/**
 * AccordionRoot:
 * 它的全部作用 = 渲染 Accordion 根组件，并支持透传 props 和事件。
 * 用法：
 * <AccordionRoot v-bind="forwarded">
 *   <slot v-bind="slotProps" />
 * </AccordionRoot>
 */
import {useForwardPropsEmits } from "reka-ui"
/**
 * useForwardPropsEmits:意思是前置参数传递
 * 它的全部作用 = 把 props + 事件合并成可 v-bind 的对象，透传给 AccordionRoot。
 * 用法：
 * const forwarded = useForwardPropsEmits(props, emits)
 * <AccordionRoot v-bind="forwarded" />
 */

const props = defineProps<AccordionRootProps>()
// 定义组件的 props 直接继承自 AccordionRootProps（modelValue 和 multiple）
const emits = defineEmits<AccordionRootEmits>()
// 定义组件的 emits 直接继承自 AccordionRootEmits（update:modelValue）
const forwarded = useForwardPropsEmits(props, emits)
// 定义一个 forwarded 对象，用于透传 props 和事件给 AccordionRoot
</script>

<template>
  <!-- Accordion 根组件
   v-slot="slotProps":这是 Vue 的具名插槽语法，用于接收 AccordionRoot 传递的插槽属性。
   data-slot="accordion" 是给 AccordionRoot 添加的自定义属性，用于标识该组件的插槽。
   v-bind="forwarded" 是把透传的 props 和事件绑定到 AccordionRoot 上。
   slot v-bind="slotProps" 是把 AccordionRoot 传递的插槽属性绑定到默认插槽上。
  -->
  <AccordionRoot v-slot="slotProps" data-slot="accordion" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </AccordionRoot>
</template>
