<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

/* ── 演示状态 ── */
const airplane = ref(false)
const wifi = ref(true)
const notification = ref(true)
const autoUpdate = ref(false)
const telemetry = ref(true)

const iconThumb = ref(true)

const subscribed = ref(false)
const submitted = ref('')

function onSubmit(e: Event) {
  const fd = new FormData(e.target as HTMLFormElement)
  submitted.value = [...fd.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .join(' & ') || '（表单为空：开关关闭时值不会被提交）'
}

const onCount = computed(() => [notification, autoUpdate, telemetry].filter(s => s.value).length)

/* ── API 表 ── */
const propRows = [
  { name: 'v-model', type: 'boolean', def: 'false', desc: '开关状态（受控）。用 <code>default-value</code> 可改成非受控' },
  { name: 'default-value', type: 'boolean', def: 'false', desc: '非受控时的初始值' },
  { name: 'size', type: "'default' | 'sm'", def: "'default'", desc: '尺寸档位。<b>本库新增</b>的 prop：8 套预设都按 <code>data-[size=…]</code> 选尺寸，<b>不传时 Vue 不会渲染这个属性，预设里的尺寸规则会全部静默失效</b>' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用：不响应点击与键盘，同时输出 <code>data-disabled</code>（<code>Label</code> 的 <code>peer-disabled:opacity-50</code> 靠它联动变灰）' },
  { name: 'name', type: 'string', def: '—', desc: '表单字段名。<b>只有传了它</b>，reka 才会额外渲染一个 <code>&lt;input type="checkbox"&gt;</code>（视觉隐藏）用于原生表单提交' },
  { name: 'value', type: 'string', def: "'on'", desc: '提交时该字段的值（配合 <code>name</code> 使用）' },
  { name: 'true-value / false-value', type: 'any', def: 'true / false', desc: 'v-model 在开 / 关时分别写入的值。想让 v-model 直接存字符串（如 <code>\'enabled\' / \'disabled\'</code>）就传这两个' },
  { name: 'required', type: 'boolean', def: 'false', desc: '原生必填校验（需要同时给 <code>name</code>）；未勾选时表单提交会被浏览器拦截' },
  { name: 'id', type: 'string', def: '—', desc: '给根节点设置 id，配合 <code>&lt;Label for="…"&gt;</code> 点击文字也能切换' },
  { name: 'class', type: 'string', def: '—', desc: '根节点样式。注意根节点带 <code>peer</code>，所以后面的兄弟 <code>&lt;Label&gt;</code> 能用 <code>peer-*</code> 变体' },
]

const slotRows = [
  { name: 'default', arg: '{ modelValue, checked }', desc: '放在滑块<b>内部</b>的内容（少见，一般留空）' },
  { name: 'thumb', arg: '{ modelValue, checked }', desc: '自定义滑块（那颗圆点）里的内容 —— 常见做法是放一个勾 / 叉图标，<code>checked</code> 就是当前状态' },
]

const sizeRows = [
  { tier: 'default', root: 'h-[18.4px] w-8', thumb: 'size-4（16px）', note: '预设里的标准档' },
  { tier: 'sm', root: 'h-3.5 w-6', thumb: 'size-3（12px）', note: '紧凑档，适合列表 / 表格内' },
]

/** 8 套预设的实测尺寸（浏览器量得，非推测） */
const presetRows = [
  { style: 'Vega', defRoot: '18.4 × 32', defThumb: '16', smRoot: '14 × 24', smThumb: '12', note: '胶囊形（本页默认）' },
  { style: 'Luma', defRoot: '20 × 44', defThumb: '16 × 24', smRoot: '16 × 28', smThumb: '16', note: '2px 描边；滑块是长条形，不是圆点' },
  { style: 'Lyra', defRoot: '18.4 × 32', defThumb: '16', smRoot: '14 × 24', smThumb: '12', note: '整体直角，但开关仍是胶囊' },
  { style: 'Maia', defRoot: '18.4 × 32', defThumb: '16', smRoot: '14 × 24', smThumb: '12', note: '同 Vega' },
  { style: 'Mira', defRoot: '16.6 × 28', defThumb: '14', smRoot: '14 × 24', smThumb: '12', note: '最小的一档' },
  { style: 'Nova', defRoot: '18.4 × 32', defThumb: '16', smRoot: '14 × 24', smThumb: '12', note: '同 Vega' },
  { style: 'Rhea', defRoot: '20 × 32', defThumb: '16', smRoot: '16 × 24', smThumb: '12', note: '<code>rounded-2xl</code>（圆角 16px）+ 2px 描边' },
  { style: 'Sera', defRoot: '18 × 33', defThumb: '14', smRoot: '14 × 25', smThumb: '10', note: '彻底直角（圆角 0）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Switch 开关</h1>
    <p class="mt-3 text-muted-foreground">
      二态的即时生效开关（开 / 关），基于 reka-ui 的 <code>SwitchRoot</code>。根节点渲染成一个
      <code>&lt;button&gt;</code>，带着 <code>data-state="checked" | "unchecked"</code>，
      里面一颗 <code>SwitchThumb</code> 圆点靠 <code>translate-x</code> 滑动。<br />
      它同时支持原生表单：<b>只要传了 <code>name</code></b>，reka 会额外渲染一个视觉隐藏的
      <code>&lt;input type="checkbox"&gt;</code>，让浏览器按常规方式提交这个字段。
    </p>

    <!-- 1. 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>v-model</code> 绑定布尔值。<code>id</code> + <code>&lt;Label for&gt;</code>
          让点击文字也能切换 —— 因为根节点带着 <code>peer</code>，
          放在它<b>后面</b>的 Label 还能吃到 <code>peer-*</code> 变体。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-3">
          <Switch id="demo-airplane" v-model="airplane" />
          <Label for="demo-airplane">飞行模式</Label>
          <Badge variant="secondary">
            {{ airplane ? 'checked' : 'unchecked' }}
          </Badge>
        </div>

        <div class="flex items-center gap-3">
          <Switch id="demo-wifi" v-model="wifi" />
          <Label for="demo-wifi">Wi-Fi</Label>
          <Badge variant="secondary">
            {{ wifi ? 'checked' : 'unchecked' }}
          </Badge>
        </div>

        <p class="text-xs text-muted-foreground">
          <code>wifi</code> 用 <code>default-value</code> 也能写成非受控：
          <code>&lt;Switch default-value&gt;</code>。
        </p>
      </CardContent>
    </Card>

    <!-- 2. 尺寸 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">尺寸：default / sm</h2>
        <CardDescription>
          两档尺寸的<b>具体像素由当前设计系统决定</b>（预设里的
          <code>data-[size=default]</code> / <code>data-[size=sm]</code>），
          比如 vega 的 default 是 <code>18.4×32</code>、滑块 16px，而 luma 是 <code>20×44</code>、滑块 24px 的细长形。<br />
          下面还叠了颗「缩放到 2 倍」的示例，方便看清滑块位置在不同档位下的差异。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="flex flex-wrap items-center gap-8">
          <div class="flex items-center gap-3">
            <Switch id="size-default" v-model="airplane" />
            <Label for="size-default">default</Label>
          </div>
          <div class="flex items-center gap-3">
            <Switch id="size-sm" v-model="airplane" size="sm" />
            <Label for="size-sm">sm</Label>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-8">
          <div class="flex items-center gap-3">
            <Switch v-model="wifi" class="scale-200 origin-left" />
            <span class="ml-10 text-xs text-muted-foreground">default ×2</span>
          </div>
          <div class="flex items-center gap-3">
            <Switch v-model="wifi" size="sm" class="scale-200 origin-left" />
            <span class="ml-4 text-xs text-muted-foreground">sm ×2</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 禁用 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁用</h2>
        <CardDescription>
          <code>disabled</code> 会让根节点带上 <code>data-disabled</code> 并降低不透明度，
          同时它仍然输出 <code>data-state="checked"</code> —— 也就是<b>禁用状态下依然能表达开 / 关</b>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-3">
          <Switch id="dis-off" disabled />
          <Label for="dis-off">禁用且关闭</Label>
        </div>
        <div class="flex items-center gap-3">
          <Switch id="dis-on" disabled :model-value="true" />
          <Label for="dis-on">禁用且开启</Label>
        </div>
        <div class="flex items-center gap-3">
          <Switch id="dis-on-sm" disabled :model-value="true" size="sm" />
          <Label for="dis-on-sm">禁用 + sm 档</Label>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 自定义滑块 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">自定义滑块内容</h2>
        <CardDescription>
          <code>#thumb</code> 插槽会给你 <code>{ modelValue, checked }</code>。
          需求上常见的是在圆点里放一个勾，或者干脆用图标表示开 / 关状态。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="flex items-center gap-3">
          <Switch id="thumb-on" v-model="iconThumb">
            <template #thumb="{ checked }">
              <span class="flex size-full items-center justify-center">
                <Check v-if="checked" class="size-3" />
                <X v-else class="size-3" />
              </span>
            </template>
          </Switch>
          <Label for="thumb-on">滑块里带勾 / 叉</Label>
          <Badge variant="secondary">
            {{ iconThumb ? 'checked' : 'unchecked' }}
          </Badge>
        </div>

        <p class="text-xs text-muted-foreground">
          滑块默认是 <code>size-4</code>（16px），所以里面放 <code>size-3</code> 的图标刚好；
          再大就会顶到边缘。
        </p>
      </CardContent>
    </Card>

    <!-- 5. 表单提交 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">随表单提交</h2>
        <CardDescription>
          <b>必须传 <code>name</code></b> —— reka 才会挂那个隐藏 checkbox。
          没传 <code>name</code> 时开关纯粹是 UI 控件，表单里什么都收不到。<br />
          另外 <code>value</code> 默认是 <code>"on"</code>；关闭状态下浏览器不会提交该字段（和原生 checkbox 一致）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="flex items-center gap-3">
            <Switch id="form-news" v-model="subscribed" name="newsletter" value="yes" />
            <Label for="form-news">订阅产品更新（提交为 newsletter=yes）</Label>
          </div>
          <div class="flex items-center gap-3">
            <Button type="submit" size="sm">
              提交表单
            </Button>
            <Badge v-if="submitted" variant="outline" class="font-mono">
              {{ submitted }}
            </Badge>
          </div>
        </form>

        <div class="rounded-lg border border-input p-3">
          <p class="mb-2 font-mono text-xs text-muted-foreground">提交出来的字段</p>
          <p class="font-mono text-sm">
            {{ submitted || '（还没提交）' }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 6. 组合场景 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">典型场景：设置项列表</h2>
        <CardDescription>
          开关最常出现在这种「一行一个开关 + 标题 / 说明」的列表里。这里用 <code>&lt;Label&gt;</code>
          包住整行，点击一整行都能切换（比只点那颗小圆点友好得多）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-1">
        <Label
          class="hover:bg-muted/50 flex items-start justify-between gap-4 rounded-lg p-3 transition-colors"
        >
          <span class="flex flex-col gap-1">
            <span class="font-medium">推送通知</span>
            <span class="text-xs font-normal text-muted-foreground">有新消息时在桌面弹出提醒</span>
          </span>
          <Switch v-model="notification" class="mt-0.5" />
        </Label>

        <Label
          class="hover:bg-muted/50 flex items-start justify-between gap-4 rounded-lg p-3 transition-colors"
        >
          <span class="flex flex-col gap-1">
            <span class="font-medium">自动更新</span>
            <span class="text-xs font-normal text-muted-foreground">在后台下载新版本，重启后生效</span>
          </span>
          <Switch v-model="autoUpdate" class="mt-0.5" />
        </Label>

        <Label
          class="hover:bg-muted/50 flex items-start justify-between gap-4 rounded-lg p-3 transition-colors"
        >
          <span class="flex flex-col gap-1">
            <span class="font-medium">匿名使用数据</span>
            <span class="text-xs font-normal text-muted-foreground">帮助我们改进产品，随时可以关闭</span>
          </span>
          <Switch v-model="telemetry" class="mt-0.5" />
        </Label>

        <p class="px-3 pt-2 text-xs text-muted-foreground">
          已开启 {{ onCount }} / 3 项。
        </p>
      </CardContent>
    </Card>

    <!-- 7. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          <code>Switch</code> 透传 reka 的 <code>SwitchRoot</code>，下面是完整属性表。
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
              <tr v-for="row in propRows" :key="row.name" class="border-b last:border-0">
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
        <h2 class="text-xl font-semibold">插槽</h2>
        <CardDescription>两个插槽都会收到同一份 <code>{ modelValue, checked }</code>。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  插槽
                </th>
                <th class="py-2 pr-4 font-medium">
                  参数
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in slotRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ row.name }}</code>
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ row.arg }}
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
        <h2 class="text-xl font-semibold">内部结构与样式钩子</h2>
        <CardDescription>
          写自定义样式时按这两个钩子定位，8 套预设就是靠它们接管外观的。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  元素
                </th>
                <th class="py-2 pr-4 font-medium">
                  data-slot
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b">
                <td class="py-2 pr-4 align-top">
                  根节点
                </td>
                <td class="py-2 pr-4 align-top">
                  <code>switch</code>
                </td>
                <td class="py-2 align-top">
                  <code>&lt;button type="button"&gt;</code>，带
                  <code>data-state</code> / <code>data-disabled</code> / <code>data-size</code> / <code>aria-checked</code>，
                  另有本库加的 <code>peer</code> 与 <code>group/switch</code>
                </td>
              </tr>
              <tr class="border-b">
                <td class="py-2 pr-4 align-top">
                  滑块
                </td>
                <td class="py-2 pr-4 align-top">
                  <code>switch-thumb</code>
                </td>
                <td class="py-2 align-top">
                  尺寸靠 <code>group-data-[size=default|sm]/switch:…</code> 从根节点继承，
                  <code>pointer-events-none</code> 保证点击事件都落在根上
                </td>
              </tr>
              <tr>
                <td class="py-2 pr-4 align-top">
                  隐藏 input
                </td>
                <td class="py-2 pr-4 align-top">
                  —
                </td>
                <td class="py-2 align-top">
                  <b>只有传了 <code>name</code> 才渲染</b>，<code>type="checkbox"</code>，视觉隐藏
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">尺寸档位</h2>
        <CardDescription>
          两档尺寸（<code>default</code> / <code>sm</code>）的<b>实际像素完全由当前设计系统决定</b>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <p class="mb-2 text-sm font-medium">8 套预设实测</p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b text-left">
                  <th class="py-2 pr-4 font-medium">
                    设计系统
                  </th>
                  <th class="py-2 pr-4 font-medium">
                    default 根
                  </th>
                  <th class="py-2 pr-4 font-medium">
                    default 滑块
                  </th>
                  <th class="py-2 pr-4 font-medium">
                    sm 根
                  </th>
                  <th class="py-2 pr-4 font-medium">
                    sm 滑块
                  </th>
                  <th class="py-2 font-medium">
                    备注
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in presetRows" :key="row.style" class="border-b last:border-0">
                  <td class="py-2 pr-4 align-top font-medium">
                    {{ row.style }}
                  </td>
                  <td class="py-2 pr-4 align-top">
                    <code>{{ row.defRoot }}</code>
                  </td>
                  <td class="py-2 pr-4 align-top">
                    <code>{{ row.defThumb }}</code>
                  </td>
                  <td class="py-2 pr-4 align-top">
                    <code>{{ row.smRoot }}</code>
                  </td>
                  <td class="py-2 pr-4 align-top">
                    <code>{{ row.smThumb }}</code>
                  </td>
                  <td class="py-2 align-top text-muted-foreground" v-html="row.note" />
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-2 text-xs text-muted-foreground">
            单位均为 px（宽 × 高；只有一个数字表示宽高相等）。
          </p>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">组件兜底尺寸</p>
          <p class="mb-2 text-xs text-muted-foreground">
            没装预设、或某套预设没定义该档时生效的值（写在本库的 <code>Switch.vue</code> 里）。
          </p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b text-left">
                  <th class="py-2 pr-4 font-medium">
                    size
                  </th>
                  <th class="py-2 pr-4 font-medium">
                    根节点
                  </th>
                  <th class="py-2 pr-4 font-medium">
                    滑块
                  </th>
                  <th class="py-2 font-medium">
                    说明
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in sizeRows" :key="row.tier" class="border-b last:border-0">
                  <td class="py-2 pr-4 align-top">
                    <code>{{ row.tier }}</code>
                  </td>
                  <td class="py-2 pr-4 align-top">
                    <code>{{ row.root }}</code>
                  </td>
                  <td class="py-2 pr-4 align-top">
                    <code>{{ row.thumb }}</code>
                  </td>
                  <td class="py-2 align-top text-muted-foreground">
                    {{ row.note }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
