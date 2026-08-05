<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

interface Props {
  class?: HTMLAttributes["class"]
  asChild?: boolean
  as?: string
}
const props = withDefaults(defineProps<Props>(), {
  as: "button",
})
</script>

<template>
  <Primitive
    data-slot="attachment-trigger"
    :as="as"
    :as-child="asChild"
    :class="cn('absolute inset-0 z-10 outline-none', props.class)"
  >
    <slot />
  </Primitive>
</template>
