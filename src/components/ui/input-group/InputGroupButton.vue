<script setup lang="ts">
/**
 * InputGroupButton —— Addon 里的小按钮（清空、复制、发送…）。
 *
 * - 默认 `size="xs"` + `variant="ghost"`：高度贴合输入框、不抢视觉
 * - `size` 可选：`xs`（h-6）/ `sm`（h-8）/ `icon-xs`（24×24）/ `icon-sm`（32×32）
 * - `variant` 透传 `Button` 的全部变体（default / outline / secondary / ghost…）
 * - 渲染的就是 `Button`，其余属性与事件（`disabled` / `@click` / `as-child`）照常可用
 */
import type { HTMLAttributes } from "vue"
import type { InputGroupButtonVariants } from "."
import type { ButtonVariants } from "../button"
import { cn } from "../../../lib/utils"
import { Button } from "../button"
import { inputGroupButtonVariants } from "."

interface InputGroupButtonProps {
  variant?: ButtonVariants["variant"]
  size?: InputGroupButtonVariants["size"]
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<InputGroupButtonProps>(), {
  size: "xs",
  variant: "ghost",
})
</script>

<template>
  <Button
    :data-size="props.size"
    :variant="props.variant"
    :class="cn(inputGroupButtonVariants({ size: props.size }), props.class)"
  >
    <slot />
  </Button>
</template>
