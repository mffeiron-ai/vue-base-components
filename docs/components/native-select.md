# Native Select 原生选择器

<script setup>
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption, } from '../../src/components/ui/native-select'

const demo0 = `import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from '@/components/ui/native-select'

  <NativeSelect>
    <NativeSelectOption value="">
      Select a fruit
    </NativeSelectOption>
    <NativeSelectOption value="apple">
      Apple
    </NativeSelectOption>
    <NativeSelectOption value="banana">
      Banana
    </NativeSelectOption>
    <NativeSelectOption value="blueberry">
      Blueberry
    </NativeSelectOption>
    <NativeSelectOption value="grapes" disabled>
      Grapes
    </NativeSelectOption>
    <NativeSelectOption value="pineapple">
      Pineapple
    </NativeSelectOption>
  </NativeSelect>`

const demo1 = `  <NativeSelect>
    <NativeSelectOption value="">
      Select a food
    </NativeSelectOption>
    <NativeSelectOptGroup label="Fruits">
      <NativeSelectOption value="apple">
        Apple
      </NativeSelectOption>
      <NativeSelectOption value="banana">
        Banana
      </NativeSelectOption>
      <NativeSelectOption value="blueberry">
        Blueberry
      </NativeSelectOption>
    </NativeSelectOptGroup>
    <NativeSelectOptGroup label="Vegetables">
      <NativeSelectOption value="carrot">
        Carrot
      </NativeSelectOption>
      <NativeSelectOption value="broccoli">
        Broccoli
      </NativeSelectOption>
      <NativeSelectOption value="spinach">
        Spinach
      </NativeSelectOption>
    </NativeSelectOptGroup>
  </NativeSelect>`

const demo2 = `  <NativeSelect aria-invalid="true">
    <NativeSelectOption value="">
      Select a country
    </NativeSelectOption>
    <NativeSelectOption value="us">
      United States
    </NativeSelectOption>
    <NativeSelectOption value="uk">
      United Kingdom
    </NativeSelectOption>
    <NativeSelectOption value="ca">
      Canada
    </NativeSelectOption>
  </NativeSelect>`

const demo3 = `  <NativeSelect aria-label="Choose your preferred language">
    <NativeSelectOption value="en">
      English
    </NativeSelectOption>
    <NativeSelectOption value="es">
      Spanish
    </NativeSelectOption>
    <NativeSelectOption value="fr">
      French
    </NativeSelectOption>
  </NativeSelect>`
</script>

> **提示**
---
icon: true
---
For a styled select component, see the [Select](/components/select.html) component.

<Demo :code="demo0">
    <NativeSelect>
      <NativeSelectOption value="">
        Select a fruit
      </NativeSelectOption>
      <NativeSelectOption value="apple">
        Apple
      </NativeSelectOption>
      <NativeSelectOption value="banana">
        Banana
      </NativeSelectOption>
      <NativeSelectOption value="blueberry">
        Blueberry
      </NativeSelectOption>
      <NativeSelectOption value="grapes" disabled>
        Grapes
      </NativeSelectOption>
      <NativeSelectOption value="pineapple">
        Pineapple
      </NativeSelectOption>
    </NativeSelect>
</Demo>

## Usage

## Examples

### With Groups

Organize options using `NativeSelectOptGroup` for better categorization.

<Demo :code="demo1">
    <NativeSelect>
      <NativeSelectOption value="">
        Select a food
      </NativeSelectOption>
      <NativeSelectOptGroup label="Fruits">
        <NativeSelectOption value="apple">
          Apple
        </NativeSelectOption>
        <NativeSelectOption value="banana">
          Banana
        </NativeSelectOption>
        <NativeSelectOption value="blueberry">
          Blueberry
        </NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Vegetables">
        <NativeSelectOption value="carrot">
          Carrot
        </NativeSelectOption>
        <NativeSelectOption value="broccoli">
          Broccoli
        </NativeSelectOption>
        <NativeSelectOption value="spinach">
          Spinach
        </NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
</Demo>

### Disabled State

Disable individual options or the entire select component.

<Demo :code="demo2">
    <NativeSelect aria-invalid="true">
      <NativeSelectOption value="">
        Select a country
      </NativeSelectOption>
      <NativeSelectOption value="us">
        United States
      </NativeSelectOption>
      <NativeSelectOption value="uk">
        United Kingdom
      </NativeSelectOption>
      <NativeSelectOption value="ca">
        Canada
      </NativeSelectOption>
    </NativeSelect>
</Demo>

### Invalid State

Show validation errors with the `aria-invalid` attribute and error styling.

<Demo :code="demo3">
    <NativeSelect aria-label="Choose your preferred language">
      <NativeSelectOption value="en">
        English
      </NativeSelectOption>
      <NativeSelectOption value="es">
        Spanish
      </NativeSelectOption>
      <NativeSelectOption value="fr">
        French
      </NativeSelectOption>
    </NativeSelect>
</Demo>

### Form Integration

Use with form libraries like VeeValidate for controlled components.

<Demo :code="demo0">
    <NativeSelect>
      <NativeSelectOption value="">
        Select a fruit
      </NativeSelectOption>
      <NativeSelectOption value="apple">
        Apple
      </NativeSelectOption>
      <NativeSelectOption value="banana">
        Banana
      </NativeSelectOption>
      <NativeSelectOption value="blueberry">
        Blueberry
      </NativeSelectOption>
      <NativeSelectOption value="grapes" disabled>
        Grapes
      </NativeSelectOption>
      <NativeSelectOption value="pineapple">
        Pineapple
      </NativeSelectOption>
    </NativeSelect>
</Demo>

<!-- ### Input Group Integration

Combine with `InputGroup` for complex input layouts.

::component-preview
---
name: NativeSelectInputGroupDemo
---
:: -->

## Native Select vs Select

- Use `NativeSelect` when you need native browser behavior, better performance, or mobile-optimized dropdowns.
- Use `Select` when you need custom styling, animations, or complex interactions.

The `NativeSelect` component provides native HTML select functionality with consistent styling that matches your design system.

## Accessibility

- The component maintains all native HTML select accessibility features.
- Screen readers can navigate through options using arrow keys.
- The chevron icon is marked as `aria-hidden="true"` to avoid duplication.
- Use `aria-label` or `aria-labelledby` for additional context when needed.

## API Reference

### NativeSelect

The main select component that wraps the native HTML select element.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

All other props are passed through to the underlying `<select>` element.

```vue
<NativeSelect>
  <NativeSelectOption value="option1">Option 1</NativeSelectOption>
  <NativeSelectOption value="option2">Option 2</NativeSelectOption>
</NativeSelect>
```

### NativeSelectOption

Represents an individual option within the select.

| Prop        | Type      | Default |
| ----------- | --------- | ------- |
| `value`     | `string`  |         |
| `disabled`  | `boolean` | `false` |
| `class` | `string`  |         |

All other props are passed through to the underlying `<option>` element.

```vue
<template>
  <NativeSelectOption value="apple">
    Apple
  </NativeSelectOption>
  <NativeSelectOption value="banana" disabled>
    Banana
  </NativeSelectOption>
</template>
```

### NativeSelectOptGroup

Groups related options together for better organization.

| Prop        | Type      | Default |
| ----------- | --------- | ------- |
| `label`     | `string`  |         |
| `disabled`  | `boolean` | `false` |
| `class` | `string`  |         |

All other props are passed through to the underlying `<optgroup>` element.

```vue
<template>
  <NativeSelectOptGroup label="Fruits">
    <NativeSelectOption value="apple">
      Apple
    </NativeSelectOption>
    <NativeSelectOption value="banana">
      Banana
    </NativeSelectOption>
  </NativeSelectOptGroup>
</template>
```
