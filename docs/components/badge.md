# Badge 徽章

用于状态标记、计数、标签展示。

<script setup>
import { Badge } from '../../src/components/ui/badge'
</script>

## 基础用法

<div class="flex flex-wrap gap-3 items-center">
  <Badge variant="default">Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="destructive">Destructive</Badge>
  <Badge variant="outline">Outline</Badge>
</div>

```vue
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
</```

## 用法示例

### 状态标记

<div class="flex flex-wrap gap-3 items-center">
  <Badge variant="default">已完成</Badge>
  <Badge variant="secondary">进行中</Badge>
  <Badge variant="destructive">已取消</Badge>
  <Badge variant="outline">草稿</Badge>
</div>

### 数字徽章

<div class="flex flex-wrap gap-3 items-center">
  <Badge variant="default">99+</Badge>
  <Badge variant="secondary">5</Badge>
  <Badge variant="destructive">NEW</Badge>
</div>

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'default' \| 'secondary' \| 'destructive' \| 'outline'` | `'default'` | 变体 |
