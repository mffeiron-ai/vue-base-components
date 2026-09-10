<script setup lang="ts">
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from '@/components/ui/bubble'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const variants = [
  { variant: 'default', label: 'default' },
  { variant: 'secondary', label: 'secondary' },
  { variant: 'muted', label: 'muted' },
  { variant: 'tinted', label: 'tinted' },
  { variant: 'outline', label: 'outline' },
  { variant: 'ghost', label: 'ghost' },
  { variant: 'destructive', label: 'destructive' },
] as const

const rows = [
  { name: 'Bubble', props: 'variant, align, as / asChild, class', desc: '根容器；variant 7 种，align 控制 start / end 对齐' },
  { name: 'BubbleContent', props: 'as / asChild, class', desc: '内容区；as-child 可把样式合并到 button / a 上' },
  { name: 'BubbleGroup', props: 'as / asChild, class', desc: '把同一发送者的多条气泡纵向分组' },
  { name: 'BubbleReactions', props: 'side, align, as / asChild, class', desc: '气泡角上的反应条；side=top/bottom，align=start/end' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Bubble 气泡</h1>
    <p class="mt-3 text-muted-foreground">对话场景中的消息气泡，支持变体、左右对齐、分组与反应。</p>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">基础用法</CardTitle>
        <CardDescription>由 `Bubble` + `BubbleContent` 组成，需要反应时再加 `BubbleReactions`。</CardDescription>
      </CardHeader>
      <CardContent>
        <Bubble>
          <BubbleContent>
            我检查了 registry 的输出，把失效的路由删掉了。
          </BubbleContent>
          <BubbleReactions>
            <span>👍</span>
          </BubbleReactions>
        </Bubble>
      </CardContent>
    </Card>

    <!-- 变体 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">变体</CardTitle>
        <CardDescription>用 `variant` 切换 7 种视觉风格；气泡宽度随内容自适应，最大为容器宽度的 80%（`ghost` 不受限）。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col items-start gap-3">
          <Bubble v-for="v in variants" :key="v.variant" :variant="v.variant">
            <BubbleContent>{{ v.label }}</BubbleContent>
          </Bubble>
        </div>
      </CardContent>
    </Card>

    <!-- 对齐 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">对齐</CardTitle>
        <CardDescription>用 `align="start"`（对方）/ `align="end"`（自己）控制左右。需放在弹性纵向容器里。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-3">
          <Bubble variant="secondary" align="start">
            <BubbleContent>这个接口的返回结构我看下。</BubbleContent>
          </Bubble>
          <Bubble align="end">
            <BubbleContent>好的，字段说明我稍后发你。</BubbleContent>
          </Bubble>
          <Bubble variant="secondary" align="start">
            <BubbleContent>收到，谢谢！</BubbleContent>
          </Bubble>
        </div>
      </CardContent>
    </Card>

    <!-- 分组 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">分组</CardTitle>
        <CardDescription>同一发送者的多条气泡用 `BubbleGroup` 包起来；`align` 要设在各 `Bubble` 上。</CardDescription>
      </CardHeader>
      <CardContent>
        <BubbleGroup>
          <Bubble variant="secondary">
            <BubbleContent>第一件事是补上缺失的依赖。</BubbleContent>
          </Bubble>
          <Bubble variant="secondary">
            <BubbleContent>第二件事是修掉那个坏引用。</BubbleContent>
          </Bubble>
        </BubbleGroup>
      </CardContent>
    </Card>

    <!-- 反应 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">反应</CardTitle>
        <CardDescription>反应条会与气泡边缘重叠，所以行与行之间要留出更大间距。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-10">
          <Bubble align="start">
            <BubbleContent>右下角（默认 side="bottom" align="end"）</BubbleContent>
            <BubbleReactions role="img" aria-label="反应：赞、火、还有 8 个">
              <span>👍</span>
              <span>🔥</span>
              <span>+8</span>
            </BubbleReactions>
          </Bubble>

          <Bubble align="start">
            <BubbleContent>右上角（side="top" align="end"）</BubbleContent>
            <BubbleReactions side="top" align="end">
              <span>🎉</span>
              <span>+3</span>
            </BubbleReactions>
          </Bubble>
        </div>
      </CardContent>
    </Card>

    <!-- 链接 / 按钮 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">链接 / 按钮</CardTitle>
        <CardDescription>用 `as-child` 把气泡样式合并到真实的可交互元素上（自带焦点环）。</CardDescription>
      </CardHeader>
      <CardContent>
        <Bubble variant="muted">
          <BubbleContent as-child>
            <button type="button">我忘记密码了</button>
          </BubbleContent>
        </Bubble>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">API / Props</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="overflow-x-auto rounded-lg">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/40 text-left">
                <th class="px-4 py-2 font-medium">组件</th>
                <th class="px-4 py-2 font-medium">属性</th>
                <th class="px-4 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.name" class="border-b border-border last:border-0">
                <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                <td class="px-4 py-2 font-mono text-muted-foreground">{{ row.props }}</td>
                <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm text-muted-foreground">
          `variant` 可选值：`default` / `secondary` / `muted` / `tinted` / `outline` / `ghost` / `destructive`。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
