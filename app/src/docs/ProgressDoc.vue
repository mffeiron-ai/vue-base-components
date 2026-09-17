<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// ---------- 演示状态 ----------
const steps = [0, 25, 60, 100]

/** 动态演示 */
const upload = ref(13)
const running = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

function start() {
  if (running.value)
    return
  running.value = true
  timer = setInterval(() => {
    upload.value += Math.round(Math.random() * 9) + 2
    if (upload.value >= 100) {
      upload.value = 100
      stop()
    }
  }, 320)
}

function stop() {
  if (timer)
    clearInterval(timer)
  timer = null
  running.value = false
}

function reset() {
  stop()
  upload.value = 0
}

onBeforeUnmount(stop)

/** max 自定义演示：题目里 8 / 12 题 */
const answered = ref(8)
const totalQuestions = 12
const percent = computed(() => Math.round((answered.value / totalQuestions) * 100))

// ---------- API ----------
const rows = [
  { name: 'model-value', type: 'number | null', def: '0', desc: '当前进度值；传 <code>null</code> 表示<b>不确定态</b>（不输出 <code>aria-valuenow</code>，无障碍上读成「加载中」）' },
  { name: 'max', type: 'number', def: '100', desc: '进度上限：填充比例 = <code>model-value / max</code>；不填就是常见的 0–100（例如答了 8 / 12 题就传 <code>:max="12"</code>）' },
  { name: 'getValueLabel', type: '(value, max) => string', def: '—', desc: '自定义无障碍文案（默认「xx%」）；双语 / 特殊单位时用' },
  { name: 'class', type: 'string', def: '—', desc: '轨道类名：默认 <code>h-2</code>、<code>rounded-full</code>、轨道色 <code>bg-primary/20</code>；改高度 / 颜色 / 圆角都从这里下手（预设已写好一套，覆盖要带 <code>!</code>）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Progress 进度条</h1>
    <p class="mt-3 text-muted-foreground">
      横向进度条：<code>model-value</code> 给进度值，<code>max</code> 给上限（默认 100），填充比例就是两者之比。<br />
      只有一个组件（<code>Progress</code>），内部已经是「轨道 + 填充」两层，不需要自己拼；
      轨道高度、颜色、圆角全部通过 <code>class</code> 覆盖（默认 <code>h-2 w-full rounded-full bg-primary/20</code>，填充是 <code>bg-primary</code>）。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          传 <code>model-value</code> 即可；它同时带 <code>role="progressbar"</code> 与 <code>aria-valuenow / aria-valuemax</code>，
          屏幕阅读器能直接读出百分比。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-for="value in steps" :key="value" class="space-y-1.5">
          <div class="flex items-baseline justify-between text-sm">
            <span class="text-muted-foreground">已完成 {{ value }}%</span>
            <code class="font-mono text-xs">{{ value }}</code>
          </div>
          <Progress :model-value="value" />
        </div>
      </CardContent>
    </Card>

    <!-- 2. 动态进度 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">动态进度</h2>
        <CardDescription>
          填充块带 <code>transition-all</code>，所以数值变化时是平滑推进的（不需要自己做动画）。
          下面模拟上传：每次加 2–10%，到 100% 自动停。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-1.5">
          <div class="flex items-baseline justify-between text-sm">
            <span class="text-muted-foreground">{{ upload >= 100 ? '已完成' : '正在上传…' }}</span>
            <code class="font-mono text-xs">{{ upload }}%</code>
          </div>
          <Progress :model-value="upload" aria-label="上传进度" />
        </div>
        <div class="flex gap-2">
          <Button size="sm" :disabled="running || upload >= 100" @click="start">
            {{ upload >= 100 ? '已完成' : '开始' }}
          </Button>
          <Button variant="outline" size="sm" @click="reset">重置</Button>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 高度与颜色 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">高度、颜色与圆角</h2>
        <CardDescription>
          默认高 <code>h-2</code>（8px）、轨道 <code>bg-primary/20</code>、填充 <code>bg-primary</code>。<br />
          但样式预设里已经把高度 / 圆角 / 颜色写死了一套（无层样式优先级高于工具类），所以覆盖必须带 <code>!</code>：
          高度 <code>h-1!</code>、方角 <code>rounded-sm!</code>，换填充色要用后代选择器
          <code>[&amp;>[data-slot=progress-indicator]]:bg-emerald-500!</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="space-y-1.5">
          <p class="text-xs text-muted-foreground">细线 h-1!</p>
          <Progress :model-value="72" class="h-1!" />
        </div>
        <div class="space-y-1.5">
          <p class="text-xs text-muted-foreground">默认（预设高度，约 6px）</p>
          <Progress :model-value="72" />
        </div>
        <div class="space-y-1.5">
          <p class="text-xs text-muted-foreground">粗条 h-4! + 方角 rounded-sm!</p>
          <Progress :model-value="72" class="h-4! rounded-sm!" />
        </div>
        <div class="space-y-1.5">
          <p class="text-xs text-muted-foreground">换填充色（emerald）+ 浅色轨道</p>
          <Progress
            :model-value="88"
            class="bg-emerald-500/15! [&>[data-slot=progress-indicator]]:bg-emerald-500!"
          />
        </div>
      </CardContent>
    </Card>

    <!-- 4. max 与不确定态 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">上限不是 100 时（max）</h2>
        <CardDescription>
          进度不一定按百分比来：例如「答了 8 / 12 题」，把 <code>:max="12"</code> 传进去，
          填充比例 = <code>model-value / max</code>（下面这条是 {{ answered }} / {{ totalQuestions }} = {{ percent }}%）。<br />
          <code>model-value</code> 传 <code>null</code> 则是不确定态：不输出 <code>aria-valuenow</code>（读屏器只说「加载中」），
          视觉上就是一条空轨道，具体动画自己加。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="space-y-1.5">
          <div class="flex items-baseline justify-between text-sm">
            <span class="text-muted-foreground">已答 {{ answered }} / {{ totalQuestions }} 题</span>
            <code class="font-mono text-xs">{{ percent }}%</code>
          </div>
          <Progress :model-value="answered" :max="totalQuestions" />
        </div>
        <div class="flex gap-2">
          <Button size="sm" variant="outline" :disabled="answered <= 0" @click="answered--">上一题</Button>
          <Button size="sm" :disabled="answered >= totalQuestions" @click="answered++">下一题</Button>
        </div>

        <div class="space-y-1.5 border-t border-border pt-5">
          <div class="flex items-baseline justify-between text-sm">
            <span class="text-muted-foreground">不确定态（model-value = null）</span>
            <code class="font-mono text-xs">null</code>
          </div>
          <Progress :model-value="null" />
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>只有一个组件，所有 props 都在它身上。</CardDescription>
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
              <tr v-for="row in rows" :key="row.name" class="border-b last:border-0">
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
                <th class="py-2 pr-4 font-medium">内部节点</th>
                <th class="py-2 pr-4 font-medium">data-slot</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b last:border-0">
                <td class="py-2 pr-4"><code>Progress</code> 轨道</td>
                <td class="py-2 pr-4 text-muted-foreground"><code>progress</code></td>
                <td class="py-2 text-muted-foreground">外层：<code>relative h-2 w-full overflow-hidden rounded-full bg-primary/20</code>；<code>role="progressbar"</code> 也在这里</td>
              </tr>
              <tr class="border-b last:border-0">
                <td class="py-2 pr-4"><code>ProgressIndicator</code> 填充</td>
                <td class="py-2 pr-4 text-muted-foreground"><code>progress-indicator</code></td>
                <td class="py-2 text-muted-foreground">内层：<code>bg-primary h-full w-full transition-all</code>，位置由 <code>translateX(-(100 - 比例)%)</code> 决定（所以不能设成 <code>absolute</code> 之外的定位方式）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-sm text-muted-foreground">
          进度条本身不带动画循环 —— 需要「转圈」或条纹动画的话，用 <code>Spinner</code>，或者给轨道加自定义动画类。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
