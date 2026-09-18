<script lang="ts" setup>
/**
 * DrawerOverlay —— 抽屉背后的遮罩（`DrawerContent` 已自带一层，一般不用手写）。
 *
 * 额外加了「关闭态不拦截点击」的兜底：动画被禁用 / 中断时遮罩节点会残留，
 * 不挡一下的话会把页面上（比如导航栏）的按钮点不动。
 */
import type { DialogOverlayProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { DrawerOverlay } from "vaul-vue"
import { cn } from "../../../lib/utils"

const props = defineProps<DialogOverlayProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <DrawerOverlay
    data-slot="drawer-overlay"
    v-bind="delegatedProps"
    :class="cn(
      'cn-anim-backdrop fixed inset-0 z-50 bg-black/80',
      // 兜底：关闭态的残留遮罩不拦截页面点击，避免挡住导航栏按钮
      'data-[state=closed]:pointer-events-none',
      props.class,
    )"
  />
</template>
