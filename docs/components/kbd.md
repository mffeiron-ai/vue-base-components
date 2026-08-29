# Kbd 键盘按键

<script setup>
</script>

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

## Usage

```vue
import { Kbd } from '@/components/ui/kbd'
<template>
  <Kbd>Ctrl</Kbd>
</template>
```

## Examples

### Group

Use the `KbdGroup` component to group keyboard keys together.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Button

Use the `Kbd` component inside a `Button` component to display a keyboard key inside a button.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Tooltip

You can use the `Kbd` component inside a `Tooltip` component to display a tooltip with a keyboard key.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Input Group

You can use the `Kbd` component inside a `InputGroupAddon` component to display a keyboard key inside an input group.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

## API Reference

### Kbd

Use the `Kbd` component to display a keyboard key.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` | ``      |

```vue
<Kbd>
Ctrl
</Kbd>
```

### KbdGroup

Use the `KbdGroup` component to group `Kbd` components together.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` | ``      |

```vue
<KbdGroup>
  <Kbd>Ctrl</Kbd>
  <Kbd>B</Kbd>
</KbdGroup>
```
