<script setup lang="ts">
/**
 * MenubarRadioItem —— 单选项，必须包在 `MenubarRadioGroup` 里。
 *
 * 与 CheckboxItem 同样是「左侧固定标记 + `pl-8`」的结构，
 * 默认标记是一个实心小圆点（`Circle class="size-2 fill-current"`），
 * 可用 `#indicator-icon` 插槽替换。
 */
import type { MenubarRadioItemEmits, MenubarRadioItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Circle } from "lucide-vue-next"
import {
  MenubarItemIndicator,
  MenubarRadioItem,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<MenubarRadioItemProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<MenubarRadioItemEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <MenubarRadioItem
    data-slot="menubar-radio-item"
    v-bind="forwarded"
    :class="cn(
      'focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
      props.class,
    )"
  >
    <span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      <MenubarItemIndicator>
        <slot name="indicator-icon">
          <Circle class="size-2 fill-current" />
        </slot>
      </MenubarItemIndicator>
    </span>
    <slot />
  </MenubarRadioItem>
</template>
