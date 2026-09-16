<script setup lang="ts">
/**
 * InputOTPGroup —— 一组格子（`flex items-center`）。
 *
 * 格子之间只画了「上/右/下」三边边框、靠相邻格子拼成完整边框，所以
 * **同一组里的 slot 要连续编号**（0,1,2…）；想断开（如 123 - 456）就在两组之间
 * 放 `InputOTPSeparator`，不要在同一个组里跳号。
 */
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <div
    data-slot="input-otp-group"
    v-bind="forwarded"
    :class="cn('flex items-center', props.class)"
  >
    <slot />
  </div>
</template>
