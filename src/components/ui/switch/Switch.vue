<script setup lang="ts">
import type { SwitchRootEmits, SwitchRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  SwitchRoot,
  SwitchThumb,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../../lib/utils"

const props = withDefaults(
  defineProps<SwitchRootProps & {
    class?: HTMLAttributes["class"]
    /**
     * 尺寸档位。8 套样式预设都是按两档写的：
     * 根用 data-[size=default|sm]，滑块用 group-data-[size=default|sm]/switch。
     * 所以根必须同时带上 data-size 与 group/switch，
     * 否则预设里的尺寸规则会全部静默失效（Vue 不渲染 data-size 时选择器不匹配）。
     *（同类坑：Avatar / Item / SelectTrigger 的 data-size）
     */
    size?: "sm" | "default"
  }>(),
  {
    size: "default",
  },
)

const emits = defineEmits<SwitchRootEmits>()

// size 只作 data-size 钩子，不往 reka 透传（避免在元素上留下无意义的 size 属性）
const delegatedProps = reactiveOmit(props, "class", "size")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <SwitchRoot
    v-slot="slotProps"
    data-slot="switch"
    :data-size="size"
    v-bind="forwarded"
    :class="cn(
      // group/switch 供滑块的 group-data-[size=*]/switch 规则定位
      'peer group/switch data-[size=default]:h-[18.4px] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
      props.class,
    )"
  >
    <SwitchThumb
      data-slot="switch-thumb"
      :class="cn('bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0')"
    >
      <slot name="thumb" v-bind="slotProps" />
    </SwitchThumb>
  </SwitchRoot>
</template>
