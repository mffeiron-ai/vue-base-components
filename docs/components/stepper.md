# Stepper 步骤条

<script setup>
</script>

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

## Usage

```vue
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'
<template>
  <Stepper>
    <StepperItem :step="1">
      <StepperTrigger>
        <StepperIndicator>1</StepperIndicator>
        <StepperTitle>Step 1</StepperTitle>
        <StepperDescription>This is the first step</StepperDescription>
      </StepperTrigger>
      <StepperSeparator />
    </StepperItem>
    <StepperItem :step="2">
      <StepperTrigger>
        <StepperIndicator>2</StepperIndicator>
        <StepperTitle>Step 2</StepperTitle>
        <StepperDescription>This is the second step</StepperDescription>
      </StepperTrigger>
    </StepperItem>
  </Stepper>
</template>
```

## Examples

### Horizontal

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Vertical

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Form

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>
