<script setup lang="ts">
import { computed, ref } from 'vue'
import { BellIcon, Check, MailIcon, Minus, ShieldCheckIcon, SmartphoneIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckboxGroup } from '@/components/ui/checkbox-group'
import { Label } from '@/components/ui/label'

// 基础：受控单选框
const accepted = ref<boolean | 'indeterminate'>(false)

// 多选列表：数组模型自己维护
const channels = [
  { value: 'email', label: '邮件通知', desc: '每天上午汇总一封', icon: MailIcon },
  { value: 'sms', label: '短信通知', desc: '仅重要告警', icon: SmartphoneIcon },
  { value: 'inbox', label: '站内信', desc: '不打扰，随时查看', icon: BellIcon },
]
const picked = ref<string[]>(['email'])

// 全选父项的三态：全选 = true，部分 = 'indeterminate'，全不选 = false
const allPicked = computed(() => channels.every(c => picked.value.includes(c.value)))
const somePicked = computed(() => picked.value.length > 0 && !allPicked.value)
const parentState = computed<boolean | 'indeterminate'>(() =>
  allPicked.value ? true : somePicked.value ? 'indeterminate' : false,
)
function toggleAll(next: boolean | 'indeterminate') {
  picked.value = next ? channels.map(c => c.value) : []
}
function toggleOne(value: string, next: boolean | 'indeterminate') {
  picked.value = next
    ? [...new Set([...picked.value, value])]
    : picked.value.filter(v => v !== value)
}

// 成组：用 CheckboxGroup 把选中项收在一个数组里（子项只写 :value）
const grouped = ref<string[]>(['email'])

// trueValue / falseValue：让 v-model 拿到业务值而不是布尔
const plan = ref('free')

const groupRows = [
  { name: 'modelValue', type: 'any[]', def: '[]', desc: '选中的值数组，支持 v-model；子项用 :value 声明自己的值' },
  { name: 'defaultValue', type: 'any[]', def: '[]', desc: '非受控时的初始选中项' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '整组禁用（子项都会变成禁用态）' },
  { name: 'rovingFocus', type: 'boolean', def: 'true', desc: '方向键在组内移动焦点（关掉后每个复选框各自可 Tab）' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", def: '不限', desc: '限制只响应某一组方向键；不传时上下左右都能移动焦点' },
  { name: 'loop', type: 'boolean', def: 'false', desc: '焦点到组尾后是否循环回组首' },
  { name: 'name / required', type: 'string / boolean', def: '—', desc: '表单相关：会渲染隐藏 input，把整个数组当成一个表单值提交' },
]

const rows = [
  { name: 'modelValue', type: "boolean | 'indeterminate'", def: 'false', desc: '受控选中状态，支持 v-model；传字符串 indeterminate 就是半选态' },
  { name: 'defaultValue', type: "boolean | 'indeterminate'", def: 'false', desc: '非受控时的初始值' },
  { name: 'value / trueValue / falseValue', type: 'any', def: "value: 'on'；true/false", desc: 'value 是该复选框自己的值（配合多选），trueValue / falseValue 决定 v-model 拿到的业务值' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用（半透明、不可点、不参与表单提交）' },
  { name: 'name / required', type: 'string / boolean', def: '—', desc: '表单相关：会渲染一个隐藏 input，按 name 提交、必填时阻止提交' },
  { name: 'id', type: 'string', def: '自动', desc: '给 Label 的 for 用（点文字也能切换）' },
  { name: 'aria-invalid', type: 'boolean', def: 'false', desc: '校验失败时传 true，边框与聚焦环变红' },
  { name: 'class', type: 'string', def: '—', desc: '追加自定义类，经 tailwind-merge 去重（默认 size-4）' },
]

const emits = [
  { name: 'update:modelValue', payload: "boolean | 'indeterminate'", desc: '选中状态变化；配合 v-model 使用' },
]

const states = [
  { name: 'data-state="checked"', desc: '选中：主色底 + 主色文字 + 主色边框' },
  { name: 'data-state="indeterminate"', desc: '半选：外观同选中，但指示器通常显示横杠' },
  { name: 'data-state="unchecked"', desc: '未选：透明底 + border-input 边框' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Checkbox 复选框</h1>
    <p class="mt-3 text-muted-foreground">
      基于 <code>reka-ui</code> 的 <code>CheckboxRoot</code>：除了选中 / 未选，还支持<strong>半选</strong>（indeterminate）三态，
      自带键盘（空格）切换、<code>aria-checked</code> 语义，并在表单里自动渲染隐藏 input 参与提交。
    </p>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          受控用法就是 <code>v-model</code>；<code>modelValue</code> 的类型是
          <code>boolean | 'indeterminate'</code>，所以可以直接用字符串驱动半选态。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-2">
          <Checkbox id="demo-basic" v-model="accepted" />
          <Label for="demo-basic">同意服务条款</Label>
        </div>
        <p class="text-sm text-muted-foreground">
          当前值：<code>{{ accepted }}</code>（点方框或按空格切换；点文字也能切换）
        </p>
      </CardContent>
    </Card>

    <!-- 文字与描述 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">配合文字与描述</h2>
        <CardDescription>
          <code>Checkbox</code> 自身带 <code>peer</code> 类：勾选后可以用
          <code>peer-data-[state=checked]:*</code> 让旁边的文字跟着变（下面的标题会加删除线）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div v-for="c in channels" :key="c.value" class="flex items-start gap-3">
            <Checkbox
              :id="`demo-desc-${c.value}`"
              class="mt-0.5"
              :model-value="picked.includes(c.value)"
              @update:model-value="(v) => toggleOne(c.value, v)"
            />
            <div class="grid gap-1">
              <Label
                :for="`demo-desc-${c.value}`"
                class="peer-data-[state=checked]:text-muted-foreground peer-data-[state=checked]:line-through"
              >
                {{ c.label }}
              </Label>
              <p class="text-sm text-muted-foreground">{{ c.desc }}</p>
            </div>
          </div>
        </div>
        <p class="mt-4 text-sm text-muted-foreground">
          已选：<code>{{ picked.join('、') || '(空)' }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 半选 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">半选：全选父项</h2>
        <CardDescription>
          把父项的 <code>model-value</code> 算成三态：全选给 <code>true</code>、
          部分给 <code>'indeterminate'</code>、全不选给 <code>false</code>。
          默认插槽能拿到 <code>{ state }</code>，据此把图标换成横杠。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex items-center gap-2">
          <Checkbox
            id="demo-all"
            :model-value="parentState"
            @update:model-value="toggleAll"
          >
            <template #default="{ state }">
              <Minus v-if="state === 'indeterminate'" class="size-3.5" />
              <Check v-else class="size-3.5" />
            </template>
          </Checkbox>
          <Label for="demo-all" class="font-medium">全选通知渠道</Label>
          <span class="text-sm text-muted-foreground">
            （{{ picked.length }} / {{ channels.length }}）
          </span>
        </div>
        <div class="ml-6 space-y-2 border-l border-border pl-4">
          <div v-for="c in channels" :key="c.value" class="flex items-center gap-2">
            <Checkbox
              :id="`demo-all-${c.value}`"
              :model-value="picked.includes(c.value)"
              @update:model-value="(v) => toggleOne(c.value, v)"
            />
            <Label :for="`demo-all-${c.value}`">{{ c.label }}</Label>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 成组 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">成组管理（CheckboxGroup）</h2>
        <CardDescription>
          <code>CheckboxGroup</code> 把选中项收在一个数组里：子项只需写 <code>:value</code>，
          选中与否由组的数组决定，不用自己维护；组内还会自动接上<strong>方向键移动焦点</strong>，
          传 <code>name</code> 时整个数组会作为一个表单值提交。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <CheckboxGroup v-model="grouped" aria-label="通知渠道" class="gap-4">
          <div v-for="c in channels" :key="c.value" class="flex items-start gap-3">
            <Checkbox :id="`demo-group-${c.value}`" class="mt-0.5" :value="c.value" />
            <div class="grid gap-1">
              <Label :for="`demo-group-${c.value}`">{{ c.label }}</Label>
              <p class="text-sm text-muted-foreground">{{ c.desc }}</p>
            </div>
          </div>
        </CheckboxGroup>
        <p class="text-sm text-muted-foreground">
          组的值：<code>{{ grouped.join('、') || '(空)' }}</code>
          （点方框切换，然后按 ↑ ↓ ← → 看焦点在组内移动）
        </p>
      </CardContent>
    </Card>

    <!-- 禁用 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁用状态</h2>
        <CardDescription>传 <code>disabled</code>：半透明、不响应点击，也不会参与表单提交。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-6">
        <div class="flex items-center gap-2">
          <Checkbox id="demo-dis-1" disabled />
          <Label for="demo-dis-1" class="text-muted-foreground">禁用 · 未选</Label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox id="demo-dis-2" :model-value="true" disabled />
          <Label for="demo-dis-2" class="text-muted-foreground">禁用 · 已选</Label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox id="demo-dis-3" model-value="indeterminate" disabled />
          <Label for="demo-dis-3" class="text-muted-foreground">禁用 · 半选</Label>
        </div>
      </CardContent>
    </Card>

    <!-- 表单与校验 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">表单提交与校验</h2>
        <CardDescription>
          <code>name</code> / <code>required</code> 会作用于内部那个隐藏 input，直接用原生 form 就能提交与拦截；
          校验失败时给 <code>aria-invalid="true"</code>，边框和聚焦环会变红。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <Checkbox
              id="demo-invalid"
              name="terms"
              required
              aria-invalid="true"
              :model-value="false"
            />
            <Label for="demo-invalid">我已阅读并同意《服务条款》</Label>
          </div>
          <p class="text-sm text-destructive">请先同意服务条款（示例中的校验失败态）</p>
        </div>

        <div class="space-y-2 border-t border-border pt-6">
          <p class="text-sm font-medium">trueValue / falseValue：让 v-model 拿到业务值</p>
          <div class="flex items-center gap-2">
            <Checkbox
              id="demo-truevalue"
              :model-value="plan === 'pro'"
              true-value="pro"
              false-value="free"
              @update:model-value="(v) => plan = v as string"
            />
            <Label for="demo-truevalue">升级到专业版</Label>
          </div>
          <p class="text-sm text-muted-foreground">
            <code>plan</code> = <code>{{ plan }}</code>
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 自定义 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">自定义尺寸与颜色</h2>
        <CardDescription>
          默认 <code>size-4</code>、主色底；用 <code>class</code> 能改尺寸与选中配色，用默认插槽可以换成任意图标。
          <strong>注意要加 <code>!</code></strong>：8 套风格预设是非分层的 CSS，优先级天然高于工具类，
          不加 <code>!</code> 会被预设里的 <code>size-4</code> / <code>bg-primary</code> 盖掉。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-6">
        <div class="flex items-center gap-2">
          <Checkbox id="demo-size" class="size-5!" :model-value="true" />
          <Label for="demo-size">size-5</Label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox
            id="demo-color"
            class="size-5! data-[state=checked]:border-emerald-500! data-[state=checked]:bg-emerald-500!"
            :model-value="true"
          />
          <Label for="demo-color">自定义主色</Label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox
            id="demo-icon"
            class="size-5! data-[state=checked]:border-emerald-500! data-[state=checked]:bg-emerald-500!"
            :model-value="true"
          >
            <ShieldCheckIcon class="size-4" />
          </Checkbox>
          <Label for="demo-icon">自定义图标</Label>
        </div>
        <Button variant="outline" size="sm" @click="accepted = accepted === 'indeterminate' ? false : 'indeterminate'">
          把第一个切成半选
        </Button>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription>
          props 基本是 reka-ui <code>CheckboxRoot</code> 的透传，本组件只加样式与默认勾选图标。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div>
          <p class="mb-2 text-sm font-medium">Props</p>
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
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">Emits / 插槽</p>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li v-for="e in emits" :key="e.name">
              · <code>{{ e.name }}</code>（<code>{{ e.payload }}</code>）：{{ e.desc }}
            </li>
            <li>· 默认插槽：拿到 <code>{ state, modelValue }</code>，用来替换勾选图标（如半选换横杠）</li>
          </ul>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">状态钩子</p>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li v-for="s in states" :key="s.name">
              · <code>{{ s.name }}</code>：{{ s.desc }}
            </li>
          </ul>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">CheckboxGroup（成组）</p>
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
                <tr v-for="r in groupRows" :key="r.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ r.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ r.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          <code>CheckboxGroup</code> 是 reka <code>CheckboxGroupRoot</code> 的薄封装；
          不用组也可以，按上面「半选」示例自己维护数组（更灵活，但方向键与表单提交要自己做）。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
