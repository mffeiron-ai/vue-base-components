<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from "lucide-vue-next"
import { Toaster as Sonner } from "vue-sonner"
import { computed } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<ToasterProps>()

/**
 * 8 套预设里的 `.cn-toast` 是「纯类名」钩子（没有 [data-slot] 回退），负责各风格下 toast 的圆角。
 * 它必须挂在 vue-sonner 运行时才渲染的那个 toast 元素上 —— 只能通过 toastOptions.class 传进去。
 */
const toastOptions = computed(() => ({
  ...(props.toastOptions ?? {}),
  class: cn("cn-toast", (props.toastOptions as { class?: string } | undefined)?.class),
}))
</script>

<template>
  <Sonner
    v-bind="props"
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    :toast-options="toastOptions"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>
