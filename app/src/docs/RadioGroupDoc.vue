<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { CheckIcon, SquareIcon } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// 基础
const plan = ref('pro')
const planLabel: Record<string, string> = { free: '免费版', pro: '专业版', team: '企业版' }

// Label 联动 + 禁用
const contact = ref('email')
const contactLog = ref('')

// 横向 + 键盘
const size = ref('m')
const keyLog = ref('')

function logKey(event: KeyboardEvent) {
  if (event.key.startsWith('Arrow'))
    keyLog.value = `按下 ${event.key} → 当前 ${size.value}`
}

// 自定义指示器
const mark = ref('star')

// 受控 / 非受控
const controlled = ref('a')
const uncontrolledLog = ref('')

// 表单提交
const submitted = ref('')

function onSubmit(event: Event) {
  event.preventDefault()
  const form = event.target as HTMLFormElement
  submitted.value = JSON.stringify(Object.fromEntries(new FormData(form).entries()), null, 2)
}

const rootRows = [
  { name: 'v-model', type: 'string | number', def: '—', desc: '当前选中值（受控）；不传则用 <code>default-value</code> 自己管' },
  { name: 'defaultValue', type: 'string | number', def: '—', desc: '非受控初始值' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '整组禁用：所有项都不可选、也不参与方向键' },
  { name: 'name', type: 'string', def: '—', desc: '提交字段名。**会为一个隐藏的原生 input 带上该 name**，所以能直接进 <code>FormData</code>' },
  { name: 'required', type: 'boolean', def: 'false', desc: '标记必选（透传给原生 input 的 <code>required</code>）' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", def: "'vertical'", desc: '决定<b>哪一组方向键</b>能切换（横向用左右键、纵向用上下键），同时写进 <code>aria-orientation</code>' },
  { name: 'loop', type: 'boolean', def: 'true', desc: '方向键走到头是否绕回另一头' },
  { name: 'dir', type: "'ltr' | 'rtl'", def: '—', desc: '阅读方向，影响方向键左右语义' },
]

const itemRows = [
  { name: 'value', type: 'string | number', def: '—', desc: '必填，该项的值（选中时同步给根组件的 <code>v-model</code>）' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '单项禁用：不能点、被方向键跳过（视觉上 <code>opacity: .5</code>）' },
  { name: 'id', type: 'string', def: '—', desc: '配 <code>&lt;Label :for="id"&gt;</code> 用，让选项文字也能点（原生 button 是 labelable 的，所以真的能联动）' },
  { name: 'required', type: 'boolean', def: 'false', desc: '单项必选标记' },
  { name: 'as / asChild', type: 'string | boolean', def: "'button'", desc: '换掉根元素（默认渲染 <code>role="radio"</code> 的 button）' },
]

const partRows = [
  { name: 'RadioGroupItem', slot: 'radio-group-item', desc: '一个选项（<code>role="radio"</code>）。输出 <code>data-state="checked | unchecked"</code> 与 <code>data-disabled</code>，选中态外观由样式预设按 <code>data-state</code> 接管' },
  { name: 'RadioGroupIndicator', slot: 'radio-group-indicator', desc: '选项内部的圆点容器，<b>只在选中时渲染</b>；默认插槽是 <code>CircleIcon</code>（带 <code>cn-radio-group-indicator-icon</code>），可以整体替换' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Radio Group 单选组</h1>
    <p class="mt-3 text-muted-foreground">
      一组互斥选项，同一时刻只能选一个。根组件是 <code>role="radiogroup"</code>，键盘方向键切换、<code>Tab</code>
      进出整组（组内只占一个 Tab 位，这是单选组的规范行为）。<br />
      外观交给样式预设按 <code>data-state</code> 接管，所以 8 套设计系统下长相各不相同。
    </p>

    <!-- 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>v-model</code> 绑一个值，每个 <code>RadioGroupItem</code> 给一个 <code>value</code>。
          点一下切换，顶部徽标实时跟着变。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-muted-foreground">当前选择：</span>
          <Badge variant="secondary">{{ plan }} · {{ planLabel[plan] }}</Badge>
        </div>

        <RadioGroup v-model="plan">
          <div class="flex items-center gap-2">
            <RadioGroupItem id="plan-free" value="free" />
            <Label for="plan-free">免费版</Label>
          </div>
          <div class="flex items-center gap-2">
            <RadioGroupItem id="plan-pro" value="pro" />
            <Label for="plan-pro">专业版</Label>
          </div>
          <div class="flex items-center gap-2">
            <RadioGroupItem id="plan-team" value="team" />
            <Label for="plan-team">企业版</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>

    <!-- 文字可点 + 禁用 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">文字可点与禁用项</h2>
        <CardDescription>
          给 <code>RadioGroupItem</code> 一个 <code>id</code>，再用 <code>&lt;Label :for&gt;</code> 关联 ——
          点文字就等于点选项（原生 button 是 labelable 元素，所以是真的联动，不是靠 JS 转发）。<br />
          某一项加 <code>disabled</code> 后不能点，方向键也会自动跳过它。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-muted-foreground">联系方式：</span>
          <Badge variant="secondary">{{ contact }}</Badge>
          <span v-if="contactLog" class="text-muted-foreground">{{ contactLog }}</span>
        </div>

        <RadioGroup v-model="contact" @update:model-value="(v) => contactLog = `已切到「${v}」`">
          <div class="flex items-center gap-2">
            <RadioGroupItem id="contact-email" value="email" />
            <Label for="contact-email">邮件（点这行文字也能选中）</Label>
          </div>
          <div class="flex items-center gap-2">
            <RadioGroupItem id="contact-im" value="im" />
            <Label for="contact-im">即时消息</Label>
          </div>
          <div class="flex items-center gap-2">
            <RadioGroupItem id="contact-phone" value="phone" disabled />
            <Label for="contact-phone">电话（暂不可用）</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>

    <!-- 横向 + 键盘 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">横向布局与键盘</h2>
        <CardDescription>
          用 <code>class</code> 改成横向，同时把 <code>orientation="horizontal"</code> 传上 —— 这样方向键才是
          <b>左右</b>切换（纵向布局是上下键）。横向时组件会自己兜一个 <code>dir="ltr"</code>，
          否则 reka 的 RovingFocus 拿不到方向、左右键会完全失效（需要 RTL 时自己传 <code>dir</code> 覆盖即可）。<br />
          <code>loop</code> 默认 <code>true</code>：在两端继续按同方向会绕回另一头。先点一个选项，再按方向键。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <RadioGroup v-model="size" orientation="horizontal" class="flex flex-wrap gap-6" @keydown="logKey">
          <div v-for="option in [['s', '小'], ['m', '中'], ['l', '大']]" :key="option[0]" class="flex items-center gap-2">
            <RadioGroupItem :id="`size-${option[0]}`" :value="option[0]" />
            <Label :for="`size-${option[0]}`">{{ option[1] }}</Label>
          </div>
        </RadioGroup>

        <p class="text-sm text-muted-foreground">
          {{ keyLog || '（还没有按键）' }}
        </p>
      </CardContent>
    </Card>

    <!-- 自定义指示器 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">自定义指示器</h2>
        <CardDescription>
          <code>RadioGroupItem</code> 的默认插槽就是选中标记容器，塞什么进去都行 —— 下面两组分别用了
          对勾和方块。<br />
          <code>RadioGroupIndicator</code> 只在选中时出现，所以插槽内容不用自己判断状态。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-muted-foreground">当前选择：</span>
          <Badge variant="secondary">{{ mark }}</Badge>
        </div>

        <RadioGroup v-model="mark">
          <div class="flex items-center gap-2">
            <RadioGroupItem id="mark-star" value="star">
              <CheckIcon class="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2" />
            </RadioGroupItem>
            <Label for="mark-star">用对勾当标记</Label>
          </div>
          <div class="flex items-center gap-2">
            <RadioGroupItem id="mark-square" value="square">
              <SquareIcon class="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current" />
            </RadioGroupItem>
            <Label for="mark-square">用方块当标记</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>

    <!-- 受控 / 非受控 + 表单 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控、非受控与表单提交</h2>
        <CardDescription>
          左：<code>v-model</code> 受控，外面的按钮能改它；右：只给 <code>default-value</code>，组件自己管当前选中项 ——
          外面只收到 <code>update:model-value</code> 事件，没有双向绑定。<br />
          下面第三个是真正的 <code>&lt;form&gt;</code>：给 <code>RadioGroup</code> 一个 <code>name</code>，
          提交时它会把选中值放进 <code>FormData</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="space-y-3">
            <p class="text-sm font-medium">受控（v-model）</p>
            <RadioGroup v-model="controlled">
              <div class="flex items-center gap-2">
                <RadioGroupItem id="ctrl-a" value="a" />
                <Label for="ctrl-a">A</Label>
              </div>
              <div class="flex items-center gap-2">
                <RadioGroupItem id="ctrl-b" value="b" />
                <Label for="ctrl-b">B</Label>
              </div>
            </RadioGroup>
            <div class="flex items-center gap-2">
              <Button size="sm" variant="outline" @click="controlled = controlled === 'a' ? 'b' : 'a'">
                外部切到 {{ controlled === 'a' ? 'B' : 'A' }}
              </Button>
              <Badge variant="secondary">{{ controlled }}</Badge>
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-sm font-medium">非受控（default-value）</p>
            <RadioGroup default-value="x" @update:model-value="(v) => uncontrolledLog = `组件内部已切到「${v}」`">
              <div class="flex items-center gap-2">
                <RadioGroupItem id="unc-x" value="x" />
                <Label for="unc-x">X</Label>
              </div>
              <div class="flex items-center gap-2">
                <RadioGroupItem id="unc-y" value="y" />
                <Label for="unc-y">Y</Label>
              </div>
            </RadioGroup>
            <p class="text-sm text-muted-foreground">
              {{ uncontrolledLog || '（还没切过）' }}
            </p>
          </div>
        </div>

        <form class="space-y-3 border-t pt-6" @submit="onSubmit">
          <p class="text-sm font-medium">表单提交</p>
          <RadioGroup name="shipping" default-value="standard">
            <div class="flex items-center gap-2">
              <RadioGroupItem id="ship-standard" value="standard" />
              <Label for="ship-standard">标准配送</Label>
            </div>
            <div class="flex items-center gap-2">
              <RadioGroupItem id="ship-express" value="express" />
              <Label for="ship-express">加急配送</Label>
            </div>
          </RadioGroup>
          <div class="flex items-center gap-3">
            <Button size="sm" type="submit">
              提交
            </Button>
            <pre v-if="submitted" class="text-xs text-muted-foreground">{{ submitted }}</pre>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>除下列 props 外，reka-ui 的 <code>RadioGroupRoot</code> 全部属性都能透传。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">RadioGroup</th>
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
                <th class="py-2 pr-4 font-medium">RadioGroupItem</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in itemRows" :key="row.name" class="border-b last:border-0">
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
                <th class="py-2 pr-4 font-medium">子部件</th>
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
          事件：根组件抛 <code>@update:model-value</code>（<code>v-model</code> 就是它的语法糖）。
          样式预设按 <code>data-state="checked | unchecked"</code> 与 <code>data-disabled</code> 接管外观，
          要自己覆盖记得带 <code>!</code>（预设是无层样式，优先级高于工具类）。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
