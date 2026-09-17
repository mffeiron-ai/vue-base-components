<script setup lang="ts">
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
  type QuestionnaireItemDefinition,
  type QuestionnaireItemStatus,
} from '@/components/ui/questionnaire'

// ---------- 演示 1：完整问卷 ----------
const setupItems: QuestionnaireItemDefinition[] = [
  {
    name: 'goal',
    required: true,
    choices: [{ value: 'speed' }, { value: 'custom' }, { value: 'budget' }],
  },
  {
    name: 'features',
    choices: [{ value: 'table' }, { value: 'chart' }, { value: 'form' }],
  },
  { name: 'email', required: true },
]

const submitted = ref<Record<string, unknown> | null>(null)

function onSubmit(event: Event) {
  const form = event.target as HTMLFormElement
  const answers: Record<string, unknown> = {}
  for (const [key, value] of new FormData(form).entries()) {
    const previous = answers[key]
    if (previous === undefined)
      answers[key] = value
    else if (Array.isArray(previous))
      previous.push(value)
    else
      answers[key] = [previous, value]
  }
  submitted.value = answers
}

// ---------- 演示 2：快捷键与状态 ----------
const shortcutItems: QuestionnaireItemDefinition[] = [
  { name: 'size', choices: [{ value: 's' }, { value: 'm' }, { value: 'l' }] },
  { name: 'channel', required: true, choices: [{ value: 'email' }, { value: 'im' }] },
]

const statuses = ref<Record<string, QuestionnaireItemStatus>>({})
function trackStatus(name: string, status: QuestionnaireItemStatus) {
  statuses.value = { ...statuses.value, [name]: status }
}
const statusLabel: Record<QuestionnaireItemStatus, string> = {
  answered: '已作答',
  skipped: '已跳过',
  unanswered: '未作答',
}

// ---------- 演示 3：受控切题 ----------
const controlledItems: QuestionnaireItemDefinition[] = [
  { name: 'team', required: true, choices: [{ value: 'design' }, { value: 'dev' }] },
  { name: 'scale', choices: [{ value: 'small' }, { value: 'large' }] },
  { name: 'note' },
]
const step = ref('team')
const stepIndex = computed(() => controlledItems.findIndex((item) => item.name === step.value) + 1)

// ---------- API ----------
const rootRows = [
  { name: 'items', type: 'QuestionnaireItemDefinition[]', def: '—', desc: '声明题目与选项的<b>逻辑顺序</b>：决定提交顺序、快捷键分配顺序与前后翻页顺序（不传则按 DOM 顺序推断）' },
  { name: 'v-model:item', type: 'string', def: '—', desc: '受控的「当前题」（题目的 <code>name</code>）；不传就按 <code>default-item</code> / 第一题自己走' },
  { name: 'defaultItem', type: 'string', def: '第一题', desc: '非受控时的起始题（<code>item</code> 存在时忽略）' },
  { name: 'shortcuts', type: "'letters' | 'numbers'", def: '—', desc: '给每题选项分配键盘快捷键：<code>letters</code> → A/B/C…，<code>numbers</code> → 1/2/3…（最多 9 个）；按键在<b>表单内</b>聚焦时生效' },
  { name: 'noValidate', type: 'boolean', def: 'true', desc: '默认 <b>true</b>：不用浏览器原生校验，由组件自己拦「必答题未答」；设 <code>false</code> 交给原生 constraint validation' },
]

const partRows = [
  { name: 'QuestionnaireItem', slot: 'questionnaire-item', desc: '一题（<code>&lt;fieldset&gt;</code>）：<code>name</code>（必填，也是提交字段名）、<code>required</code>、<code>disabled</code>、<code>multiple</code>（选项变多选）、<code>invalid</code>（外部标记无效）；<code>@update:status</code> 抛出 answered / skipped / unanswered' },
  { name: 'QuestionnaireTitle / Description', slot: 'questionnaire-title / -description', desc: '题干与说明：Title 默认渲染 <code>&lt;legend&gt;</code>；两者都会自动登记进 fieldset 的 <code>aria-labelledby / aria-describedby</code>' },
  { name: 'QuestionnaireChoices', slot: 'questionnaire-choices', desc: '选项容器（<code>grid gap-3</code>）；插槽参数 <code>{ shortcuts }</code>，可以自己按快捷键模式渲染提示' },
  { name: 'QuestionnaireChoice', slot: 'questionnaire-choice', desc: '一个选项：<code>value</code> 必填；<code>multiple</code> 时渲染 checkbox、否则 radio；<code>defaultChecked</code> / <code>v-model:checked</code> 控制选中；内部把值提交到父题的 <code>name</code>' },
  { name: 'QuestionnaireChoiceDescription', slot: 'questionnaire-choice-description', desc: '选项里第二行的补充说明（muted 小字）' },
  { name: 'QuestionnaireInput', slot: 'questionnaire-input', desc: '填空型答案：<code>type</code>（text / email / number / date…）、<code>v-model</code> 或 <code>defaultValue</code>；同样提交到父题的 <code>name</code>' },
  { name: 'QuestionnaireError', slot: 'questionnaire-error', desc: '错误提示：只在当前题校验失败时显示（<code>role="alert"</code>），默认文案按 required 区分；可给插槽参数 <code>{ invalid }</code> 自定义' },
  { name: 'QuestionnaireProgress', slot: 'questionnaire-progress', desc: '进度（<code>role="progressbar"</code>）：默认文案 <code>Question x of y</code>，插槽参数 <code>{ current, total, first, last }</code>；<code>data-current / -total / -first / -last</code> 也挂在元素上' },
  { name: 'QuestionnaireActions', slot: 'questionnaire-actions', desc: '底部操作行：三列 grid（左 Previous / 中 Skip / 右 Next|Submit），组件各自带 <code>col-start</code>，顺序随便放' },
  { name: 'QuestionnairePrevious / Next / Skip / Submit', slot: 'questionnaire-previous / -next / -skip / -submit', desc: '四个动作按钮：按位置自动显隐（首题无 Previous、末题才出 Submit、非必答题才出 Skip），隐藏时同时 <code>hidden + inert + tabindex=-1</code>；都支持 <code>variant</code> / <code>size</code> / <code>as</code> / <code>as-child</code>' },
]

const typeRows = [
  { name: 'QuestionnaireItemDefinition', type: '{ name, required?, disabled?, choices? }', desc: '题目定义：<code>name</code> 必填；<code>choices</code> 里是 <code>{ value, disabled? }</code>' },
  { name: 'QuestionnaireItemStatus', type: "'unanswered' | 'answered' | 'skipped'", desc: '题目状态，配合 <code>@update:status</code> 做「哪题没答」的汇总' },
  { name: 'QuestionnaireShortcutMode', type: "'letters' | 'numbers'", desc: '两种快捷键方案（A–Z / 1–9）' },
  { name: 'QuestionnaireInputType', type: "'text' | 'email' | 'number' | 'date' | …", desc: '填空型答案支持的 input 类型（含 tel / url / password / time 等）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Questionnaire 问卷</h1>
    <p class="mt-3 text-muted-foreground">
      <b>一次一题</b>的问卷 / 引导流程：进度、必答校验、跳过、上一题 / 下一题 / 提交、键盘快捷键都由组件管，
      你用 <code>QuestionnaireItem</code> 声明题目即可。<br />
      外层 <code>Questionnaire</code> 渲染的是真正的 <code>&lt;form&gt;</code>，每题的答案按 <code>name</code> 提交
      （多选会提交多个值），所以 <code>new FormData(event.target)</code> 就能直接拿到结果。<br />
      题目顺序以 <code>:items</code> 声明为准（决定提交顺序与快捷键分配），不传则按 DOM 顺序推断。
    </p>

    <!-- 1. 完整问卷 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">完整问卷</h2>
        <CardDescription>
          三题：单选（必答）、多选（可跳过）、填空（必答）。试试不选就点「下一题」——会被拦下并给出错误提示；
          第二题可以点「跳过」，最后一题按钮会换成「提交」。<br />
          这个例子<b>没有传 <code>shortcuts</code>，所以没有键盘快捷键</b>；想要键位提示看下面第二个例子。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Questionnaire :items="setupItems" @submit.prevent="onSubmit">
          <QuestionnaireProgress class="mb-2" />

          <QuestionnaireItem name="goal" required>
            <QuestionnaireTitle>你最看重哪一点？</QuestionnaireTitle>
            <QuestionnaireDescription>单选，必答。</QuestionnaireDescription>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="speed">
                上手速度
                <QuestionnaireChoiceDescription>今天就能跑起来</QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
              <QuestionnaireChoice value="custom">
                可定制程度
                <QuestionnaireChoiceDescription>能改样式、能换实现</QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
              <QuestionnaireChoice value="budget">
                成本可控
                <QuestionnaireChoiceDescription>按量付费，没有最低消费</QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>

          <QuestionnaireItem name="features" multiple>
            <QuestionnaireTitle>还想用哪些能力？</QuestionnaireTitle>
            <QuestionnaireDescription>多选，可以跳过。</QuestionnaireDescription>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="table">
                数据表格
                <QuestionnaireChoiceDescription>排序、筛选、分页</QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
              <QuestionnaireChoice value="chart">
                图表
                <QuestionnaireChoiceDescription>折线、柱状、饼图</QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
              <QuestionnaireChoice value="form">
                表单校验
                <QuestionnaireChoiceDescription>字段级提示与联动</QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>

          <QuestionnaireItem name="email" required>
            <QuestionnaireTitle>留个邮箱？</QuestionnaireTitle>
            <QuestionnaireDescription>会把结果与后续说明发到这里。</QuestionnaireDescription>
            <QuestionnaireInput type="email" placeholder="you@example.com" />
            <QuestionnaireError />
          </QuestionnaireItem>

          <QuestionnaireActions class="mt-4">
            <QuestionnairePrevious />
            <QuestionnaireSkip />
            <QuestionnaireNext />
            <QuestionnaireSubmit>提交</QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>

        <div v-if="submitted" class="rounded-md border border-input bg-muted/40 p-3">
          <p class="mb-1 text-sm font-medium">
            提交结果（FormData）
          </p>
          <pre class="overflow-x-auto text-xs">{{ JSON.stringify(submitted, null, 2) }}</pre>
        </div>
      </CardContent>
    </Card>

    <!-- 2. 快捷键与状态 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">快捷键与题目状态</h2>
        <CardDescription>
          <code>shortcuts="numbers"</code>：选项按 <code>1 / 2 / 3</code> 分配（<code>letters</code> 则是 A / B / C），
          选项上会显示键位提示，元素上也带 <code>aria-keyshortcuts</code>。<br />
          每题的 <code>@update:status</code> 会抛出 <code>unanswered</code> / <code>answered</code> / <code>skipped</code>，
          下面用徽标实时显示（选一个、或点第一题的「跳过」看看变化）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="text-muted-foreground">状态：</span>
          <Badge variant="secondary">size · {{ statusLabel[statuses.size ?? 'unanswered'] }}</Badge>
          <Badge variant="secondary">channel · {{ statusLabel[statuses.channel ?? 'unanswered'] }}</Badge>
        </div>

        <Questionnaire :items="shortcutItems" shortcuts="numbers" @reset="statuses = {}">
          <QuestionnaireItem name="size" @update:status="(s) => trackStatus('size', s)">
            <QuestionnaireTitle>你平时做多大屏幕的页面？</QuestionnaireTitle>
            <QuestionnaireDescription>按 1 / 2 / 3 直接选。</QuestionnaireDescription>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="s">只做移动端</QuestionnaireChoice>
              <QuestionnaireChoice value="m">兼顾平板</QuestionnaireChoice>
              <QuestionnaireChoice value="l">桌面大屏为主</QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>

          <QuestionnaireItem name="channel" required @update:status="(s) => trackStatus('channel', s)">
            <QuestionnaireTitle>希望怎么联系你？</QuestionnaireTitle>
            <QuestionnaireDescription>必答，没有跳过按钮。</QuestionnaireDescription>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="email">邮件</QuestionnaireChoice>
              <QuestionnaireChoice value="im">即时消息</QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>

          <QuestionnaireActions class="mt-4">
            <QuestionnairePrevious />
            <QuestionnaireSkip />
            <QuestionnaireNext />
            <QuestionnaireSubmit>完成</QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      </CardContent>
    </Card>

    <!-- 3. 受控切题 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控切题</h2>
        <CardDescription>
          <code>v-model:item</code> 把「当前题」交给外面：下面三个按钮直接跳到对应题（值就是题目的
          <code>name</code>），当前是第 {{ stepIndex }} 题。<br />
          传了 <code>item</code> 就不再自己管顺序，适合「先填基本信息，再跳回未答项」的流程。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="item in controlledItems"
            :key="item.name"
            size="sm"
            :variant="step === item.name ? 'default' : 'outline'"
            @click="step = item.name"
          >
            {{ item.name }}
          </Button>
        </div>

        <Questionnaire v-model:item="step" :items="controlledItems">
          <QuestionnaireItem name="team" required>
            <QuestionnaireTitle>你在哪个团队？</QuestionnaireTitle>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="design">设计</QuestionnaireChoice>
              <QuestionnaireChoice value="dev">研发</QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>

          <QuestionnaireItem name="scale">
            <QuestionnaireTitle>团队规模？</QuestionnaireTitle>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="small">10 人以内</QuestionnaireChoice>
              <QuestionnaireChoice value="large">10 人以上</QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>

          <QuestionnaireItem name="note">
            <QuestionnaireTitle>还有什么想说的？</QuestionnaireTitle>
            <QuestionnaireDescription>选填。</QuestionnaireDescription>
            <QuestionnaireInput placeholder="例如：希望支持暗色主题" />
            <QuestionnaireError />
          </QuestionnaireItem>

          <QuestionnaireActions class="mt-4">
            <QuestionnairePrevious />
            <QuestionnaireSkip />
            <QuestionnaireNext />
            <QuestionnaireSubmit>提交</QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>根组件的 props 与事件；每个 <code>QuestionnaireItem</code> 只认自己那一题。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">Questionnaire</th>
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

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">形状</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in typeRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-sm text-muted-foreground">
          事件：根组件有 <code>@submit</code> / <code>@reset</code> / <code>@update:item</code>，题目有 <code>@update:status</code>，
          选项有 <code>@change</code> —— 常规用法只需要 <code>@submit</code> 里读一次 <code>FormData</code>。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
