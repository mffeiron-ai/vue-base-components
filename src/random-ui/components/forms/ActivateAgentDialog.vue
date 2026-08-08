<script setup lang="ts">
import IconPlaceholder from "@/components/IconPlaceholder.vue"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

const agentFeatures = [
  {
    id: "code-reviews",
    title: "Code reviews",
    description: "with full codebase context to catch",
    highlight: "hard-to-find",
    suffix: "bugs.",
  },
  {
    id: "code-suggestions",
    title: "Code suggestions",
    description: "validated in sandboxes before you merge.",
  },
  {
    id: "root-cause",
    title: "Root-cause analysis",
    description: "for production issues with deployment context.",
    badge: true,
  },
]
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>使用 Vercel Agent 更快、更安全地交付</CardTitle>
      <CardDescription>
        您的使用需遵守 Vercel 的
        <a href="#">公共测试协议</a> 和
        <a href="#">AI 产品条款</a>。
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-4">
      <ItemGroup class="gap-0">
        <Item size="xs" class="px-0">
          <ItemMedia variant="icon" class="self-start">
            <IconPlaceholder
              lucide="CheckCircle2Icon"
              tabler="IconCircleCheckFilled"
              hugeicons="CheckmarkCircle02Icon"
              phosphor="CheckCircleIcon"
              remixicon="RiCheckboxCircleLine"
              class="size-5 fill-primary text-primary-foreground"
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle class="inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground">
              <strong>代码审查</strong>，具有完整的代码库上下文，可发现
              <strong>难以查找</strong>的缺陷。
            </ItemTitle>
          </ItemContent>
        </Item>
        <Item size="xs" class="px-0">
          <ItemMedia variant="icon" class="self-start">
            <IconPlaceholder
              lucide="CheckCircle2Icon"
              tabler="IconCircleCheckFilled"
              hugeicons="CheckmarkCircle02Icon"
              phosphor="CheckCircleIcon"
              remixicon="RiCheckboxCircleLine"
              class="size-5 fill-primary text-primary-foreground"
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle class="inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground">
              <strong>代码建议</strong>，在合并之前在沙盒中验证。
            </ItemTitle>
          </ItemContent>
        </Item>
        <Item size="xs" class="px-0">
          <ItemMedia variant="icon" class="self-start">
            <IconPlaceholder
              lucide="CheckCircle2Icon"
              tabler="IconCircleCheckFilled"
              hugeicons="CheckmarkCircle02Icon"
              phosphor="CheckCircleIcon"
              remixicon="RiCheckboxCircleLine"
              class="size-5 fill-primary text-primary-foreground"
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle class="inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground">
              <strong>根本原因分析</strong>，针对具有部署上下文的生产问题。
              <Badge variant="secondary" class="bg-chart-1 text-chart-5">
                需要可观测性 Plus
              </Badge>
            </ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
      <Alert>
        <AlertDescription>
          Pro 团队在激活后 2 周内可获得 $100 Vercel Agent 试用额度。
        </AlertDescription>
      </Alert>
    </CardContent>
    <CardFooter class="justify-end gap-2">
      <Button variant="outline">
        取消
      </Button>
      <Button>以 $100 额度开启</Button>
    </CardFooter>
  </Card>
</template>
