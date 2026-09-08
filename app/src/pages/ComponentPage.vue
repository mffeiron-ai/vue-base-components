<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import type { ComponentDoc, ComponentVariant } from '../docs/registry'
import Demo from '../components/Demo.vue'

const route = useRoute()
const doc = computed<ComponentDoc>(() => route.meta.doc as ComponentDoc)

// 组件名 → 实际组件：后续可从 registry 自动加载，这里先手动映射
const componentMap: Record<string, unknown> = {
  button: Button,
}

const mainComponent = computed(() => componentMap[doc.value.name])

const basicCode = computed(() => `<Button variant="outline">Button</Button>
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>`)

function renderVariantLabel(v: ComponentVariant, value: string) {
  return v.name === 'variant' ? (value === 'default' ? 'Default' : value.charAt(0).toUpperCase() + value.slice(1)) : value
}
</script>

<template>
  <div v-if="doc" class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">{{ doc.title }}</h1>
    <p class="mt-3 text-muted-foreground">{{ doc.description }}</p>

    <!-- 导入 -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">导入</h2>
      <Demo :code="doc.importCode" title="vue" />
    </section>

    <!-- 变体演示 -->
    <section v-for="v in doc.variants" :key="v.name" class="mt-8">
      <h2 class="text-xl font-semibold">{{ v.name }}</h2>
      <div class="mt-4 flex flex-wrap gap-3 items-center">
        <component
          :is="mainComponent"
          v-for="value in v.values"
          :key="value"
          v-bind="{ [v.name]: value }"
          class="cursor-default"
        >
          {{ renderVariantLabel(v, value) }}
        </component>
      </div>
    </section>

    <!-- 基础用法 Demo -->
    <section class="mt-8">
      <h2 class="text-xl font-semibold">基础用法</h2>
      <Demo :code="basicCode">
        <Button variant="outline">Outline</Button>
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
      </Demo>
    </section>

    <!-- Props API -->
    <section v-if="doc.props?.length" class="mt-8">
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
            <tr v-for="p in doc.props" :key="p.name" class="border-b border-border last:border-0">
              <td class="px-4 py-2 font-mono text-foreground">{{ p.name }}</td>
              <td class="px-4 py-2 font-mono text-muted-foreground">{{ p.type }}</td>
              <td class="px-4 py-2 text-muted-foreground">{{ p.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
