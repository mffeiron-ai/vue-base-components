<script setup lang="ts">
import type { AlertDialogDescriptionProps } from "reka-ui"
/**
 * AlertDialogDescriptionProps：描述 props（as / asChild 等）。
 */
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  AlertDialogDescription,
} from "reka-ui"
/**
 * AlertDialogDescription：reka-ui 的对话框描述组件。
 */
import { cn } from "../../../lib/utils"

const props = defineProps<AlertDialogDescriptionProps & { class?: HTMLAttributes["class"] }>()
// 定义 props = reka-ui 的 props + 一个可选的 class

const delegatedProps = reactiveOmit(props, "class")
// 去掉 class，剩余的透传给 AlertDialogDescription（class 由下面 :class 合并）
</script>

<template>
  <!-- data-slot="alert-dialog-description" 标识描述；v-bind 透传 props；:class 合并默认描述样式 -->
  <AlertDialogDescription
    data-slot="alert-dialog-description"
    v-bind="delegatedProps"
    :class="cn('text-muted-foreground text-sm', props.class)"
  >
    <slot />
  </AlertDialogDescription>
</template>
