<script setup lang="ts">
import type { SeparatorProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Separator } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = withDefaults(defineProps<
  SeparatorProps & { class?: HTMLAttributes["class"] }
>(), {
  orientation: "horizontal",
  decorative: true,
})

const delegatedProps = reactiveOmit(props, "class")

/**
 * 8 套预设里这两条是「纯类名」钩子（`.cn-separator-horizontal` / `.cn-separator-vertical`），
 * 没有 [data-slot] 回退，所以必须由组件把类名带上，设计系统才能接管尺寸
 * （目前 8 套的取值与下面那串工具类完全一致，属于契约对齐；将来某套改了尺寸就会生效）。
 */
const orientationClass = computed(() =>
  props.orientation === "vertical" ? "cn-separator-vertical" : "cn-separator-horizontal",
)
</script>

<template>
  <Separator
    data-slot="separator"
    v-bind="delegatedProps"
    :class="cn(
      'cn-separator bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
      orientationClass,
      props.class,
    )"
  />
</template>
