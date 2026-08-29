# Button Group 按钮组

<script setup>
</script>

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

## Usage

```vue
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '@/components/ui/button-group'
<template>
  <ButtonGroup>
    <Button>Button 1</Button>
    <Button>Button 2</Button>
  </ButtonGroup>
</template>
```

## Accessibility

- The `ButtonGroup` component has the `role` attribute set to `group`.
- Use `Tab` to navigate between the buttons in the group.
- Use `aria-label` or `aria-labelledby` to label the button group.

```vue
<template>
  <ButtonGroup aria-label="Button group">
    <Button>Button 1</Button>
    <Button>Button 2</Button>
  </ButtonGroup>
</template>
```

## ButtonGroup vs ToggleGroup

- Use the `ButtonGroup` component when you want to group buttons that perform an action.
- Use the `ToggleGroup` component when you want to group buttons that toggle a state.

## Examples

### Orientation

Set the `orientation` prop to change the button group layout.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Size

Control the size of buttons using the `size` prop on individual buttons.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Nested

`<ButtonGroup>` components to create button groups with spacing.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Separator

The `ButtonGroupSeparator` component visually divides buttons within a group.

Buttons with variant `outline` do not need a separator since they have a border. For other variants, a separator is recommended to improve the visual hierarchy.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Split

Create a split button group by adding two buttons separated by a `ButtonGroupSeparator`.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Input

Wrap an `Input` component with buttons.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Input Group

Wrap an `InputGroup` component to create complex input layouts.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Dropdown Menu

Create a split button group with a `DropdownMenu` component.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Select

Pair with a `Select` component.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Popover

Use with a `Popover` component.

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

## API Reference

### ButtonGroup

The `ButtonGroup` component is a container that groups related buttons together with consistent styling.

| Prop         | Type                             | Default   |
| ------------ | -------------------------------- | --------- |
| `orientation` | `"horizontal"` \| `"vertical"`    | `"horizontal"` |

```vue
<template>
  <ButtonGroup>
    <Button>Button 1</Button>
    <Button>Button 2</Button>
  </ButtonGroup>
</template>
```

Nest multiple button groups to create complex layouts with spacing. See the [nested](#nested) example for more details.

```vue
<template>
  <ButtonGroup>
    <ButtonGroup />
    <ButtonGroup />
  </ButtonGroup>
</template>
```

### ButtonGroupSeparator

The `ButtonGroupSeparator` component visually divides buttons within a group.

| Prop      | Type   | Default |
| --------- | ------ | ------- |
| `orientation`    | `"horizontal" \| "vertical"` | `vertical`    |

```vue
<template>
  <ButtonGroup>
    <Button>Button 1</Button>
    <ButtonGroupSeparator />
    <Button>Button 2</Button>
  </ButtonGroup>
</template>
```

### ButtonGroupText

Use this component to display text within a button group.

| Prop      | Type   | Default |
| --------- | ------ | ------- |
| `as-child`    | boolean | `false`    |

```vue
<template>
  <ButtonGroup>
    <ButtonGroupText>Text</ButtonGroupText>
    <Button>Button</Button>
  </ButtonGroup>
</template>
```

Use the `as-child` prop to render a custom component as the text, for example a label.

```vue
import { ButtonGroupText } from '@/components/ui/button-group'
import { Label } from '@/components/ui/label'
<template>
  <ButtonGroup>
    <ButtonGroupText as-child>
      <Label for="name">Text</Label>
    </ButtonGroupText>
    <Input id="name" placeholder="Type something here..." />
  </ButtonGroup>
</template>
```
