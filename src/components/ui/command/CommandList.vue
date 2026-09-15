<script setup lang="ts">
/**
 * CommandList —— 选项容器（reka 的 ListboxContent）。
 *
 * - 自带最大高度与滚动（max-h-[300px]），预设里也会给 `[data-slot="command-list"]`
 *   补 max-h-72 / 无滚动条样式。选项多时滚动只发生在这里。
 * - 里面套了一层 `role="presentation"` 的 div：让 ListboxContent 成为唯一的滚动容器，
 *   同时避免中间的 div 被读屏当成列表项。
 */
import type { ListboxContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ListboxContent, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ListboxContentProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <ListboxContent
    data-slot="command-list"
    v-bind="forwarded"
    :class="cn('max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto', props.class)"
  >
    <div role="presentation">
      <slot />
    </div>
  </ListboxContent>
</template>
