<script setup lang="ts">
/**
 * ItemSeparator —— 条目之间的横向分隔线。
 *
 * 就是 `Separator` 把上下外边距清零（分隔线间距交给 Item 自己的 padding），
 * 其余属性（如 `decorative`）照常透传。放在相邻两个 Item 之间即可。
 */
import type { SeparatorProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"
import { Separator } from "../separator"

const props = defineProps<
  SeparatorProps & { class?: HTMLAttributes["class"] }
>()
</script>

<template>
  <Separator
    data-slot="item-separator"
    orientation="horizontal"
    :class="cn('my-0', props.class)"
  />
</template>
