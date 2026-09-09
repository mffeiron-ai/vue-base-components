<script setup lang="ts">
import type { AlertDialogCancelProps } from "reka-ui"
/**
 * AlertDialogCancelProps：取消按钮 props（as / asChild 等）。
 */
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { AlertDialogCancel } from "reka-ui"
/**
 * AlertDialogCancel：reka-ui 的“取消”按钮，点击后关闭对话框。
 */
import { cn } from "../../../lib/utils"
import { buttonVariants } from "../button"

const props = defineProps<AlertDialogCancelProps & { class?: HTMLAttributes["class"] }>()
// 定义 props = reka-ui 的 props + 一个可选的 class

const delegatedProps = reactiveOmit(props, "class")
// 去掉 class，剩余的透传给 AlertDialogCancel
</script>

<template>
  <!-- 复用 button 的 outline 样式作为取消按钮外观，:class 合并用户 props.class -->
  <AlertDialogCancel
    v-bind="delegatedProps"
    :class="cn(
      buttonVariants({ variant: 'outline' }),
      'mt-2 sm:mt-0',
      props.class,
    )"
  >
    <slot />
  </AlertDialogCancel>
</template>
