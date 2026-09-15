<script lang="ts" setup>
/**
 * DrawerContent —— 抽屉主体（自动挂 Portal + 遮罩）。
 *
 * - 从哪边滑出由 `direction` 决定，圆角 / 外边距靠 `data-[vaul-drawer-direction=*]` 分别适配
 * - 顶部那条小把手只在 bottom 方向显示（暗示「可以往下拖」）
 * - 上下方向最高 80vh，内容超了要自己套一层 `overflow-y-auto` 在内部滚动
 * - 尺寸：左右方向默认 w-3/4、sm 以上 max-w-sm；用 `class` 覆盖即可
 *
 * props 类型借用 reka 的 `DialogContentProps` 是上游写法：vaul-vue 的 API 与 Dialog 对齐，
 * open / modal / onOpenChange 这些名字都一致，所以两边的类型能直接复用。
 */
import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { useForwardPropsEmits } from "reka-ui"
import { DrawerContent, DrawerPortal } from "vaul-vue"
import { cn } from "../../../lib/utils"
import DrawerOverlay from "./DrawerOverlay.vue"

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<DialogContentProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<DialogContentEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerContent
      data-slot="drawer-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="cn(
        'group/drawer-content bg-background fixed z-50 flex h-auto flex-col',
        'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg',
        'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg',
        'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-sm',
        'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:sm:max-w-sm',
        props.class,
      )"
    >
      <div class="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>
