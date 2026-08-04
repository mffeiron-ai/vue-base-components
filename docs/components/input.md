# Input 输入框

基础文本输入组件。

<script setup>
import { Input } from '../../src/components/ui/input'
</script>

## 基础用法

<div class="flex flex-col gap-4 max-w-sm">
  <Input placeholder="请输入内容..." />
  <Input type="email" placeholder="Email" />
  <Input type="password" placeholder="Password" />
</div>

```vue
<Input placeholder="请输入内容..." />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

## 禁用 & 只读

<div class="flex flex-col gap-4 max-w-sm">
  <Input disabled placeholder="禁用状态" />
  <Input readonly value="只读内容" />
</div>

```vue
<Input disabled placeholder="禁用状态" />
<Input readonly value="只读内容" />
```

## 带图标

<div class="flex flex-col gap-4 max-w-sm">
  <div class="relative">
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <Input class="pl-9" placeholder="搜索..." />
  </div>
</div>

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `string` | `'text'` | 输入类型 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
| `placeholder` | `string` | — | 占位文本 |
| `modelValue` | `string` | — | 绑定值 |
