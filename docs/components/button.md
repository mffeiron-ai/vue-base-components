# Button 按钮

触发用户操作的交互元素。

<script setup>
import { ArrowUpIcon } from 'lucide-vue-next'
import { Button } from '../../src/components/ui/button'

const basicCode = `<Button variant="outline">
  Button
</Button>
<Button variant="outline" size="icon" aria-label="Submit">
  <ArrowUpIcon />
</Button>`

const variantsCode = `<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`

const sizeCode = `<Button size="lg">Large</Button>
<Button size="default">Default</Button>
<Button size="sm">Small</Button>`
</script>

## 基础用法

<Demo :code="basicCode">
  <div class="flex flex-wrap items-center gap-2 md:flex-row">
    <Button variant="outline">
      Button
    </Button>
    <Button variant="outline" size="icon" aria-label="Submit">
      <ArrowUpIcon />
    </Button>
  </div>
</Demo>

## 变体

<Demo :code="variantsCode">
  <div class="flex flex-wrap gap-3 items-center">
    <Button variant="default">Default</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>
</Demo>

## 尺寸

<Demo :code="sizeCode">
  <div class="flex flex-wrap gap-3 items-center">
    <Button size="lg">Large</Button>
    <Button size="default">Default</Button>
    <Button size="sm">Small</Button>
  </div>
</Demo>

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | `'default'` | 按钮变体 |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon' \| 'icon-sm' \| 'icon-lg'` | `'default'` | 按钮尺寸 |
| `as` | `string` | `'button'` | 渲染为的 HTML 标签 |
| `disabled` | `boolean` | `false` | 禁用状态 |
