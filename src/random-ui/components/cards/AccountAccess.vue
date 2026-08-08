<script setup lang="ts">
import IconPlaceholder from "@/components/IconPlaceholder.vue"
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
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>账户访问</CardTitle>
      <CardDescription>
        更新您的凭据或重新进行身份验证。
      </CardDescription>
    </CardHeader>
    <CardContent>
      <FieldGroup>
        <Field>
          <FieldLabel for="email-address">
            电子邮件
          </FieldLabel>
          <Input
            id="email-address"
            type="email"
            default-value="artist@studio.inc"
          />
        </Field>
        <Field>
          <div class="flex items-center justify-between">
            <FieldLabel for="current-password">
              当前密码
            </FieldLabel>
            <a
              href="#"
              class="text-xs font-medium tracking-wider text-muted-foreground uppercase hover:text-foreground"
            >
              忘记密码？
            </a>
          </div>
          <Input
            id="current-password"
            type="password"
            default-value="password123"
          />
        </Field>
      </FieldGroup>
    </CardContent>
    <CardFooter class="flex-col gap-4">
      <Button class="w-full">
        <IconPlaceholder
          lucide="LockKeyholeIcon"
          tabler="IconLock"
          hugeicons="SquareLock02Icon"
          phosphor="LockKeyIcon"
          remixicon="RiLockLine"
        />
        更新安全设置
      </Button>
      <Item variant="muted" as="a" href="#">
        <ItemMedia variant="icon">
          <IconPlaceholder
            lucide="AlertCircleIcon"
            tabler="IconAlertCircle"
            hugeicons="AlertCircleIcon"
            phosphor="WarningCircleIcon"
            remixicon="RiErrorWarningLine"
            class="text-destructive"
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>危险操作</ItemTitle>
          <ItemDescription class="line-clamp-1">
            归档账户并移除目录
          </ItemDescription>
        </ItemContent>
        <IconPlaceholder
          lucide="ArrowRightIcon"
          tabler="IconArrowRight"
          hugeicons="ArrowRight01Icon"
          phosphor="ArrowRightIcon"
          remixicon="RiArrowRightLine"
          class="size-4"
        />
      </Item>
    </CardFooter>
  </Card>
</template>

