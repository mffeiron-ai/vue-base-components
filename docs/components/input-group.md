# Input Group 输入组

<script setup>
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea, } from '../../src/components/ui/input-group'

const demo0 = `import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'

  <InputGroup>
    <InputGroupInput placeholder="Search..." />
    <InputGroupAddon>
      <SearchIcon />
    </InputGroupAddon>
    <InputGroupAddon align="inline-end">
      <InputGroupButton>Search</InputGroupButton>
    </InputGroupAddon>
  </InputGroup>`

const demo1 = `import { InputGroup, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group'

  <div class="grid w-full max-w-sm gap-6">
    <InputGroup>
      <textarea
        data-slot="input-group-control"
        class="flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
        placeholder="Autoresize textarea..."
      />
      <InputGroupAddon align="block-end">
        <InputGroupButton class="ml-auto" size="sm" variant="default">
          Submit
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </div>`
</script>

<Demo :code="demo0">
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
</Demo>

## Usage

## Examples

### Icon

<Demo :code="demo1">
    <div class="grid w-full max-w-sm gap-6">
      <InputGroup>
        <textarea
          data-slot="input-group-control"
          class="flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
          placeholder="Autoresize textarea..."
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton class="ml-auto" size="sm" variant="default">
            Submit
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
</Demo>

### Text

Display additional text information alongside inputs.

<Demo :code="demo0">
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
</Demo>

### Button

Add buttons to perform actions within the input group.

<Demo :code="demo0">
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
</Demo>

### Tooltip

Add tooltips to provide additional context or help.

<Demo :code="demo0">
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
</Demo>

### Textarea

Input groups also work with textarea components. Use `block-start` or `block-end` for alignment.

<Demo :code="demo0">
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
</Demo>

### Spinner

Show loading indicators while processing input.

<Demo :code="demo0">
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
</Demo>

### Label

Add labels within input groups to improve accessibility.

<Demo :code="demo0">
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
</Demo>

### Dropdown

Pair input groups with dropdown menus for complex interactions.

<Demo :code="demo0">
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
</Demo>

### Button Group

Wrap input groups with button groups to create prefixes and suffixes.

<Demo :code="demo0">
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
</Demo>

### Custom Input

Add the `data-slot="input-group-control"` attribute to your custom input for automatic behavior and focus state handling.

No style is applied to the custom input. Apply your own styles using the `class` prop.

<Demo :code="demo0">
    <InputGroup>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
</Demo>

## API Reference

### InputGroup

The main component that wraps inputs and addons.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

```vue
<InputGroup>
  <InputGroupInput />
  <InputGroupAddon />
</InputGroup>
```

### InputGroupAddon

Displays icons, text, buttons, or other content alongside inputs.

> **提示**
For proper focus navigation, the `InputGroupAddon` component should be placed
after the input. Set the `align` prop to position the addon.

| Prop        | Type                                                             | Default          |
| ----------- | ---------------------------------------------------------------- | ---------------- |
| `align`     | `"inline-start" \| "inline-end" \| "block-start" \| "block-end"` | `"inline-start"` |
| `class` | `string`                                                         |                  |

```vue
<InputGroupAddon align="inline-end">
  <SearchIcon />
</InputGroupAddon>
```

**For `<InputGroupInput />`, use the `inline-start` or `inline-end` alignment. For `<InputGroupTextarea />`, use the `block-start` or `block-end` alignment.**

The `InputGroupAddon` component can have multiple `InputGroupButton` components and icons.

```vue
<InputGroupAddon>
  <InputGroupButton>Button</InputGroupButton>
  <InputGroupButton>Button</InputGroupButton>
</InputGroupAddon>
```

### InputGroupButton

Displays buttons within input groups.

| Prop        | Type                                                                          | Default   |
| ----------- | ----------------------------------------------------------------------------- | --------- |
| `size`      | `"xs" \| "icon-xs" \| "sm" \| "icon-sm"`                                      | `"xs"`    |
| `variant`   | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"ghost"` |
| `class` | `string`                                                                      |           |

```vue
<InputGroupButton>
Button
</InputGroupButton>

<InputGroupButton size="icon-xs" aria-label="Copy">
  <CopyIcon />
</InputGroupButton>
```

### InputGroupInput

Replacement for `<Input />` when building input groups. This component has the input group styles pre-applied and uses the unified `data-slot="input-group-control"` for focus state handling.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

All other props are passed through to the underlying `<Input />` component.

```vue
<InputGroup>
  <InputGroupInput placeholder="Enter text..." />
  <InputGroupAddon>
    <SearchIcon />
  </InputGroupAddon>
</InputGroup>
```

### InputGroupTextarea

Replacement for `<Textarea />` when building input groups. This component has the textarea group styles pre-applied and uses the unified `data-slot="input-group-control"` for focus state handling.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

All other props are passed through to the underlying `<Textarea />` component.

```vue
<InputGroup>
  <InputGroupTextarea placeholder="Enter message..." />
  <InputGroupAddon align="block-end">
    <InputGroupButton>Send</InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```
