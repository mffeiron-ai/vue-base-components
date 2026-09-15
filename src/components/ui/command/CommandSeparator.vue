<script setup lang="ts">
/**
 * CommandSeparator —— 分组/选项之间的 1px 分隔线（reka 的 Separator）。
 * 预设会把 `.cn-command-separator` / `[data-slot="command-separator"]` 补上 bg-border 与负边距。
 */
import type { SeparatorProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Separator } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<SeparatorProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <Separator
    data-slot="command-separator"
    v-bind="delegatedProps"
    :class="cn('bg-border -mx-1 h-px', props.class)"
  >
    <slot />
  </Separator>
</template>
