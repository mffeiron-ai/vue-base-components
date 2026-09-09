<script setup lang="ts">
import type { AlertDialogContentEmits, AlertDialogContentProps } from "reka-ui"
/**
 * AlertDialogContentProps：内容区 props（as / asChild / forceMount 等）。
 * AlertDialogContentEmits：内容区事件。
 */
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogPortal,
  useForwardPropsEmits,
} from "reka-ui"
/**
 * AlertDialogPortal：把对话框内容传送到 body 根部（脱离文档流）。
 * AlertDialogOverlay：对话框背后的遮罩层。
 * AlertDialogContent：对话框内容面板。
 * useForwardPropsEmits：合并 props + 事件，便于 v-bind 透传。
 */
import { cn } from "../../../lib/utils"

defineOptions({
  inheritAttrs: false,
})
// 关闭自动继承 attrs，交由下方 $attrs 显式绑定

const props = defineProps<AlertDialogContentProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<AlertDialogContentEmits>()
// 定义 props = reka-ui 的 props + 一个可选的 class

const delegatedProps = reactiveOmit(props, "class")
// 去掉 class，剩下的用于透传给 AlertDialogContent（class 由下面 :class 合并）

const forwarded = useForwardPropsEmits(delegatedProps, emits)
// 合并 props + 事件，供 v-bind 透传
</script>

<template>
  <AlertDialogPortal>
    <!-- 遮罩层：固定全屏 + 半透明黑 + 打开/关闭淡入淡出 -->
    <AlertDialogOverlay
      data-slot="alert-dialog-overlay"
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
    />
    <!-- 内容面板：居中 + 打开/关闭缩放动画，:class 合并用户传入的 props.class -->
    <AlertDialogContent
      data-slot="alert-dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          props.class,
        )
      "
    >
      <slot />
    </AlertDialogContent>
  </AlertDialogPortal>
</template>
