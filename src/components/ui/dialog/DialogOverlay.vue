<script setup lang="ts">
/**
 * DialogOverlay —— 背后那层半透明遮罩（bg-black/80，带淡入淡出）。
 *
 * 平时不用手写：`DialogContent` 已经自带一层。只有当你想完全自定义遮罩
 * （比如换成毛玻璃、换颜色、或让遮罩自己承载布局）时，才单独拿出来用。
 */
import type { DialogOverlayProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { DialogOverlay } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<DialogOverlayProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <DialogOverlay
    data-slot="dialog-overlay"
    v-bind="delegatedProps"
    :class="cn('cn-anim-backdrop fixed inset-0 z-50 bg-black/80', props.class)"
  >
    <slot />
  </DialogOverlay>
</template>
