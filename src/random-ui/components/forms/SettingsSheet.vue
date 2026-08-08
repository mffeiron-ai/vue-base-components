<script setup lang="ts">
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
</script>

<template>
  <Sheet>
    <SheetTrigger :as-child="true">
      <Button variant="outline">
        打开设置
      </Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>设置</SheetTitle>
        <SheetDescription>
          在此处修改您的设置。完成后点击保存。
        </SheetDescription>
      </SheetHeader>
      <div class="grid gap-4 py-4">
        <Field>
          <FieldLabel for="name">
            姓名
          </FieldLabel>
          <Input id="name" placeholder="张三" />
        </Field>
        <Field>
          <FieldLabel for="username">
            用户名
          </FieldLabel>
          <Input id="username" placeholder="@zhangsan" />
        </Field>
      </div>
      <SheetFooter>
        <SheetClose :as-child="true">
          <Button variant="outline">
            取消
          </Button>
        </SheetClose>
        <Button type="submit">
          保存更改
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
