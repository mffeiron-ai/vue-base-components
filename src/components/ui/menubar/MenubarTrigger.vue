<script setup lang="ts">
/**
 * MenubarTrigger —— 菜单栏上那个可点的标题（文件 / 编辑 / 视图…）。
 *
 * - 聚焦或展开时都是 `bg-accent` 底色（`focus:` / `data-[state=open]:`）
 * - 面板打开后，指针移到别的标题上会自动切到那个菜单
 * - 别在里面放输入框 / 按钮这类交互控件：它本身就是一个菜单按钮
 */
import type { MenubarTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { MenubarTrigger, useForwardProps } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<MenubarTriggerProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <MenubarTrigger
    data-slot="menubar-trigger"
    v-bind="forwardedProps"
    :class="
      cn(
        'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none',
        props.class,
      )
    "
  >
    <slot />
  </MenubarTrigger>
</template>
