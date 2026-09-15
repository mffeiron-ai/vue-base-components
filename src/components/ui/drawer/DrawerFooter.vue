<script lang="ts" setup>
/**
 * DrawerFooter —— 抽屉底部操作区。`mt-auto` 把它推到内容区底部（主体是 flex-col）。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="drawer-footer"
    :class="cn('mt-auto flex flex-col gap-2 p-4', props.class)"
  >
    <slot />
  </div>
</template>
