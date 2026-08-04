# Button 按钮

触发用户操作的交互元素。

<script setup>
import { Button } from '../../src/components/ui/button'
import { Icon } from '@lucide/vue'
</script>

## 基础用法

<div class="flex flex-wrap gap-3 items-center">
  <Button variant="default">Default</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="destructive">Destructive</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="link">Link</Button>
</div>

```vue
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## 尺寸

<div class="flex flex-wrap gap-3 items-center">
  <Button size="lg">Large</Button>
  <Button size="default">Default</Button>
  <Button size="sm">Small</Button>
</div>

```vue
<Button size="lg">Large</Button>
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
```

## 图标按钮

<div class="flex flex-wrap gap-3 items-center">
  <Button size="icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12l4 6-10 13L2 9Z"/></svg></Button>
  <Button size="icon-sm"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12l4 6-10 13L2 9Z"/></svg></Button>
  <Button size="icon-lg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12l4 6-10 13L2 9Z"/></svg></Button>
</div>

```vue
<Button size="icon"><Diamond /></Button>
<Button size="icon-sm"><Diamond /></Button>
<Button size="icon-lg"><Diamond /></Button>
```

## 禁用状态

<div class="flex flex-wrap gap-3 items-center">
  <Button disabled>Disabled</Button>
  <Button variant="destructive" disabled>Disabled</Button>
  <Button variant="outline" disabled>Disabled</Button>
</div>

```vue
<Button disabled>Disabled</Button>
```

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | `'default'` | 按钮变体 |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon' \| 'icon-sm' \| 'icon-lg'` | `'default'` | 按钮尺寸 |
| `as` | `string` | `'button'` | 渲染为的 HTML 标签 |
| `asChild` | `boolean` | `false` | 作为子元素的插槽组件 |
| `disabled` | `boolean` | `false` | 禁用状态 |
