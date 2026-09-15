<script setup lang="ts">
/**
 * ComboboxItem —— 单个可选项。
 *
 * - value：必填，选中后写入 Combobox 的 v-model。可以是任意类型；
 *   传对象时要在 Combobox 上用 by="xxx" 指定比较/回显字段。
 * - disabled：禁用该选项（预设的 data-disabled 样式会跟着生效）。
 * - 键盘上下 + Enter 由 reka 管；高亮态用 `data-[highlighted]`（预设里写作 data-highlighted:）。
 * - `min-w-0` / `[&>*]:truncate` 是为了长文本能正确省略号截断，别删。
 * 选中标记不要直接写 Check 图标，放到 ComboboxItemIndicator 里，位置才对。
 */
import type { ComboboxItemEmits, ComboboxItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ComboboxItem, useForwardPropsEmits } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<ComboboxItemProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<ComboboxItemEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ComboboxItem data-slot="combobox-item" v-bind="forwarded" :class="cn('data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*=\'text-\'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4 min-w-0 [&>*]:min-w-0 [&>*]:truncate', props.class)"
  >
    <slot />
  </ComboboxItem>
</template>
