<script setup lang="ts">
/**
 * Menubar —— 桌面应用风格的菜单栏（横向一排 MenubarMenu）。
 *
 * 结构：`Menubar` > 若干 `MenubarMenu`，每个菜单里放 `MenubarTrigger`（栏上标题）
 * + `MenubarContent`（下拉面板）。
 *
 * - 键盘：左右方向键在菜单间切换，上下键在面板内移动；`Alt` / `F10` 可聚焦菜单栏
 * - 同一时刻只有一个菜单展开；面板开着时把指针移到旁边的标题上会自动切换
 *   （这就是「菜单栏」区别于普通下拉的手感）
 * - 面板里的部件与 DropdownMenu 一一对应（Item / CheckboxItem / RadioItem /
 *   SubTrigger / Separator / Shortcut / Label），用法完全一致，可互相参照
 */
import type { MenubarRootEmits, MenubarRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  MenubarRoot,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<MenubarRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<MenubarRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <MenubarRoot
    v-slot="slotProps"
    data-slot="menubar"
    v-bind="forwarded"
    :class="
      cn(
        // 注意 border 一定要带颜色：Tailwind v4 的 border-color 默认是 currentColor，
        // 只写 `border` 会让边框取到文字色（深灰），所以要显式给 border-input
        'bg-background flex h-9 items-center gap-1 rounded-md border border-input p-1 shadow-xs',
        props.class,
      )
    "
  >
    <slot v-bind="slotProps" />
  </MenubarRoot>
</template>
