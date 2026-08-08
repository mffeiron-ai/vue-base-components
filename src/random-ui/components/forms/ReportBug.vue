<script setup lang="ts">
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>提交错误报告</CardTitle>
      <CardDescription>帮助我们更快地修复问题。</CardDescription>
    </CardHeader>
    <CardContent>
      <FieldGroup>
        <Field>
          <FieldLabel for="bug-title">
            标题
          </FieldLabel>
          <Input
            id="bug-title"
            placeholder="简要描述问题"
          />
        </Field>
        <div class="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel for="bug-severity">
              严重程度
            </FieldLabel>
            <Select default-value="medium">
              <SelectTrigger id="bug-severity" class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="critical">
                    紧急
                  </SelectItem>
                  <SelectItem value="high">
                    高
                  </SelectItem>
                  <SelectItem value="medium">
                    中
                  </SelectItem>
                  <SelectItem value="low">
                    低
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel for="bug-component">
              模块
            </FieldLabel>
            <Select default-value="dashboard">
              <SelectTrigger id="bug-component" class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="dashboard">
                    控制台
                  </SelectItem>
                  <SelectItem value="auth">
                    认证
                  </SelectItem>
                  <SelectItem value="api">
                    API
                  </SelectItem>
                  <SelectItem value="billing">
                    账单
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field>
          <FieldLabel for="bug-steps">
            复现步骤
          </FieldLabel>
          <Textarea
            id="bug-steps"
            placeholder="1. 进入...&#10;2. 点击...&#10;3. 观察..."
            class="min-h-24 resize-none"
          />
        </Field>
      </FieldGroup>
    </CardContent>
    <CardFooter>
      <Field orientation="horizontal" class="justify-end">
        <Button variant="outline">
          附加文件
        </Button>
        <Button>提交错误</Button>
      </Field>
    </CardFooter>
  </Card>
</template>
