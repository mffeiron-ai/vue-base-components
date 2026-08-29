# Spinner 加载指示

<script setup>
import { Spinner } from '../../src/components/ui/Spinner'

const demo0 = `import { Spinner } from '@/components/ui/Spinner'

  <Spinner />`
</script>

<Demo :code="demo0">
    <Spinner />
</Demo>

## Usage

## Customization

You can replace the default spinner icon with any other icon by editing the `Spinner` component.

<Demo :code="demo0">
    <Spinner />
</Demo>

## Examples

### Size

Use the `size-*` utility class to change the size of the spinner.

<Demo :code="demo0">
    <Spinner />
</Demo>

### Color

Use the `text-*` utility class to change the color of the spinner.

<Demo :code="demo0">
    <Spinner />
</Demo>

### Button

Add a spinner to a button to indicate a loading state. The `<Button />` will handle the spacing between the spinner and the text.

<Demo :code="demo0">
    <Spinner />
</Demo>

### Badge

You can also use a spinner inside a badge.

<Demo :code="demo0">
    <Spinner />
</Demo>

### Input Group

Input Group can have spinners inside `<InputGroupAddon>`.

<Demo :code="demo0">
    <Spinner />
</Demo>

### Empty

You can place a spinner inside an empty state.

<Demo :code="demo0">
    <Spinner />
</Demo>

### Item

Use the spinner inside `<ItemMedia>` to indicate a loading state.

<Demo :code="demo0">
    <Spinner />
</Demo>

## API Reference

### Spinner

Use the `Spinner` component to display a spinner.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class`     | `string` |         |

```vue
<template>
  <Spinner />
</template>
```
