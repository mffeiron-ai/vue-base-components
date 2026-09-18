<script setup lang="ts">
import type { Component } from "vue"
import type { SidebarMenuButtonProps } from "./SidebarMenuButtonChild.vue"
import { reactiveOmit } from "@vueuse/core"
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip"
import SidebarMenuButtonChild from "./SidebarMenuButtonChild.vue"
import { useSidebar } from "./utils"

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SidebarMenuButtonProps & {
  tooltip?: string | Component
}>(), {
  as: "button",
  variant: "default",
  size: "default",
})

const { isMobile, state } = useSidebar()

const delegatedProps = reactiveOmit(props, "tooltip")
</script>

<template>
  <SidebarMenuButtonChild v-if="!tooltip" v-bind="{ ...delegatedProps, ...$attrs }">
    <slot />
  </SidebarMenuButtonChild>

  <Tooltip v-else>
    <!--
      注意：TooltipTrigger 在 as-child 时会把自已的 data-slot 合并掉子元素的同名属性
      （不带 tooltip 的按钮没问题，带 tooltip 的会被改写成 "tooltip-trigger"）。
      而 8 套预设的菜单按钮规则全部挂在 [data-slot="sidebar-menu-button"] 上，
      所以这里必须把 data-slot 重新写回来，否则带 tooltip 的项会丢失整套样式。
    -->
    <TooltipTrigger as-child data-slot="sidebar-menu-button">
      <SidebarMenuButtonChild v-bind="{ ...delegatedProps, ...$attrs }">
        <slot />
      </SidebarMenuButtonChild>
    </TooltipTrigger>
    <TooltipContent
      side="right"
      align="center"
      :hidden="state !== 'collapsed' || isMobile"
    >
      <template v-if="typeof tooltip === 'string'">
        {{ tooltip }}
      </template>
      <component :is="tooltip" v-else />
    </TooltipContent>
  </Tooltip>
</template>
