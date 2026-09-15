<script setup lang="ts">
/**
 * DialogFooter —— 底部操作区（按钮靠右；移动端上下堆叠且主操作在上）。
 *
 * `show-close-button` 会附一个「Close」按钮，注意文案是英文、位置在插槽内容之后，
 * 中文场景建议自己写「取消 / 确认」按钮（用 `DialogClose` 包一下即可）。
 */
import type { HTMLAttributes } from "vue"
import { DialogClose } from "reka-ui"
import { cn } from "../../../lib/utils"
import { Button } from "../button"

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  showCloseButton?: boolean
}>(), {
  showCloseButton: false,
})
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', props.class)"
  >
    <slot />
    <DialogClose v-if="showCloseButton" as-child>
      <Button variant="outline">
        Close
      </Button>
    </DialogClose>
  </div>
</template>
