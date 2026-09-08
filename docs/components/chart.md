# Chart 图表

<script setup lang="ts">
import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/vue'
import { ChartContainer, ChartCrosshair, ChartTooltip, ChartTooltipContent, componentToString } from '../../src/components/ui/chart'
import type { ChartConfig } from '../../src/components/ui/chart'

const demo0 = `import { VisGroupedBar, VisXYContainer } from '@unovis/vue'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

  <ChartContainer :config="chartConfig">
    <VisXYContainer :data="data">
      <VisGroupedBar :x="(d) => d.month" :y="(d) => d.value" />
      <ChartTooltip :template="componentToString(chartConfig, ChartTooltipContent)" />
    </VisXYContainer>
  </ChartContainer>`

const demo1 = `import type { ChartConfig } from '@/components/ui/chart'
import { VisGroupedBar, VisXYContainer } from '@unovis/vue'
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart'

const chartData = [
  { date: new Date("2024-01-01"), desktop: 186, mobile: 80 },
  { date: new Date("2024-02-01"), desktop: 305, mobile: 200 },
  { date: new Date("2024-03-01"), desktop: 237, mobile: 120 },
];
type Data = (typeof chartData)[number]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig
  <ChartContainer :config="chartConfig" class="min-h-[400px] w-full">
    <VisXYContainer :data="chartData">
      <VisGroupedBar
        :x="(d: Data) => d.date"
        :y="[(d: Data) => d.desktop, (d: Data) => d.mobile]"
        :color="[chartConfig.desktop.color, chartConfig.mobile.color]"
      />
      <ChartTooltip />
      <ChartCrosshair
        :template="
          componentToString(chartConfig, ChartTooltipContent, {
            labelFormatter(d) {
              return new Date(d).toLocaleDateString('en-US', {
                month: 'long',
              });
            },
          })
        "
        :color="[chartConfig.desktop.color, chartConfig.mobile.color]"
      />
    </VisXYContainer>
  </ChartContainer>`

const demo2 = `  import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/vue'
  `

const demo3 = `    <VisAxis
      type="x"
      :x="(d: Data) => d.date"
      :tick-line="false"
      :domain-line="false"
      :grid-line="false"
      :tick-format="(d: number) => {
        const date = new Date(d)
        return date.toLocaleDateString('en-US', {
          month: 'short',
        })
      }"
      :tick-values="chartData.map(d => d.date)"
    />
    <VisAxis
      type="y"
      :tick-format="(d: number) => ''"
      :tick-line="false"
      :domain-line="false"
      :grid-line="true"
    />
  `

const demo4 = `  <ChartTooltip />

  <ChartCrosshair :template="componentToString(chartConfig, ChartTooltipContent)" />
  `

const demo5 = `import type { ChartConfig } from '@/components/ui/chart'
import { Monitor } from '@lucide/vue'

const chartConfig = {
  desktop: {
    label: 'Desktop',
    icon: Monitor,
    // A color like 'hsl(220, 98%, 61%)' or 'var(--color-name)'
    color: 'var(--chart-1)',
    // OR a theme object with 'light' and 'dark' keys
    theme: {
      light: 'var(--chart-1)',
      dark: 'var(--chart-2)',
    },
  },
} satisfies ChartConfig`

const demo6 = `<VisGroupedBar
  :x="(d) => d.month"
  :y="(d) => d.desktop"
  color="var(--color-desktop)"
/>`

const demo7 = `  <ChartTooltip />
  <ChartCrosshair
    :template="componentToString(chartConfig, ChartTooltipContent)"
  />`

const demo8 = `  <ChartCrosshair
    :template="componentToString(chartConfig, ChartTooltipContent, {
      labelKey: 'visitors',
      nameKey: 'browser',
    })"
  />`
</script>

<Demo :code="demo0">
  <!-- TODO: 动态示例需补充 script 逻辑后放入 -->
</Demo>

Introducing **Charts**. A collection of chart components that you can copy and paste into your apps.

Charts are designed to look great out of the box. They work well with the other components and are fully customizable to fit your project.

[Browse the Charts Library](/charts).

## Component

We use [Unovis](https://unovis.dev/) under the hood.

We designed the `chart` component with composition in mind. **You build your charts using Unovis components and only bring in custom components, such as `ChartTooltip`, when and where you need it**.

We do not wrap Unovis. This means you're not locked into an abstraction. When a new Unovis version is released, you can follow the official upgrade path to upgrade your charts.

**The components are yours**.

## Usage

## Your First Chart

Let's build your first chart. We'll build a bar chart, add a grid, axis, tooltip and legend.

  ::step
  Start by defining your data

  The following data represents the number of desktop and mobile users for each month.

  ```ts showLineNumbers
  const chartData = [
    { month: 'January', desktop: 186, mobile: 80 },
    { month: 'February', desktop: 305, mobile: 200 },
    { month: 'March', desktop: 237, mobile: 120 },
    { month: 'April', desktop: 73, mobile: 190 },
    { month: 'May', desktop: 209, mobile: 130 },
    { month: 'June', desktop: 214, mobile: 140 },
  ]
  ```

  ::step
  Define your chart config

  The chart config holds configuration for the chart. This is where you place human-readable strings, such as labels, icons and color tokens for theming.

  ```ts showLineNumbers
  import type { ChartConfig } from '@/components/ui/chart'

  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'var(--chart-1)',
    },
    mobile: {
      label: 'Mobile',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig
  ```

  ::step
  Build your chart

  You can now build your chart using Unovis components.

  ::component-source{name="ChartBarDemo" title="components/ExampleChart.vue"}

  ::component-preview
  ---
  name: ChartBarDemo
  class: '[&_.preview]:min-h-[250px] [&_.preview]:p-4'
  ---

:::

### Add an Axis

To add axes to the chart, we use the `VisAxis` component.

  ::step
  Import the `VisAxis` component

  ::step
  Add the `VisAxis` components to your chart

  ::component-preview
  ---
  name: ChartBarDemoAxis
  class: '[&_.preview]:min-h-[250px] [&_.preview]:p-4'
  ---

:::

### Add Tooltip

To add a tooltip, we'll use the custom `ChartTooltip` and `ChartTooltipContent` components from `chart`.

  ::step
  Import the `ChartTooltip` and `ChartTooltipContent` components

  ```ts
  import { ChartTooltip, ChartTooltipContent, componentToString } from '@/components/ui/chart'
  ```

  ::step
  Add the components to your chart

  ::component-preview
  ---
  name: ChartBarDemoTooltip
  class: '[&_.preview]:min-h-[250px] [&_.preview]:p-4'
  ---

  Hover to see the tooltips. Easy, right? Two components, and we've got a beautiful tooltip.

:::

### Add Legend

We'll do the same for the legend. We'll use the `ChartLegend` and `ChartLegendContent` components from `chart`.

  ::step
  Import the `ChartLegendContent` components.

  ```ts
  import { ChartLegendContent } from '@/components/ui/chart'
  ```

  ::step
  Add the components to your chart.

  ```vue
  <template>
    <ChartContainer :config="chartConfig" class="min-h-[200px] w-full">
      <VisXYContainer :data="chartData" />
      <ChartLegendContent />
    </ChartContainer>
  </template>
  ```

  ::component-preview
  ---
  name: ChartBarDemoLegend
  class: '[&_.preview]:min-h-[250px] [&_.preview]:p-4'
  ---

:::

Done. You've built your first chart! What's next?

- [Themes and Colors](/components/chart.html)
- [Tooltip](/components/chart.html)
- [Legend](/components/chart.html)

## Chart Config

The chart config is where you define the labels, icons and colors for a chart.

It is intentionally decoupled from chart data.

This allows you to share config and color tokens between charts. It can also works independently for cases where your data or color tokens live remotely or in a different format.

## Theming

Charts has built-in support for theming. You can use css variables (recommended) or color values in any color format, such as hex, hsl or oklch.

### CSS Variables

  ::step
  Define your colors in your css file

  ```css showLineNumbers
  @layer base {
    :root {
      --chart-1: oklch(0.646 0.222 41.116);
      --chart-2: oklch(0.6 0.118 184.704);
    }

    .dark {
      --chart-1: oklch(0.488 0.243 264.376);
      --chart-2: oklch(0.696 0.17 162.48);
    }
  }
  ```

  ::step
  Add the color to your `chartConfig`

  ```ts showLineNumbers {4,8}
  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'var(--chart-1)',
    },
    mobile: {
      label: 'Mobile',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig
  ```

:::

### hex, hsl or oklch

You can also define your colors directly in the chart config. Use the color format you prefer.

```ts showLineNumbers
const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: '#2563eb',
  },
} satisfies ChartConfig
```

### Using Colors

To use the theme colors in your chart, reference the colors using the format `var(--color-KEY)`.

#### Components

#### Chart Data

```ts showLineNumbers
const chartData = [
  { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
]
```

## Tooltip

A chart tooltip contains a label, name, indicator and value. You can use a combination of these to customize your tooltip.

You can turn on/off any of these using the `hideLabel`, `hideIndicator` props and customize the indicator style using the `indicator` prop.

Use `labelKey` and `nameKey` to use a custom key for the tooltip label and name.

Chart comes with the `ChartTooltip` and `ChartTooltipContent` components. You can use these two components to add custom tooltips to your chart.

```ts showLineNumbers
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
```

### Props

Use the following props to customize the tooltip.

| Prop            | Type                     | Description                                  |
| :-------------- | :----------------------- | :------------------------------------------- |
| `labelKey`      | string                   | The config or data key to use for the label. |
| `nameKey`       | string                   | The config or data key to use for the name.  |
| `indicator`     | `dot` `line` or `dashed` | The indicator style for the tooltip.         |
| `hideLabel`     | boolean                  | Whether to hide the label.                   |
| `hideIndicator` | boolean                  | Whether to hide the indicator.               |

### Colors

Colors are automatically referenced from the chart config.

### Custom

To use a custom key for tooltip label and names, use the `labelKey` and `nameKey` props.

```ts showLineNumbers
const chartData = [
  { browser: 'chrome', visitors: 187, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
]

const chartConfig = {
  visitors: {
    label: 'Total Visitors',
  },
  chrome: {
    label: 'Chrome',
    color: 'var(--chart-1)',
  },
  safari: {
    label: 'Safari',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig
```

This will use `Total Visitors` for label and `Chrome` and `Safari` for the tooltip names.

## Legend

You can use the custom `<ChartLegendContent>` components to add a legend to your chart.

```ts
import { ChartLegendContent } from '@/components/ui/chart'
```

```vue
<template>
  <ChartLegendContent />
</template>
```

### Colors

Colors are automatically referenced from the chart config.

### Custom

To use a custom key for legend names, use the `nameKey` prop.

```tsx showLineNumbers /browser/
const chartData = [
  { browser: 'chrome', visitors: 187, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
]

const chartConfig = {
  chrome: {
    label: 'Chrome',
    color: 'hsl(var(--chart-1))',
  },
  safari: {
    label: 'Safari',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig
```

```vue
<template>
  <ChartLegendContent name-key="browser" />
</template>
```

This will use `Chrome` and `Safari` for the legend names.
