<script setup lang="ts">
/**
 * InputOTP —— 一次性验证码输入框（基于 `vue-input-otp`）。
 *
 * 结构：`InputOTP` > `InputOTPGroup` > 若干 `InputOTPSlot :index="n"`；
 * 想把 6 位拆成 3+3 这种，就在两组之间放一个 `InputOTPSeparator`。
 *
 * - `maxlength` **必填**：总位数
 * - `v-model`（或 `default-value`）拿到的是一整个字符串；填满时额外触发 `complete`
 * - 限制字符：`pattern` 配 `REGEXP_ONLY_DIGITS` / `REGEXP_ONLY_CHARS` /
 *   `REGEXP_ONLY_DIGITS_AND_CHARS`（这几个常量从 `vue-input-otp` 导出）
 * - `inputmode="numeric"` 让移动端弹数字键盘；`text-align` 控制光标初始落在哪
 * - 实现上是「一个隐藏 input + 若干展示用的格子」，所以整块可聚焦、可粘贴，
 *   密码管理器也能识别（`push-password-manager-strategy`）
 * - 其余属性（`disabled` / `aria-invalid` / `autocomplete` / `name`…）都透传到那个 input
 */
// @ts-nocheck
import type { HTMLAttributes } from "vue"
import type { OTPInputEmits, OTPInputProps } from "vue-input-otp"
import { reactiveOmit } from "@vueuse/core"
import { useForwardPropsEmits } from "reka-ui"
import { OTPInput } from "vue-input-otp"
import { cn } from "../../../lib/utils"

const props = defineProps<OTPInputProps & { class?: HTMLAttributes["class"] }>()

const emits = defineEmits<OTPInputEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps as any, emits)
</script>

<template>
  <OTPInput
    v-slot="slotProps"
    v-bind="forwarded"
    :container-class="cn('group/input-otp flex items-center gap-2 has-disabled:opacity-50', props.class)"
    data-slot="input-otp"
    class="disabled:cursor-not-allowed"
  >
    <slot v-bind="slotProps" />
  </OTPInput>
</template>
