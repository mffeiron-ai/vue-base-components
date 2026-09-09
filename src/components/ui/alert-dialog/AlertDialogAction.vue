<script setup lang="ts">
import type { AlertDialogActionProps } from "reka-ui"
/**
 * AlertDialogActionProps：确认按钮 props（as / asChild 等）。
 */
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { AlertDialogAction } from "reka-ui"
/**
 * AlertDialogAction：reka-ui 的“确认”按钮，点击后关闭对话框。
 */
import { cn } from "../../../lib/utils"
import { buttonVariants } from "../button"

const props = defineProps<AlertDialogActionProps & { class?: HTMLAttributes["class"] }>()
// 定义 props = reka-ui 的 props + 一个可选的 class

const delegatedProps = reactiveOmit(props, "class")
// 去掉 class，剩余的透传给 AlertDialogAction
</script>

<template>
  <!-- 复用 button 的默认样式作为确认按钮外观，:class 合并用户 props.class -->
  <AlertDialogAction v-bind="delegatedProps" :class="cn(buttonVariants(), props.class)">
    <slot />
  </AlertDialogAction>
</template>
