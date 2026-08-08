<script setup lang="ts">
import { ref } from "vue"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
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

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const bio = ref("")
const role = ref("")
const agreeToTerms = ref(false)
</script>

<template>
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>创建账户</CardTitle>
      <CardDescription>
        输入您的信息以创建账户。
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form>
        <FieldGroup>
          <div class="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel for="first-name">
                名
              </FieldLabel>
              <Input
                id="first-name"
                v-model="firstName"
                placeholder="张"
              />
            </Field>
            <Field>
              <FieldLabel for="last-name">
                姓
              </FieldLabel>
              <Input
                id="last-name"
                v-model="lastName"
                placeholder="三"
              />
            </Field>
          </div>
          <Field>
            <FieldLabel for="email">
              邮箱
            </FieldLabel>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="zhangsan@example.com"
            />
          </Field>
          <Field>
            <FieldLabel for="role">
              职位
            </FieldLabel>
            <Select v-model="role">
              <SelectTrigger id="role">
                <SelectValue placeholder="请选择职位" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="developer">
                    开发者
                  </SelectItem>
                  <SelectItem value="designer">
                    设计师
                  </SelectItem>
                  <SelectItem value="manager">
                    管理者
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel for="bio">
              个人简介
            </FieldLabel>
            <Textarea
              id="bio"
              v-model="bio"
              placeholder="介绍一下自己..."
            />
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="terms" v-model:checked="agreeToTerms" />
            <FieldLabel for="terms">
              我同意用户协议和条款
            </FieldLabel>
          </Field>
        </FieldGroup>
      </form>
    </CardContent>
    <CardFooter class="flex justify-between">
      <Button variant="outline">
        取消
      </Button>
      <Button type="submit">
        创建账户
      </Button>
    </CardFooter>
  </Card>
</template>
