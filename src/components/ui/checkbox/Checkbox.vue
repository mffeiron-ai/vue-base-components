<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui"
// CheckboxRootProps：modelValue / defaultValue（boolean 或 'indeterminate'）、disabled、value、trueValue/falseValue、name、required 等
// CheckboxRootEmits：update:modelValue
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
// reactiveOmit：把不需要往底层透传的 prop 挑出来（这里只排除 class）
import { Check } from "lucide-vue-next"
// 默认勾选图标（用默认插槽可以换成横杠 / 自己的图标）
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui"
// CheckboxRoot：无头基元：三态（checked / unchecked / indeterminate）、空格键切换、aria-checked、
//   表单里会自动渲染一个隐藏 input（name / required / value 都靠它提交）
// CheckboxIndicator：只在「选中或半选」时才渲染，用来放勾 / 横杠
import { cn } from "../../../lib/utils"

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <!--
    Checkbox = reka 的 CheckboxRoot + 一层样式：
    - data-slot="checkbox" 是样式钩子（8 套风格预设按它定位）
    - 自身带 peer：可以在兄弟元素上用 peer-data-[state=checked]:… 跟着变（比如标签加删除线）
    - data-[state=checked] 系列就是选中态（主色底 + 主色文字 + 主色边框）；
      半选态（indeterminate）在下面单独处理，不然会看起来像未选中的空格子
    - aria-invalid:* 在表单校验失败时变红环 / 红边，配合 FieldError 使用
  -->
  <CheckboxRoot
    v-slot="slotProps"
    data-slot="checkbox"
    v-bind="forwarded"
    :class="
      cn('peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary! focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
         props.class)"
  >
    <!-- 默认插槽透出 reka 的 slotProps（state / checked 等），方便按状态换图标；默认是勾 -->
    <CheckboxIndicator
      data-slot="checkbox-indicator"
      class="grid place-content-center text-current transition-none"
    >
      <slot v-bind="slotProps">
        <Check class="size-3.5" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
