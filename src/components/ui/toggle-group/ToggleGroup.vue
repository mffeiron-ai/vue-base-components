<script setup lang="ts">
import type { VariantProps } from "class-variance-authority"
import type { ToggleGroupRootEmits, ToggleGroupRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import type { toggleVariants } from "../toggle"
import { reactiveOmit } from "@vueuse/core"
import { ToggleGroupRoot, useForwardPropsEmits } from "reka-ui"
import { provide, reactive, watchEffect } from "vue"
import { cn } from "../../../lib/utils"

type ToggleGroupVariants = VariantProps<typeof toggleVariants>

const props = withDefaults(defineProps<ToggleGroupRootProps & {
  class?: HTMLAttributes["class"]
  variant?: ToggleGroupVariants["variant"]
  size?: ToggleGroupVariants["size"]
  spacing?: number
}>(), {
  spacing: 0,
  /**
   * reka 的 ToggleGroupRoot 没给 orientation 默认值 → 不传时根节点不会输出 data-orientation，
   * 而 8 套预设都靠 `group-data-horizontal/toggle-group:` / `group-data-vertical/toggle-group:`
   * 选首尾圆角、内边距等规则 —— 少了这个属性那些规则会全部静默失效。
   * 这里按 reka 的实际默认行为（横向）显式补上，只影响属性输出与方向键，不改变交互。
   */
  orientation: "horizontal",
})

const emits = defineEmits<ToggleGroupRootEmits>()

/*
 * 把档位下发给子项。
 * **必须用 reactive 对象**：直接 provide({ variant: props.variant, … }) 只会在 setup 时取值一次，
 * 父组件之后动态改 variant / size / spacing 时子项仍拿旧值 → 子项的 data-variant / data-size /
 * data-spacing 不更新，预设里按这些属性选的样式也跟着不更新。
 * 用 watchEffect 同步进 reactive 对象后，读取方（ToggleGroupItem）的代码不用改。
 */
const groupContext = reactive<{
  variant?: ToggleGroupVariants["variant"]
  size?: ToggleGroupVariants["size"]
  spacing?: number
}>({})

watchEffect(() => {
  groupContext.variant = props.variant
  groupContext.size = props.size
  groupContext.spacing = props.spacing
})

provide("toggleGroup", groupContext)

const delegatedProps = reactiveOmit(props, "class", "size", "variant")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ToggleGroupRoot v-slot="slotProps" :data-size="size" :data-variant="variant" :data-spacing="spacing" :style="{ '--gap': spacing, }" data-slot="toggle-group" v-bind="forwarded" :class="cn(
    // data-vertical:flex-col + items-stretch：纵向时按钮要真的竖排 —— 预设里 7 套风格都写了
    // group-data-vertical/toggle-group:…:first:rounded-t-* / last:rounded-b-*，
    // 若布局不跟着变成列，那些「上圆角 / 下圆角」就会画在左右两侧，看起来是错的。
    'group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs data-vertical:flex-col data-vertical:items-stretch',
    props.class,
  )" >
    <slot v-bind="slotProps" />
  </ToggleGroupRoot>
</template>
