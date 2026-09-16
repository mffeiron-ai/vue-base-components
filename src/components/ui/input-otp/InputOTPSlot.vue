<script setup lang="ts">
/**
 * InputOTPSlot —— 单个格子，必须传 `index`（从 0 开始）。
 *
 * - 显示什么、是否正在输入、要不要画光标，都从 `useVueOTPContext()` 里取，
 *   使用方只要按顺序摆就行，不用自己接状态
 * - 激活态：`data-active="true"` → 边框变 ring 色 + 3px ring，并 `z-10`
 *   （z-10 是为了让 ring 盖住相邻格子的边框，否则会被切掉一半）
 * - 格子本身不接收事件，输入都发生在根组件那个隐藏 input 上
 * - 光标是一根会闪的竖线，靠 `animate-caret-blink`（定义在 `utilities.css`）
 */
// @ts-nocheck
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { useForwardProps } from "reka-ui"
import { computed } from "vue"
import { useVueOTPContext } from "vue-input-otp"
import { cn } from "../../../lib/utils"

const props = defineProps<{ index: number, class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardProps(delegatedProps)

const context = useVueOTPContext()

const slot = computed(() => context?.value.slots[props.index])
</script>

<template>
  <div
    v-bind="forwarded"
    data-slot="input-otp-slot"
    :data-active="slot?.isActive"
    :class="cn('data-[active=true]:border-ring data-[active=true]:ring-ring/50 group-has-[input[aria-invalid=true]]/input-otp:border-destructive! group-has-[input[aria-invalid=true]]/input-otp:ring-destructive/20 dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]', props.class)"
  >
    {{ slot?.char }}
    <div v-if="slot?.hasFakeCaret" class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div class="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
    </div>
  </div>
</template>
