<script setup lang="ts">
import { ref } from "vue"
import IconPlaceholder from "@/components/IconPlaceholder.vue"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"

const CURRENCIES = [
  { label: "USD - United States Dollar", value: "usd" },
  { label: "EUR - Euro", value: "eur" },
  { label: "GBP - British Pound", value: "gbp" },
  { label: "JPY - Japanese Yen", value: "jpy" },
]

const amount = ref([2500])
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>提款阈值</CardTitle>
      <CardDescription>
        设置触发提款所需的最低余额。
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
          <FieldLabel for="preferred-currency">
            首选货币
          </FieldLabel>
          <Select default-value="usd">
            <SelectTrigger id="preferred-currency" class="w-full">
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
        <Field>
          <div class="flex items-baseline justify-between">
            <FieldLabel for="min-payout">
              最低提款金额
            </FieldLabel>
            <span class="text-2xl font-semibold tabular-nums">
              ${{ amount[0]!.toFixed(2) }}
            </span>
          </div>
          <Slider
            id="min-payout"
            v-model="amount"
            :min="50"
            :max="10000"
            :step="50"
          />
          <div class="flex items-center justify-between">
            <FieldDescription>$50（最低）</FieldDescription>
            <FieldDescription>$10,000（最高）</FieldDescription>
          </div>
        </Field>
        <Field>
          <FieldLabel for="payout-notes">
            备注
          </FieldLabel>
          <Textarea
            id="payout-notes"
            placeholder="为此提款配置添加备注..."
            class="min-h-[100px]"
          />
        </Field>
      </FieldGroup>
    </CardContent>
    <CardFooter>
      <Button class="w-full">
        保存阈值
      </Button>
    </CardFooter>
  </Card>
</template>

