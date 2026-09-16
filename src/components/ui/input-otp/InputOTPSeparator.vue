<script setup lang="ts">
/**
 * InputOTPSeparator —— 组与组之间的分隔符。
 *
 * 默认渲染一个 `-` 图标（lucide 的 Minus），想换成文字 / 其它图形就直接写插槽。
 * 它只做视觉分隔、不参与输入，`role="separator"` 是给读屏用的。
 */
import type { HTMLAttributes } from "vue"
import { MinusIcon } from "lucide-vue-next"
import { useForwardProps } from "reka-ui"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()

const forwarded = useForwardProps(props)
</script>

<template>
  <div
    data-slot="input-otp-separator"
    role="separator"
    v-bind="forwarded"
  >
    <slot>
      <MinusIcon />
    </slot>
  </div>
</template>
