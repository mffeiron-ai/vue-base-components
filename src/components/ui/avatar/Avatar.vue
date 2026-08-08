<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { AvatarRoot } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  size?: "sm" | "default" | "lg" | "xl"
}>(), {
  size: "default",
})

const sizeClass: Record<"sm" | "default" | "lg" | "xl", string> = {
  sm: "size-6",
  default: "size-8",
  lg: "size-12",
  xl: "size-16",
}
</script>

<template>
  <AvatarRoot
    data-slot="avatar"
    :class="cn('relative flex shrink-0 overflow-hidden rounded-full', sizeClass[size ?? 'default'], props.class)"
  >
    <slot />
  </AvatarRoot>
</template>
