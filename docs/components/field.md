# Field 表单字段

<script setup>
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle, } from '../../src/components/ui/field'

const demo0 = `import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'

  <FieldSet>
    <FieldLegend>Profile</FieldLegend>
    <FieldDescription>This appears on invoices and emails.</FieldDescription>
    <FieldGroup>
      <Field>
        <FieldLabel for="name">
          Full name
        </FieldLabel>
        <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
        <FieldDescription>This appears on invoices and emails.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel for="username">
          Username
        </FieldLabel>
        <Input id="username" autocomplete="off" aria-invalid />
        <FieldError>Choose another username.</FieldError>
      </Field>
      <Field orientation="horizontal">
        <Switch id="newsletter" />
        <FieldLabel for="newsletter">
          Subscribe to the newsletter
        </FieldLabel>
      </Field>
    </FieldGroup>
  </FieldSet>`

const demo1 = `  <Field>
    <FieldLabel for="input-id">
      Label
    </FieldLabel>
    <!-- Input, Select, Switch, etc. -->
    <FieldDescription>Optional helper text.</FieldDescription>
    <FieldError>Validation message.</FieldError>
  </Field>`
</script>

<Demo :code="demo0">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel for="name">
            Full name
          </FieldLabel>
          <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" autocomplete="off" aria-invalid />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel for="newsletter">
            Subscribe to the newsletter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
</Demo>

## Usage

## Anatomy

The `Field` family is designed for composing accessible forms. A typical field is structured as follows:

- `Field` is the core wrapper for a single field.
- `FieldContent` is a flex column that groups label and description. Not required if you have no description.
- Wrap related fields with `FieldGroup`, and use `FieldSet` with `FieldLegend` for semantic grouping.

## Examples

### Input

<Demo :code="demo1">
    <Field>
      <FieldLabel for="input-id">
        Label
      </FieldLabel>
      <!-- Input, Select, Switch, etc. -->
      <FieldDescription>Optional helper text.</FieldDescription>
      <FieldError>Validation message.</FieldError>
    </Field>
</Demo>

### Textarea

<Demo :code="demo0">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel for="name">
            Full name
          </FieldLabel>
          <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" autocomplete="off" aria-invalid />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel for="newsletter">
            Subscribe to the newsletter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
</Demo>

### Select

<Demo :code="demo0">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel for="name">
            Full name
          </FieldLabel>
          <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" autocomplete="off" aria-invalid />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel for="newsletter">
            Subscribe to the newsletter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
</Demo>

### Slider

<Demo :code="demo0">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel for="name">
            Full name
          </FieldLabel>
          <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" autocomplete="off" aria-invalid />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel for="newsletter">
            Subscribe to the newsletter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
</Demo>

### Fieldset

<Demo :code="demo0">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel for="name">
            Full name
          </FieldLabel>
          <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" autocomplete="off" aria-invalid />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel for="newsletter">
            Subscribe to the newsletter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
</Demo>

### Checkbox

<Demo :code="demo0">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel for="name">
            Full name
          </FieldLabel>
          <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" autocomplete="off" aria-invalid />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel for="newsletter">
            Subscribe to the newsletter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
</Demo>

### Radio

<Demo :code="demo0">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel for="name">
            Full name
          </FieldLabel>
          <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" autocomplete="off" aria-invalid />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel for="newsletter">
            Subscribe to the newsletter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
</Demo>

### Switch

<Demo :code="demo0">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel for="name">
            Full name
          </FieldLabel>
          <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" autocomplete="off" aria-invalid />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel for="newsletter">
            Subscribe to the newsletter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
</Demo>

### Choice Card

Wrap `Field` components inside `FieldLabel` to create selectable field groups. This works with `RadioItem`, `Checkbox` and `Switch` components.

<Demo :code="demo0">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel for="name">
            Full name
          </FieldLabel>
          <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" autocomplete="off" aria-invalid />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel for="newsletter">
            Subscribe to the newsletter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
</Demo>

### Field Group

Stack `Field` components with `FieldGroup`. Add `FieldSeparator` to divide them.

<Demo :code="demo0">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel for="name">
            Full name
          </FieldLabel>
          <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" autocomplete="off" aria-invalid />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel for="newsletter">
            Subscribe to the newsletter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
</Demo>

## Responsive Layout

If you are in tailwindcss v3 you need to install [`@tailwindcss/container-queries`](https://github.com/tailwindlabs/tailwindcss-container-queries)

- **Vertical fields:** Default orientation stacks label, control, and helper text—ideal for mobile-first layouts.
- **Horizontal fields:** Set `orientation="horizontal"` on `Field` to align the label and control side-by-side. Pair with `FieldContent` to keep descriptions aligned.
- **Responsive fields:** Set `orientation="responsive"` for automatic column layouts inside container-aware parents. Apply `@container/field-group` classes on `FieldGroup` to switch orientations at specific breakpoints.

<Demo :code="demo0">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel for="name">
            Full name
          </FieldLabel>
          <Input id="name" autocomplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>This appears on invoices and emails.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel for="username">
            Username
          </FieldLabel>
          <Input id="username" autocomplete="off" aria-invalid />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field orientation="horizontal">
          <Switch id="newsletter" />
          <FieldLabel for="newsletter">
            Subscribe to the newsletter
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
</Demo>

## Validation and Errors

- Add `data-invalid` to `Field` to switch the entire block into an error state.
- Add `aria-invalid` on the input itself for assistive technologies.
- Render `FieldError` immediately after the control or inside `FieldContent` to keep error messages aligned with the field.

```vue
<template>
  <Field data-invalid>
    <FieldLabel for="email">
      Email
    </FieldLabel>
    <Input id="email" type="email" aria-invalid />
    <FieldError>Enter a valid email address.</FieldError>
  </Field>
</template>
```

## Accessibility

  - `FieldSet` and `FieldLegend` keep related controls grouped for keyboard and assistive tech users.
  - `Field` outputs `role="group"` so nested controls inherit labeling from `FieldLabel` and `FieldLegend` when combined.
  - Apply `FieldSeparator` sparingly to ensure screen readers encounter clear section boundaries.

## API Reference

### FieldSet

Container that renders a semantic `fieldset` with spacing presets.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

```vue
<template>
  <FieldSet>
    <FieldLegend>Delivery</FieldLegend>
    <FieldGroup>
      <!-- Fields -->
    </FieldGroup>
  </FieldSet>
</template>
```

### FieldLegend

Legend element for a `FieldSet`. Switch to the `label` variant to align with label sizing.

| Prop        | Type                  | Default    |
| ----------- | --------------------- | ---------- |
| `variant`   | `"legend" \| "label"` | `"legend"` |
| `class` | `string`              |            |

```vue
<FieldLegend variant="label">
Notification Preferences
</FieldLegend>
```

The `FieldLegend` has two variants: `legend` and `label`. The `label` variant applies label sizing and alignment. Handy if you have nested `FieldSet`.

### FieldGroup

Layout wrapper that stacks `Field` components and enables container queries for responsive orientations.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

```vue
<template>
  <FieldGroup class="@container/field-group flex flex-col gap-6">
    <Field><!-- Fields --></Field>
    <Field><!-- Fields --></Field>
  </FieldGroup>
</template>
```

### Field

The core wrapper for a single field. Provides orientation control, invalid state styling, and spacing.

| Prop           | Type                                         | Default      |
| -------------- | -------------------------------------------- | ------------ |
| `orientation`  | `"vertical" \| "horizontal" \| "responsive"` | `"vertical"` |
| `class`    | `string`                                     |              |
| `data-invalid` | `boolean`                                    |              |

```vue
<Field orientation="horizontal">
  <FieldLabel for="remember">Remember me</FieldLabel>
  <Switch id="remember" />
</Field>
```

### FieldContent

Flex column that groups control and descriptions when the label sits beside the control. Not required if you have no description.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

```vue
<Field>
  <Checkbox id="notifications" />
  <FieldContent>
    <FieldLabel for="notifications">Notifications</FieldLabel>
    <FieldDescription>Email, SMS, and push options.</FieldDescription>
  </FieldContent>
</Field>
```

### FieldLabel

Label styled for both direct inputs and nested `Field` children.

| Prop        | Type      | Default |
| ----------- | --------- | ------- |
| `class` | `string`  |         |
| `asChild`   | `boolean` | `false` |

```vue
<FieldLabel for="email">
Email
</FieldLabel>
```

### FieldTitle

Renders a title with label styling inside `FieldContent`.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

```vue
<FieldContent>
  <FieldTitle>Enable Touch ID</FieldTitle>
  <FieldDescription>Unlock your device faster.</FieldDescription>
</FieldContent>
```

### FieldDescription

Helper text slot that automatically balances long lines in horizontal layouts.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

```vue
<FieldDescription>
We never share your email with anyone.
</FieldDescription>
```

### FieldSeparator

Visual divider to separate sections inside a `FieldGroup`. Accepts optional inline content.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

```vue
<FieldSeparator>
Or continue with
</FieldSeparator>
```

### FieldError

Accessible error container that accepts children or an `errors` array (e.g., from `vee-validate`).

| Prop        | Type                                       | Default |
| ----------- | ------------------------------------------ | ------- |
| `errors`    | `Array<{ message?: string } \| undefined>` |         |
| `class` | `string`                                   |         |

```vue
<FieldError :errors="errors.username" />
```

When the `errors` array contains multiple messages, the component renders a list automatically.

`FieldError` also accepts issues produced by any validator that implements [Standard Schema](https://standardschema.dev/), including Zod, Valibot, and ArkType. Pass the `issues` array from the schema result directly to render a unified error list across libraries.
