<script setup lang="ts">
/**
 * HoverCard —— 悬停（或键盘聚焦）时弹出的信息卡片根组件（连接状态层）。
 *
 * 组合：`HoverCard` 包住 `HoverCardTrigger` + `HoverCardContent`（内容里放 Avatar / Item 等）。
 *
 * 要点：
 * - 鼠标从触发器移到卡片上**不会**关闭（卡片自身也在命中区），所以里面可以放可点内容
 * - 开/关都有延迟，用 `open-delay` / `close-delay`（毫秒）调；不传就用 reka 的默认延迟
 * - 受控用 `v-model:open`
 * - 它只响应悬停/聚焦：**触屏上没有 hover**，重要信息别只放在这里（触屏用户看不到）
 */
import type { HoverCardRootEmits, HoverCardRootProps } from "reka-ui"
import { HoverCardRoot, useForwardPropsEmits } from "reka-ui"

const props = defineProps<HoverCardRootProps>()
const emits = defineEmits<HoverCardRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <HoverCardRoot
    v-slot="slotProps"
    data-slot="hover-card"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </HoverCardRoot>
</template>
