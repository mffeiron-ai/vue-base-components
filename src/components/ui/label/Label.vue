<script setup lang="ts">
/**
 * Label —— 表单控件标签（基于 reka-ui 的 Label，渲染成原生 `<label>`）。
 *
 * 两种绑定方式，哪种都能「点标签就聚焦 / 切换对应控件」：
 *   ① 配 `for="input-id"` 指向控件 id；
 *   ② 直接把控件包在标签里（不用写 for）：`<Label><Checkbox /> 同意</Label>`
 *
 * - 默认就是 `flex items-center gap-2`，所以前面塞图标会自然对齐：
 *   `<Label><Mail class="size-4" /> 邮箱</Label>`
 * - **禁用态自动联动**（两条现成的钩子，但它们都是 Tailwind 组合器，
 *   需要你在结构上配合打标记才会生效）：
 *   · `peer-disabled:*` —— 同级控件加 `class="peer"` + `disabled`，且 label
 *     要排在它**后面**；命中后标签自动变灰并禁掉点击
 *   · `group-data-[disabled=true]:*` —— 某个祖先容器同时加 `class="group"` 与
 *     `data-disabled="true"` 时生效（注意 `Field` 的 `role="group"` 是 ARIA 属性，
 *     不等于 Tailwind 的 `group` 类，所以用 Field 时也要自己补）
 * - `select-none`：双击选词不会被标签文字打扰
 * - 必填、错误这类语义**不在这里**：`required` / `aria-invalid` 要加在控件上，
 *   标签里的星号（`<span class="text-destructive">*</span>`）自己加
 */
import type { LabelProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Label } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<LabelProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <Label
    data-slot="label"
    v-bind="delegatedProps"
    :class="
      cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none',
        // 两条禁用钩子表现统一成「点不到 + 变灰」：
        // 加 pointer-events-none 后，点标签不会再把焦点送到已禁用的控件上
        'peer-disabled:pointer-events-none peer-disabled:opacity-50',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        props.class,
      )
    "
  >
    <slot />
  </Label>
</template>
