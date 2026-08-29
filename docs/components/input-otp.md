# Input Otp OTP 输入

<script setup>
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, } from '../../src/components/ui/input-otp'

const demo0 = `import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'

  <InputOTP v-model="value" :maxlength="6">
    <InputOTPGroup>
      <InputOTPSlot :index="0" />
      <InputOTPSlot :index="1" />
      <InputOTPSlot :index="2" />
    </InputOTPGroup>
    <InputOTPSeparator />
    <InputOTPGroup>
      <InputOTPSlot :index="3" />
      <InputOTPSlot :index="4" />
      <InputOTPSlot :index="5" />
    </InputOTPGroup>
  </InputOTP>`
</script>

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

## Usage

## Examples

### Pattern

Use the `pattern` prop to define a custom pattern for the OTP input.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

```vue
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'vue-input-otp'
// ...
<template>
  <InputOTP
    maxlength="6"
    :pattern="REGEXP_ONLY_DIGITS_AND_CHARS"
  >
    <InputOTPGroup>
      <InputOTPSlot :index="0" />
      <!-- ... -->
    </InputOTPGroup>
  </InputOTP>
</template>
```

### Separator
You can use the `<InputOTPSeparator />` component to add a separator between the input groups.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

```vue
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
// ...
<template>
  <InputOTP maxlength="4">
    <InputOTPGroup>
      <InputOTPSlot :index="0" />
      <InputOTPSlot :index="1" />
    </InputOTPGroup>
    <InputOTPSeparator />
    <InputOTPGroup>
      <InputOTPSlot :index="2" />
      <InputOTPSlot :index="3" />
    </InputOTPGroup>
  </InputOTP>
</template>
```

### Controlled
You can use the `v-model` directive to control the input value.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Form

You can use the InputOTP component within a form, for example with VeeValidate.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>
