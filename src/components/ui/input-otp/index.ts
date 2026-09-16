export { default as InputOTP } from "./InputOTP.vue"
export { default as InputOTPGroup } from "./InputOTPGroup.vue"
export { default as InputOTPSeparator } from "./InputOTPSeparator.vue"
export { default as InputOTPSlot } from "./InputOTPSlot.vue"

/**
 * 常用的 `pattern` 常量，原样转发自 `vue-input-otp`，省得使用方再去引底层包。
 *
 * 注意都是**整串**正则（带 `^…$`）：库会把「当前全部内容」整体丢给 `test()`，
 * 不匹配则整次输入作废 —— 所以自己写 `pattern` 时也必须锚定全串，
 * 写成 `[0-9]*` 这种因为能匹配空串会永远通过（等于没限制）。
 */
export {
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "vue-input-otp"
