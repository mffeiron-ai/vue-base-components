<script setup lang="ts">
import type { AlertDialogTriggerProps } from "reka-ui"
/**
 * AlertDialogTriggerProps：触发器 props（as / asChild 等）。
 */
import { AlertDialogTrigger } from "reka-ui"
/**
 * AlertDialogTrigger：reka-ui 的触发器，点击后打开对话框。
 */

const props = defineProps<AlertDialogTriggerProps>()
// 定义组件的 props 直接继承 reka-ui 的 AlertDialogTriggerProps
</script>

<template>
  <!-- data-slot="alert-dialog-trigger" 标识插槽；v-bind="props" 透传 as/asChild 给 reka-ui -->
  <AlertDialogTrigger data-slot="alert-dialog-trigger" v-bind="props">
    <slot />
  </AlertDialogTrigger>
</template>
