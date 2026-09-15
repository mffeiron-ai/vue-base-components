<script setup lang="ts">
/**
 * DialogDescription —— 标题下面那行说明文字（会挂到 `aria-describedby`）。
 * 不适合放长正文：长内容用普通 `<p>`（这个组件带 muted 小字号样式）。
 */
import type { DialogDescriptionProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { DialogDescription, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DialogDescription
    data-slot="dialog-description"
    v-bind="forwardedProps"
    :class="cn('text-muted-foreground text-sm', props.class)"
  >
    <slot />
  </DialogDescription>
</template>
