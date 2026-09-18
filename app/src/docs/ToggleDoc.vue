<script setup lang="ts">
import { ref } from 'vue'
import { Bell, BellOff, Bold, Bookmark, Italic, Star, Underline } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Toggle } from '@/components/ui/toggle'

/* ── 演示状态 ── */
const starred = ref(false)
const bold = ref(true)
const italic = ref(false)
const underline = ref(false)
const muted = ref(false)

const submitted = ref('')
function onSubmit(e: Event) {
  const fd = new FormData(e.target as HTMLFormElement)
  submitted.value = [...fd.entries()].map(([k, v]) => `${k}=${v}`).join(' & ') || '（空）'
}

/* ── API 表 ── */
const propRows = [
  { name: 'v-model', type: 'boolean', def: 'false', desc: '按下状态（受控）。注意 reka 的 prop 名是 <code>modelValue</code> / <code>update:modelValue</code>，所以直接用 <code>v-model</code> 即可' },
  { name: 'default-value', type: 'boolean', def: 'false', desc: '非受控时的初始按下状态（<code>&lt;Toggle :default-value="true"&gt;</code> 就是一开始按下）' },
  { name: 'variant', type: "'default' | 'outline'", def: "'default'", desc: '<code>default</code> 背景透明；<code>outline</code> 带 <code>border-input</code> 描边 + 阴影' },
  { name: 'size', type: "'default' | 'sm' | 'lg'", def: "'default'", desc: '尺寸档位：<code>h-9 / h-8 / h-10</code>，同时带 <code>min-w-9 / min-w-8 / min-w-10</code>（纯图标时也能保持方形）' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用：不可点击，输出 <code>data-disabled</code> 并降低不透明度' },
  { name: 'name', type: 'string', def: '—', desc: '表单字段名。传了它会额外渲染一个隐藏 checkbox（见下文实测说明）' },
  { name: 'class', type: 'string', def: '—', desc: '根节点样式。<b>注意 8 套预设都会重写圆角 / 字号 / 按下底色</b>，覆盖这些要带 <code>!</code>' },
]

const slotRows = [
  { name: 'modelValue', desc: '当前值（布尔），与 <code>v-model</code> 同一个' },
  { name: 'pressed', desc: '与 <code>modelValue</code> 相同 —— 语义化别名，判断「是否按下」用它更好读' },
  { name: 'state', desc: '<code>"on"</code> / <code>"off"</code>，与根节点 <code>data-state</code> 一致' },
  { name: 'disabled', desc: '是否禁用' },
]

const presetRows = [
  { style: 'Vega', radius: '6px', font: '14px', icon: '16px', note: '按下底色 bg-muted' },
  { style: 'Luma', radius: '24px', font: '14px', icon: '16px', note: '接近全圆角' },
  { style: 'Lyra', radius: '0（直角）', font: '12px', icon: '16px', note: '直角系；额外写了一条 data-[state=on]' },
  { style: 'Maia', radius: '32px', font: '14px', icon: '16px', note: '全圆角' },
  { style: 'Mira', radius: '6px', font: '12px', icon: '16px', note: '紧凑；同样有 data-[state=on] 兜底' },
  { style: 'Nova', radius: '8px', font: '14px', icon: '16px', note: '同样有 data-[state=on] 兜底' },
  { style: 'Rhea', radius: '16px', font: '14px', icon: '16px', note: '' },
  { style: 'Sera', radius: '0（直角）', font: '12px + 大写 + 字距', icon: '14px', note: '唯一改小图标的风格' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Toggle 切换按钮</h1>
    <p class="mt-3 text-muted-foreground">
      一个「按下 / 弹起」的双态按钮，基于 reka-ui 的 <code>Toggle</code>。
      它本质是个带 <code>aria-pressed</code> 的 <code>&lt;button&gt;</code>，
      按下时输出 <code>data-state="on"</code> + <code>aria-pressed="true"</code>，
      两个状态都会被预设用来上色。<br />
      需要「一组按钮里多选一 / 多选多」的场景，用另一个组件
      <code>@/components/ui/toggle-group</code>（<code>ToggleGroup</code>）。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>v-model</code> 绑布尔值。点击切换，键盘 <b>Space</b> / <b>Enter</b> 同样有效（原生 button 行为）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-3">
          <Toggle v-model="starred" aria-label="收藏">
            <Star :class="starred ? 'fill-current' : ''" />
            收藏
          </Toggle>
          <Badge :variant="starred ? 'default' : 'secondary'">
            {{ starred ? '已收藏' : '未收藏' }}
          </Badge>
        </div>
        <p class="text-xs text-muted-foreground">
          <code>starred = {{ starred }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 2. 受控 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控与非受控</h2>
        <CardDescription>
          用 <code>default-value</code> 可以不接管状态 —— <code>Bold</code> 那个就是非受控且默认按下
          （下面按钮改它的状态是改不到的）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="flex flex-wrap items-center gap-3">
          <Toggle v-model="starred" aria-label="收藏（受控）">
            <Star />
          </Toggle>
          <Toggle :default-value="true" aria-label="加粗（非受控，默认按下）">
            <Bold />
          </Toggle>
          <Badge variant="secondary">
            starred = {{ starred }}
          </Badge>
        </div>
        <p class="text-xs text-muted-foreground">
          注意 <code>v-model</code> 的默认值是 <code>false</code>，所以「想要一开始就按下」只能用
          <code>:default-value="true"</code>。
        </p>
      </CardContent>
    </Card>

    <!-- 3. variant -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">档位：variant</h2>
        <CardDescription>
          <code>outline</code> 会加 <code>border-input</code> 描边与一层阴影，适合放在浅色背景上；
          <code>default</code>（默认）完全透明，更适合工具栏那种紧挨着的场景。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <Toggle v-model="bold" variant="default" aria-label="加粗">
            <Bold />
          </Toggle>
          <Toggle v-model="italic" variant="default" aria-label="斜体">
            <Italic />
          </Toggle>
          <Toggle v-model="underline" variant="default" aria-label="下划线">
            <Underline />
          </Toggle>
          <span class="text-xs text-muted-foreground">variant="default"</span>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Toggle v-model="bold" variant="outline" aria-label="加粗">
            <Bold />
          </Toggle>
          <Toggle v-model="italic" variant="outline" aria-label="斜体">
            <Italic />
          </Toggle>
          <Toggle v-model="underline" variant="outline" aria-label="下划线">
            <Underline />
          </Toggle>
          <span class="text-xs text-muted-foreground">variant="outline"</span>
        </div>
        <p class="text-xs text-muted-foreground">
          两组共用同一状态（<code>bold</code> / <code>italic</code> / <code>underline</code>），
          所以点其中任意一个，两组会同时变化。
        </p>
      </CardContent>
    </Card>

    <!-- 4. size -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">档位：size</h2>
        <CardDescription>
          三档高度 <code>36 / 32 / 40px</code>，并带 <code>min-w-*</code> ——
          所以只放一个图标时按钮也是正方形而不是压成扁条。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="flex flex-wrap items-center gap-3">
          <Toggle size="default" aria-label="default">
            <Star />
          </Toggle>
          <Toggle size="sm" aria-label="sm">
            <Star />
          </Toggle>
          <Toggle size="lg" aria-label="lg">
            <Star />
          </Toggle>
          <span class="text-xs text-muted-foreground">纯图标：default / sm / lg</span>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Toggle size="default" variant="outline">
            默认尺寸
          </Toggle>
          <Toggle size="sm" variant="outline">
            小号
          </Toggle>
          <Toggle size="lg" variant="outline">
            大号
          </Toggle>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 禁用 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁用</h2>
        <CardDescription>
          <code>disabled</code> 直接透传到 <code>&lt;button&gt;</code>，不可点击、不可聚焦，
          并输出 <code>data-disabled</code>。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-center gap-3">
          <Toggle disabled>
            <Star />
            未按下 + 禁用
          </Toggle>
          <Toggle disabled :default-value="true">
            <Star />
            已按下 + 禁用
          </Toggle>
        </div>
      </CardContent>
    </Card>

    <!-- 6. 插槽参数 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">用插槽参数换内容</h2>
        <CardDescription>
          默认插槽会给你 <code>{ modelValue, pressed, state, disabled }</code>，
          于是可以在不额外维护一个 ref 的情况下根据状态换图标 / 文案。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <Toggle v-model="muted" variant="outline">
            <template #default="{ pressed }">
              <BellOff v-if="pressed" />
              <Bell v-else />
              {{ pressed ? '已静音' : '取消静音' }}
            </template>
          </Toggle>
          <Toggle aria-label="收藏">
            <template #default="{ pressed }">
              <Bookmark :class="pressed ? 'fill-current' : ''" />
            </template>
          </Toggle>
          <Badge variant="secondary">
            muted = {{ muted }}
          </Badge>
        </div>
        <p class="text-xs text-muted-foreground">
          第二个按钮是<b>非受控</b>的，但你仍能从 <code>pressed</code> 拿到它的实时状态 ——
          这正是插槽参数的意义。
        </p>
      </CardContent>
    </Card>

    <!-- 7. 表单 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">表单提交</h2>
        <CardDescription>
          传 <code>name</code> 后 reka 会额外渲染一个隐藏 checkbox —— 但<b>实测它不会被勾选</b>，
          所以按原生方式提交时拿不到这个字段（见下面的实测结果）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="flex flex-wrap items-center gap-3">
            <Toggle v-model="starred" name="starred" value="1">
              <Star />
              带 name 的 Toggle
            </Toggle>
            <Button type="submit" size="sm">
              提交
            </Button>
          </div>
          <div class="rounded-lg border border-input p-3">
            <p class="mb-1 text-xs font-medium text-muted-foreground">
              提交结果
            </p>
            <p class="font-mono text-sm">
              {{ submitted || '（还没提交）' }}
            </p>
          </div>
        </form>
        <div class="rounded-lg border border-input p-3 text-xs text-muted-foreground">
          <p class="mb-1 font-medium text-foreground">
            实测结论
          </p>
          <p>
            reka 给隐藏 checkbox 传的是 <code>value: modelValue</code>（布尔），
            但<b>没有传 <code>checked</code></b> —— 所以这个 checkbox 永远是未勾选状态，
            浏览器不会把它的值放进 <code>FormData</code>（上面提交结果里只有空）。
            <b>需要把开关状态带进表单，用 <code>Switch</code>（它的隐藏 input 正确同步 checked）或自己在提交前取值。</b>
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 8. 与 ToggleGroup -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">与 Toggle Group 的关系</h2>
        <CardDescription>
          两者共用同一个底层实现 —— reka 的 <code>ToggleGroupItem</code> 内部渲染的就是 <code>Toggle</code>，
          并且会注入组上下文（所以 <code>Toggle</code> 直接放进 <code>ToggleGroup</code> 里也会跟着组走）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3 text-sm text-muted-foreground">
        <p>
          · 单个 / 独立开关 → 用 <code>Toggle</code>（本页）<br />
          · 多个按钮成组、需要单选或多选、需要统一尺寸与间距 → 用 <code>ToggleGroup</code>
          （它多了 <code>type="single|multiple"</code>、<code>variant</code>、<code>size</code>、
          <code>spacing</code> 与方向键导航）
        </p>
        <p>
          另外：<code>Toggle</code> 在 <code>ToggleGroup</code> 内部时<b>不会</b>再渲染自己的隐藏 checkbox ——
          reka 里显式判断了组上下文。
        </p>
      </CardContent>
    </Card>

    <!-- 9. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          透传 reka 的 <code>Toggle</code>，再加上 <code>variant</code> / <code>size</code> 两个档位。
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
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">渲染出的属性与插槽参数</h2>
        <CardDescription>
          <code>data-slot="toggle"</code> 是预设的定位钩子；预设并不读 <code>data-variant</code> /
          <code>data-size</code>（与 <code>Switch</code> 不同，所以这里不需要补这两个属性）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="rounded-lg border border-input p-3 text-xs text-muted-foreground">
          <ul class="list-disc space-y-1 pl-4">
            <li>根节点：<code>button</code>，带 <code>aria-pressed="true|false"</code>、<code>data-state="on|off"</code>、<code>data-disabled</code></li>
            <li>按下态预设写的是 <code>aria-pressed:bg-muted</code>（8 套都有），Lyra / Mira / Nova 另外补了一条 <code>data-[state=on]:bg-muted</code></li>
            <li>键盘：Space / Enter（原生 button 行为），不需要额外处理</li>
            <li>无障碍：<code>aria-pressed</code> 已经把「这是个可切换按钮」传达给读屏软件；纯图标时记得补 <code>aria-label</code></li>
          </ul>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  插槽参数
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in slotRows" :key="r.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ r.name }}</code>
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
        <h2 class="text-xl font-semibold">各风格外观（实测）</h2>
        <CardDescription>
          尺寸档位（高 / 最小宽）是组件自带类，各风格一致；<b>圆角、字号、图标大小、按下底色由预设决定</b>。
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
                  字号
                </th>
                <th class="py-2 pr-4 font-medium">
                  图标
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
                  {{ r.radius }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ r.font }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ r.icon }}
                </td>
                <td class="py-2 align-top text-muted-foreground">
                  {{ r.note }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-muted-foreground">
          按下底色在 8 套里都是 <code>bg-muted</code>（<code>#f9fafb</code>）——
          比组件 cva 里写的 <code>bg-accent</code> 更淡，因为预设是无层规则会盖掉它。
          想让它更明显就自己覆盖，例如 <code>aria-pressed:bg-accent!</code>。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
