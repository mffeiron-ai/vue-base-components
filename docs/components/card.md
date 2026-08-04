# Card 卡片

用于内容分组的容器组件。

<script setup>
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../src/components/ui/card'
import { Button } from '../../src/components/ui/button'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
</script>

## 基础用法

<Card class="max-w-sm">
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>这是卡片的描述信息，用于简单说明卡片内容。</CardDescription>
  </CardHeader>
  <CardContent>
    <p>卡片的主要内容区域。</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline">取消</Button>
    <Button class="ml-auto">保存</Button>
  </CardFooter>
</Card>

```vue
<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>描述信息</CardDescription>
  </CardHeader>
  <CardContent>
    <p>卡片内容</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline">取消</Button>
    <Button class="ml-auto">保存</Button>
  </CardFooter>
</Card>
```

## 带表单

<Card class="max-w-md">
  <CardHeader>
    <CardTitle>创建项目</CardTitle>
    <CardDescription>填写以下信息创建新项目</CardDescription>
  </CardHeader>
  <CardContent class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label>项目名称</Label>
      <Input placeholder="输入项目名称" />
    </div>
    <div class="flex flex-col gap-2">
      <Label>描述</Label>
      <Input placeholder="输入项目描述" />
    </div>
  </CardContent>
  <CardFooter>
    <Button variant="outline">取消</Button>
    <Button class="ml-auto">创建</Button>
  </CardFooter>
</Card>

## API

| 组件 | 说明 |
|------|------|
| `Card` | 卡片容器 |
| `CardHeader` | 卡片头部 |
| `CardTitle` | 卡片标题 |
| `CardDescription` | 卡片描述 |
| `CardContent` | 卡片内容 |
| `CardFooter` | 卡片底部 |
