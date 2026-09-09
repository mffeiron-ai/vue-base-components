<script setup lang="ts">
import type { AlertDialogTitleProps } from "reka-ui"
/**
 * AlertDialogTitleProps：标题 props（as / asChild 等）。
 */
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { AlertDialogTitle } from "reka-ui"
/**
 * AlertDialogTitle：reka-ui 的对话框标题组件。
 */
import { cn } from "../../../lib/utils"

const props = defineProps<AlertDialogTitleProps & { class?: HTMLAttributes["class"] }>()
// 定义 props = reka-ui 的 props + 一个可选的 class

const delegatedProps = reactiveOmit(props, "class")
// 去掉 class，剩余的透传给 AlertDialogTitle（class 由下面 :class 合并）
</script>

<template>
  <!-- data-slot="alert-dialog-title" 标识标题；v-bind 透传 props；:class 合并默认标题样式 -->
  <AlertDialogTitle
    data-slot="alert-dialog-title"
    v-bind="delegatedProps"
    :class="cn('text-lg font-semibold', props.class)"
  >
    <slot />
  </AlertDialogTitle>
</template>
