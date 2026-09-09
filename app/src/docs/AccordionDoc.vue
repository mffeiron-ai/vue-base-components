<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

const openValue = ref('item-a')

const propsRows = [
  { name: 'type', type: `'single' | 'multiple'`, desc: '允许多个面板展开或仅一个（默认 single）' },
  { name: 'collapsible', type: 'boolean', desc: '是否允许收起当前展开的面板（仅 single 生效）' },
  { name: 'defaultValue', type: 'string | string[]', desc: '默认展开的面板 value（multiple 时传数组）' },
  { name: 'modelValue', type: 'string | string[]', desc: '受控值，配合 v-model / @update:modelValue 使用' },
  { name: 'disabled', type: 'boolean', desc: '禁用整个 Accordion（item 也可单独 disabled）' },
  { name: 'orientation', type: `'vertical' | 'horizontal'`, desc: '手风琴方向（默认 vertical）' },
  { name: 'unmountOnHide', type: 'boolean', desc: '收起时是否卸载内容（默认 true）' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Accordion 手风琴</h1>
    <p class="mt-3 text-muted-foreground">垂直堆叠的可折叠区块，点击标题展开 / 收起对应内容。</p>

    <!-- 基础用法 -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">基础用法</h2>
      <p class="mt-2 text-sm text-muted-foreground">单选 + 可折叠，`default-value` 指定默认展开项。</p>
      <div class="mt-4 rounded-xl  p-4">
        <Accordion type="single" collapsible default-value="item-1" class="w-full border-input">
          <AccordionItem value="item-1">
            <AccordionTrigger>什么是 RionStudio？</AccordionTrigger>
            <AccordionContent>一套开箱即用的业务组件与 UI 组件，源码完全属于你。</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>如何安装？</AccordionTrigger>
            <AccordionContent>使用 npx rionstudio add &lt;组件名&gt; 添加单个组件。</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>

    <!-- 多选 -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">多选</h2>
      <p class="mt-2 text-sm text-muted-foreground">`type="multiple"` 可同时展开多个面板，`default-value` 传数组。</p>
      <div class="mt-4 rounded-xl  p-4">
        <Accordion type="multiple" :default-value="['a','b']" class="w-full border-input">
          <AccordionItem value="a">
            <AccordionTrigger>支持多选</AccordionTrigger>
            <AccordionContent>设置 type="multiple" 可同时展开多个面板。</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>默认展开</AccordionTrigger>
            <AccordionContent>通过 default-value 指定默认展开的面板。</AccordionContent>
          </AccordionItem>
          <AccordionItem value="c">
            <AccordionTrigger>第三项</AccordionTrigger>
            <AccordionContent>额外的内容面板。</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>

    <!-- 自定义图标 -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">自定义图标</h2>
      <p class="mt-2 text-sm text-muted-foreground">通过 Trigger 的 `#icon` 插槽替换默认箭头。</p>
      <div class="mt-4 rounded-xl  p-4">
        <Accordion type="single" collapsible class="w-full border-input">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <span>自定义图标</span>
              <template #icon>
                <Plus class="size-4" />
              </template>
            </AccordionTrigger>
            <AccordionContent>通过 #icon 插槽替换默认的向下箭头。</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>第二个面板</AccordionTrigger>
            <AccordionContent>未指定 #icon 的 Trigger 仍显示默认箭头。</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>

    <!-- 禁用状态 -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">禁用状态</h2>
      <p class="mt-2 text-sm text-muted-foreground">在 `AccordionItem` 上设置 `disabled`，单个面板不可交互。</p>
      <div class="mt-4 rounded-xl  p-4">
        <Accordion type="single" collapsible class="w-full border-input">
          <AccordionItem value="item-1" disabled>
            <AccordionTrigger>禁用的面板</AccordionTrigger>
            <AccordionContent>设置 disabled 后不可点击展开。</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>正常的面板</AccordionTrigger>
            <AccordionContent>其余面板不受影响。</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>

    <!-- 受控模式 -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">受控模式</h2>
      <p class="mt-2 text-sm text-muted-foreground">用 `v-model` 双向绑定当前展开值，可从外部控制。</p>
      <div class="mt-4 rounded-xl  p-4">
        <Accordion type="single" collapsible v-model="openValue" class="w-full border-input">
          <AccordionItem value="item-a">
            <AccordionTrigger>面板 A</AccordionTrigger>
            <AccordionContent>当前值：{{ openValue }}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-b">
            <AccordionTrigger>面板 B</AccordionTrigger>
            <AccordionContent>当前值：{{ openValue }}</AccordionContent>
          </AccordionItem>
        </Accordion>
        <div class="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <span>当前展开：{{ openValue }}</span>
          <Button size="sm" variant="outline" @click="openValue = 'item-b'">打开 B</Button>
          <Button size="sm" variant="ghost" @click="openValue = ''">收起</Button>
        </div>
      </div>
    </section>

    <!-- API -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">API / Props</h2>
      <div class="mt-4 overflow-x-auto rounded-lg ">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/40 text-left">
              <th class="px-4 py-2 font-medium">属性</th>
              <th class="px-4 py-2 font-medium">类型</th>
              <th class="px-4 py-2 font-medium">说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in propsRows" :key="row.name" class="border-b border-border last:border-0">
              <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
              <td class="px-4 py-2 font-mono text-muted-foreground">{{ row.type }}</td>
              <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
