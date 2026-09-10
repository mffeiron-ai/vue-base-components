<script setup lang="ts">
import { ArrowRight, Plus, Trash2 } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const variants = [
  { variant: 'default', label: 'Default' },
  { variant: 'secondary', label: 'Secondary' },
  { variant: 'destructive', label: 'Destructive' },
  { variant: 'outline', label: 'Outline' },
  { variant: 'ghost', label: 'Ghost' },
  { variant: 'link', label: 'Link' },
] as const

const sizes = [
  { size: 'sm', label: 'Small' },
  { size: 'default', label: 'Default' },
  { size: 'lg', label: 'Large' },
] as const

const iconSizes = [
  { size: 'icon-sm', label: 'icon-sm' },
  { size: 'icon', label: 'icon' },
  { size: 'icon-lg', label: 'icon-lg' },
] as const

const rows = [
  { name: 'variant', type: "'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'", def: "'default'", desc: '视觉变体' },
  { name: 'size', type: "'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'", def: "'default'", desc: '尺寸；icon 系列为正方形纯图标按钮' },
  { name: 'as-child', type: 'boolean', def: 'false', desc: '不渲染 <button>，把按钮样式合并到唯一子元素上（<a> / RouterLink）' },
  { name: 'as', type: 'string', def: "'button'", desc: '指定渲染的标签，如 as="a"' },
  { name: 'class', type: 'string', def: '—', desc: '追加自定义类，经 tailwind-merge 去重' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Button 按钮</h1>
    <p class="mt-3 text-muted-foreground">触发操作的基础控件，含 6 种变体、6 种尺寸，支持图标、加载态与 as-child 链接合并。</p>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">基础用法</CardTitle>
        <CardDescription>不传任何 props 时是主题主色实底按钮。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </CardContent>
    </Card>

    <!-- 变体 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">变体</CardTitle>
        <CardDescription>`variant` 共 6 种：主操作、次级操作、危险操作、描边、幽灵、链接。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-3">
          <Button v-for="v in variants" :key="v.variant" :variant="v.variant">{{ v.label }}</Button>
        </div>
      </CardContent>
    </Card>

    <!-- 尺寸 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">尺寸</CardTitle>
        <CardDescription>常规 3 档 `sm` / `default` / `lg`，以及 3 档正方形纯图标尺寸。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <Button v-for="s in sizes" :key="s.size" :size="s.size" variant="outline">{{ s.label }}</Button>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Button v-for="s in iconSizes" :key="s.size" :size="s.size" variant="outline" :aria-label="s.label">
            <Plus />
          </Button>
          <span class="text-sm text-muted-foreground">icon-sm / icon / icon-lg</span>
        </div>
      </CardContent>
    </Card>

    <!-- 带图标 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">带图标</CardTitle>
        <CardDescription>图标与文字的间距由 `gap` 统一控制，不需要给图标加 margin；图标未写 `size-*` 时自动收敛为 `size-4`。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-3">
          <Button>
            <Plus /> 新建
          </Button>
          <Button variant="secondary">
            下一步 <ArrowRight />
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 /> 删除
          </Button>
          <Button variant="ghost" size="icon" aria-label="新建">
            <Plus />
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 加载态 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">加载态</CardTitle>
        <CardDescription>用 `Spinner` + `disabled` 表示操作进行中，避免重复提交。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-3">
          <Button disabled>
            <Spinner /> 提交中…
          </Button>
          <Button variant="outline" disabled>
            <Spinner /> 加载
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 圆角 / 禁用 / 校验 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">圆角、禁用与校验错误</CardTitle>
        <CardDescription>
          风格预设会给按钮锁定 `rounded-md`（其特异性高于普通工具类），所以改成胶囊要写 `rounded-full!` 显式覆盖；
          `disabled` 半透明且不可点击；表单校验失败时给按钮加 `aria-invalid`。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <Button class="rounded-full!">胶囊按钮</Button>
          <Button variant="outline" size="icon" class="rounded-full!" aria-label="新增">
            <Plus />
          </Button>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>Disabled</Button>
          <Button variant="outline" disabled>Disabled</Button>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Button variant="outline" aria-invalid="true">校验失败</Button>
        </div>
      </CardContent>
    </Card>

    <!-- as-child -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">as-child（让链接看起来像按钮）</CardTitle>
        <CardDescription>加 `as-child` 后不再渲染 `&lt;button&gt;`，而是把按钮样式合并到唯一子元素上 —— 保留链接的语义与中键/右键行为。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-3">
          <Button as-child>
            <RouterLink to="/components/bubble">路由跳转</RouterLink>
          </Button>
          <Button variant="outline" as-child>
            <a href="https://github.com/mffeiron-ai/vue-base-components" target="_blank" rel="noreferrer">
              GitHub
              <ArrowRight />
            </a>
          </Button>
          <Button variant="link" as-child>
            <a href="#as-child">了解更多</a>
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 按钮组 -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle class="text-xl font-semibold">按钮组</CardTitle>
        <CardDescription>相邻操作可用 `ButtonGroup` 拼接，自动去掉接缝处的圆角与边框。</CardDescription>
      </CardHeader>
      <CardContent>
        <ButtonGroup>
          <Button variant="outline">复制</Button>
          <Button variant="outline">粘贴</Button>
          <Button variant="outline">剪切</Button>
        </ButtonGroup>
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
                <th class="px-4 py-2 font-medium">属性</th>
                <th class="px-4 py-2 font-medium">类型</th>
                <th class="px-4 py-2 font-medium">默认值</th>
                <th class="px-4 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.name" class="border-b border-border last:border-0">
                <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm text-muted-foreground">
          其余原生属性（如 `type` / `disabled` / `aria-label`）会直接透传到渲染出的元素；
          纯图标按钮务必补 `aria-label`。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
