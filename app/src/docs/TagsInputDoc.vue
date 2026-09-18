<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/components/ui/tags-input'

/* ── 演示状态 ── */
const skills = ref(['Vue', 'TypeScript'])
const emails = ref(['linzhou@example.com'])
const limited = ref(['a', 'b'])
const disabledTags = ref(['只读标签', '不可编辑'])
const submitted = ref('')

const fruit = ref(['苹果'])

/* 对象值 */
type Member = { id: number, name: string }
const members = ref<Member[]>([{ id: 1, name: '林舟' }])
let seq = 2

/* 表单提交：处理逻辑必须写在 script 里 —— 模板表达式访问不到全局 FormData
   （直接写在 @submit 里会报 `_ctx.FormData is not a constructor`，同类坑：Sonner 的 setTimeout） */
function onSubmit(e: Event) {
  const fd = new FormData(e.target as HTMLFormElement)
  submitted.value = [...fd.entries()].map(([k, v]) => `${k}=${v}`).join(' & ') || '（空）'
}

/* ── API 表 ── */
const rootRows = [
  { name: 'v-model', type: 'any[]', def: '[]', desc: '标签数组（受控）。元素可以是字符串，也可以是对象（对象要配 <code>convert-value</code>）' },
  { name: 'default-value', type: 'any[]', def: '[]', desc: '非受控时的初始标签' },
  { name: 'delimiter', type: 'string | RegExp', def: "','", desc: '分隔符：在输入框里<b>键入这个字符就会立刻成标签</b>；粘贴时也按它拆分（<code>add-on-paste</code> 开启时）。传 <code>""</code> 则关闭' },
  { name: 'max', type: 'number', def: '0', desc: '标签数量上限，<code>0</code> 表示不限。超出时添加被拒并触发 <code>invalid</code> 事件' },
  { name: 'duplicate', type: 'boolean', def: 'false', desc: '是否允许重复标签。默认不允许 —— 添加重复项会被拒，并给根节点与输入框打上 <code>data-invalid</code>' },
  { name: 'addOnPaste', type: 'boolean', def: 'false', desc: '粘贴时按 <code>delimiter</code> 拆分并逐个添加（默认关闭：走浏览器原生粘贴）' },
  { name: 'addOnTab', type: 'boolean', def: 'false', desc: '按 Tab 时把当前输入内容加为标签（默认关闭，Tab 仍是移动焦点）' },
  { name: 'addOnBlur', type: 'boolean', def: 'false', desc: '失焦时把当前输入内容加为标签' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用：输入框不可输入、标签不可选中删除' },
  { name: 'name', type: 'string', def: '—', desc: '表单字段名。<b>只有传了它</b>，reka 才会为<b>每个标签</b>渲染一个隐藏 input（name 带下标：<code>skills[0]</code> / <code>skills[1]</code>）参与原生表单提交' },
  { name: 'required', type: 'boolean', def: 'false', desc: '原生必填校验（需同时给 <code>name</code>）' },
  { name: 'convertValue', type: '(v: string) => any', def: '—', desc: '<b>值用对象时必填</b>：把输入框里的字符串转成你的对象。不传而值是对象会直接抛错' },
  { name: 'displayValue', type: '(v: any) => string', def: 'v => v.toString()', desc: '把值渲染成标签文字（<code>TagsInputItemText</code> 用它）' },
  { name: 'id', type: 'string', def: '—', desc: '透传到输入框上，配合 <code>&lt;Label for&gt;</code> 点击文字即可聚焦' },
]

const eventRows = [
  { name: 'update:modelValue', desc: '标签数组变化（v-model）' },
  { name: 'addTag', desc: '成功添加一个标签时触发，参数是该标签' },
  { name: 'removeTag', desc: '删除标签时触发' },
  { name: 'invalid', desc: '添加被拒时触发（重复 / 超出 <code>max</code>）' },
]

const partRows = [
  { name: 'TagsInput', desc: '根容器（<code>flex flex-wrap</code> + 输入框外观）。焦点在输入框时靠 <code>focus-within:</code> 给整圈高亮' },
  { name: 'TagsInputInput', desc: '真正的 <code>&lt;input&gt;</code>，<code>flex-1</code> 占满剩余宽度；本身没有边框（边框在根上）' },
  { name: 'TagsInputItem', desc: '单个标签：<code>h-5</code> 的次级色胶囊；被键盘选中时打 <code>data-state="active"</code>（组件据此画 ring）' },
  { name: 'TagsInputItemText', desc: '标签文字；默认插槽可以拿到值，也可以直接用 <code>displayValue</code> 自动渲染' },
  { name: 'TagsInputItemDelete', desc: '删除按钮，默认插槽是一枚 <code>X</code> 图标；可以换成别的图标 / 文字' },
]

const addRows = [
  { way: '键入分隔符', flag: "delimiter（默认 ','）", def: '开', desc: '在输入框里敲 <code>,</code> 立刻成标签（分隔符本身不会进入内容）' },
  { way: 'Enter', flag: '—', def: '开', desc: '无法关闭；内容为空时不生效' },
  { way: 'Tab', flag: 'add-on-tab', def: '关', desc: '开启后 Tab 会先把内容加为标签并阻止默认的焦点移动' },
  { way: '失焦', flag: 'add-on-blur', def: '关', desc: '点击容器外时把未提交的输入内容加为标签' },
  { way: '粘贴', flag: 'add-on-paste', def: '关', desc: '开启后粘贴会按分隔符拆分并逐个添加（<code>"a, b, c"</code> → 三个标签）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Tags Input 标签输入</h1>
    <p class="mt-3 text-muted-foreground">
      把自由文本收成一组标签：输入内容后按分隔符 / Enter 变成胶囊，胶囊上有删除按钮，
      还能用键盘在胶囊之间移动与删除。基于 reka-ui 的 <code>TagsInputRoot</code>，5 个部件。<br />
      <b>注意</b>：8 套样式预设里<b>没有任何 tags-input 规则</b>（和 Stepper 一样），
      所以它的外观完全由组件自带类决定，不受设计系统切换影响。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>v-model</code> 绑一个字符串数组。输入框里敲 <b>Enter</b> 或 <b>逗号</b> 就能把当前内容变成标签；
          点胶囊上的 × 删除。容器是 <code>flex-wrap</code>，标签多了会自动换行。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <TagsInput v-model="skills">
          <TagsInputItem v-for="s in skills" :key="s" :value="s">
            <TagsInputItemText />
            <TagsInputItemDelete />
          </TagsInputItem>
          <TagsInputInput placeholder="输入技能后回车…" />
        </TagsInput>

        <p class="text-xs text-muted-foreground">
          当前值：<code>{{ JSON.stringify(skills) }}</code> —— 试试输入
          <code>Rust,Go</code>（带逗号会一次拆成两个）
        </p>
      </CardContent>
    </Card>

    <!-- 2. 添加方式 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">五种添加方式</h2>
        <CardDescription>
          只有「键入分隔符」和 Enter 是默认开启的，其余三个都要显式打开。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  方式
                </th>
                <th class="py-2 pr-4 font-medium">
                  开启开关
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
              <tr v-for="r in addRows" :key="r.way" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top font-medium">
                  {{ r.way }}
                </td>
                <td class="py-2 pr-4 align-top">
                  <code>{{ r.flag }}</code>
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  {{ r.def }}
                </td>
                <td class="py-2 align-top" v-html="r.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-4">
          <div class="space-y-1">
            <p class="text-xs font-medium text-muted-foreground">
              自定义分隔符 <code>delimiter=";"</code> —— 这时逗号只是普通字符
            </p>
            <TagsInput v-model="fruit" delimiter=";">
              <TagsInputItem v-for="f in fruit" :key="f" :value="f">
                <TagsInputItemText />
                <TagsInputItemDelete />
              </TagsInputItem>
              <TagsInputInput placeholder="输入水果后敲 ; …" />
            </TagsInput>
          </div>

          <div class="space-y-1">
            <p class="text-xs font-medium text-muted-foreground">
              <code>add-on-blur</code> + <code>add-on-tab</code>：直接点别处 / 按 Tab 也会提交
            </p>
            <TagsInput v-model="emails" add-on-blur add-on-tab delimiter="@">
              <TagsInputItem v-for="e in emails" :key="e" :value="e">
                <TagsInputItemText />
                <TagsInputItemDelete />
              </TagsInputItem>
              <TagsInputInput placeholder="输入邮箱后点到别处…" />
            </TagsInput>
            <p class="text-xs text-muted-foreground">
              这里把分隔符设成了 <code>@</code>，所以能用它把「域名」拆成独立标签。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 上限与重复 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">数量上限与重复项</h2>
        <CardDescription>
          <code>max</code> 限数量（默认 <code>0</code> 不限），<code>duplicate</code> 控制是否允许重复。
          两者被拒时都会触发 <code>invalid</code> 事件；<b>但只有重复项会给根节点打上 <code>data-invalid</code></b>
          （组件据此把边框变红），超上限不会。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">
            <code>:max="3"</code> —— 已经 2 个，只能再加 1 个
          </p>
          <TagsInput v-model="limited" :max="3" add-on-blur>
            <TagsInputItem v-for="t in limited" :key="t" :value="t">
              <TagsInputItemText />
              <TagsInputItemDelete />
            </TagsInputItem>
            <TagsInputInput placeholder="再输一个试试…" />
          </TagsInput>
          <p class="text-xs text-muted-foreground">
            {{ limited.length }} / 3
          </p>
        </div>

        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">
            默认不允许重复：输入 <code>Vue</code>（上面已有）会被拒 → 边框变红
          </p>
          <TagsInput v-model="skills" add-on-blur>
            <TagsInputItem v-for="s in skills" :key="s" :value="s">
              <TagsInputItemText />
              <TagsInputItemDelete />
            </TagsInputItem>
            <TagsInputInput placeholder="输入 Vue 试试…" />
          </TagsInput>
          <p class="text-xs text-muted-foreground">
            红色一直保留到下一次输入 —— reka 在每次 input 事件时重置这个状态。
            传 <code>duplicate</code> 就不会被拒。
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 禁用 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁用</h2>
        <CardDescription>
          <code>disabled</code> 会透传到输入框上：不能输入，也不能用键盘选中 / 删除标签。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TagsInput v-model="disabledTags" disabled>
          <TagsInputItem v-for="t in disabledTags" :key="t" :value="t">
            <TagsInputItemText />
            <TagsInputItemDelete />
          </TagsInputItem>
          <TagsInputInput placeholder="这个输入框点不动" />
        </TagsInput>
      </CardContent>
    </Card>

    <!-- 5. 自定义标签内容 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">自定义标签内容</h2>
        <CardDescription>
          胶囊的外观由 <code>TagsInputItem</code> 的 class 控制，里面的内容自由：
          <code>TagsInputItemText</code> 不加插槽时会用 <code>display-value</code> 自动渲染文字，
          想加图标 / 计数就往里放内容。<code>TagsInputItemDelete</code> 的插槽可以换成别的图标。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">
            用 <code>Badge</code> 换掉默认胶囊外观
          </p>
          <TagsInput v-model="skills">
            <TagsInputItem v-for="s in skills" :key="s" :value="s" class="h-auto! bg-transparent! p-0">
              <Badge variant="outline" class="gap-1">
                {{ s }}
                <TagsInputItemDelete class="mr-0! size-3! opacity-60 hover:opacity-100" />
              </Badge>
            </TagsInputItem>
            <TagsInputInput placeholder="输入技能后回车…" />
          </TagsInput>
        </div>

        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">
            对象值：<code>convert-value</code> 把输入转成对象，<code>display-value</code> 决定显示文字
          </p>
          <TagsInput
            v-model="members"
            add-on-blur
            :convert-value="(v: string) => ({ id: seq++, name: v })"
            :display-value="(v: Member) => `#${v.id} ${v.name}`"
          >
            <TagsInputItem v-for="m in members" :key="m.id" :value="m">
              <TagsInputItemText />
              <TagsInputItemDelete />
            </TagsInputItem>
            <TagsInputInput placeholder="输入成员名…" />
          </TagsInput>
          <p class="text-xs text-muted-foreground">
            值：<code>{{ JSON.stringify(members) }}</code>
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 6. 键盘与选中态 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">键盘与选中态</h2>
        <CardDescription>
          除了 Enter 添加，键盘还能操作已存在的标签 —— 关键前提是<b>光标停在输入框最前面</b>：
          <code>selectionStart === 0</code> 才会接管方向键与退格。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <TagsInput v-model="skills">
          <TagsInputItem v-for="s in skills" :key="s" :value="s">
            <TagsInputItemText />
            <TagsInputItemDelete />
          </TagsInputItem>
          <TagsInputInput placeholder="光标置前再按 Backspace…" />
        </TagsInput>

        <div class="rounded-lg border border-input p-3 text-xs text-muted-foreground">
          <ul class="list-disc space-y-1 pl-4">
            <li><b>Backspace</b>（输入框为空且光标在最前）：第一次按<b>选中</b>最后一个标签，再按一次<b>删除</b>它</li>
            <li><b>←</b>（光标在最前）：从最后一个标签开始向前移动选中；<b>→</b> 向后移动，走到最后一个标签后再按一次回到输入框</li>
            <li><b>Delete</b>：直接删除当前选中的标签</li>
            <li>被选中的标签带 <code>data-state="active"</code>，组件据此画一圈 ring（上例里按 ← 就能看到）</li>
            <li>输入任何其他字符都会取消选中</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <!-- 7. 表单提交 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">随表单提交</h2>
        <CardDescription>
          和 <code>Switch</code> 一样的机制：<b>必须传 <code>name</code></b>，
          reka 才会额外渲染隐藏 input 把标签交给浏览器提交；<b>而且每个标签一个</b>，
          name 带下标 —— <code>skills[0]</code> / <code>skills[1]</code> ……（与 Slider 的 <code>volume[0]</code> 同一套路）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="space-y-2">
            <Label for="tags-skills">技能（提交为 skills）</Label>
            <TagsInput v-model="skills" name="skills" id="tags-skills">
              <TagsInputItem v-for="s in skills" :key="s" :value="s">
                <TagsInputItemText />
                <TagsInputItemDelete />
              </TagsInputItem>
              <TagsInputInput placeholder="输入技能后回车…" />
            </TagsInput>
          </div>
          <div class="flex items-center gap-3">
            <Button type="submit" size="sm">
              提交
            </Button>
            <Badge v-if="submitted" variant="outline" class="font-mono">
              {{ submitted }}
            </Badge>
          </div>
        </form>
        <p class="text-xs text-muted-foreground">
          隐藏 input 带 <code>aria-hidden</code> / <code>tabindex="-1"</code>，并用内联样式压成 1×1 ——
          注意它们<b>没有 <code>type</code> 属性</b>（所以 <code>input.type</code> 会报 <code>"text"</code>，
          想过滤它们得看 <code>data-hidden</code> 或 <code>aria-hidden</code>）。后端按数组接收即可。
        </p>
      </CardContent>
    </Card>

    <!-- 8. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          <code>TagsInput</code> 透传 reka 的 <code>TagsInputRoot</code>。
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
              <tr v-for="r in rootRows" :key="r.name" class="border-b last:border-0">
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
        <h2 class="text-xl font-semibold">事件</h2>
        <CardDescription>
          四个事件，其中 <code>invalid</code> 是判断「为什么没加上」的唯一途径
          （<code>max</code> 超限时不会打 <code>data-invalid</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  事件
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in eventRows" :key="r.name" class="border-b last:border-0">
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
        <h2 class="text-xl font-semibold">五个部件与状态属性</h2>
        <CardDescription>
          reka 另外还导出了 <code>TagsInputClear</code>（「清空全部」按钮），本库没有包装。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
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
              <tr v-for="r in partRows" :key="r.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ r.name }}</code>
                </td>
                <td class="py-2 align-top" v-html="r.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rounded-lg border border-input p-3 text-xs text-muted-foreground">
          <p class="mb-1 font-medium text-foreground">
            可用的状态属性
          </p>
          <ul class="list-disc space-y-1 pl-4">
            <li>根节点 / 输入框：添加被拒（重复）时带 <code>data-invalid</code> —— 组件的红边框就是靠它</li>
            <li>标签：<code>data-state="active" | "inactive"</code>（键盘选中态）</li>
            <li>删除按钮：同样带 <code>data-state</code></li>
            <li><b>没有 <code>data-slot</code></b>（与 Stepper 一样），也没有 <code>aria-invalid</code> ——
              组件里的 <code>aria-invalid:*</code> 类只在你自己传这个属性时生效</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">关于样式</h2>
        <CardDescription>
          8 套预设里关于 tags-input 的规则数为 <b>0</b>，所以这个组件不参与设计系统切换。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="rounded-lg border border-input p-3 text-xs text-muted-foreground">
          <ul class="list-disc space-y-1 pl-4">
            <li>外观全部来自组件自带类：根 <code>rounded-md border border-input bg-background px-2 py-1</code>、
              标签 <code>h-5 rounded-md bg-secondary</code></li>
            <li>因此 <b>覆盖样式不需要 <code>!</code></b>（这与 Table / Switch / Slider 那些被预设压制的组件正好相反）</li>
            <li>代价是它不会跟随设计系统变化 —— 需要每套风格各不相同的观感时，得自己按风格写样式</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
