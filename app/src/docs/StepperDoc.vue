<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'

/* ── 演示数据 ── */
const steps = [
  { step: 1, title: '账号信息', desc: '邮箱与密码' },
  { step: 2, title: '团队设置', desc: '名称与规模' },
  { step: 3, title: '邀请成员', desc: '可稍后再说' },
  { step: 4, title: '完成', desc: '确认并开始' },
]

const step = ref(1)
const linearStep = ref(1)
const verticalStep = ref(2)
const customStep = ref(2)

const current = computed(() => steps[step.value - 1])

/* ── API 表 ── */
const rootRows = [
  { name: 'v-model', type: 'number', def: '1', desc: '当前第几步（<b>从 1 开始</b>，不是 0）。内部用它派生每个 <code>StepperItem</code> 的状态' },
  { name: 'defaultValue', type: 'number', def: '1', desc: '非受控时的初始步数' },
  { name: 'linear', type: 'boolean', def: 'true', desc: '线性模式（默认）：只能「上一步」或「前进一步」，点跳跃更远的步骤会被忽略。传 <code>false</code> 就能随便跳' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", def: "'horizontal'", desc: '仅用于无障碍语义与 <code>StepperSeparator</code> 的 <code>data-orientation</code>；<b>布局要自己切</b>（纵向时给根节点加 <code>flex-col</code>）' },
  { name: 'class', type: 'string', def: '—', desc: '根节点默认是 <code>flex gap-2</code>；纵向布局在这里加 <code>flex-col</code>' },
]

const itemRows = [
  { name: 'step', type: 'number', def: '—', desc: '<b>必填</b>，且要与 v-model 的取值对得上（从 1 开始）' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用这一步：不可点、不可聚焦，<code>data-state</code> 仍然是 <code>inactive</code>' },
  { name: 'completed', type: 'boolean', def: 'false', desc: '手动把它标成「已完成」（优先级最高）。用来做「跳着填完的表单」—— 比如第 2 步先填了、第 1 步还没走完' },
]

const partRows = [
  { name: 'StepperItem', desc: '一步的容器（<code>flex items-center gap-2 group</code> + <code>data-[disabled]:pointer-events-none</code>）。<b>它会派生 <code>data-state</code></b>（<code>active</code> / <code>completed</code> / <code>inactive</code>），后面几个部件的样式全靠这个属性' },
  { name: 'StepperTrigger', desc: '可点区域（默认 <code>flex flex-col items-center</code> + <code>p-1</code>）。点它或聚焦后按 <code>Enter</code> / <code>Space</code> 切换步骤；线性模式下只有「已走过的」和「下一步」能聚焦' },
  { name: 'StepperIndicator', desc: '圆形编号（<code>w-8 h-8 rounded-full</code>）：<b>inactive</b> 是 <code>text-muted-foreground/50</code>、<b>active</b> 是主色底 + 主色前景、<b>completed</b> 是 accent 底。默认插槽可以拿到 <code>{ step }</code>，不传就渲染「Step N」' },
  { name: 'StepperSeparator', desc: '步骤之间的连线。<b>组件没给尺寸</b> —— 自己写 <code>h-px flex-1</code>（横向）或 <code>w-px flex-1</code>（纵向）；已完成时底色会变成 accent' },
  { name: 'StepperTitle / Description', desc: '步骤标题（<code>font-semibold</code> + 不换行）与说明（<code>text-sm text-muted-foreground</code>）。它们会自动挂到 Trigger 的 <code>aria-labelledby</code> / <code>aria-describedby</code> 上' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Stepper 步骤条</h1>
    <p class="mt-3 text-muted-foreground">
      多步流程的进度指示：<code>Stepper</code> 管当前第几步（<b>从 1 开始</b>），
      每个 <code>StepperItem</code> 声明自己是第几步，里面放 <code>StepperTrigger</code>
      （可点区域）+ <code>StepperIndicator</code>（圆编号）+ <code>StepperTitle</code> / <code>Description</code>，
      步骤之间用 <code>StepperSeparator</code> 连线。<br />
      状态是<b>派生</b>出来的：等于当前步 → <code>active</code>，小于当前步 → <code>completed</code>，
      其余 <code>inactive</code>。组件只负责语义与交互，外观（每一步长什么样、线多长）都由你摆。
    </p>

    <!-- 1. 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          四步的表单流程。点圆点或「上一步 / 下一步」都能切；<code>StepperTrigger</code> 默认是竖排
          （编号在上、标题在下），这里给它加了 <code>flex-row</code> 改成横向排布，更省高度。<br />
          注意 <code>StepperSeparator</code> <b>自带没有任何尺寸</b>（只有颜色），长度得自己用
          <code>h-px flex-1</code> 撑出来；这里还顺手传了 <code>bg-border</code> 把线固定成描边色
          —— 不传的话会用组件自带的 <code>bg-muted → bg-accent</code> 状态色（下一张卡片能看到差别）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <Stepper v-model="step" class="w-full">
          <StepperItem
            v-for="s in steps"
            :key="s.step"
            :step="s.step"
            class="flex-1 last:flex-none"
          >
            <StepperTrigger class="flex-row gap-2">
              <StepperIndicator>{{ s.step }}</StepperIndicator>
              <span class="flex flex-col items-start">
                <StepperTitle>{{ s.title }}</StepperTitle>
                <StepperDescription>{{ s.desc }}</StepperDescription>
              </span>
            </StepperTrigger>

            <StepperSeparator
              v-if="s.step < steps.length"
              class="mx-2 h-px flex-1 bg-border"
            />
          </StepperItem>
        </Stepper>

        <!-- 当前步的内容 -->
        <div class="rounded-lg border border-input p-4">
          <p class="text-sm font-medium">
            第 {{ step }} 步 · {{ current.title }}
          </p>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ current.desc }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <Button variant="outline" size="sm" :disabled="step <= 1" @click="step--">
            上一步
          </Button>
          <Button size="sm" :disabled="step >= steps.length" @click="step++">
            下一步
          </Button>
          <Badge variant="secondary">
            step = {{ step }}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <!-- 2. linear -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">线性 / 非线性</h2>
        <CardDescription>
          <code>linear</code> 默认是 <b>true</b>：只能前进一步或往回走，点跳跃更远的步骤会被静默忽略
          （那个 Trigger 也拿不到焦点）。<br />
          传 <code>:linear="false"</code> 就随便跳 —— 适合「用户可以自由切换的配置向导」。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-3">
          <p class="text-xs font-medium text-muted-foreground">
            linear（默认）：试试直接点第 4 步
          </p>
          <Stepper v-model="linearStep" class="w-full">
            <StepperItem
              v-for="s in steps"
              :key="s.step"
              :step="s.step"
              class="flex-1 last:flex-none"
            >
              <StepperTrigger class="flex-row gap-2">
                <StepperIndicator>{{ s.step }}</StepperIndicator>
                <StepperTitle>{{ s.title }}</StepperTitle>
              </StepperTrigger>
              <StepperSeparator
                v-if="s.step < steps.length"
                class="mx-2 h-px flex-1 bg-border"
              />
            </StepperItem>
          </Stepper>
          <Badge variant="secondary">
            step = {{ linearStep }}
          </Badge>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-medium text-muted-foreground">
            :linear="false" —— 想点哪步点哪步
          </p>
          <Stepper :default-value="1" :linear="false" class="w-full">
            <StepperItem
              v-for="s in steps"
              :key="s.step"
              :step="s.step"
              class="flex-1 last:flex-none"
            >
              <StepperTrigger class="flex-row gap-2">
                <StepperIndicator>{{ s.step }}</StepperIndicator>
                <StepperTitle>{{ s.title }}</StepperTitle>
              </StepperTrigger>
              <StepperSeparator
                v-if="s.step < steps.length"
                class="mx-2 h-px flex-1 bg-border"
              />
            </StepperItem>
          </Stepper>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 禁用与手动完成 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁用某步 / 手动标记已完成</h2>
        <CardDescription>
          <code>StepperItem</code> 上的 <code>disabled</code> 让这一步不可点、不可聚焦；
          <code>completed</code> 则能把它<b>强制</b>标成已完成（优先级高于「小于当前步」的推断）。<br />
          下面这条：第 3 步被禁用，第 2 步与第 4 步被手动标成已完成 —— 即使当前才走到第 1 步。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Stepper :default-value="1" class="w-full">
          <StepperItem
            v-for="s in steps"
            :key="s.step"
            :step="s.step"
            :disabled="s.step === 3"
            :completed="s.step === 2 || s.step === 4"
            class="flex-1 last:flex-none"
          >
            <StepperTrigger class="flex-row gap-2">
              <StepperIndicator>
                <Check v-if="s.step === 2 || s.step === 4" class="size-4" />
                <template v-else>{{ s.step }}</template>
              </StepperIndicator>
              <StepperTitle>{{ s.title }}</StepperTitle>
            </StepperTrigger>
            <!-- 这条故意不覆盖底色：组件自带 bg-muted → 完成后 bg-accent 的切换就露出来了 -->
            <StepperSeparator
              v-if="s.step < steps.length"
              class="mx-2 h-px flex-1"
            />
          </StepperItem>
        </Stepper>
        <p class="mt-4 text-xs text-muted-foreground">
          第 3 步的圆点是灰色半透明（<code>group-data-[disabled]</code>）、点不动；
          第 2、4 步的 <code>data-state</code> 被强制成 <code>completed</code>，所以是 accent 底 + 勾。<br />
          这条分隔线<b>没有</b>覆盖底色，因此能看出组件自带的配色：默认 <code>bg-muted</code> 很浅，
          一旦它所在的那一步变成 <code>completed</code>，线就转成 <code>bg-accent</code>
          —— 第 2 步后面那条已经比其它两条亮一档了。
        </p>
      </CardContent>
    </Card>

    <!-- 4. 纵向 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">纵向</h2>
        <CardDescription>
          <code>orientation="vertical"</code> 只改语义（<code>aria-orientation</code> 与 separator 的
          <code>data-orientation</code>），<b>布局要自己切</b>：根节点加 <code>flex-col</code>、
          每个 item 加 <code>flex-col items-start</code>，separator 换成竖线 <code>w-px flex-1</code>。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Stepper v-model="verticalStep" orientation="vertical" class="flex-col gap-0">
          <StepperItem
            v-for="s in steps"
            :key="s.step"
            :step="s.step"
            class="flex-col items-start gap-0"
          >
            <StepperTrigger class="flex-row gap-3">
              <StepperIndicator>{{ s.step }}</StepperIndicator>
              <span class="flex flex-col items-start">
                <StepperTitle>{{ s.title }}</StepperTitle>
                <StepperDescription>{{ s.desc }}</StepperDescription>
              </span>
            </StepperTrigger>
            <StepperSeparator
              v-if="s.step < steps.length"
              class="ml-4 h-6 w-px bg-border"
            />
          </StepperItem>
        </Stepper>
        <div class="mt-4 flex items-center gap-3">
          <Button variant="outline" size="sm" :disabled="verticalStep <= 1" @click="verticalStep--">
            上一步
          </Button>
          <Button size="sm" :disabled="verticalStep >= steps.length" @click="verticalStep++">
            下一步
          </Button>
          <Badge variant="secondary">
            step = {{ verticalStep }}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 自定义指示器 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">自定义指示器内容</h2>
        <CardDescription>
          <code>StepperIndicator</code> 的默认插槽会给你 <code>{ step }</code>（不传插槽时它自己渲染「Step N」）。<br />
          常见改法：用文字代替数字（「账户 / 支付 / 完成」）、已完成显示勾、或者干脆换成图标。
          判断状态用祖先 <code>StepperItem</code> 上的 <code>group-data-[state=…]</code> 即可。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Stepper v-model="customStep" class="w-full">
          <StepperItem
            v-for="s in steps"
            :key="s.step"
            :step="s.step"
            class="flex-1 last:flex-none"
          >
            <StepperTrigger class="flex-row gap-2">
              <StepperIndicator class="w-10">
                <!-- 默认插槽会拿到 { step }；不传则渲染「Step N」 -->
                <template #default="{ step: n }">
                  <Check class="hidden size-4 group-data-[state=completed]:block" />
                  <span class="group-data-[state=completed]:hidden">{{ n }}</span>
                </template>
              </StepperIndicator>
              <StepperTitle>{{ s.title }}</StepperTitle>
            </StepperTrigger>
            <StepperSeparator
              v-if="s.step < steps.length"
              class="mx-2 h-px flex-1 bg-border"
            />
          </StepperItem>
        </Stepper>
        <p class="text-xs text-muted-foreground">
          走过的步骤圆点里是勾、当前与未来的仍是数字（<code>group-data-[state=completed]:hidden/block</code> 一对切）。
          点「下一步」看变化。
        </p>
      </CardContent>
    </Card>

    <!-- 6. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription><code>Stepper</code>（根，透传 reka 的 <code>StepperRoot</code>）。</CardDescription>
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
        <h2 class="text-xl font-semibold">StepperItem</h2>
        <CardDescription>每一步都要声明自己是第几步。</CardDescription>
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
              <tr v-for="row in itemRows" :key="row.name" class="border-b last:border-0">
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
        <h2 class="text-xl font-semibold">其余部件</h2>
        <CardDescription>
          一共 7 个导出：1 个根 + 1 个 item + 4 个部位 + 1 条连线。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  部件
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
