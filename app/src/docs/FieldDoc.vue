<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'

// ---------- 演示状态 ----------
const email = ref('')
const emailInvalid = ref(true)
const bio = ref('')
const plan = ref('team')
const notify = ref(true)

// ---------- API ----------
const variantsRows = [
  { name: 'vertical', def: '（默认）', desc: '标签在上、控件在下；`[&>*]:w-full` —— 每个子元素都占满一行' },
  { name: 'horizontal', def: '—', desc: '标签与控件同行（items-center）；配 FieldContent 时「标签+描述」整体在控件左侧' },
  { name: 'responsive', def: '—', desc: '窄容器垂直、宽容器水平 —— 断点看的是**外层 FieldGroup 的宽度**（@md = 28rem），不是视口' },
]

const partRows = [
  { name: 'Field', type: 'orientation / class', desc: '单个字段容器；传 :data-invalid="true" 时内部文字变 destructive 色' },
  { name: 'FieldLabel', type: 'class', desc: '带 <label> 语义的标签（点击能聚焦控件）；包住 Checkbox/Radio 时选中整块变主色' },
  { name: 'FieldTitle', type: 'class', desc: '纯视觉标题，**无 label 语义**；故意复用 data-slot="field-label" 以复用同一套样式' },
  { name: 'FieldDescription', type: 'class', desc: '辅助说明；自带与 legend/相邻元素的间距修正，内部 <a> 自动带下划线' },
  { name: 'FieldError', type: 'errors / class', desc: '错误提示（role="alert"）：errors 支持字符串数组或 vee-validate 的 { message } 数组，自动去重；也可直接用插槽' },
  { name: 'FieldContent', type: 'class', desc: '把「标签 + 描述」包成一列，水平布局时与控件左右并列' },
  { name: 'FieldGroup', type: 'class', desc: '一组字段（间距大）；同时提供 @container/field-group 容器查询上下文' },
  { name: 'FieldSet', type: 'class', desc: '<fieldset> 语义的一组字段（间距小）；内含 checkbox/radio 组会自动收紧' },
  { name: 'FieldLegend', type: 'variant', desc: '<legend> 分组标题；variant="legend"（16px，默认）/ "label"（14px）' },
  { name: 'FieldSeparator', type: 'class', desc: '分隔线；给默认插槽文字就变成「中间带字」的分隔线' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Field 表单字段</h1>
    <p class="mt-3 text-muted-foreground">
      把「标签 + 控件 + 说明 + 错误」组织成一个字段的布局组件族。<br />
      <code>Field</code> 管单个字段的排布（垂直 / 水平 / 响应式），<code>FieldGroup</code> 与
      <code>FieldSet</code> 管一组，<code>FieldLabel</code> / <code>FieldTitle</code> /
      <code>FieldDescription</code> / <code>FieldError</code> 负责各部分。<br />
      它不绑定任何表单库：<code>FieldError</code> 直接吃字符串数组，也能吃 vee-validate 的
      <code>{ message }</code> 形状。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>标签 + 控件 + 说明，放进 <code>FieldGroup</code> 自动获得字段间距。</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel for="field-email">邮箱</FieldLabel>
            <Input id="field-email" v-model="email" type="email" placeholder="you@example.com" />
            <FieldDescription>用于接收通知与登录链接，不会公开。</FieldDescription>
          </Field>
          <Field>
            <FieldLabel for="field-bio">个人简介</FieldLabel>
            <Input id="field-bio" v-model="bio" placeholder="一句话介绍自己" />
            <FieldDescription>最多 60 个字，会显示在团队页。</FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <!-- 2. 错误态 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">错误态</h2>
        <CardDescription>
          <code>FieldError</code> 显示文案，<code>Field</code> 加 <code>:data-invalid="true"</code> 让整块文字变红；
          输入框自己加 <code>aria-invalid</code>（Input 自带红边样式）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field :data-invalid="emailInvalid">
            <FieldLabel for="field-email-invalid">邮箱</FieldLabel>
            <Input
              id="field-email-invalid"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              :aria-invalid="emailInvalid || undefined"
            />
            <FieldError v-if="emailInvalid" :errors="['邮箱格式不正确', '该邮箱已被占用']" />
            <FieldDescription v-else>格式正确。</FieldDescription>
          </Field>
        </FieldGroup>
        <Button class="mt-4" variant="outline" size="sm" @click="emailInvalid = !emailInvalid">
          {{ emailInvalid ? '切到正常态' : '切到错误态' }}
        </Button>
      </CardContent>
    </Card>

    <!-- 3. 水平布局 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">水平布局</h2>
        <CardDescription>
          <code>orientation="horizontal"</code> + <code>FieldContent</code>：标签与描述在左、控件在右。
          开关 / 勾选的整行设置项常用这个布局。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel for="field-notify">邮件通知</FieldLabel>
              <FieldDescription>有新任务时发一封汇总邮件。</FieldDescription>
            </FieldContent>
            <Switch id="field-notify" v-model="notify" />
          </Field>
          <FieldSeparator>或者</FieldSeparator>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel for="field-plan">套餐</FieldLabel>
              <FieldDescription>随时可以升配或降配。</FieldDescription>
            </FieldContent>
            <RadioGroup v-model="plan" class="flex gap-4">
              <FieldLabel>
                <RadioGroupItem value="personal" />
                个人
              </FieldLabel>
              <FieldLabel>
                <RadioGroupItem value="team" />
                团队
              </FieldLabel>
            </RadioGroup>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <!-- 4. 响应式 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">响应式（按容器宽度切换）</h2>
        <CardDescription>
          <code>orientation="responsive"</code> 看的是<strong>外层 FieldGroup 的宽度</strong>
          （容器查询 <code>@md</code> = 28rem），不是视口宽度 —— 所以同一份代码在窄侧栏里会自动变垂直。
          下面两个容器一窄一宽，代码完全一样。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="rounded-lg border border-input p-4">
          <p class="mb-3 text-xs text-muted-foreground">窄容器（&lt; 28rem）→ 垂直</p>
          <div class="max-w-[320px]">
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel for="field-resp-1">显示名称</FieldLabel>
                  <FieldDescription>别人看到的名字</FieldDescription>
                </FieldContent>
                <Input id="field-resp-1" placeholder="Rion" />
              </Field>
            </FieldGroup>
          </div>
        </div>
        <div class="rounded-lg border border-input p-4">
          <p class="mb-3 text-xs text-muted-foreground">宽容器（≥ 28rem）→ 水平</p>
          <FieldGroup>
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel for="field-resp-2">显示名称</FieldLabel>
                <FieldDescription>别人看到的名字</FieldDescription>
              </FieldContent>
              <Input id="field-resp-2" placeholder="Rion" />
            </Field>
          </FieldGroup>
        </div>
      </CardContent>
    </Card>

    <!-- 5. FieldSet / FieldLegend -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">字段分组（FieldSet + FieldLegend）</h2>
        <CardDescription>
          <code>FieldSet</code> 是 <code>&lt;fieldset&gt;</code> 语义的一组字段，配 <code>FieldLegend</code> 做组标题；
          比 <code>FieldGroup</code> 的间距更小，适合「一组相关设置」。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet>
          <FieldLegend>通知偏好</FieldLegend>
          <FieldDescription>选择你希望收到哪些通知。</FieldDescription>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldLabel>
                <Checkbox :default-checked="true" />
                任务分配给我时通知
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel>
                <Checkbox />
                有人评论时通知
              </FieldLabel>
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </Card>

    <!-- 6. FieldTitle -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">FieldTitle 与 FieldLabel 的区别</h2>
        <CardDescription>
          <code>FieldLabel</code> 有 <code>&lt;label&gt;</code> 语义（点击聚焦控件、可关联 for/id）；
          <code>FieldTitle</code> 只是视觉标题。下面两个字段标题外观一致，但点左边那行的文字会聚焦输入框。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel for="field-title-demo">用 FieldLabel（可点击联动）</FieldLabel>
            <Input id="field-title-demo" placeholder="点上面的标题试试" />
          </Field>
          <Field>
            <FieldTitle>用 FieldTitle（纯视觉）</FieldTitle>
            <Input placeholder="点上面的标题没有反应" />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <p class="mb-2 text-sm font-medium"><code>Field</code> 的 <code>orientation</code></p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">取值</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in variantsRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">子组件</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="row in partRows" :key="row.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ row.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ row.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          另外导出了 <code>fieldVariants</code>（cva）：需要自己拼一个「字段布局容器」时可以直接复用；
          要接表单库（vee-validate / zod）看 <code>Form</code> 组件，它和本组件族可以混用。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
