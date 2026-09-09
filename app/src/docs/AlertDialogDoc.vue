<script setup lang="ts">
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Alert Dialog 警告对话框</h1>
    <p class="mt-3 text-muted-foreground">模态对话框，用于需要用户确认的重要操作，打断当前流程。</p>

    <!-- 基础用法 -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">基础用法</h2>
      <p class="mt-2 text-sm text-muted-foreground">由 `AlertDialogTrigger` 触发，包含标题、描述、取消 / 确认按钮。</p>
      <div class="mt-4 rounded-xl border border-border p-4">
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button variant="outline">打开对话框</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认操作</AlertDialogTitle>
              <AlertDialogDescription>此操作不可撤销，确定继续吗？</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction>继续</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>

    <!-- 危险操作 -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">危险操作</h2>
      <p class="mt-2 text-sm text-muted-foreground">给 `AlertDialogAction` 叠加危险样式，表达删除等不可逆操作。</p>
      <div class="mt-4 rounded-xl border border-border p-4">
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button variant="destructive">删除数据</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>删除确认</AlertDialogTitle>
              <AlertDialogDescription>删除后数据无法恢复，确认继续？</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction class="bg-destructive text-white hover:bg-destructive/90">确认删除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
              <td class="px-4 py-2 font-mono text-foreground">open</td>
              <td class="px-4 py-2 font-mono text-muted-foreground">boolean</td>
              <td class="px-4 py-2 text-muted-foreground">受控打开状态（配合 @update:open）</td>
            </tr>
            <tr class="border-b border-border last:border-0">
              <td class="px-4 py-2 font-mono text-foreground">defaultOpen</td>
              <td class="px-4 py-2 font-mono text-muted-foreground">boolean</td>
              <td class="px-4 py-2 text-muted-foreground">初始是否打开</td>
            </tr>
            <tr class="border-b border-border last:border-0">
              <td class="px-4 py-2 font-mono text-foreground">modal</td>
              <td class="px-4 py-2 font-mono text-muted-foreground">boolean</td>
              <td class="px-4 py-2 text-muted-foreground">是否模态（聚焦锁定，默认 true）</td>
            </tr>
            <tr class="border-b border-border last:border-0">
              <td class="px-4 py-2 font-mono text-foreground">as / asChild</td>
              <td class="px-4 py-2 font-mono text-muted-foreground">string / boolean</td>
              <td class="px-4 py-2 text-muted-foreground">渲染的元素标签或作为子元素渲染（reka-ui）</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
