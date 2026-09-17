<script setup lang="ts">
/**
 * MenubarCheckboxItem —— 可勾选的菜单项（多选），用 `v-model` 或 `v-model:checked` 控制。
 *
 * 勾选标记固定在**左侧**（`absolute left-2` 的一层 span + `MenubarItemIndicator`），
 * 所以项本身带 `pl-8` 给标记留位 —— 这与预设里的 `left-2` 一致，别改成右侧。
 * 想换标记图标用 `#indicator-icon` 插槽（默认 Check）。
 */
import type { MenubarCheckboxItemEmits, MenubarCheckboxItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Check } from "lucide-vue-next"
import {
  MenubarCheckboxItem,
  MenubarItemIndicator,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<MenubarCheckboxItemProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<MenubarCheckboxItemEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <MenubarCheckboxItem
    data-slot="menubar-checkbox-item"
    v-bind="forwarded"
    :class="cn(
      'focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
      props.class,
    )"
  >
    <span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      <MenubarItemIndicator>
        <slot name="indicator-icon">
          <Check class="size-4" />
        </slot>
      </MenubarItemIndicator>
    </span>
    <slot />
  </MenubarCheckboxItem>
</template>
