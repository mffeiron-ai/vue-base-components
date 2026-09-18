<script setup lang="ts">
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/* ── 演示状态 ── */
const feedback = ref('')
const autoGrow = ref('')
const sized = ref('固定 6 行，且不可拖拽改变大小。')
const long = ref('第十二次同步任务已完成，写入 444 条记录。\n'.repeat(6))
const invalid = ref('这个值不合法')
const controlled = ref('初始内容：由父组件写入。')
const counted = ref('')
const maxCount = 60

const typed = ref(0)
function onInput(e: Event) {
  typed.value = (e.target as HTMLTextAreaElement).value.length
}

/* ── API 表 ── */
const propRows = [
  { name: 'v-model', type: 'string | number', def: '—', desc: '双向绑定。<code>default-value</code> 可作为非受控初始值（内部用 <code>useVModel(passive)</code>，两边都能改）' },
  { name: 'class', type: 'string', def: '—', desc: '覆盖外观。注意 8 套预设都会重写内边距 / 圆角 / 背景 / 字号，所以 <b>改这些要带 <code>!</code></b>' },
  { name: '其他原生属性', type: '—', def: '—', desc: '<code>placeholder</code> / <code>rows</code> / <code>disabled</code> / <code>readonly</code> / <code>maxlength</code> / <code>id</code> / <code>aria-invalid</code> 等<b>全部透传</b>到内层 <code>&lt;textarea&gt;</code>（组件只有上面 3 个自己的 prop）' },
]

const stateRows = [
  { attr: ':focus-visible', style: 'focus-visible:border-ring + ring', desc: '聚焦时边框换色 + 外圈 ring，粗细随风格（1px~3px）' },
  { attr: '[aria-invalid="true"]', style: 'aria-invalid:border-destructive + ring-destructive/20', desc: '校验失败样式。<b>组件不会自己判断</b>，要你传 <code>aria-invalid</code>' },
  { attr: '[disabled]', style: 'disabled:cursor-not-allowed disabled:opacity-50', desc: '禁用：变灰 + 禁用光标（部分风格还会改背景）' },
  { attr: '[readonly]', style: '—', desc: '预设与组件都<b>没写</b> readonly 样式 —— 只读态与普通态外观一致，需要自己加类区分' },
]

const presetRows = [
  { style: '经典', radius: '6px', padding: '10 / 8', bg: '透明', border: '四边描边', font: '14px', resize: '可竖向拖拽' },
  { style: '胶囊', radius: '16px', padding: '12 / 12', bg: '--input/50 填充', border: '无描边（透明）', font: '14px', resize: '不可拖' },
  { style: '直角', radius: '0（直角）', padding: '10 / 8', bg: '透明', border: '四边描边', font: '12px', resize: '可竖向拖拽' },
  { style: '圆润', radius: '12px', padding: '12 / 12', bg: '--input/30', border: '四边描边', font: '14px', resize: '不可拖' },
  { style: '紧凑', radius: '6px', padding: '8 / 8', bg: '--input/20', border: '四边描边', font: '12px', resize: '不可拖' },
  { style: '小巧', radius: '8px', padding: '10 / 8', bg: '透明', border: '四边描边', font: '14px', resize: '可竖向拖拽' },
  { style: '饱满', radius: '16px', padding: '10 / 8', bg: '--input/50 填充', border: '无描边（透明）', font: '14px', resize: '不可拖' },
  { style: '排版', radius: '0（直角）', padding: '0 / 12', bg: '透明', border: '只有下边框', font: '14px', resize: '不可拖' },
]

const remaining = computed(() => maxCount - counted.value.length)
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Textarea 多行输入</h1>
    <p class="mt-3 text-muted-foreground">
      一个 <code>&lt;textarea&gt;</code> 的样式包装 —— 组件本身只有 <code>v-model</code>、
      <code>default-value</code>、<code>class</code> 三个 prop，<b>其余原生属性全部透传</b>。<br />
      它默认带 <code>field-sizing-content</code>：<b>内容多了会自动长高</b>（现代浏览器原生支持，不需要 JS 撑高度），
      并用 <code>min-h-16</code>（64px）兜底。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>v-model</code> 绑字符串。<code>Textarea</code> 内部用
          <code>useVModel(passive)</code>：既维护内部值，也会 emit
          <code>update:modelValue</code>，所以受控与非受控都能用。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="ta-feedback">反馈内容</Label>
          <Textarea id="ta-feedback" v-model="feedback" placeholder="说点什么…" />
        </div>
        <p class="text-xs text-muted-foreground">
          值：<code>{{ feedback || '（空）' }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 2. 自适应高度 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">自适应高度（默认行为）</h2>
        <CardDescription>
          组件自带 <code>field-sizing-content</code>（CSS <code>field-sizing: content</code>），
          文本超过一行时元素会<b>自己变高</b>，不会出现内部滚动条，也不需要写 JS 去算
          <code>scrollHeight</code>。<br />
          下面左边是默认行为，右边显式关掉了（<code>field-sizing-fixed!</code>）—— 后者到 4 行就封顶、开始内部滚动。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              默认：随内容长高（<code>field-sizing: content</code>）
            </p>
            <Textarea v-model="autoGrow" placeholder="换几行试试…" />
            <p class="text-xs text-muted-foreground">
              行数 {{ autoGrow.split('\n').length }}
            </p>
          </div>
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              固定高度 + 内部滚动
            </p>
            <Textarea
              v-model="long"
              class="field-sizing-fixed h-24 resize-none"
            />
            <p class="text-xs text-muted-foreground">
              固定 96px，超出部分靠内部滚动。
            </p>
          </div>
        </div>
        <p class="text-xs text-muted-foreground">
          想临时关掉自适应就写 <code>field-sizing-fixed</code>（预设没动这个属性，所以<b>不需要 <code>!</code></b>）。
        </p>
      </CardContent>
    </Card>

    <!-- 3. 高度与缩放 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">高度与缩放</h2>
        <CardDescription>
          <code>rows</code> 是原生属性，会与 <code>min-h-16</code> 一起决定初始高度；
          能不能拖拽改大小由 <code>resize</code> 决定 —— <b>5 套风格（胶囊 / 圆润 / 紧凑 / 饱满 / 排版）
          预设里写了 <code>resize-none</code></b>，那些风格下右下角的拖拽手柄会消失；
          其余 3 套（经典 / 直角 / 小巧）保持可竖向拖拽。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              <code>:rows="2"</code> 起始两行
            </p>
            <Textarea :rows="2" placeholder="初始两行高…" />
          </div>
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              <code>:rows="6"</code> + 关掉缩放
            </p>
            <Textarea v-model="sized" :rows="6" class="resize-none" />
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            想更大就覆盖 <code>min-h-*</code>（这里 <code>min-h-40</code> = 160px）
          </p>
          <Textarea class="min-h-40" placeholder="更高的输入框…" />
        </div>
      </CardContent>
    </Card>

    <!-- 4. 状态 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁用、只读与校验态</h2>
        <CardDescription>
          禁用与校验态都有内置样式；<b>只读（readonly）预设和组件都没写</b>，
          只读态和普通态长得一样，要自己加类区分。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="grid gap-6 md:grid-cols-3">
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              禁用
            </p>
            <Textarea disabled placeholder="不可编辑" />
          </div>
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              只读（无内置样式）
            </p>
            <Textarea readonly :model-value="'只读内容，但外观和普通态一致。'" class="cursor-default bg-muted/50" />
          </div>
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              校验失败（<code>aria-invalid</code>）
            </p>
            <Textarea v-model="invalid" aria-invalid="true" />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  状态
                </th>
                <th class="py-2 pr-4 font-medium">
                  内置样式
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in stateRows" :key="r.attr" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ r.attr }}</code>
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  <code>{{ r.style }}</code>
                </td>
                <td class="py-2 align-top" v-html="r.desc" />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 计数 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">字数统计与上限</h2>
        <CardDescription>
          <code>maxlength</code> 是原生属性，直接透传即可；计数用 <code>v-model</code> 的长度算，
          不用监听 <code>input</code> 事件。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Textarea
          v-model="counted"
          :maxlength="maxCount"
          :rows="3"
          placeholder="最多 60 个字…"
        />
        <div class="flex items-center justify-between">
          <p class="text-xs text-muted-foreground">
            再输入 <code>{{ Math.max(remaining, 0) }}</code> 个字就到上限（达到上限后浏览器会直接拦掉输入）
          </p>
          <Badge :variant="remaining <= 10 ? 'destructive' : 'secondary'">
            {{ counted.length }} / {{ maxCount }}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <!-- 6. 受控 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控：从外部改写</h2>
        <CardDescription>
          因为内部会监听 <code>modelValue</code> 的变化，父组件直接改值也能同步到输入框
          （包括追加内容这种「不让用户手动做」的操作）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Textarea v-model="controlled" :rows="3" />
        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="controlled = ''">
            清空
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="controlled += `\n[${new Date().toLocaleTimeString('zh-CN')}] 追加了一行`"
          >
            追加一行
          </Button>
          <Button variant="outline" size="sm" @click="controlled = '整段替换成新内容。'">
            替换
          </Button>
          <Badge variant="secondary">{{ controlled.length }} 字</Badge>
        </div>
      </CardContent>
    </Card>

    <!-- 7. 组合 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">组合：带说明与提交的留言框</h2>
        <CardDescription>
          最常见的样子：<code>Label</code> + <code>Textarea</code> + 说明文字 + 操作按钮。
          <code>id</code> / <code>for</code> 配对后点标签能聚焦输入框。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="ta-comment">留言</Label>
          <Textarea
            id="ta-comment"
            v-model="feedback"
            placeholder="写下你的想法…"
            :rows="4"
            @input="onInput"
          />
          <p class="text-xs text-muted-foreground">
            支持 Markdown，最多 500 字。当前 {{ typed }} 字（这里用 <code>@input</code> 只是为了演示事件透传，
            正常情况下用 <code>feedback.length</code> 即可）。
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button size="sm" :disabled="!feedback">
            提交留言
          </Button>
          <Button variant="ghost" size="sm" @click="feedback = ''">
            清空
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 8. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          就这三个 —— 其余全是原生属性透传，所以 <code>rows</code> / <code>maxlength</code> /
          <code>autocomplete</code> / 各种 <code>aria-*</code> 不用查文档，按原生写就行。
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
              <tr v-for="r in propRows" :key="r.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ r.name }}</code>
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ r.type }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ r.def }}
                </td>
                <td class="py-2 align-top" v-html="r.desc" />
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-muted-foreground">
          事件：只透传原生 <code>input</code> / <code>change</code> / <code>focus</code> / <code>blur</code> 等，
          加上 v-model 用的 <code>update:modelValue</code>。<code>data-slot="textarea"</code> 是预设的定位钩子。
        </p>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">各风格外观（实测）</h2>
        <CardDescription>
          <code>.cn-textarea / [data-slot="textarea"]</code> 是预设重写最彻底的一个组件 ——
          内边距、圆角、背景、边框形态、字号几乎每套都不同，所以<b>覆盖这些属性必须带 <code>!</code></b>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  设计系统
                </th>
                <th class="py-2 pr-4 font-medium">
                  圆角
                </th>
                <th class="py-2 pr-4 font-medium">
                  内边距（左右 / 上下）
                </th>
                <th class="py-2 pr-4 font-medium">
                  背景
                </th>
                <th class="py-2 pr-4 font-medium">
                  边框
                </th>
                <th class="py-2 pr-4 font-medium">
                  字号
                </th>
                <th class="py-2 font-medium">
                  缩放
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in presetRows" :key="r.style" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top font-medium">
                  {{ r.style }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ r.radius }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ r.padding }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ r.bg }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ r.border }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ r.font }}
                </td>
                <td class="py-2 align-top text-muted-foreground">
                  {{ r.resize }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-muted-foreground">
          内边距单位为 px（<b>左/右 / 上/下</b>，实际是 <code>px-x py-y</code> 的 <code>x</code> 与 <code>y</code>）。
          <b>「排版」最特别</b>：它是「下划线」形态 —— 其余三边透明、只有下边框有颜色，
          所以它的左右内边距是 0（内容贴着边线）。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
