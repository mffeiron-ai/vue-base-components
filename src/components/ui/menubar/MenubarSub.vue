<script setup lang="ts">
/**
 * MenubarSub —— 二级菜单容器（一个 SubTrigger + 一个 SubContent）。
 *
 * - `v-model:open` 可受控；不传则靠悬停 / 方向键展开，`default-open` 设初始展开
 * - 二级菜单不需要额外嵌套：再往下开只需在 SubContent 里再写一个 MenubarSub
 * - 会透传 slot 作用域，想自定义可以写 `v-slot="{ open }"`
 */
import type { MenubarSubEmits } from "reka-ui"
import { MenubarSub, useForwardPropsEmits } from "reka-ui"

interface MenubarSubRootProps {
  defaultOpen?: boolean
  open?: boolean
}

const props = defineProps<MenubarSubRootProps>()
const emits = defineEmits<MenubarSubEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <MenubarSub
    v-slot="slotProps"
    data-slot="menubar-sub"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </MenubarSub>
</template>
