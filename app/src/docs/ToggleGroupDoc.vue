<script setup lang="ts">
import { ref } from 'vue'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  Italic,
  Strikethrough,
  Underline,
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

/* ── 演示状态 ── */
const align = ref<string | undefined>('left')
const multi = ref<string[]>(['bold'])
const separated = ref<string | undefined>('day')
const vertical = ref<string | undefined>('profile')
const density = ref<string | undefined>('normal')

/* 动态档位（用于验证组级档位会实时下发到子项） */
const dynamicVariant = ref<'default' | 'outline'>('default')
const dynamicSize = ref<'default' | 'sm' | 'lg'>('default')
const dynamicSpacing = ref(0)
const dynamic = ref<string | undefined>('a')

/* ── API 表 ── */
const groupRows = [
  { name: 'type', type: "'single' | 'multiple'", def: '自动推断', desc: '选择模式。<b>可以不传</b> —— reka 会按 <code>modelValue</code> / <code>default-value</code> 是不是数组来推断，都没有时按 <code>single</code>' },
  { name: 'v-model', type: 'single: any · multiple: any[]', def: '—', desc: '选中值。<b>单选模式下再点一次已选中的项会取消选中</b>，值变回 <code>undefined</code>' },
  { name: 'default-value', type: '同上', def: 'single: undefined · multiple: []', desc: '非受控初始值' },
  { name: 'variant', type: "'default' | 'outline'", def: 'undefined', desc: '组级档位，会通过 <code>data-variant</code> 下发到每个子项（子项也能单独覆盖）。<code>outline</code> 是描边档' },
  { name: 'size', type: "'default' | 'sm' | 'lg'", def: 'undefined', desc: '组级尺寸，同样下发给子项（<code>data-size</code>）' },
  { name: 'spacing', type: 'number', def: '0', desc: '按钮间距，<b>取 Tailwind 间距刻度</b>（0 = 相邻成一体，2 = 8px…）。为 0 时组件会自动把首尾改成外侧圆角、并用共享描边把中间项接起来' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", def: "'horizontal'", desc: '方向。<b>本库补了默认值</b> —— reka 原样不传时不会输出 <code>data-orientation</code>，而预设正是按它选首尾圆角，会导致规则静默失效' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用整组（每个子项都会跟着禁用）' },
  { name: 'rovingFocus', type: 'boolean', def: 'true', desc: '是否开启「漫游焦点」：整组只占一个 Tab 位，进组后用方向键移动' },
  { name: 'loop', type: 'boolean', def: 'true', desc: '方向键走到头是否绕回' },
  { name: 'name / required', type: 'string / boolean', def: '—', desc: '表单字段名（会渲染隐藏 input）与原生必填校验' },
]

const itemRows = [
  { name: 'value', type: 'any', def: '—', desc: '<b>必填</b>，与组的选中值比对' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用单个按钮' },
  { name: 'variant / size', type: '同组级', def: '继承组', desc: '单独覆盖这一项的档位（不传就跟着组走）' },
  { name: 'class', type: 'string', def: '—', desc: '样式覆盖。注意 <b>8 套预设都会重写首尾圆角、按下底色</b>，改这些要带 <code>!</code>' },
]

const presetRows = [
  { style: '经典', groupRadius: '6px', firstLast: 'rounded-l-md / rounded-r-md', onBg: 'bg-muted', note: '' },
  { style: '胶囊', groupRadius: '3xl（仅 outline 档）', firstLast: 'rounded-l-3xl / rounded-r-3xl', onBg: 'bg-muted', note: '连体时更圆' },
  { style: '直角', groupRadius: '0（直角）', firstLast: 'rounded-none', onBg: 'bg-accent（预设未写，cva 兜底）', note: '直角系；它是少数「选中底色偏蓝」的风格' },
  { style: '圆润', groupRadius: '4xl（仅 outline 档）', firstLast: 'rounded-l-3xl / rounded-r-3xl', onBg: 'bg-muted', note: '' },
  { style: '紧凑', groupRadius: '6px', firstLast: 'rounded-l-md / rounded-r-md', onBg: 'bg-accent（预设未写，cva 兜底）', note: '选中底色偏蓝' },
  { style: '小巧', groupRadius: '8px', firstLast: 'rounded-l-lg / rounded-r-lg', onBg: 'bg-accent（预设未写，cva 兜底）', note: '选中底色偏蓝' },
  { style: '饱满', groupRadius: '2xl（仅 outline 档）', firstLast: 'rounded-l-2xl / rounded-r-2xl', onBg: 'bg-muted', note: '' },
  { style: '排版', groupRadius: '0（直角）', firstLast: 'rounded-none', onBg: 'bg-muted + text-foreground', note: '连体时左右内边距最大（px-6）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Toggle Group 按钮组</h1>
    <p class="mt-3 text-muted-foreground">
      一组「按下 / 弹起」按钮，支持单选与多选，基于 reka-ui 的 <code>ToggleGroupRoot</code>。
      每个子项<b>内部就是一个 <code>Toggle</code></b>，所以状态属性（<code>aria-pressed</code> /
      <code>data-state</code>）与单个切换按钮完全一致。<br />
      只要 <b>1 个</b>开关请用
      <code>@/components/ui/toggle</code>；要成组、要统一档位与间距、要方向键导航就用本组件。
    </p>

    <!-- 1. 基础：单选 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法（单选）</h2>
        <CardDescription>
          <code>type="single"</code> + <code>v-model</code>（值是单个字符串）。
          <b>再点一次已选中的项会取消选中</b> —— 值变成 <code>undefined</code>，所以类型要允许空。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <ToggleGroup v-model="align" type="single">
          <ToggleGroupItem value="left" aria-label="左对齐">
            <AlignLeft />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="居中">
            <AlignCenter />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="右对齐">
            <AlignRight />
          </ToggleGroupItem>
        </ToggleGroup>
        <p class="text-xs text-muted-foreground">
          当前对齐：<code>{{ align ?? '（未选）' }}</code> —— 反复点同一个按钮试试
        </p>
      </CardContent>
    </Card>

    <!-- 2. 多选 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">多选</h2>
        <CardDescription>
          <code>type="multiple"</code> 时值是<b>数组</b>，点一下加入、再点一下移除。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <ToggleGroup v-model="multi" type="multiple">
          <ToggleGroupItem value="bold" aria-label="加粗">
            <Bold />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="斜体">
            <Italic />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="下划线">
            <Underline />
          </ToggleGroupItem>
          <ToggleGroupItem value="strike" aria-label="删除线">
            <Strikethrough />
          </ToggleGroupItem>
          <ToggleGroupItem value="highlight" aria-label="高亮">
            <Highlighter />
          </ToggleGroupItem>
        </ToggleGroup>
        <p class="text-xs text-muted-foreground">
          已选：<code>{{ multi.length ? multi.join(', ') : '（无）' }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 3. variant -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">档位：variant</h2>
        <CardDescription>
          组级 <code>variant</code> 会下发给每个子项；<code>outline</code> 档在<b>连体（spacing=0）</b>时
          只保留外圈描边，中间的竖线是共享的（组件把中间项的左边框去掉）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            variant="default"（无描边）
          </p>
          <ToggleGroup v-model="align" type="single" variant="default">
            <ToggleGroupItem value="left">
              左
            </ToggleGroupItem>
            <ToggleGroupItem value="center">
              中
            </ToggleGroupItem>
            <ToggleGroupItem value="right">
              右
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            variant="outline"
          </p>
          <ToggleGroup v-model="align" type="single" variant="outline">
            <ToggleGroupItem value="left">
              左
            </ToggleGroupItem>
            <ToggleGroupItem value="center">
              中
            </ToggleGroupItem>
            <ToggleGroupItem value="right">
              右
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>

    <!-- 4. size + spacing -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">size 与 spacing</h2>
        <CardDescription>
          <code>size</code> 三档与单个 <code>Toggle</code> 一致（36 / 32 / 40px）。
          <code>spacing</code> 取 Tailwind 间距刻度：<b>0（默认）是连体</b>，
          给个正数就变成互相分离的按钮。<br />
          连体时组件会自动处理「首尾外侧圆角 + 中间项去掉重复描边」，所以你不用管这些细节。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            size：default / sm / lg
          </p>
          <div class="flex flex-wrap items-center gap-6">
            <ToggleGroup type="single" size="sm" variant="outline" default-value="a">
              <ToggleGroupItem value="a">
                小
              </ToggleGroupItem>
              <ToggleGroupItem value="b">
                小
              </ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="single" size="default" variant="outline" default-value="a">
              <ToggleGroupItem value="a">
                默认
              </ToggleGroupItem>
              <ToggleGroupItem value="b">
                默认
              </ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup type="single" size="lg" variant="outline" default-value="a">
              <ToggleGroupItem value="a">
                大
              </ToggleGroupItem>
              <ToggleGroupItem value="b">
                大
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-medium text-muted-foreground">
            spacing：0（连体）vs 1（4px）vs 2（8px）
          </p>
          <div class="flex flex-wrap items-center gap-8">
            <ToggleGroup v-model="separated" type="single" variant="outline" :spacing="0">
              <ToggleGroupItem value="day">
                日
              </ToggleGroupItem>
              <ToggleGroupItem value="week">
                周
              </ToggleGroupItem>
              <ToggleGroupItem value="month">
                月
              </ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup v-model="separated" type="single" variant="outline" :spacing="1">
              <ToggleGroupItem value="day">
                日
              </ToggleGroupItem>
              <ToggleGroupItem value="week">
                周
              </ToggleGroupItem>
              <ToggleGroupItem value="month">
                月
              </ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup v-model="separated" type="single" variant="outline" :spacing="2">
              <ToggleGroupItem value="day">
                日
              </ToggleGroupItem>
              <ToggleGroupItem value="week">
                周
              </ToggleGroupItem>
              <ToggleGroupItem value="month">
                月
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <p class="text-xs text-muted-foreground">
            三组共用 <code>separated</code>，所以选中状态是同步的。分离时每项都是独立圆角。
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 纵向 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">纵向</h2>
        <CardDescription>
          <code>orientation="vertical"</code>：按钮竖着排，方向键换成上下。
          连体时首尾圆角会自动改成<b>上下</b>方向（这也是本库补 <code>orientation</code> 默认值的原因 ——
          预设按 <code>group-data-vertical/toggle-group:</code> 选圆角）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-start gap-8">
          <ToggleGroup v-model="vertical" type="single" orientation="vertical" variant="outline">
            <ToggleGroupItem value="profile">
              个人资料
            </ToggleGroupItem>
            <ToggleGroupItem value="security">
              安全
            </ToggleGroupItem>
            <ToggleGroupItem value="notify">
              通知
            </ToggleGroupItem>
          </ToggleGroup>
          <div class="text-xs text-muted-foreground">
            <p>当前：<code>{{ vertical ?? '（未选）' }}</code></p>
            <p class="mt-2">
              连体纵向：<code>rounded-t-*</code> / <code>rounded-b-*</code>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 6. 禁用 + 键盘 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁用与键盘</h2>
        <CardDescription>
          组级 <code>disabled</code> 会让每个子项都禁用；也可以只禁用其中一项。
          组件默认开启 <code>rovingFocus</code>：整组只占<b>一个 Tab 停靠点</b>，
          进入后用方向键在项间移动、<code>Space</code> / <code>Enter</code> 切换。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="flex flex-wrap items-center gap-6">
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              整组禁用
            </p>
            <ToggleGroup type="single" variant="outline" disabled default-value="a">
              <ToggleGroupItem value="a">
                一
              </ToggleGroupItem>
              <ToggleGroupItem value="b">
                二
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              只禁用中间那项（方向键会跳过它）
            </p>
            <ToggleGroup type="single" variant="outline" :default-value="'a'">
              <ToggleGroupItem value="a">
                可用
              </ToggleGroupItem>
              <ToggleGroupItem value="b" disabled>
                禁用
              </ToggleGroupItem>
              <ToggleGroupItem value="c">
                可用
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <ul class="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
          <li><code>Tab</code>：整组作为一个停靠点进入 / 离开</li>
          <li><code>←</code> <code>→</code>（横向）或 <code>↑</code> <code>↓</code>（纵向）：在项间移动并自动聚焦</li>
          <li><code>Space</code> / <code>Enter</code>：切换当前项</li>
          <li><code>loop</code> 默认 true —— 走到最后一项再按一下会回到第一项；传 <code>false</code> 就停在两端</li>
        </ul>
      </CardContent>
    </Card>

    <!-- 7. 动态档位 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">动态切换档位</h2>
        <CardDescription>
          组级 <code>variant</code> / <code>size</code> / <code>spacing</code> 支持运行时改变 ——
          组件内部是把它们放在<b>响应式对象</b>里下发给子项的，所以子项的
          <code>data-variant</code> / <code>data-size</code> 会立刻跟着更新。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="dynamicVariant = dynamicVariant === 'default' ? 'outline' : 'default'"
          >
            variant: {{ dynamicVariant }}
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="dynamicSize = dynamicSize === 'default' ? 'lg' : (dynamicSize === 'lg' ? 'sm' : 'default')"
          >
            size: {{ dynamicSize }}
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="dynamicSpacing = dynamicSpacing === 0 ? 2 : 0"
          >
            spacing: {{ dynamicSpacing }}
          </Button>
          <Badge variant="secondary">{{ dynamic ?? '未选' }}</Badge>
        </div>

        <ToggleGroup
          v-model="dynamic"
          type="single"
          :variant="dynamicVariant"
          :size="dynamicSize"
          :spacing="dynamicSpacing"
        >
          <ToggleGroupItem value="a">
            A
          </ToggleGroupItem>
          <ToggleGroupItem value="b">
            B
          </ToggleGroupItem>
          <ToggleGroupItem value="c">
            C
          </ToggleGroupItem>
        </ToggleGroup>

        <p class="text-xs text-muted-foreground">
          点上面三个按钮：描边、尺寸、间距都应该立刻变化。
        </p>
      </CardContent>
    </Card>

    <!-- 8. 组合 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">组合：设置项里的分段选择</h2>
        <CardDescription>
          和 <code>Label</code> 配合用在表单里 —— 一组按钮代替下拉框，选中即生效。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <Label>主题密度</Label>
            <p class="text-xs text-muted-foreground">
              影响列表行高与内边距
            </p>
          </div>
          <ToggleGroup v-model="density" type="single" variant="outline">
            <ToggleGroupItem value="compact">
              紧凑
            </ToggleGroupItem>
            <ToggleGroupItem value="normal">
              标准
            </ToggleGroupItem>
            <ToggleGroupItem value="cozy">
              宽松
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <p class="text-xs text-muted-foreground">
          当前密度：<code>{{ density }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 9. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          <code>ToggleGroup</code> 透传 reka 的 <code>ToggleGroupRoot</code>，
          <code>ToggleGroupItem</code> 透传 <code>ToggleGroupItem</code>（内部就是 <code>Toggle</code>）。
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
              <tr v-for="r in groupRows" :key="r.name" class="border-b last:border-0">
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
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">ToggleGroupItem 与渲染属性</h2>
        <CardDescription>
          <code>data-slot="toggle-group"</code> / <code>data-slot="toggle-group-item"</code> 是预设的定位钩子。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
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
              <tr v-for="r in itemRows" :key="r.name" class="border-b last:border-0">
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

        <div class="rounded-lg border border-input p-3 text-xs text-muted-foreground">
          <ul class="list-disc space-y-1 pl-4">
            <li>根节点：<code>role="group"</code> + <code>data-slot</code> + <code>data-variant</code> / <code>data-size</code> / <code>data-spacing</code> + <code>data-orientation</code>（本库补的默认值）+ <code>group/toggle-group</code></li>
            <li>子项：<code>button</code> + <code>aria-pressed</code> + <code>data-state="on|off"</code> + <code>data-variant</code> / <code>data-size</code> / <code>data-spacing</code>（从组继承，可单项覆盖）</li>
            <li>子项插槽参数与 <code>Toggle</code> 一致：<code>{ modelValue, pressed, state, disabled }</code></li>
            <li>组级 <code>name</code> 会渲染一个隐藏 input（与 <code>Switch</code> / <code>Toggle</code> 同一机制）</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">各风格外观（实测）</h2>
        <CardDescription>
          按钮尺寸档位来自 <code>toggleVariants</code>，各风格一致；
          <b>连体时的首尾圆角、内边距、按下底色由预设决定</b>。
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
                  组圆角
                </th>
                <th class="py-2 pr-4 font-medium">
                  连体首尾圆角
                </th>
                <th class="py-2 pr-4 font-medium">
                  选中底色
                </th>
                <th class="py-2 font-medium">
                  备注
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in presetRows" :key="r.style" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top font-medium">
                  {{ r.style }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ r.groupRadius }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  <code>{{ r.firstLast }}</code>
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ r.onBg }}
                </td>
                <td class="py-2 align-top text-muted-foreground">
                  {{ r.note }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-muted-foreground">
          选中底色在各风格里基本都是 <code>bg-muted</code>（<code>#f9fafb</code>）；
          直角 / 紧凑 / 小巧 的预设里没写这条，于是由组件 cva 的 <code>data-[state=on]:bg-accent</code> 兜底 ——
          它们是仅有的「选中底色偏蓝」的几套。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
