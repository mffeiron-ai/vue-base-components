# Dialog 对话框

模态弹窗组件，用于需要用户确认或输入的场景。

<script setup>
import { ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '../../src/components/ui/dialog'
import { Button } from '../../src/components/ui/button'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'

const open = ref(false)
</script>

## 基础用法

<Dialog>
  <DialogTrigger>
    <Button variant="outline">打开对话框</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>确认操作</DialogTitle>
      <DialogDescription>
        此操作不可撤销。确定要继续吗？
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose>
        <Button variant="outline">取消</Button>
      </DialogClose>
      <Button>确认</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

```vue
<Dialog>
  <DialogTrigger>
    <Button variant="outline">打开对话框</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>确认操作</DialogTitle>
      <DialogDescription>
        此操作不可撤销。确定要继续吗？
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose><Button variant="outline">取消</Button></DialogClose>
      <Button>确认</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## 带表单

<Dialog>
  <DialogTrigger>
    <Button variant="outline">编辑资料</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>编辑资料</DialogTitle>
      <DialogDescription>
        修改您的个人信息。完成后点击保存。
      </DialogDescription>
    </DialogHeader>
    <div class="flex flex-col gap-4 py-2">
      <div class="flex flex-col gap-2">
        <Label>用户名</Label>
        <Input placeholder="请输入用户名" />
      </div>
      <div class="flex flex-col gap-2">
        <Label>邮箱</Label>
        <Input type="email" placeholder="请输入邮箱" />
      </div>
    </div>
    <DialogFooter>
      <DialogClose>
        <Button variant="outline">取消</Button>
      </DialogClose>
      <Button>保存</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

## API

### Dialog (Root)

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | `boolean` | — | 受控打开状态 |
| `defaultOpen` | `boolean` | `false` | 默认打开状态 |
| `modal` | `boolean` | `true` | 是否模态 |

### DialogContent

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `class` | `string` | — | 自定义样式类 |
