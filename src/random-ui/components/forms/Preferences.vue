<script setup lang="ts">
import IconPlaceholder from "@/components/IconPlaceholder.vue"
import { Button } from "@/random-ui/ui-dispatch/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/random-ui/ui-dispatch/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/random-ui/ui-dispatch/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/random-ui/ui-dispatch/select"
import { Switch } from "@/random-ui/ui-dispatch/switch"

const CURRENCIES = [
  { label: "USD - United States Dollar", value: "usd" },
  { label: "EUR - Euro", value: "eur" },
  { label: "GBP - British Pound", value: "gbp" },
  { label: "JPY - Japanese Yen", value: "jpy" },
]
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>偏好设置</CardTitle>
      <CardDescription>
        管理您的账户设置和通知。
      </CardDescription>
      <CardAction>
        <Button variant="ghost" size="icon-sm" class="bg-muted">
          <IconPlaceholder
            lucide="XIcon"
            tabler="IconX"
            hugeicons="Cancel01Icon"
            phosphor="XIcon"
            remixicon="RiCloseLine"
          />
        </Button>
      </CardAction>
    </CardHeader>
    <CardContent>
      <FieldGroup>
        <Field>
          <FieldLabel for="default-currency">
            默认货币
          </FieldLabel>
          <Select default-value="usd">
            <SelectTrigger id="default-currency" class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="item in CURRENCIES"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <FieldSeparator class="-my-4" />
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel for="public-statistics">
              公开统计数据
            </FieldLabel>
            <FieldDescription>
              允许其他人查看您的总播放次数和收听记录
            </FieldDescription>
          </FieldContent>
          <Switch id="public-statistics" :default-checked="true" />
        </Field>
        <FieldSeparator class="-my-4" />
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel for="email-notifications">
              邮件通知
            </FieldLabel>
            <FieldDescription>
              每月版税报告和发行更新
            </FieldDescription>
          </FieldContent>
          <Switch id="email-notifications" :default-checked="true" />
        </Field>
      </FieldGroup>
    </CardContent>
    <CardFooter>
      <Button variant="outline">
        重置
      </Button>
      <Button class="ml-auto">
        保存偏好
      </Button>
    </CardFooter>
  </Card>
</template>

