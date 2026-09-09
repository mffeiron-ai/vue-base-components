<script setup lang="ts">
import { CircleAlert, CircleX } from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Alert 提示</h1>
    <p class="mt-3 text-muted-foreground">页面内固定位置的提示条，用于展示重要信息或错误状态。</p>

    <!-- 基础用法 -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">基础用法</h2>
      <p class="mt-2 text-sm text-muted-foreground">默认 `default` 变体，用于普通信息提示。</p>
      <div class="mt-4 rounded-xl border border-border p-4">
        <Alert>
          <AlertTitle>提示</AlertTitle>
          <AlertDescription>这是一条普通的提示信息，用于说明当前状态。</AlertDescription>
        </Alert>
      </div>
    </section>

    <!-- 带图标 -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">带图标</h2>
      <p class="mt-2 text-sm text-muted-foreground">在 Alert 内直接放 &lt;svg&gt; 图标，会自动切到两列布局。</p>
      <div class="mt-4 rounded-xl border border-border p-4">
        <Alert>
          <CircleAlert class="size-4" />
          <AlertTitle>注意事项</AlertTitle>
          <AlertDescription>这是一条带图标的提示，图标位于左侧，内容右移。</AlertDescription>
        </Alert>
      </div>
    </section>

    <!-- 危险状态 -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">危险状态</h2>
      <p class="mt-2 text-sm text-muted-foreground">用 `variant="destructive"` 表达错误 / 危险操作。</p>
      <div class="mt-4 rounded-xl border border-border p-4">
        <Alert variant="destructive">
          <CircleX class="size-4" />
          <AlertTitle>操作失败</AlertTitle>
          <AlertDescription>删除失败，请稍后重试。</AlertDescription>
        </Alert>
      </div>
    </section>

    <!-- API -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">API / Props</h2>
      <div class="mt-4 overflow-x-auto rounded-lg border border-border">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/40 text-left">
              <th class="px-4 py-2 font-medium">属性</th>
              <th class="px-4 py-2 font-medium">类型</th>
              <th class="px-4 py-2 font-medium">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-border last:border-0">
              <td class="px-4 py-2 font-mono text-foreground">variant</td>
              <td class="px-4 py-2 font-mono text-muted-foreground">'default' | 'destructive'</td>
              <td class="px-4 py-2 text-muted-foreground">提示样式（默认 default）</td>
            </tr>
            <tr class="border-b border-border last:border-0">
              <td class="px-4 py-2 font-mono text-foreground">class</td>
              <td class="px-4 py-2 font-mono text-muted-foreground">string</td>
              <td class="px-4 py-2 text-muted-foreground">追加 / 覆盖类名</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
