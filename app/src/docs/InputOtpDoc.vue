<script setup lang="ts">
import { computed, ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-vue-next'

// ---------- 演示状态 ----------
/** 6 位，3+3 分组 */
const code = ref('')
/** 4 位 PIN */
const pin = ref('')
/** 8 位 */
const long = ref('')
/** 只允许数字 / 只允许字母 */
const digitsOnly = ref('')
const charsOnly = ref('')
/** 错误态 */
const invalidCode = ref('12')
const invalid = ref(true)
/** 事件日志 */
const log = ref<string[]>([])
const eventCode = ref('')
/** 对齐示例（单独一个 ref，别和上面共用会联动） */
const alignCode = ref('')

function push(name: string, value: unknown) {
  log.value = [`${name}: ${typeof value === 'string' ? value : String(value)}`, ...log.value].slice(0, 5)
}

const isDone = computed(() => code.value.length === 6)

// ---------- API ----------
const propRows = [
  { name: 'maxlength', type: 'number', def: '—', desc: '<b>必填</b>：总位数（不是每格的位数，是整个控件的）' },
  { name: 'v-model', type: 'string', def: "''", desc: '整串值；也可以只给 default-value 走非受控' },
  { name: 'pattern', type: 'string | RegExp', def: '—', desc: '校验<b>整串</b>的正则（带 ^…$）；不匹配则整次输入作废。常用 REGEXP_ONLY_DIGITS / REGEXP_ONLY_CHARS / REGEXP_ONLY_DIGITS_AND_CHARS，已从本组件库转出' },
  { name: 'inputmode', type: "'numeric' | 'text'", def: "'numeric'", desc: '控制移动端弹哪种键盘' },
  { name: 'text-align', type: "'left' | 'center' | 'right'", def: "'left'", desc: '光标初始落在哪一格（影响「未聚焦时看起来的样子」）' },
  { name: 'container-class', type: 'string', def: '—', desc: '作用于最外层容器（我们默认给了 flex items-center gap-2）；组件上的 class 就是它' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用：整块 opacity-50 且 cursor-not-allowed' },
  { name: 'aria-invalid', type: "'true' | 'false'", def: '—', desc: '错误态；写在根组件上，由库透到格子上' },
  { name: 'push-password-manager-strategy', type: "'increase-width' | 'none'", def: "'increase-width'", desc: '让密码管理器能识别；不想被接管就传 none' },
  { name: '其它输入属性', type: '—', def: '—', desc: 'name / autocomplete / placeholder / readonly… 透传到内部那个隐藏 input' },
]

const emitRows = [
  { name: 'complete', type: 'value: string', desc: '填满全部位数时触发（最常用：拿到就提交验证）' },
  { name: 'input', type: 'value: string', desc: '每次输入变化；v-model 绑的就是它' },
  { name: 'change / select / paste', type: 'e: Event', desc: '原生同名的转发事件' },
  { name: 'focus / blur', type: 'e: FocusEvent', desc: '整块控件（内部那个 input）的聚焦失焦' },
]

const slotStateRows = [
  { name: 'char', type: 'string | null', desc: '该格已输入的字符' },
  { name: 'isActive', type: 'boolean', desc: '光标是否停留在此格（映射成 data-active）' },
  { name: 'hasFakeCaret', type: 'boolean', desc: '要不要画那根会闪的假光标' },
  { name: 'placeholderChar', type: 'string | null', desc: '占位字符（配 placeholder 用）' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Input OTP 验证码输入</h1>
    <p class="mt-3 text-muted-foreground">
      一次性验证码 / PIN 码输入框：外观是一排格子，实际是<b>一个隐藏 input</b>——<br />
      所以整块可聚焦、支持粘贴整串、密码管理器也认得，比「手搓 n 个 input」省事得多。<br />
      用法：<code>InputOTP</code>（必给 <code>maxlength</code>）里放
      <code>InputOTPGroup</code> + 若干 <code>InputOTPSlot :index="n"</code>。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法：6 位验证码</h2>
        <CardDescription>
          填满时触发 <code>complete</code>，适合直接拿去校验。格子保持连续编号，断开处用
          <code>InputOTPSeparator</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-4">
          <Label for="otp-basic">验证码</Label>
          <InputOTP v-model="code" :maxlength="6" @complete="push('complete', $event)">
            <InputOTPGroup>
              <InputOTPSlot :index="0" />
              <InputOTPSlot :index="1" />
              <InputOTPSlot :index="2" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot :index="3" />
              <InputOTPSlot :index="4" />
              <InputOTPSlot :index="5" />
            </InputOTPGroup>
          </InputOTP>
          <Badge v-if="isDone" variant="secondary">
            <Check />
            已填满
          </Badge>
        </div>
        <p class="text-sm text-muted-foreground">
          当前值：<code>{{ code || '（空）' }}</code>
          <span v-if="isDone"> → 可以提交了</span>
        </p>
      </CardContent>
    </Card>

    <!-- 2. 位数与分组 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">位数与分组</h2>
        <CardDescription>
          位数由 <code>maxlength</code> 决定；分组只是视觉上的，<code>InputOTPGroup</code>
          里连续放格子、组与组之间插分隔符就行。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="space-y-2">
          <Label for="otp-pin">4 位 PIN（不分隔）</Label>
          <InputOTP v-model="pin" :maxlength="4">
            <InputOTPGroup>
              <InputOTPSlot v-for="i in 4" :key="i" :index="i - 1" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Separator />

        <div class="space-y-2">
          <Label for="otp-long">8 位（4 + 4）</Label>
          <InputOTP v-model="long" :maxlength="8">
            <InputOTPGroup>
              <InputOTPSlot v-for="i in 4" :key="i" :index="i - 1" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot v-for="i in 4" :key="`b${i}`" :index="i + 3" />
            </InputOTPGroup>
          </InputOTP>
          <p class="text-muted-foreground text-xs">
            用 <code>v-for</code> 摆格子时，<code>index</code> 要自己按全局序号算（后一组是 4~7）
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 限制字符 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">限制字符：pattern</h2>
        <CardDescription>
          <code>pattern</code> 是<b>整串</b>校验的正则：库会拿「当前全部内容」整体去
          <code>test()</code>，不匹配就整次输入作废。<br />
          所以必须写带 <code>^…$</code> 的全串正则 —— 写成 <code>[0-9]*</code> 会因为能匹配空串而
          <b>永远通过</b>（等于没限制）。官方备好了 <code>REGEXP_ONLY_DIGITS</code> /
          <code>REGEXP_ONLY_CHARS</code> / <code>REGEXP_ONLY_DIGITS_AND_CHARS</code>，
          我们从组件库一并转出了。
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-5 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="otp-digits">只允许数字（<code>REGEXP_ONLY_DIGITS</code>）</Label>
          <InputOTP v-model="digitsOnly" :maxlength="4" :pattern="REGEXP_ONLY_DIGITS">
            <InputOTPGroup>
              <InputOTPSlot v-for="i in 4" :key="i" :index="i - 1" />
            </InputOTPGroup>
          </InputOTP>
          <p class="text-muted-foreground text-xs">试试输字母 → 整次输入会被丢掉</p>
        </div>

        <div class="space-y-2">
          <Label for="otp-chars">只允许字母（<code>REGEXP_ONLY_CHARS</code>）</Label>
          <InputOTP v-model="charsOnly" :maxlength="4" :pattern="REGEXP_ONLY_CHARS">
            <InputOTPGroup>
              <InputOTPSlot v-for="i in 4" :key="i" :index="i - 1" />
            </InputOTPGroup>
          </InputOTP>
          <p class="text-muted-foreground text-xs">用于「字母 + 数字混合」的邀请码</p>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 状态 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">状态：错误 / 禁用 / 对齐</h2>
        <CardDescription>
          <code>aria-invalid</code> 写在<b>根组件</b>上（库里会把它透到格子上），
          <code>text-align</code> 决定光标初始停在哪一格。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="space-y-2">
          <Label>错误态（只输了 2 位就提交）</Label>
          <InputOTP
            v-model="invalidCode"
            :maxlength="6"
            :aria-invalid="invalid"
            @input="invalid = invalidCode.length !== 6"
          >
            <InputOTPGroup>
              <InputOTPSlot v-for="i in 6" :key="i" :index="i - 1" />
            </InputOTPGroup>
          </InputOTP>
          <p class="text-destructive text-sm">
            {{ invalid ? '验证码应为 6 位' : '长度正确' }}
          </p>
        </div>

        <Separator />

        <div class="space-y-2">
          <Label>禁用</Label>
          <InputOTP :maxlength="4" disabled default-value="1234">
            <InputOTPGroup>
              <InputOTPSlot v-for="i in 4" :key="i" :index="i - 1" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Separator />

        <div class="space-y-2">
          <Label>text-align="center"（居中起始）</Label>
          <InputOTP v-model="alignCode" :maxlength="4" text-align="center">
            <InputOTPGroup>
              <InputOTPSlot v-for="i in 4" :key="i" :index="i - 1" />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 事件 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">事件</h2>
        <CardDescription>
          除了 <code>complete</code>，还有 <code>input</code> / <code>change</code> /
          <code>paste</code> / <code>focus</code> / <code>blur</code>。下面这块会实时记录。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <InputOTP
          v-model="eventCode"
          :maxlength="4"
          @input="push('input', $event)"
          @change="push('change', 'event')"
          @complete="push('complete', $event)"
          @focus="push('focus', 'event')"
          @blur="push('blur', 'event')"
        >
          <InputOTPGroup>
            <InputOTPSlot v-for="i in 4" :key="i" :index="i - 1" />
          </InputOTPGroup>
        </InputOTP>
        <div class="bg-muted/40 min-h-24 rounded-md border p-3 text-sm">
          <p v-for="(line, i) in log" :key="i" class="font-mono text-xs">
            {{ line }}
          </p>
          <p v-if="!log.length" class="text-muted-foreground text-xs">点一下上面输入框，敲几个键看看</p>
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          一共 4 个组件：<code>InputOTP</code> / <code>InputOTPGroup</code> /
          <code>InputOTPSlot</code>（必须传 <code>index</code>）/ <code>InputOTPSeparator</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">InputOTP</th>
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
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">事件</th>
                <th class="py-2 pr-4 font-medium">参数</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in emitRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">槽位状态（slot 作用域里可拿到）</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in slotStateRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
