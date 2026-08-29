# Bubble 气泡

<script setup>
import { Bubble, BubbleContent, BubbleReactions } from '../../src/components/ui/bubble'
import { Bubble, BubbleContent } from '../../src/components/ui/bubble'

const demo0 = `import { Bubble, BubbleContent, BubbleReactions } from '@/components/ui/bubble'

  <Bubble>
    <BubbleContent>
      I checked the registry output and removed the stale route.
    </BubbleContent>
    <BubbleReactions>
      <span>👍</span>
    </BubbleReactions>
  </Bubble>`

const demo1 = `import { Bubble, BubbleContent } from '@/components/ui/bubble'

  <Bubble variant="muted">
    <BubbleContent as-child>
      <button type="button">Click here</button>
    </BubbleContent>
  </Bubble>`

const demo2 = `<BubbleReactions role="img" aria-label="Reactions: thumbs up, fire, and 8 more">
  <span>👍</span>
  <span>🔥</span>
  <span>+8</span>
</BubbleReactions>`

const demo3 = `<BubbleReactions>
  <Button aria-label="Thumbs up" variant="secondary" size="icon-xs">
    <ThumbsUpIcon />
  </Button>
</BubbleReactions>`

const demo4 = `<Bubble variant="muted" align="end">
  <BubbleContent as-child>
    <button type="button" @click="onReply">
      I forgot my password
    </button>
  </BubbleContent>
</Bubble>`
</script>

<Demo :code="demo0">
    <Bubble>
      <BubbleContent>
        I checked the registry output and removed the stale route.
      </BubbleContent>
      <BubbleReactions>
        <span>👍</span>
      </BubbleReactions>
    </Bubble>
</Demo>

The `Bubble` component displays framed conversational content. Use it for chat text, short structured output, quoted replies, suggestions, and reactions.

For full-featured chat interfaces, use the [`Message`](/components/message.html) component. `Bubble` is intentionally scoped to the bubble surface. Place avatars, names, timestamps, metadata, and message-level actions in [`Message`](/components/message.html).

## Usage

## Composition

Use the following composition to build a bubble:

```text
Bubble
├── BubbleContent
└── BubbleReactions
```

Use `BubbleGroup` to group consecutive bubbles from the same sender:

```text
BubbleGroup
├── Bubble
│   └── BubbleContent
└── Bubble
    └── BubbleContent
```

## Features

- Seven visual variants, from a strong primary bubble to unframed ghost content
- Start and end alignment for sender and receiver bubbles
- Reactions that anchor to the bubble edge with configurable side and alignment
- Bubbles size to their content, up to 80% of the container width
- Polymorphic content via `as` or `as-child` for link and button bubbles
- Customizable styling through the `class` prop on every part

## Examples

### Variants

Use `variant` to change the visual treatment of the bubble.

<Demo :code="demo1">
    <Bubble variant="muted">
      <BubbleContent as-child>
        <button type="button">Click here</button>
      </BubbleContent>
    </Bubble>
</Demo>

| Variant       | Description                                            |
| ------------- | ------------------------------------------------------ |
| `default`     | A strong primary bubble, usually for the current user. |
| `secondary`   | The standard neutral bubble for conversation content.  |
| `muted`       | A lower-emphasis bubble for quiet supporting content.  |
| `tinted`      | A subtle primary-tinted bubble.                        |
| `outline`     | A bordered bubble for secondary or rich content.       |
| `ghost`       | Unframed content for assistant text or rich content.   |
| `destructive` | A destructive bubble for error or failed actions.      |

A bubble sizes to its content, up to 80% of the container width. The `ghost` variant removes the max-width so assistant text and rich content can span the full row.

### Alignment

Use `align` on `Bubble` to align the bubble to the start or end of the conversation.

<Demo :code="demo2">
  <BubbleReactions role="img" aria-label="Reactions: thumbs up, fire, and 8 more">
    <span>👍</span>
    <span>🔥</span>
    <span>+8</span>
  </BubbleReactions>
</Demo>

| align   | Description                                        |
| ------- | -------------------------------------------------- |
| `start` | Align the bubble to the start of the conversation. |
| `end`   | Align the bubble to the end of the conversation.   |

**Note:** When building chat interfaces, you probably want to set `align` on the `Message` component itself. Bubbles inside `MessageContent` automatically follow the message alignment.

### Bubble Group

Use `BubbleGroup` to group consecutive bubbles from the same sender. Note the `align` prop should be set on the `Bubble` component itself, not the `BubbleGroup` component.

```text
BubbleGroup
├── Bubble
│   └── BubbleContent
└── Bubble
    └── BubbleContent
```

<Demo :code="demo3">
  <BubbleReactions>
    <Button aria-label="Thumbs up" variant="secondary" size="icon-xs">
      <ThumbsUpIcon />
    </Button>
  </BubbleReactions>
</Demo>

### Links and Buttons

Use `as-child` to merge `BubbleContent` styling and attributes onto a link or button passed through its default slot.

<Demo :code="demo4">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

### Reactions

Use `BubbleReactions` for bubble reactions. You can use it to display reactions or quick action buttons. Use `side` and `align` to position the row — `side="top"` anchors it to the upper edge. Reactions overlap the bubble edge, so leave vertical space between rows — the examples below use a larger `gap` for this reason.

<Demo :code="demo0">
    <Bubble>
      <BubbleContent>
        I checked the registry output and removed the stale route.
      </BubbleContent>
      <BubbleReactions>
        <span>👍</span>
      </BubbleReactions>
    </Bubble>
</Demo>

### Show More / Collapsible

Long bubble content can be composed with [`Collapsible`](/components/collapsible.html) to allow for a show more or show less interaction. Use the `CollapsibleTrigger` component to trigger the collapsible content.

<Demo :code="demo0">
    <Bubble>
      <BubbleContent>
        I checked the registry output and removed the stale route.
      </BubbleContent>
      <BubbleReactions>
        <span>👍</span>
      </BubbleReactions>
    </Bubble>
</Demo>

### Tooltip

Wrap a bubble in a [`Tooltip`](/components/tooltip.html) to reveal metadata on hover, such as when a message was read.

<Demo :code="demo0">
    <Bubble>
      <BubbleContent>
        I checked the registry output and removed the stale route.
      </BubbleContent>
      <BubbleReactions>
        <span>👍</span>
      </BubbleReactions>
    </Bubble>
</Demo>

### Popover

Pair a bubble with a [`Popover`](/components/popover.html) to surface more information on demand, such as the full error message for a failed action.

<Demo :code="demo0">
    <Bubble>
      <BubbleContent>
        I checked the registry output and removed the stale route.
      </BubbleContent>
      <BubbleReactions>
        <span>👍</span>
      </BubbleReactions>
    </Bubble>
</Demo>

## Accessibility

`Bubble` renders the presentational message surface. Keep conversation-level semantics on the surrounding container and follow the guidelines below.

### Labeling Reactions

Reactions render as a row of emoji. A screen reader reads each glyph with no context, and counters like `+8` are announced as "plus eight". Group the row as a single image with a descriptive `aria-label` so it announces once. `role="img"` also hides the individual emoji from assistive tech, so no `aria-hidden` is needed.

When reactions are interactive, render buttons instead and give icon-only buttons an `aria-label`.

### Interactive Bubbles

When a bubble is clickable, pass a real `<button>` or `<a>` through `BubbleContent` with `as-child` so it is focusable and exposes the correct role. `BubbleContent` ships a visible focus ring for interactive elements, and the accessible name comes from the bubble text. No extra label is needed.

### Meaning Beyond Color

Bubble variants signal role and tone with color. Pair them with text, alignment, or icons so meaning is not conveyed by color alone. For a `destructive` bubble, keep the error context in the message text rather than relying on the color treatment.

## API Reference

All Bubble parts render a `<div>` by default. Use `as` to choose another element, or `as-child` to merge the component's attributes and styles onto the single element or component in its default slot.

### Bubble

The root bubble wrapper.

| Prop       | Type                                                                                       | Default     | Description                                                     |
| ---------- | ------------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------- |
| `variant`  | `"default" \| "secondary" \| "muted" \| "tinted" \| "outline" \| "ghost" \| "destructive"` | `"default"` | The bubble visual treatment.                                    |
| `align`    | `"start" \| "end"`                                                                         | `"start"`   | The inline alignment of the bubble.                             |
| `as`       | `string \| Component`                                                                       | `"div"`     | The element or component to render.                             |
| `as-child` | `boolean`                                                                                    | `false`     | Render the default slot as the root and merge props onto it.    |
| `class`    | `string`                                                                                     | -           | Additional classes to apply to the root element.                |

### BubbleContent

The bubble content wrapper.

| Prop       | Type                 | Default | Description                                                  |
| ---------- | -------------------- | ------- | ------------------------------------------------------------ |
| `as`       | `string \| Component` | `"div"` | The element or component to render.                          |
| `as-child` | `boolean`            | `false` | Render the default slot as the root and merge props onto it. |
| `class`    | `string`             | -       | Additional classes to apply to the content element.          |

### BubbleReactions

Displays overlapped reactions for a bubble.

| Prop       | Type                 | Default    | Description                                                  |
| ---------- | -------------------- | ---------- | ------------------------------------------------------------ |
| `side`     | `"top" \| "bottom"` | `"bottom"` | The side of the bubble to anchor the reactions.              |
| `align`    | `"start" \| "end"`  | `"end"`    | The inline alignment of the reactions.                       |
| `as`       | `string \| Component` | `"div"`    | The element or component to render.                          |
| `as-child` | `boolean`            | `false`    | Render the default slot as the root and merge props onto it. |
| `class`    | `string`             | -          | Additional classes to apply to the reaction row.             |

### BubbleGroup

Groups consecutive bubbles from the same sender.

| Prop       | Type                 | Default | Description                                                  |
| ---------- | -------------------- | ------- | ------------------------------------------------------------ |
| `as`       | `string \| Component` | `"div"` | The element or component to render.                          |
| `as-child` | `boolean`            | `false` | Render the default slot as the root and merge props onto it. |
| `class`    | `string`             | -       | Additional classes to apply to the group root.               |
