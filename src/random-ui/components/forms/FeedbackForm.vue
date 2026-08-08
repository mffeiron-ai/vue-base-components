<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
</script>

<template>
  <Card>
    <CardContent>
      <form id="feedback-form">
        <FieldGroup>
          <Field>
            <FieldLabel for="topic">
              主题
            </FieldLabel>
            <NativeSelect id="topic">
              <NativeSelectOption value="">
                选择主题
              </NativeSelectOption>
              <NativeSelectOption value="ai">
                人工智能
              </NativeSelectOption>
              <NativeSelectOption value="accounts-and-access-controls">
                账户与访问权限
              </NativeSelectOption>
              <NativeSelectOption value="billing">
                账单与计费
              </NativeSelectOption>
              <NativeSelectOption value="cdn">
                CDN（防火墙、缓存）
              </NativeSelectOption>
              <NativeSelectOption value="ci-cd">
                CI/CD（构建、部署、环境变量）
              </NativeSelectOption>
              <NativeSelectOption value="dashboard-interface">
                控制台界面（导航、UI 问题）
              </NativeSelectOption>
              <NativeSelectOption value="domains">
                域名
              </NativeSelectOption>
              <NativeSelectOption value="frameworks">
                框架
              </NativeSelectOption>
              <NativeSelectOption value="marketplace-and-integrations">
                市场与集成
              </NativeSelectOption>
              <NativeSelectOption value="observability">
                可观测性（监控、日志）
              </NativeSelectOption>
              <NativeSelectOption value="storage">
                存储
              </NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel for="feedback">
              反馈内容
            </FieldLabel>
            <Textarea
              id="feedback"
              placeholder="您的反馈有助于我们改进..."
            />
          </Field>
        </FieldGroup>
      </form>
    </CardContent>
    <CardFooter>
      <Button type="submit" form="feedback-form">
        提交
      </Button>
    </CardFooter>
  </Card>
</template>
