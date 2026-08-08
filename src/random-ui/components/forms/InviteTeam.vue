<script setup lang="ts">
import IconPlaceholder from "@/components/IconPlaceholder.vue"
import { Button } from "@/random-ui/ui-dispatch/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/random-ui/ui-dispatch/card"
import { Field, FieldLabel } from "@/random-ui/ui-dispatch/field"
import { Input } from "@/random-ui/ui-dispatch/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/random-ui/ui-dispatch/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/random-ui/ui-dispatch/select"
import { Separator } from "@/random-ui/ui-dispatch/separator"

const invites = [
  { email: "alex@example.com", role: "editor" },
  { email: "sam@example.com", role: "viewer" },
]
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>邀请团队成员</CardTitle>
      <CardDescription>向工作区添加成员</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <div class="flex flex-col gap-3">
        <div
          v-for="invite in invites"
          :key="invite.email"
          class="flex items-center gap-2"
        >
          <Input :model-value="invite.email" class="flex-1" />
          <Select
            :default-value="invite.role"
          >
            <SelectTrigger class="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                <SelectItem value="admin">
                  管理员
                </SelectItem>
                <SelectItem value="editor">
                  编辑者
                </SelectItem>
                <SelectItem value="viewer">
                  查看者
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button variant="outline">
        <IconPlaceholder
          lucide="PlusIcon"
          tabler="IconPlus"
          hugeicons="PlusSignIcon"
          phosphor="PlusIcon"
          remixicon="RiAddLine"
          data-icon="inline-start"
        />
        再添加一个
      </Button>
      <Separator />
      <Field>
        <FieldLabel for="invite-link">
          或分享邀请链接
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="invite-link"
            model-value="https://app.co/invite/x8f2k"
            readonly
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Copy link">
              <IconPlaceholder
                lucide="CopyIcon"
                tabler="IconCopy"
                hugeicons="Copy01Icon"
                phosphor="CopyIcon"
                remixicon="RiFileCopyLine"
              />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </CardContent>
    <CardFooter>
      <Button class="w-full">
        发送邀请
      </Button>
    </CardFooter>
  </Card>
</template>
