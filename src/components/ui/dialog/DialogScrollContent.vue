<script setup lang="ts">
/**
 * DialogScrollContent —— 长内容版对话框：内容超高时整页滚动，而不是把弹层挤扁。
 *
 * 与 `DialogContent` 的差别：
 * - 遮罩自己兼做滚动容器（overflow-y-auto + place-items-center + 弹层 my-8），所以内容能自然顶天立地
 * - 右上角 × 换成 hover 有底色的方形按钮
 * - 多一段 `pointer-down-outside` 处理：在弹层里拖选文字、鼠标移到弹层外再松手，不会误关闭
 *
 * 适合：条款正文、变更日志、需要滚动的长表单。
 */
import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { X } from "lucide-vue-next"
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../../lib/utils"
// 用项目自己的遮罩组件（而不是 reka 原始组件）：拿一样的 data-slot 与动画钩子，样式预设才能命中
import DialogOverlay from "./DialogOverlay.vue"

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<DialogContentProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80">
      <DialogContent
        data-slot="dialog-scroll-content"
        :class="
          cn(
            'relative z-50 grid w-full max-w-lg my-8 gap-4 border border-input bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full',
            props.class,
          )
        "
        v-bind="{ ...$attrs, ...forwarded }"
        @pointer-down-outside="(event) => {
          const originalEvent = event.detail.originalEvent;
          const target = originalEvent.target as HTMLElement;
          if (originalEvent.offsetX > target.clientWidth || originalEvent.offsetY > target.clientHeight) {
            event.preventDefault();
          }
        }"
      >
        <slot />

        <DialogClose
          data-slot="dialog-close-button"
          class="absolute top-4 right-4 p-0.5 transition-colors rounded-md hover:bg-secondary"
        >
          <X class="w-4 h-4" />
          <span class="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </DialogOverlay>
  </DialogPortal>
</template>
