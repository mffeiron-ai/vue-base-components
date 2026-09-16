<script setup lang="ts">
/**
 * InputGroupAddon —— 输入框两侧（或上下）的附加区：图标、前缀文本、按钮都放这里。
 *
 * - `align` 决定位置：`inline-start`（左，默认）/ `inline-end`（右）/
 *   `block-start`（上方整行）/ `block-end`（下方整行）；后两个会把容器变成竖排并变高
 * - 点这块区域会自动把焦点交给同组的输入框（点图标就能直接开打）；
 *   但如果点的是里面的 `<button>` 就不抢焦点（`InputGroupButton` 靠这个行为正常工作）
 * - 里面放 `<kbd>` 时圆角会自动缩一点，与输入框对齐
 */
import type { HTMLAttributes } from "vue"
import type { InputGroupVariants } from "."
import { cn } from "../../../lib/utils"
import { inputGroupAddonVariants } from "."

const props = withDefaults(defineProps<{
  align?: InputGroupVariants["align"]
  class?: HTMLAttributes["class"]
}>(), {
  align: "inline-start",
})

function handleInputGroupAddonClick(e: MouseEvent) {
  const currentTarget = e.currentTarget as HTMLElement | null
  const target = e.target as HTMLElement | null
  if (target && target.closest("button")) {
    return
  }
  if (currentTarget && currentTarget?.parentElement) {
    currentTarget.parentElement?.querySelector("input")?.focus()
  }
}
</script>

<template>
  <div
    role="group"
    data-slot="input-group-addon"
    :data-align="props.align"
    :class="cn(inputGroupAddonVariants({ align: props.align }), props.class)"
    @click="handleInputGroupAddonClick"
  >
    <slot />
  </div>
</template>
