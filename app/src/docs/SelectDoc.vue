<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Clock, Globe, Star } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/* ── 基础用法 ── */
const timezones = [
  { value: 'utc', label: 'UTC 协调世界时' },
  { value: 'sh', label: '(GMT+8) 北京 / 上海' },
  { value: 'tyo', label: '(GMT+9) 东京' },
  { value: 'lon', label: '(GMT+0) 伦敦' },
  { value: 'nyc', label: '(GMT-5) 纽约' },
]
const basic = ref<string>()
const basicLabel = computed(() => timezones.find(t => t.value === basic.value)?.label ?? '还没选')

/* ── 分组 ── */
const grouped = ref<string>('apple')

/* ── 尺寸与禁用 ── */
const sized = ref<string>('standard')
const disabledDemo = ref<string>('locked')

/* ── 自定义样式 ── */
const favorite = ref<string>('vue')
const frameworks = [
  { value: 'vue', label: 'Vue', hint: '渐进式框架', icon: Globe },
  { value: 'react', label: 'React', hint: 'UI 库', icon: Star },
  { value: 'svelte', label: 'Svelte', hint: '编译期框架', icon: Clock },
]

/* ── 长列表 ── */
const longList = ref<string>()
const cities = Array.from({ length: 24 }, (_, i) => ({
  value: `city-${i + 1}`,
  label: `城市 ${String(i + 1).padStart(2, '0')}`,
}))

/* ── 表单 ── */
const formValue = ref<string>('monthly')
const submitted = ref('')
function onSubmit(e: Event) {
  const data = new FormData(e.target as HTMLFormElement)
  submitted.value = [...data.entries()].map(([k, v]) => `${k}=${v}`).join(' & ') || '(空)'
}

/* ── API 表 ── */
const rootRows = [
  { name: 'v-model', type: 'any', def: '—', desc: '当前选中值（<code>modelValue</code>）。选项的 <code>value</code> 是什么类型这里就是什么类型' },
  { name: 'defaultValue', type: 'any', def: '—', desc: '非受控时的初始值；单选组件用这个就不需要 <code>v-model</code> 了' },
  { name: 'open / defaultOpen', type: 'boolean', def: '—', desc: '受控 / 非受控地控制下拉面板开合（<code>v-model:open</code>）' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '整个选择器禁用：触发器点不开、也不能聚焦' },
  { name: 'name', type: 'string', def: '—', desc: '给组件挂一个隐藏的原生 <code>select</code>，值会随表单提交一起发出去（<code>FormData</code> 里能拿到）' },
  { name: 'required', type: 'boolean', def: 'false', desc: '配合 <code>name</code> 使用，参与原生表单必填校验' },
  { name: 'dir', type: "'ltr' | 'rtl'", def: '继承页面', desc: '阅读方向；影响面板里 <code>inline-start/end</code> 那组滑入动画与 ArrowLeft/Right 的行为' },
]

const triggerRows = [
  { name: 'size', type: "'sm' | 'default'", def: "'default'", desc: '本库扩展：高度 32px / 36px，对应 <code>data-[size=sm]</code> 与 <code>data-[size=default]</code>' },
  { name: 'placeholder', type: '—', def: '—', desc: '写在 <code>&lt;SelectValue placeholder="…" /&gt;</code> 上，没选中时显示；此时触发器带 <code>data-placeholder</code>，文字自动变浅' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '只禁用触发器（一般直接用根组件的 <code>disabled</code>）' },
  { name: 'class', type: 'string', def: '—', desc: '宽度基本都靠它（如 <code>w-[220px]</code>）；默认是 <code>w-fit</code>' },
]

const partRows = [
  { name: 'SelectContent', desc: '下拉面板本体（Portal 到 body）。<code>position</code> 默认 <code>popper</code>（跟随触发器宽度）；要限定高度就给它 <code>max-h-56</code> 之类' },
  { name: 'SelectValue', desc: '把当前选中项的文本渲染到触发器里；不选时显示 <code>placeholder</code>' },
  { name: 'SelectItem', desc: '<code>value</code> 必填。默认插槽是显示文本（选中后 <code>SelectValue</code> 会把它原样搬过去，<b>里面放的图标也会一起搬</b>）；可选 <code>disabled</code>、<code>text-value</code>（指定用于搜索/回显的纯文本）' },
  { name: 'SelectItemText', desc: '包住选项文本的容器，通常不用手写（<code>SelectItem</code> 内部已用了）' },
  { name: 'SelectGroup / SelectLabel', desc: '分组：<code>SelectGroup</code> 是滚动对齐的容器，<code>SelectLabel</code> 是组标题（不可选中）' },
  { name: 'SelectSeparator', desc: '组之间的一根 1px 分隔线' },
  { name: 'SelectScrollUpButton / DownButton', desc: '内容超出面板高度时自动出现的上下滚动按钮，默认就是一对 Chevron，可换图标' },
  { name: 'indicator-icon 插槽', desc: '<code>SelectItem</code> 上的具名插槽：换成自定义勾选图标（默认是 <code>Check</code>）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Select 选择器</h1>
    <p class="mt-3 text-muted-foreground">
      从一组选项里挑一个：<code>Select</code> 给值，<code>SelectTrigger</code> + <code>SelectValue</code> 画触发器，
      <code>SelectContent</code> 里摆平铺的 <code>SelectItem</code>。<br />
      面板是 Portal 出来的浮层，会自动翻转避免被视口裁掉；键盘、屏幕阅读器、表单提交都已经处理好。
    </p>

    <!-- 1. 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          点触发器展开，选一项后 <code>SelectValue</code> 会把该选项的文本回填进触发器。<br />
          没选时显示 <code>placeholder</code>，此时触发器上有 <code>data-placeholder</code>，文字色调自动变浅。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Select v-model="basic">
          <SelectTrigger class="w-[260px]">
            <SelectValue placeholder="选择一个时区" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="tz in timezones" :key="tz.value" :value="tz.value">
              {{ tz.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <div class="flex items-center gap-2 text-sm">
          <span class="text-muted-foreground">v-model：</span>
          <Badge variant="secondary">{{ basicLabel }}</Badge>
        </div>
      </CardContent>
    </Card>

    <!-- 2. 分组 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">分组与标题</h2>
        <CardDescription>
          <code>SelectGroup</code> + <code>SelectLabel</code> 把选项分组，组之间用
          <code>SelectSeparator</code> 画一条分隔线。组标题不参与选中，方向键会跳过它。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select v-model="grouped">
          <SelectTrigger class="w-[260px]">
            <SelectValue placeholder="选一种水果" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>常见水果</SelectLabel>
              <SelectItem value="apple">
                苹果
              </SelectItem>
              <SelectItem value="banana">
                香蕉
              </SelectItem>
              <SelectItem value="orange">
                橙子
              </SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>浆果类</SelectLabel>
              <SelectItem value="strawberry">
                草莓
              </SelectItem>
              <SelectItem value="blueberry">
                蓝莓
              </SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>暂时缺货</SelectLabel>
              <SelectItem value="durian" disabled>
                榴莲（缺货）
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>

    <!-- 3. 尺寸与禁用 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">尺寸、禁用与初始值</h2>
        <CardDescription>
          两种高度：<code>size="default"</code>（36px）与 <code>size="sm"</code>（32px）。<br />
          禁用可以直接落在根组件的 <code>disabled</code> 上（整个不可用、不给聚焦），也可以只禁用某一项（该项变暗且方向键跳过）。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-end gap-4">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            default
          </p>
          <Select v-model="sized">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="默认尺寸" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">
                标准
              </SelectItem>
              <SelectItem value="pro">
                专业
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            sm
          </p>
          <Select :default-value="'enterprise'">
            <SelectTrigger size="sm" class="w-[180px]">
              <SelectValue placeholder="小尺寸" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">
                免费版
              </SelectItem>
              <SelectItem value="enterprise">
                企业版
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            整体禁用
          </p>
          <Select v-model="disabledDemo" disabled>
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="不可用" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="locked">
                锁定
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 自定义 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">自定义选项内容</h2>
        <CardDescription>
          选项里可以放图标与副标题（<code>SelectItem</code> 内部已经排好「左图标 + 主文本 + 右勾」的栅格）；<br />
          勾选图标换掉只需覆盖 <code>#indicator-icon</code> 插槽。注意<b>选项里放的图标会跟着文本一起搬进触发器</b>。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-start gap-6">
        <Select v-model="favorite">
          <SelectTrigger class="w-[240px]">
            <SelectValue placeholder="选一个框架" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="fw in frameworks" :key="fw.value" :value="fw.value">
              <component :is="fw.icon" class="size-4" />
              <span class="flex flex-col">
                <span>{{ fw.label }}</span>
                <span class="text-xs text-muted-foreground">{{ fw.hint }}</span>
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select :default-value="'a'">
          <SelectTrigger class="w-[240px]">
            <SelectValue placeholder="自定义勾选图标" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">
              <template #indicator-icon>
                <Star class="size-4 text-primary" />
              </template>
              星星代替对勾
            </SelectItem>
            <SelectItem value="b">
              <template #indicator-icon>
                <Check class="size-4 text-primary" />
              </template>
              默认的对勾
            </SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>

    <!-- 5. 长列表 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">长列表滚动</h2>
        <CardDescription>
          面板给一个 <code>max-h-56</code>，内容超出时上下会自动出现滚动按钮（
          <code>SelectScrollUpButton</code> / <code>SelectScrollDownButton</code>，默认就是一对 Chevron）。
          键盘 <code>↑</code> <code>↓</code> 走到边界也会带动滚动。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Select v-model="longList">
          <SelectTrigger class="w-[220px]">
            <SelectValue placeholder="24 个城市" />
          </SelectTrigger>
          <SelectContent class="max-h-56">
            <SelectItem v-for="c in cities" :key="c.value" :value="c.value">
              {{ c.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p class="text-sm text-muted-foreground">
          已选：{{ longList ?? '—' }}
        </p>
      </CardContent>
    </Card>

    <!-- 6. 表单 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控值与表单提交</h2>
        <CardDescription>
          带 <code>name</code> 时组件会渲染一个隐藏的原生 <code>select</code>，所以能直接被
          <code>FormData</code> 读到、也参与原生表单校验（配合 <code>required</code>）。这里点「提交」看结果。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <form class="space-y-3" @submit.prevent="onSubmit">
          <Select v-model="formValue" name="plan" required>
            <SelectTrigger class="w-[220px]">
              <SelectValue placeholder="选择套餐" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">
                按月付费
              </SelectItem>
              <SelectItem value="yearly">
                按年付费（省 20%）
              </SelectItem>
              <SelectItem value="lifetime">
                一次买断
              </SelectItem>
            </SelectContent>
          </Select>
          <button type="submit" class="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent">
            提交
          </button>
        </form>
        <p class="text-sm text-muted-foreground">
          FormData：<code>{{ submitted || '—' }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 7. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          根组件 <code>Select</code> 的 props（其余透传给 reka 的 <code>SelectRoot</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  属性
                </th>
                <th class="py-2 pr-4 font-medium">
                  类型
                </th>
                <th class="py-2 pr-4 font-medium">
                  默认
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rootRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ row.name }}</code>
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ row.type }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ row.def }}
                </td>
                <td class="py-2 align-top" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">SelectTrigger</h2>
        <CardDescription>触发器。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  属性
                </th>
                <th class="py-2 pr-4 font-medium">
                  类型
                </th>
                <th class="py-2 pr-4 font-medium">
                  默认
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in triggerRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ row.name }}</code>
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ row.type }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ row.def }}
                </td>
                <td class="py-2 align-top" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">其余子部件</h2>
        <CardDescription>面板与选项相关的部分。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  部件 / 插槽
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in partRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ row.name }}</code>
                </td>
                <td class="py-2 align-top" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
