<script setup lang="ts">
import { Button } from "@/random-ui/ui-dispatch/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/random-ui/ui-dispatch/card"
import { Checkbox } from "@/random-ui/ui-dispatch/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/random-ui/ui-dispatch/field"
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>贡献和活动</CardTitle>
      <CardDescription>
        管理你的贡献和活动可见性。
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form id="contributions-activity">
        <FieldGroup>
          <FieldSet>
            <FieldLegend class="sr-only">
              贡献和活动
            </FieldLegend>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox id="activity-private-profile" />
                <FieldContent>
                  <FieldLabel for="activity-private-profile">
                    将个人资料设为私密并隐藏活动
                  </FieldLabel>
                  <FieldDescription>
                    启用此功能将从您的 GitHub 个人资料中隐藏您的贡献和活动，以及从关注者、星标、动态、排行榜和发布版本等社交功能中隐藏。
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </CardContent>
    <CardFooter>
      <Button form="contributions-activity">
        保存更改
      </Button>
    </CardFooter>
  </Card>
</template>
