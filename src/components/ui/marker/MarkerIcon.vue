<script setup lang="ts">
/**
 * MarkerIcon —— 标记前的小图标（16×16，`shrink-0` 不会被压扁）。
 *
 * 带 `aria-hidden="true"`：图标是纯装饰，语义交给旁边文字，
 * 所以用图标时**务必**同时写一个 `MarkerContent`。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

interface Props {
  class?: HTMLAttributes["class"]
}

const props = defineProps<Props>()
</script>

<template>
  <span
    data-slot="marker-icon"
    aria-hidden="true"
    :class="cn(`size-4 [&_svg:not([class*='size-'])]:size-4 shrink-0`, props.class)"
  >
    <slot />
  </span>
</template>
