<script setup lang="ts">
import type { RadioGroupRootEmits, RadioGroupRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { computed } from "vue"
import { RadioGroupRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<RadioGroupRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<RadioGroupRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

// reka 的 RovingFocusGroup 在 orientation="horizontal" 时靠 dir 决定左右键语义，
// 不传 dir 会让左右方向键彻底失效（上下键不受影响）。这里只给横向兜个 ltr，
// 用户在 rtl 场景仍然可以自己传 dir 覆盖。
const forwarded = useForwardPropsEmits(
  computed(() => ({
    ...delegatedProps,
    dir: delegatedProps.dir ?? (delegatedProps.orientation === "horizontal" ? "ltr" as const : undefined),
  })),
  emits,
)
</script>

<template>
  <RadioGroupRoot
    v-slot="slotProps"
    data-slot="radio-group"
    :class="cn('grid gap-3', props.class)"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </RadioGroupRoot>
</template>
