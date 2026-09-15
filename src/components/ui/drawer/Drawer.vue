<script lang="ts" setup>
/**
 * Drawer —— 抽屉根组件（底层是 vaul-vue，iOS 风格的「可拖拽抽屉」）。
 *
 * 和 Dialog 的区别：Dialog 是静止的弹层，Drawer 带手势 —— 向下拖拽关闭、拖把手、
 * 打开时背景缩放（should-scale-background，默认开），移动端体验更自然。
 *
 * 常用 props（全部原样透传 vaul-vue 的 DrawerRoot）：
 * - `direction`：top / right / bottom / left（默认 bottom，从底部滑出）
 * - `v-model:open` / `default-open`：受控与非受控
 * - `dismissible`：传 false 后拖拽与点遮罩都不关（只能点明确的按钮）
 * - `handle-only`：只有顶部把手能拖，内容区不响应拖拽（内部有滚动列表时很有用）
 * - `snap-points` + `v-model:active-snap-point`：多档吸附高度
 * - `nested`：抽屉里再开抽屉时必须打开，否则手势会串
 */
import type { DrawerRootEmits, DrawerRootProps } from "vaul-vue"
import { useForwardPropsEmits } from "reka-ui"
import { DrawerRoot } from "vaul-vue"

// 默认打开时把背景缩一点：这是 vaul 的招牌观感
const props = withDefaults(defineProps<DrawerRootProps>(), {
  shouldScaleBackground: true,
})

const emits = defineEmits<DrawerRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DrawerRoot
    v-slot="slotProps"
    data-slot="drawer"
    v-bind="forwarded as any"
  >
    <slot v-bind="slotProps" />
  </DrawerRoot>
</template>
