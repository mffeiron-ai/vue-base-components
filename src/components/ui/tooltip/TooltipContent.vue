<script setup lang="ts">
import type { TooltipContentEmits, TooltipContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { TooltipArrow, TooltipContent, TooltipPortal, useForwardPropsEmits } from "reka-ui"
import { cn } from "../../../lib/utils"

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipContentProps & { class?: HTMLAttributes["class"] }>(), {
  sideOffset: 4,
})

const emits = defineEmits<TooltipContentEmits>()

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <TooltipPortal>
    <TooltipContent
      data-slot="tooltip-content"
      v-bind="{ ...forwarded, ...$attrs }"
      :class="cn(
        // cn-tooltip-content-logical 是预设里的「纯类名钩子」（没有 data-slot 回退），
        // 负责 data-[side=inline-start|inline-end] 时的滑入方向，不写这个类它永远不生效。
        'cn-tooltip-content-logical cn-anim-overlay bg-foreground text-background z-50 w-fit rounded-md px-3 py-1.5 text-sm text-balance',
        props.class,
      )"
    >
      <slot />

      <TooltipArrow
        class="cn-tooltip-arrow cn-tooltip-arrow-logical bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
      />
    </TooltipContent>
  </TooltipPortal>
</template>
