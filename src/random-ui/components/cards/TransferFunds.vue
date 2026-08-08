.0<script setup lang="ts">
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
import { Field, FieldGroup, FieldLabel } from "@/random-ui/ui-dispatch/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/random-ui/ui-dispatch/input-group"
import { Item, ItemContent } from "@/random-ui/ui-dispatch/item"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/random-ui/ui-dispatch/select"
import { Separator } from "@/random-ui/ui-dispatch/separator"

const FROM_ACCOUNTS = [
  { label: "主账户 (..8402) - $12,450.00", value: "checking" },
  { label: "企业账户 (..7731) - $8,920.00", value: "business" },
]

const TO_ACCOUNTS = [
  { label: "高息储蓄 (..1192) - $42,100.00", value: "savings" },
  { label: "投资账户 (..3349) - $18,200.00", value: "investment" },
]
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>资金转账</CardTitle>
      <CardDescription>
        在您的关联账户之间转移资金。
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
          <FieldLabel for="transfer-amount">
            转账金额
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput id="transfer-amount" default-value="1,200.00" />
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel for="from-account">
            转出账户
          </FieldLabel>
          <Select default-value="checking">
            <SelectTrigger id="from-account" class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="item in FROM_ACCOUNTS"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel for="to-account">
            转入账户
          </FieldLabel>
          <Select default-value="savings">
            <SelectTrigger id="to-account" class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="item in TO_ACCOUNTS"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Item variant="muted" class="flex-col items-stretch">
          <ItemContent class="gap-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">
                预计到账时间
              </span>
              <span class="text-sm font-medium">今天，4月14日</span>
            </div>
            <Separator />
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">
                手续费
              </span>
              <span class="text-sm font-medium tabular-nums">$0.00</span>
            </div>
            <Separator />
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">总金额</span>
              <span class="text-sm font-semibold tabular-nums">
                $1,200.00
              </span>
            </div>
          </ItemContent>
        </Item>
      </FieldGroup>
    </CardContent>
    <CardFooter>
      <Button class="w-full">
        确认转账
      </Button>
    </CardFooter>
  </Card>
</template>

