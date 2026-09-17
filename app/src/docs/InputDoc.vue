<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { DatePicker, DatePickerRange } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Mail, Eye, EyeOff } from 'lucide-vue-next'

// ---------- 演示状态 ----------
/** 基础：受控 */
const nickname = ref('')

/** 错误态：故意先给个不合法的值 */
const emailValue = ref('not-an-email')
const emailInvalid = ref(true)

/** 密码可见性 */
const password = ref('hunter2')
const showPassword = ref(false)

/** 非受控：值住在原生 input 里（组件没有 defineExpose，模板 ref 拿到的是组件实例而非 DOM），这里演示「直接从 DOM 读」 */
const uncontrolledRead = ref('')

function readUncontrolled() {
  const el = document.getElementById('doc-input-uncontrolled') as HTMLInputElement | null
  uncontrolledRead.value = el?.value ?? ''
}

const alternatives = [
  { native: 'type="date"', use: 'DatePicker', desc: '弹层日历、主题一致，还能设 min / max 与不可选日期' },
  { native: '两个 date 输入框', use: 'DatePickerRange', desc: '日期区间，自带「最近 7 天」类快捷预设' },
  { native: 'type="number"', use: 'NumberField', desc: '带步进按钮与格式化，同样受主题控制' },
  { native: '再包一层 div 放图标', use: 'InputGroup', desc: '「输入框 + 前后缀图标 / 按钮 / 单位」的标准做法' },
]

// ---------- API ----------
const propRows = [
  { name: 'v-model', type: 'string | number', def: '—', desc: '双向绑定值；受控用，外部维护状态' },
  { name: 'default-value', type: 'string | number', def: '—', desc: '非受控的初始值；之后由原生 input 自己维护，不再回写外部' },
  { name: 'class', type: 'string', def: '—', desc: '透传到 input 上；改预设已定义的属性（高度/内边距/圆角）要带 !' },
]

const passThroughRows = [
  { name: 'type', type: 'string', def: "'text'", desc: 'text / email / password / number / search / file / date… 原生类型，直接透传（视觉不受主题控制，见上一节）' },
  { name: 'placeholder', type: 'string', def: '—', desc: '占位文本，颜色取 muted-foreground' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用：变半透明 (opacity .5)、光标 not-allowed、且不再接收指针事件' },
  { name: 'readonly', type: 'boolean', def: 'false', desc: '只读：能选中/复制，但不能改；外观与禁用不同（不透明）' },
  { name: 'required', type: 'boolean', def: 'false', desc: '原生必填标记；表单提交时由浏览器校验' },
  { name: 'aria-invalid', type: "'true' | 'false'", def: '—', desc: '错误态：红边 + 红 ring（比 disabled 更该用它表达「输错了」）' },
  { name: '其它原生属性', type: '—', def: '—', desc: 'name / id / autocomplete / inputmode / maxlength / @input / @focus… 全部透传' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Input 输入框</h1>
    <p class="mt-3 text-muted-foreground">
      单行文本输入框，是对原生 <code>&lt;input&gt;</code> 的样式封装 —— 没有额外抽象，属性全部透传。<br />
      用 <code>v-model</code> 双向绑定；只想给初始值就用 <code>default-value</code>。<br />
      错误态用 <code>aria-invalid="true"</code>（配 <code>Field</code> 一起用最省事）。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>Label</code> 的 <code>for</code> 指向 input 的 <code>id</code>，点标签能聚焦输入框。
        </CardDescription>
      </CardHeader>
      <CardContent class="max-w-sm space-y-2">
        <Label for="doc-input-nickname">昵称</Label>
        <Input id="doc-input-nickname" v-model="nickname" placeholder="请输入昵称" />
        <p class="text-sm text-muted-foreground">
          当前值：<code>{{ nickname || '（空）' }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 2. 输入类型 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">输入类型：type</h2>
        <CardDescription>
          <code>type</code> 直接透传给原生 input，浏览器会给出对应的键盘、校验与原生控件（如日期选择、文件选择）。
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="doc-input-text">text</Label>
          <Input id="doc-input-text" type="text" placeholder="普通文本" />
        </div>
        <div class="space-y-2">
          <Label for="doc-input-email">email</Label>
          <Input id="doc-input-email" type="email" placeholder="you@example.com" />
        </div>
        <div class="space-y-2">
          <Label for="doc-input-password">password（可切换明文）</Label>
          <div class="relative">
            <Input
              id="doc-input-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="pr-10"
            />
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1"
              :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="size-4" />
              <Eye v-else class="size-4" />
            </button>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="doc-input-number">number</Label>
          <Input id="doc-input-number" type="number" default-value="18" min="0" max="120" />
        </div>
        <div class="space-y-2">
          <Label for="doc-input-date">date</Label>
          <Input id="doc-input-date" type="date" />
        </div>
        <div class="space-y-2">
          <Label for="doc-input-search">search</Label>
          <Input id="doc-input-search" type="search" placeholder="搜索…" />
        </div>
        <div class="space-y-2 sm:col-span-2">
          <Label for="doc-input-file">file</Label>
          <Input id="doc-input-file" type="file" />
        </div>
      </CardContent>
    </Card>

    <!-- 3. 原生 type 的替代方案 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">原生 type 的替代方案</h2>
        <CardDescription>
          像 <code>type="date"</code> / <code>type="number"</code> 这类<b>原生控件</b>，
          里面的日期文案、日历图标、上下箭头都是<b>浏览器自己画的</b>，不受主题与预设控制（各家浏览器还长得不一样）。<br />
          要和设计系统统一，就换成下面这几个组件。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">原生写法</th>
                <th class="py-2 pr-4 font-medium">换成</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in alternatives" :key="row.native" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.native }}</code></td>
                <td class="py-2 pr-4"><code>{{ row.use }}</code></td>
                <td class="py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="doc-input-native-date">原生 type="date"（浏览器 UI）</Label>
            <Input id="doc-input-native-date" type="date" />
            <p class="text-muted-foreground text-xs">「年/月/日」与日历图标都改不动</p>
          </div>
          <div class="space-y-2">
            <Label>DatePicker（跟主题一致）</Label>
            <DatePicker />
            <p class="text-muted-foreground text-xs">同样的 h-9 / 圆角 6px，配色跟主题走</p>
          </div>
          <div class="space-y-2 sm:col-span-2">
            <Label>DatePickerRange（日期区间）</Label>
            <DatePickerRange />
            <p class="text-muted-foreground text-xs">
              区间形态；上面两个都能受控（v-model），也能像这样不传值自己管
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 状态 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">状态：禁用 / 只读 / 必填 / 错误</h2>
        <CardDescription>
          禁用是 <code>opacity .5</code> 且不吃指针事件；只读保持正常外观但改不动；输错了用
          <code>aria-invalid</code>（红边 + 红 ring），别拿禁用去表达错误。
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="doc-input-disabled">disabled（不可编辑、不可聚焦）</Label>
          <Input id="doc-input-disabled" disabled placeholder="禁用状态" />
        </div>
        <div class="space-y-2">
          <Label for="doc-input-readonly">readonly（可选中复制，不能改）</Label>
          <Input id="doc-input-readonly" readonly default-value="只读内容" />
        </div>
        <div class="space-y-2">
          <Label for="doc-input-required">required（必填）</Label>
          <Input id="doc-input-required" required placeholder="必填项" />
        </div>
        <div class="space-y-2">
          <Label for="doc-input-invalid">错误态</Label>
          <Input
            id="doc-input-invalid"
            v-model="emailValue"
            :aria-invalid="emailInvalid"
            @input="emailInvalid = !emailValue.includes('@')"
          />
          <p class="text-destructive text-sm">
            {{ emailInvalid ? '请输入合法的邮箱地址' : '格式正确' }}
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 非受控 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">非受控：default-value</h2>
        <CardDescription>
          不需要在外面维护状态时，用 <code>default-value</code> 给初始值，之后值就存在原生 input 里。<br />
          注意：<code>&lt;Input ref="el"&gt;</code> 拿到的是<b>组件实例</b>（组件没做 <code>defineExpose</code>），
          想拿 DOM 得用 <code>el.$el</code> 或直接按 <code>id</code> 取。
        </CardDescription>
      </CardHeader>
      <CardContent class="max-w-sm space-y-3">
        <Label for="doc-input-uncontrolled">站点名称</Label>
        <Input
          id="doc-input-uncontrolled"
          default-value="RionStudio"
          placeholder="随便改，改完点下面按钮读值"
        />
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="readUncontrolled">读取原生值</Button>
          <code class="text-sm text-muted-foreground">{{ uncontrolledRead || '（未读取）' }}</code>
        </div>
      </CardContent>
    </Card>

    <!-- 6. 定制 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">定制：图标 / 尺寸 / 圆角</h2>
        <CardDescription>
          高度、内边距、圆角都是样式预设锁定的（预设那行写了 <code>h-9 px-2.5 rounded-md</code>，
          连左右内边距一起管），所以想改必须带 <code>!</code> —— 图标位写 <code>pl-9!</code>，
          大号圆角写 <code>h-12! rounded-full!</code>。正式场景的「前后缀」请用 <code>InputGroup</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="relative max-w-sm">
          <Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input placeholder="搜索组件…" class="pl-9!" />
        </div>
        <div class="relative max-w-sm">
          <Mail class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input type="email" placeholder="邮箱（大号圆角）" class="h-12! rounded-full! pl-9!" />
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          <code>Input</code> 只声明了下面 3 个 prop，其余属性一律透传到原生 <code>&lt;input&gt;</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">Prop</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in propRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">透传属性</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in passThroughRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
