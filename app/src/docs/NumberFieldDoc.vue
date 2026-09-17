<script setup lang="ts">
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import { ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'

// ---------- 演示状态 ----------
/** 基础：受控值 */
const quantity = ref(12)
/** 范围 + 步进 */
const half = ref(2.5)
/** 货币 */
const price = ref(1299)
/** 百分比（值是小数，显示成 %） */
const ratio = ref(0.25)

// ---------- API ----------
const rootRows = [
  { name: 'v-model', type: 'number', def: '—', desc: '受控值（就是普通数字，不是字符串）' },
  { name: 'defaultValue', type: 'number', def: '—', desc: '非受控时的初值' },
  { name: 'min / max', type: 'number', def: '—', desc: '可输入范围：到界后对应的增减按钮会自动 <code>disabled</code>（淡到 20%）' },
  { name: 'step', type: 'number', def: '1', desc: '点按钮 / 按上下方向键的步长（可以是小数，如 0.5）' },
  { name: 'stepSnapping', type: 'boolean', def: 'true', desc: '手输的值是否吸附到 <code>step</code> 的整数倍；设 <code>false</code> 就允许任意值（按钮仍按 step 增减）' },
  { name: 'formatOptions', type: 'Intl.NumberFormatOptions', def: '—', desc: '交给 <code>Intl.NumberFormat</code> 的格式化选项：货币、百分比、小数位、千分位等；输入框里显示的就是格式化后的文本' },
  { name: 'locale', type: 'string', def: '—', desc: '格式化的语言环境（如 <code>zh-CN</code>），影响千分位与小数点' },
  { name: 'disabled / readonly / required / name / id', type: '—', def: '—', desc: '原生语义透传；<code>name</code> 会挂在内部 input 上，可直接随表单提交' },
]

const partRows = [
  { name: 'NumberField', slot: '—', desc: '根：<code>grid gap-1.5</code>；只管状态与上下文，不渲染额外盒子' },
  { name: 'NumberFieldContent', slot: '—', desc: '包裹输入框与按钮的 <code>relative</code> 容器：检测到相邻的 <code>data-slot="increment"</code> / <code>"decrement"</code> 时，会<b>自动</b>给输入框补 <code>pr-5</code> / <code>pl-5</code>（数字不被按钮压住）' },
  { name: 'NumberFieldInput', slot: 'input', desc: '真正输入的地方：<code>inputmode="decimal"</code>、文本居中、h-9 描边样式；键盘上下键同样按 <code>step</code> 增减' },
  { name: 'NumberFieldIncrement', slot: 'increment', desc: '右侧 ＋ 按钮（绝对定位、垂直居中）：默认 <code>Plus</code> 图标，可换默认插槽；禁用时 <code>opacity-20</code>' },
  { name: 'NumberFieldDecrement', slot: 'decrement', desc: '左侧 － 按钮：同上，默认 <code>Minus</code> 图标' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Number Field 数字输入框</h1>
    <p class="mt-3 text-muted-foreground">
      带增减按钮的数字输入：值类型是真正的 <code>number</code>（不是字符串），自带范围限制、步长、键盘上下键，
      以及基于 <code>Intl.NumberFormat</code> 的格式化（货币 / 百分比 / 千分位）。<br />
      结构：<code>NumberField</code> → <code>NumberFieldContent</code>（relative 容器）→ 里面依次放
      <code>NumberFieldDecrement</code> + <code>NumberFieldInput</code> + <code>NumberFieldIncrement</code>；
      两个按钮是绝对定位，所以顺序不影响位置，但<b>必须和输入框一起放在 Content 里</b>（Content 会据此给输入框补左右内边距）。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>v-model</code> 拿到的就是数字。点两侧按钮或聚焦后按 ↑ / ↓ 都能改，长按按钮会持续增减。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="w-40">
          <NumberField v-model="quantity">
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </div>
        <p class="text-sm text-muted-foreground">
          当前值：<code class="rounded bg-muted px-1.5 py-0.5 font-mono">{{ quantity }}（{{ typeof quantity }}）</code>
        </p>
      </CardContent>
    </Card>

    <!-- 2. 范围与步进 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">范围与步进</h2>
        <CardDescription>
          <code>:min="0" :max="10" :step="0.5"</code>：步长可以是小数；到边界后对应按钮自动禁用（变淡且点不动）。
          手输超范围的值会在失焦时被夹回区间。<br />
          另外 <code>step-snapping</code> 默认开启 —— 手输 <code>3.7</code> 会被吸附到最近的 <code>0.5</code> 倍数。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="w-40">
          <NumberField v-model="half" :min="0" :max="10" :step="0.5">
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </div>
        <p class="text-sm text-muted-foreground">
          当前值：<code class="rounded bg-muted px-1.5 py-0.5 font-mono">{{ half }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 3. 格式化 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">格式化（货币 / 百分比）</h2>
        <CardDescription>
          <code>format-options</code> 直接透传给 <code>Intl.NumberFormat</code>，输入框里显示的就是格式化文本，
          而 <code>v-model</code> 仍然是纯数字。<br />
          百分比要注意：值是<b>小数</b>（<code>0.25</code> 显示成 <code>25%</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap gap-8">
        <div class="space-y-2">
          <Label>价格（人民币，千分位）</Label>
          <div class="w-44">
            <NumberField
              v-model="price"
              :format-options="{ style: 'currency', currency: 'CNY', maximumFractionDigits: 2 }"
              locale="zh-CN"
              :step="100"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
          <p class="text-xs text-muted-foreground">
            v-model = <code class="font-mono">{{ price }}</code>
          </p>
        </div>

        <div class="space-y-2">
          <Label>占比（百分比）</Label>
          <div class="w-36">
            <NumberField
              v-model="ratio"
              :format-options="{ style: 'percent', maximumFractionDigits: 1 }"
              :step="0.05"
              :min="0"
              :max="1"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
          <p class="text-xs text-muted-foreground">
            v-model = <code class="font-mono">{{ ratio }}</code>
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 禁用 / 只读 / 自定义按钮 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁用、只读与自定义按钮</h2>
        <CardDescription>
          <code>disabled</code> 整块不可交互，<code>readonly</code> 只能看不能改（按钮也会禁用）。
          想换图标就写 <code>NumberFieldIncrement</code> / <code>Decrement</code> 的默认插槽。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-start gap-8">
        <div class="space-y-2">
          <Label>disabled</Label>
          <div class="w-40">
            <NumberField :default-value="5" disabled>
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
        </div>

        <div class="space-y-2">
          <Label>readonly</Label>
          <div class="w-40">
            <NumberField :default-value="5" readonly>
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
        </div>

        <div class="space-y-2">
          <Label>自定义图标（上下箭头）</Label>
          <div class="w-40">
            <NumberField :default-value="3" :min="0" :max="9">
              <NumberFieldContent>
                <NumberFieldDecrement>
                  <ChevronDown class="h-4 w-4" />
                </NumberFieldDecrement>
                <NumberFieldInput />
                <NumberFieldIncrement>
                  <ChevronUp class="h-4 w-4" />
                </NumberFieldIncrement>
              </NumberFieldContent>
            </NumberField>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>根组件的 props（其余部件都只透传 <code>class</code> 与 reka 的原生 props）。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">Props</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rootRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">组件</th>
                <th class="py-2 pr-4 font-medium">data-slot</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in partRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground"><code>{{ row.slot }}</code></td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-sm text-muted-foreground">
          配 <code>Label</code>（或 <code>Field</code> / <code>FieldLabel</code>）时，把 <code>id</code> 传给
          <code>NumberField</code>、<code>for</code> 传给 <code>Label</code> 即可正常关联；点标签会聚焦到数字输入框。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
