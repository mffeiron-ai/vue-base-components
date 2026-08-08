<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from "@/random-ui/ui-dispatch/alert"
import { Button } from "@/random-ui/ui-dispatch/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/random-ui/ui-dispatch/card"
import { Field, FieldGroup, FieldLabel } from "@/random-ui/ui-dispatch/field"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/random-ui/ui-dispatch/toggle-group"

const timeSlots = ["上午 9:00", "上午 10:30", "上午 11:00", "下午 1:30"]
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>预约门诊</CardTitle>
      <CardDescription>陈山医生 · 心脏科</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel>2026年3月18日可预约时间</FieldLabel>
          <ToggleGroup :spacing="2" default-value="slot-0">
            <ToggleGroupItem
              v-for="(time, index) in timeSlots"
              :key="time"
              :value="`slot-${index}`"
            >
              {{ time }}
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>
      </FieldGroup>
      <Alert>
        <AlertTitle>初诊患者？</AlertTitle>
        <AlertDescription>请提前 15 分钟到达。</AlertDescription>
      </Alert>
    </CardContent>
    <CardFooter>
      <Button class="w-full">
        确认预约
      </Button>
    </CardFooter>
  </Card>
</template>
