# Empty 空状态

<script setup>
import { FolderOpen } from 'lucide-vue-next'
import { Button } from '../../src/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, } from '../../src/components/ui/empty'

const demo0 = `import { FolderOpen } from '@lucide/vue'
import { Button } from '@/registry/default/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/registry/default/ui/empty'

  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <FolderOpen />
      </EmptyMedia>
    </EmptyHeader>
    <EmptyTitle>No data</EmptyTitle>
    <EmptyDescription>No data found</EmptyDescription>
    <EmptyContent>
      <Button>Add data</Button>
    </EmptyContent>
  </Empty>`
</script>

<Demo :code="demo0">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>No data</EmptyTitle>
      <EmptyDescription>No data found</EmptyDescription>
      <EmptyContent>
        <Button>Add data</Button>
      </EmptyContent>
    </Empty>
</Demo>

## Usage

## Examples

### Outline

Use the `border` utility class to create an outline empty state.

<Demo :code="demo0">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>No data</EmptyTitle>
      <EmptyDescription>No data found</EmptyDescription>
      <EmptyContent>
        <Button>Add data</Button>
      </EmptyContent>
    </Empty>
</Demo>

### Background

Use the `bg-*` and `bg-gradient-*` utilities to add a background to the empty state.

<Demo :code="demo0">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>No data</EmptyTitle>
      <EmptyDescription>No data found</EmptyDescription>
      <EmptyContent>
        <Button>Add data</Button>
      </EmptyContent>
    </Empty>
</Demo>

### Avatar

Use the `EmptyMedia` component to display an avatar in the empty state.

<Demo :code="demo0">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>No data</EmptyTitle>
      <EmptyDescription>No data found</EmptyDescription>
      <EmptyContent>
        <Button>Add data</Button>
      </EmptyContent>
    </Empty>
</Demo>

### Avatar Group

Use the `EmptyMedia` component to display an avatar group in the empty state.

<Demo :code="demo0">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>No data</EmptyTitle>
      <EmptyDescription>No data found</EmptyDescription>
      <EmptyContent>
        <Button>Add data</Button>
      </EmptyContent>
    </Empty>
</Demo>

### InputGroup

You can add an `InputGroup` component to the `EmptyContent` component.

<Demo :code="demo0">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>No data</EmptyTitle>
      <EmptyDescription>No data found</EmptyDescription>
      <EmptyContent>
        <Button>Add data</Button>
      </EmptyContent>
    </Empty>
</Demo>

## API Reference

### Empty

The main component of the empty state. Wraps the `EmptyHeader` and `EmptyContent` components.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

```vue
<template>
  <Empty>
    <EmptyHeader />
    <EmptyContent />
  </Empty>
</template>
```

### EmptyHeader

The `EmptyHeader` component wraps the empty media, title, and description.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

```vue
<template>
  <EmptyHeader>
    <EmptyMedia />
    <EmptyTitle />
    <EmptyDescription />
  </EmptyHeader>
</template>
```

### EmptyMedia

Use the `EmptyMedia` component to display the media of the empty state such as an icon or an image. You can also use it to display other components such as an avatar.

| Prop        | Type                  | Default   |
| ----------- | --------------------- | --------- |
| `variant`   | `"default" \| "icon"` | `default` |
| `class` | `string`              |           |

```vue
<template>
  <EmptyMedia variant="icon">
    <Icon />
  </EmptyMedia>
</template>
```

```vue
<template>
  <EmptyMedia>
    <Avatar>
      <AvatarImage src="..." />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  </EmptyMedia>
</template>
```

### EmptyTitle

Use the `EmptyTitle` component to display the title of the empty state.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

```vue
<template>
  <EmptyTitle>No data</EmptyTitle>
</template>
```

### EmptyDescription

Use the `EmptyDescription` component to display the description of the empty state.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

```vue
<template>
  <EmptyDescription>You do not have any notifications.</EmptyDescription>
</template>
```

### EmptyContent

Use the `EmptyContent` component to display the content of the empty state such as a button, input or a link.

| Prop        | Type     | Default |
| ----------- | -------- | ------- |
| `class` | `string` |         |

```vue
<template>
  <EmptyContent>
    <Button>Add Project</Button>
  </EmptyContent>
</template>
```
