<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/random-ui/ui-dispatch/card"
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>平均成本法</CardTitle>
      <CardDescription>
        一种长期财富积累策略。
      </CardDescription>
    </CardHeader>
    <CardContent>
      <CardDescription class="mt-3 text-sm leading-relaxed">
        <a
          href="#"
          class="underline underline-offset-4 hover:text-primary"
        >
          随着时间的推移
        </a>
        ，这平稳了您的投资平均成本。当价格下跌时，固定金额会购买更多股份。当价格上升时，您购买的股份较少。与波动期间的一次性投资相比，结果是更低的平均每股成本。
      </CardDescription>
    </CardContent>
  </Card>
</template>

