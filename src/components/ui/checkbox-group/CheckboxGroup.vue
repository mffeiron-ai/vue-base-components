<script setup lang="ts">
import type { CheckboxGroupRootEmits, CheckboxGroupRootProps } from "reka-ui"
// CheckboxGroupRootProps：modelValue（数组）/ defaultValue / disabled / rovingFocus / orientation / loop / name / required
// CheckboxGroupRootEmits：update:modelValue
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
// reactiveOmit：把不需要往底层透传的 prop 挑出来（这里只排除 class）
import { CheckboxGroupRoot, useForwardPropsEmits } from "reka-ui"
// CheckboxGroupRoot：把「一组复选框」的选中项收在一个数组里，并通过 provide 交给子 Checkbox：
//   - 子项只需要写 :value，选中与否由组的数组决定，不用自己维护
//   - 默认开启 rovingFocus：方向键在组内移动焦点（不传 orientation 时四个方向都能移动）
//   - 传了 name 会额外渲染一个隐藏 input，把整个数组作为表单值提交
import { cn } from "../../../lib/utils"

const props = defineProps<CheckboxGroupRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<CheckboxGroupRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <!--
    CheckboxGroup = reka 的 CheckboxGroupRoot + 一层样式与语义：
    - data-slot="checkbox-group" 是样式钩子（8 套预设里有 [data-slot=checkbox-group] 相关规则）
    - role="group"：reka 的 RovingFocusGroup 自身不带语义，这里补上，配合 aria-label / aria-labelledby
      让屏幕阅读器把这一组读成一个整体
    - 默认纵向排列 grid gap-3；横向可以传 class="flex flex-wrap gap-3"
  -->
  <CheckboxGroupRoot
    data-slot="checkbox-group"
    role="group"
    v-bind="forwarded"
    :class="cn('grid gap-3', props.class)"
  >
    <slot />
  </CheckboxGroupRoot>
</template>
