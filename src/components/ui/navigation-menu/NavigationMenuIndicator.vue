<script setup lang="ts">
import type { NavigationMenuIndicatorProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { NavigationMenuIndicator, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<NavigationMenuIndicatorProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <NavigationMenuIndicator
    data-slot="navigation-menu-indicator"
    v-bind="forwardedProps"
    :class="cn('cn-anim-overlay absolute top-full left-[var(--reka-navigation-menu-indicator-position)] z-[1] flex h-1.5 w-[var(--reka-navigation-menu-indicator-size)] items-end justify-center overflow-hidden', props.class)"
  >
    <div class="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
  </NavigationMenuIndicator>
</template>
