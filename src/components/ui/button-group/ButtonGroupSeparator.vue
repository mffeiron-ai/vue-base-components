<script setup lang="ts">
// SeparatorProps / Separator 来自 reka-ui：一个无障碍的分隔线基元
// （默认 decorative=true，即纯装饰、不会给读屏器报一个无意义的 separator 角色）
import type { SeparatorProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
// reactiveOmit：把 class 从要透传的 props 里拿掉 —— class 必须单独交给 cn() 合并，
// 否则 v-bind 传入的原始 class 会覆盖合并后的结果
import { reactiveOmit } from "@vueuse/core"
import { cn } from "../../../lib/utils"
import { Separator } from "../separator"

const props = withDefaults(defineProps<SeparatorProps & { class?: HTMLAttributes["class"] }>(), {
  // 按钮组里分隔线默认是竖的，把相邻按钮分开
  orientation: "vertical",
})
// 除 class 外的其余 props（orientation / decorative 等）直接透传给 Separator
const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <!--
    !m-0 self-stretch：抵消 Separator 自带的 margin，并让它沿交叉轴撑满按钮高度；
    data-[orientation=vertical]:h-auto：竖向时分隔线高度由拉伸决定，不用 h-full
    （!m-0 里的 ! 是为了盖过预设/基础样式里的 margin）
  -->
  <Separator
    data-slot="button-group-separator"
    v-bind="delegatedProps"
    :orientation="props.orientation"
    :class="cn(
      'bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto',
      props.class,
    )"
  />
</template>
