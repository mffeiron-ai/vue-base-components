<script setup lang="ts">
import type { TabsRootEmits, TabsRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { TabsRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<TabsRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<TabsRootEmits>()

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <TabsRoot
    v-slot="slotProps"
    data-slot="tabs"
    v-bind="forwarded"
    :class="cn(
      // group/tabs：8 套预设都用 group-data-horizontal/tabs:… 与 group-data-vertical/tabs:…
      // 在列表 / 触发器上选方向相关的样式，少了它这些规则全部静默失效（reka 已提供 data-orientation）
      // data-vertical:flex-row：纵向时让内容排到列表右侧
      'group/tabs flex flex-col gap-2 data-vertical:flex-row',
      props.class,
    )"
  >
    <slot v-bind="slotProps" />
  </TabsRoot>
</template>
