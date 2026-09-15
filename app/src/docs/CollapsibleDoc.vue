<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ChevronsUpDown, StarIcon } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'

// 基础示例：非受控（默认收起）
const repos = ['@radix-ui/primitives', '@radix-ui/colors', '@radix-ui/icons']

// 受控示例
const controlled = ref(false)

// FAQ：多个独立折叠区，各自维护开合状态（第一个默认展开）
const faqs = [
  { q: 'Collapsible 和 Accordion 有什么区别？', a: 'Collapsible 是「单个」可展开区域，开合状态由你自己管；Accordion 管一组，还能控制「同时只展开一个」。', open: true },
  { q: '内容能放表单吗？', a: '可以。收起时内容会被卸载，所以表单值不会保留 —— 需要保留就用 force-mount。', open: false },
  { q: '动画时长怎么调？', a: '默认自带 0.2s 高度动画，传 class="duration-300" 改时长，class="animate-none!" 关掉。', open: false },
]

const rows = [
  { name: 'open', type: 'boolean', def: 'false', desc: '受控开合状态，支持 v-model:open' },
  { name: 'defaultOpen', type: 'boolean', def: 'false', desc: '非受控时的初始状态' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用：触发器不可点，也不会响应键盘；会在触发器上加 data-disabled' },
  { name: 'class', type: 'string', def: '—', desc: '追加自定义类（Collapsible 自身不渲染额外结构，一般不需要）' },
]

const triggerRows = [
  { name: 'as-child', type: 'boolean', def: 'false', desc: '不渲染自带 button，而是把触发行为与 aria 合并到唯一子元素上（常用于 Button / 整块标题）' },
  { name: 'data-state', type: "'open' | 'closed'", def: '—', desc: '开合状态；图标写 group-data-[state=open]:rotate-180 就能翻转（在该元素上加 group 类）' },
  { name: 'aria-expanded', type: 'boolean', def: '—', desc: '无障碍：屏幕阅读器据此播报展开 / 收起' },
  { name: '插槽参数', type: '{ open }', def: '—', desc: '默认插槽透出 open，可按状态换图标或文案' },
]

const contentRows = [
  { name: 'forceMount', type: 'boolean', def: 'false', desc: '收起时也保留内容在 DOM 里（表单、图表等需要保留状态的场景）' },
  { name: 'class', type: 'string', def: '—', desc: '内容区默认带高度动画与 overflow-hidden，可用它覆盖时长或关掉动画' },
  { name: 'CSS 变量', type: '--reka-collapsible-content-height', def: '—', desc: '内容实际高度（reka 写入），animate-collapsible-down/up 就是拿它算的' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Collapsible 折叠面板</h1>
    <p class="mt-3 text-muted-foreground">
      基于 <code>reka-ui</code> 的 <code>CollapsibleRoot</code>：一个可以展开 / 收起的内容区。
      自带 <code>aria-expanded</code> 语义与键盘支持（触发器的原生按钮行为），
      <code>CollapsibleContent</code> 默认带 0.2s 的高度动画。
    </p>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          三段式：<code>Collapsible</code>（状态）→ <code>CollapsibleTrigger</code>（触发器）→
          <code>CollapsibleContent</code>（内容）。看右上角箭头：展开时会翻转 180°。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible v-slot="{ open }" class="w-full max-w-md space-y-2">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-semibold">已收藏的仓库（{{ repos.length }}）</p>
            <CollapsibleTrigger as-child>
              <Button variant="ghost" size="icon-sm" class="group" :aria-label="open ? '收起' : '展开'">
                <ChevronsUpDown class="size-4" />
              </Button>
            </CollapsibleTrigger>
          </div>

          <div class="rounded-md border border-input px-4 py-3 font-mono text-sm">
            {{ repos[0] }}
          </div>

          <CollapsibleContent class="space-y-2">
            <div
              v-for="r in repos.slice(1)"
              :key="r"
              class="rounded-md border border-input px-4 py-3 font-mono text-sm"
            >
              {{ r }}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>

    <!-- 整行可点 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">整块标题当触发器</h2>
        <CardDescription>
          给 <code>CollapsibleTrigger</code> 传 <code>as-child</code>，就能把触发行为合并到自己写的元素上
          —— 这里用整条标题行当按钮，箭头靠
          <code>group-data-[state=open]:rotate-180</code> 翻转（所以承载元素要加个
          <code>group</code> 类）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible class="w-full max-w-md rounded-lg border border-input">
          <CollapsibleTrigger as-child>
            <button
              type="button"
              class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
            >
              <span class="text-sm font-medium">配送与退换货说明</span>
              <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Separator />
            <div class="space-y-2 px-4 py-3 text-sm text-muted-foreground">
              <p>· 工作日 15:00 前下单当天发出，节假日顺延。</p>
              <p>· 未拆封商品支持 7 天无理由退换。</p>
              <p>· 生鲜类目不支持无理由退换，质量问题可申请全额退款。</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>

    <!-- 受控 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控与外部操作</h2>
        <CardDescription>
          用 <code>v-model:open</code> 受控：外面的按钮 / 业务逻辑也能开合它，
          并且可以顺便展示更多信息（比如这里按状态切换按钮文案）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" @click="controlled = !controlled">
            {{ controlled ? '收起详情' : '展开详情' }}
          </Button>
          <Badge variant="secondary">open: {{ controlled }}</Badge>
        </div>
        <Collapsible v-model:open="controlled" class="w-full max-w-md rounded-lg border border-input">
          <CollapsibleTrigger as-child>
            <button
              type="button"
              class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span class="text-sm font-medium">月度用量明细</span>
              <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Separator />
            <dl class="grid gap-2 px-4 py-3 text-sm">
              <div class="flex justify-between">
                <dt class="text-muted-foreground">输入 tokens</dt>
                <dd class="font-mono tabular-nums">1,284,320</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted-foreground">输出 tokens</dt>
                <dd class="font-mono tabular-nums">318,904</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-muted-foreground">缓存命中</dt>
                <dd class="font-mono tabular-nums">62.4%</dd>
              </div>
            </dl>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>

    <!-- 默认展开 / 禁用 / 动画 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">默认展开、禁用与动画</h2>
        <CardDescription>
          <code>default-open</code> 让初始就是展开的；<code>disabled</code> 时触发器不可点并带
          <code>data-disabled</code>；动画默认 0.2s，用
          <code>class="duration-300"</code> 改时长、<code>class="animate-none!"</code> 关掉。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Collapsible :default-open="true" class="w-full max-w-md rounded-lg border border-input">
          <CollapsibleTrigger as-child>
            <button type="button" class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
              <span class="text-sm font-medium">默认展开（default-open）</span>
              <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Separator />
            <p class="px-4 py-3 text-sm text-muted-foreground">初始就是打开状态。</p>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible disabled class="w-full max-w-md rounded-lg border border-input">
          <CollapsibleTrigger as-child>
            <button type="button" class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50" disabled>
              <span class="text-sm font-medium">禁用（disabled）</span>
              <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Separator />
            <p class="px-4 py-3 text-sm text-muted-foreground">点不开。</p>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible class="w-full max-w-md rounded-lg border border-input">
          <CollapsibleTrigger as-child>
            <button type="button" class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
              <span class="text-sm font-medium">慢速动画（duration-500）</span>
              <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent class="duration-500">
            <Separator />
            <p class="px-4 py-3 text-sm text-muted-foreground">覆盖默认的 0.2s，换成 0.5s。</p>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>

    <!-- FAQ -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">FAQ 列表（多个独立折叠区）</h2>
        <CardDescription>
          每个 <code>Collapsible</code> 都是独立状态，所以放多个就能做 FAQ / 设置分组。
          如果要「同时只展开一个」，用 <code>Accordion</code>（那是另一套组件）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="w-full max-w-xl space-y-2">
          <Collapsible
            v-for="f in faqs"
            :key="f.q"
            v-slot="{ open }"
            :default-open="f.open"
            class="rounded-lg border border-input"
          >
            <CollapsibleTrigger as-child>
              <button type="button" class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                <span class="text-sm font-medium">{{ f.q }}</span>
                <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Separator />
              <p class="px-4 py-3 text-sm text-muted-foreground">
                {{ f.a }}
                <span class="sr-only">{{ open ? '（已展开）' : '（已收起）' }}</span>
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription>
          三个组件都是 reka-ui 的薄封装，props 直接透传；本库额外给 <code>CollapsibleContent</code>
          加了默认高度动画。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <p class="mb-2 text-sm font-medium">Collapsible</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">属性</th>
                  <th class="px-4 py-2 font-medium">类型</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in rows" :key="r.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ r.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ r.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-2 text-sm text-muted-foreground">
            事件：<code>update:open</code>（配合 <code>v-model:open</code>）；
            默认插槽透出 <code>{{ '{ open }' }}</code>。
          </p>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">CollapsibleTrigger</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">属性</th>
                  <th class="px-4 py-2 font-medium">类型</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in triggerRows" :key="r.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ r.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ r.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">CollapsibleContent</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">属性</th>
                  <th class="px-4 py-2 font-medium">类型</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in contentRows" :key="r.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ r.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ r.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <StarIcon class="mt-0.5 size-4 shrink-0" />
          <p>
            高度动画的 keyframes 在 <code>src/styles/utilities.css</code>（<code>animate-collapsible-down/up</code>），
            使用方需要在样式入口 import 这个文件才有动画；没引入时依然能正常开合，只是没有过渡。
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
