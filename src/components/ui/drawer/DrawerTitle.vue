<script lang="ts" setup>
/**
 * DrawerTitle —— 抽屉标题（必填）。vaul 用它生成 `aria-labelledby`，缺了会提示无障碍标记不完整。
 */
import type { DrawerTitleProps } from "vaul-vue"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { DrawerTitle } from "vaul-vue"
import { cn } from "../../../lib/utils"

const props = defineProps<DrawerTitleProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <DrawerTitle
    data-slot="drawer-title"
    v-bind="delegatedProps"
    :class="cn('text-foreground font-semibold', props.class)"
  >
    <slot />
  </DrawerTitle>
</template>
