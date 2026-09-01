# Accordion 手风琴

垂直堆叠的一组交互标题,点击可展开/收起对应内容,遵循 WAI-ARIA 手风琴设计模式。

<script setup>
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from '../../src/components/ui/accordion'

const demo0 = `import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>`

const demoProduct = `<Accordion type="single" collapsible class="w-full">
  <AccordionItem value="item-1">
    <AccordionTrigger>Product Information</AccordionTrigger>
    <AccordionContent>
      Our flagship product combines cutting-edge technology with sleek design.
      Built with premium materials, it offers unparalleled performance and reliability.
      Key features include advanced processing capabilities and an intuitive interface.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Shipping Details</AccordionTrigger>
    <AccordionContent>
      Orders are processed within 1-3 business days and shipped with tracking.
      Express shipping is available at checkout for faster delivery.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>Return Policy</AccordionTrigger>
    <AccordionContent>
      We offer a 30-day return policy on all unused items in their original packaging.
      Refunds are issued to the original payment method within 5-7 business days.
    </AccordionContent>
  </AccordionItem>
</Accordion>`

const demoDefault = `<Accordion type="single" collapsible default-value="item-2">
  <AccordionItem value="item-1">
    <AccordionTrigger>Item 1</AccordionTrigger>
    <AccordionContent>
      Content for item 1.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Item 2</AccordionTrigger>
    <AccordionContent>
      This item is expanded by default via \`default-value\`.
    </AccordionContent>
  </AccordionItem>
</Accordion>`

const demoCollapsible = `<Accordion type="single">
  <AccordionItem value="item-1">
    <AccordionTrigger>Without collapsible</AccordionTrigger>
    <AccordionContent>
      When \`type="single"\` without \`collapsible\`, at least one item stays open.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Item 2</AccordionTrigger>
    <AccordionContent>
      Content for item 2.
    </AccordionContent>
  </AccordionItem>
</Accordion>`

const demoMultiple = `<Accordion type="multiple">
  <AccordionItem value="item-1">
    <AccordionTrigger>Item 1</AccordionTrigger>
    <AccordionContent>
      Use \`type="multiple"\` to open several items at once.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Item 2</AccordionTrigger>
    <AccordionContent>
      Both items can be expanded simultaneously.
    </AccordionContent>
  </AccordionItem>
</Accordion>`
</script>

## 基础用法

<Demo :code="demoProduct">
  <Accordion type="single" collapsible class="w-full">
    <AccordionItem value="item-1">
      <AccordionTrigger>Product Information</AccordionTrigger>
      <AccordionContent>
        Our flagship product combines cutting-edge technology with sleek design.
        Built with premium materials, it offers unparalleled performance and reliability.
        Key features include advanced processing capabilities and an intuitive interface.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger>Shipping Details</AccordionTrigger>
      <AccordionContent>
        Orders are processed within 1-3 business days and shipped with tracking.
        Express shipping is available at checkout for faster delivery.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-3">
      <AccordionTrigger>Return Policy</AccordionTrigger>
      <AccordionContent>
        We offer a 30-day return policy on all unused items in their original packaging.
        Refunds are issued to the original payment method within 5-7 business days.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</Demo>

## 使用方式

手风琴由 `Accordion`(根)、`AccordionItem`(一项)、`AccordionTrigger`(触发头)和 `AccordionContent`(内容)组成。每个 `AccordionItem` 都需要一个唯一的 `value`。

<Demo :code="demo0">
  <Accordion type="single" collapsible class="w-full">
    <AccordionItem value="item-1">
      <AccordionTrigger>Is it accessible?</AccordionTrigger>
      <AccordionContent>
        Yes. It adheres to the WAI-ARIA design pattern.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</Demo>

## 默认展开

通过 `default-value` 指定默认展开的项。

<Demo :code="demoDefault">
  <Accordion type="single" collapsible default-value="item-2" class="w-full">
    <AccordionItem value="item-1">
      <AccordionTrigger>Item 1</AccordionTrigger>
      <AccordionContent>
        Content for item 1.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger>Item 2</AccordionTrigger>
      <AccordionContent>
        This item is expanded by default via `default-value`.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</Demo>

## 允许全部折叠

当 `type="single"` 且不加 `collapsible` 时,至少保持一项展开;加上 `collapsible` 后,可点击已展开项将其收起。

<Demo :code="demoCollapsible">
  <Accordion type="single" class="w-full">
    <AccordionItem value="item-1">
      <AccordionTrigger>Without collapsible</AccordionTrigger>
      <AccordionContent>
        When `type="single"` without `collapsible`, at least one item stays open.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger>Item 2</AccordionTrigger>
      <AccordionContent>
        Content for item 2.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</Demo>

## 多项展开

设置 `type="multiple"` 可同时展开多项。

<Demo :code="demoMultiple">
  <Accordion type="multiple" class="w-full">
    <AccordionItem value="item-1">
      <AccordionTrigger>Item 1</AccordionTrigger>
      <AccordionContent>
        Use `type="multiple"` to open several items at once.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger>Item 2</AccordionTrigger>
      <AccordionContent>
        Both items can be expanded simultaneously.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</Demo>

## API

### Accordion(根)

包含所有手风琴部件。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'single' \| 'multiple'` | — | 单次或多次展开。会覆盖由 `modelValue` / `defaultValue` 推断的类型 |
| `collapsible` | `boolean` | `false` | 当 `type="single"` 时,允许点击已展开项将其关闭。`type="multiple"` 时无效果 |
| `defaultValue` | `string \| string[]` | — | 默认展开的值。受控时用 `modelValue` |
| `modelValue` | `string \| string[]` | — | 受控的值,可配合 `v-model` 绑定 |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | 手风琴方向 |
| `disabled` | `boolean` | `false` | 禁止与手风琴及其所有项交互 |
| `unmountOnHide` | `boolean` | `true` | 关闭时是否卸载内容元素 |
| `dir` | `'ltr' \| 'rtl'` | — | 阅读方向 |
| `as` | `AsTag` | `'div'` | 渲染的元素/组件,可被 `asChild` 覆盖 |
| `asChild` | `boolean` | — | 将默认渲染元素替换为传入的子元素 |

### AccordionItem

包含一个可折叠部分。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 该项的唯一值(必填) |
| `disabled` | `boolean` | — | 是否禁止与该项交互 |
| `unmountOnHide` | `boolean` | — | 关闭时是否卸载内容 |
| `as` / `asChild` | `AsTag` / `boolean` | — | 渲染行为,同上 |

### AccordionTrigger

切换其关联项的展开/收起状态,内部已包裹 `AccordionHeader` 并提供默认箭头图标(可通过 `#icon` 插槽自定义)。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` / `asChild` | `AsTag` / `boolean` | — | 渲染行为 |

### AccordionContent

包含某一项的折叠内容。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `forceMount` | `boolean` | — | 需要更多控制动画时强制挂载 |
| `unmountOnHide` | `boolean` | — | 关闭时是否卸载内容 |
| `as` / `asChild` | `AsTag` / `boolean` | — | 渲染行为 |

## 无障碍

遵循 [Accordion WAI-ARIA 设计模式](https://www.w3.org/WAI/ARIA/apg/patterns/accordion)。

| 按键 | 行为 |
| --- | --- |
| `Space` / `Enter` | 展开当前聚焦的折叠项 |
| `Tab` / `Shift + Tab` | 移动到下一个/上一个可聚焦元素 |
| `ArrowDown` / `ArrowUp` | 垂直方向移动焦点到下一个/上一个 Trigger |
| `ArrowRight` / `ArrowLeft` | 水平方向移动焦点 |
| `Home` / `End` | 移动到第一个/最后一个 Trigger |
