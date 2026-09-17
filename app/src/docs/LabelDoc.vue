<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Search, User } from 'lucide-vue-next'

// ---------- 演示状态 ----------
const nickname = ref('')
const agreed = ref(false)
const notify = ref(false)
const bio = ref('')
const disabledValue = ref('不可编辑')
const focusLog = ref('（还没点过标签）')

/** 点标签后记录焦点落到了谁身上（原生 label 的聚焦发生在 click 之后，所以要等一拍） */
function note(which: string) {
  window.setTimeout(() => {
    const el = document.activeElement as HTMLElement | null
    focusLog.value = `${which} → ${el?.id ? `#${el.id}` : el?.tagName?.toLowerCase() ?? '无'}`
  }, 0)
}

// ---------- API ----------
const propRows = [
  { name: 'for', type: 'string', def: '—', desc: '指向控件的 <code>id</code>，点标签即可聚焦 / 切换它；也可以不写 for，直接把控件包在标签里' },
  { name: 'class', type: 'string', def: '—', desc: '追加类名。字号 / 间距由预设的 <code>[data-slot="label"]</code> 管着，要改需带 <code>!</code>（如 <code>text-xs!</code>）' },
  { name: 'as / as-child', type: '—', def: "'label'", desc: '透传 reka-ui 的 Label，可换根标签或把样式交给子元素' },
]

const autoRows = [
  { name: 'peer-disabled:*', how: '同级控件加 <code>class="peer"</code> + <code>disabled</code>，且 Label 写在它<b>后面</b>', effect: '标签变灰 (opacity .5) 且点不到（pointer-events: none），不会把焦点送给已禁用的控件' },
  { name: 'group-data-[disabled=true]:*', how: '某个祖先容器同时加 <code>class="group"</code> 与 <code>data-disabled="true"</code>', effect: '同上；适合「一整块都禁用」的场景' },
  { name: 'select-none', how: '内置', effect: '双击选词不会把标签文字一起选中' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Label 标签</h1>
    <p class="mt-3 text-muted-foreground">
      表单控件的标签，渲染成原生 <code>&lt;label&gt;</code>，所以<b>点标签就能聚焦 / 切换控件</b>。<br />
      两种写法：给控件起 <code>id</code>、标签写 <code>for</code>；或者直接把控件包进标签里（更推荐）。<br />
      它自带两条禁用态钩子（<code>peer-disabled</code> / <code>group-data-[disabled]</code>），
      控件禁用时标签会自己变灰，不用手写判断。
    </p>

    <!-- 1. 两种绑定方式 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">两种绑定方式</h2>
        <CardDescription>
          左边用 <code>for</code> + <code>id</code>，右边把 <code>Input</code> 直接包进标签。
          两种都能点标签聚焦，下面会记录焦点落到了谁身上。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="lbl-for" @click="note('for 写法')">昵称（for + id）</Label>
            <Input id="lbl-for" v-model="nickname" placeholder="点标签试试" />
          </div>

          <div class="space-y-2">
            <Label @click="note('包裹写法')">
              昵称（包裹写法）
              <Input v-model="nickname" placeholder="点标签试试" />
            </Label>
          </div>
        </div>
        <p class="text-sm text-muted-foreground">
          最近一次：<code>{{ focusLog }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 2. 包住可切换控件 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">包住「可切换」控件</h2>
        <CardDescription>
          Checkbox / Switch / Radio 这类推荐直接包进 <code>Label</code>：
          点文字就能勾选，不用自己写 <code>@click</code>。默认 <code>gap-2</code> 会留好间距。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <Label class="w-fit">
          <Checkbox v-model="agreed" />
          我已阅读并同意服务条款
        </Label>

        <Label class="w-fit">
          <Switch v-model="notify" />
          接收产品更新推送
        </Label>

        <p class="text-sm text-muted-foreground">
          勾选状态：<code>同意={{ agreed }}</code> / <code>推送={{ notify }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 3. 带图标 / 必填星号 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">图标与必填星号</h2>
        <CardDescription>
          标签默认是 <code>flex items-center gap-2</code>，所以图标直接放进去就对齐了；
          必填星号用 <code>text-destructive</code> 的 <code>span</code> 自己加（
          <code>required</code> 要给控件）。
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-6 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="lbl-mail">
            <Mail class="size-4 text-muted-foreground" />
            邮箱
            <span class="text-destructive" aria-hidden="true">*</span>
          </Label>
          <Input id="lbl-mail" type="email" required placeholder="you@example.com" />
        </div>

        <div class="space-y-2">
          <Label for="lbl-bio">
            <User class="size-4 text-muted-foreground" />
            自我介绍
          </Label>
          <Textarea id="lbl-bio" v-model="bio" rows="2" placeholder="写点什么…" />
        </div>
      </CardContent>
    </Card>

    <!-- 4. 禁用态自动联动 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁用态自动联动</h2>
        <CardDescription>
          两条内置钩子：<code>peer-disabled</code>（控件同级禁用、Label 写在它后面）与
          <code>group-data-[disabled=true]</code>（祖先容器声明整块禁用）。<br />
          注意它们都是 Tailwind 的<b>组合器</b>，需要你配合打标记：前者控件要加
          <code>class="peer"</code>，后者容器要加 <code>class="group"</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <p class="text-sm font-medium">① peer-disabled：控件加 <code>peer</code>，标签写在它后面</p>
          <Input id="lbl-disabled" v-model="disabledValue" class="peer" disabled />
          <Label for="lbl-disabled">这个标签写在带 peer 的禁用输入框后面（自动变灰）</Label>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">② group-data-[disabled]：容器加 <code>group</code></p>
          <div data-disabled="true" class="group space-y-2">
            <Label for="lbl-group">这一组的祖先容器带了 group + data-disabled="true"</Label>
            <Input id="lbl-group" model-value="整块不可编辑" disabled />
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">③ 对照组：正常状态</p>
          <Label for="lbl-normal">
            <Search class="size-4 text-muted-foreground" />
            正常标签（颜色与光标都正常）
          </Label>
          <Input id="lbl-normal" placeholder="可编辑" />
        </div>
      </CardContent>
    </Card>

    <!-- 5. 与 Field 的区别 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">Label 还是 FieldLabel？</h2>
        <CardDescription>两者外观一致，选哪个取决于你有没有用到 Field 的那套结构。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-2 text-sm text-muted-foreground">
        <p>
          · 只是给单个控件配个标签 → 用 <b class="text-foreground">Label</b>（本组件），
          最轻。
        </p>
        <p>
          · 已经用 <code>Field</code> / <code>FieldGroup</code> 组织表单 →
          用 <b class="text-foreground">FieldLabel</b>，它会自动接上 Field 的
          <code>data-invalid</code> / <code>data-disabled</code> 转发（Label 只认
          <code>data-disabled</code>）。
        </p>
        <p>
          · 想给「一组选项」起标题（渲染成 <code>&lt;legend&gt;</code> 语义）→ 用
          <code>FieldLegend</code>。
        </p>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>只有 <code>class</code> 与 reka 透传属性，内容走默认插槽。</CardDescription>
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
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">内置行为</th>
                <th class="py-2 pr-4 font-medium">怎么触发</th>
                <th class="py-2 font-medium">表现</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in autoRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground" v-html="row.how" />
                <td class="py-2 text-muted-foreground" v-html="row.effect" />
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-sm text-muted-foreground">
          无障碍：原生 <code>&lt;label&gt;</code> 的 <code>for</code> 关联本身就是最标准的方案，
          读屏会念「标签文本 + 控件」；用包裹写法时同样自动关联，不需要额外 aria。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
