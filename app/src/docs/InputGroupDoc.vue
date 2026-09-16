<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AtSign, Copy, CreditCard, Link, Search, Send, X } from 'lucide-vue-next'

// ---------- 演示状态 ----------
const q = ref('')
const amount = ref('1250')
const domain = ref('rionstudio')
const url = ref('docs.rionstudio.dev')
const mail = ref('hi')
const kw = ref('')
const clearable = ref('可以清空的内容')
const bio = ref('组件库与设计系统，喜欢把交互细节抠到底。')
const invalidValue = ref('not-an-email')
const copied = ref(false)

/** 复制按钮的临时反馈 */
function copy() {
  copied.value = true
  window.setTimeout(() => (copied.value = false), 1200)
}

const bioCount = computed(() => bio.value.length)

// ---------- API ----------
const groupRows = [
  { name: 'class', type: 'string', def: '—', desc: '容器类名；高度 / 圆角在预设里写死，要改得带 !（如 h-11!）' },
  { name: '（默认插槽）', type: '—', def: '—', desc: '放 InputGroupAddon + InputGroupInput / InputGroupTextarea' },
]

const addonRows = [
  { name: 'align', type: "'inline-start' | 'inline-end' | 'block-start' | 'block-end'", def: "'inline-start'", desc: '左侧 / 右侧 / 上方整行 / 下方整行；block-* 会把容器变成竖排并自动变高' },
  { name: 'class', type: 'string', def: '—', desc: '左右内边距预设已给（pl-2 / pr-2），要改需要 !' },
]

const partRows = [
  { name: 'InputGroupInput', type: '—', desc: '组内输入框（Input 去掉边框/圆角/ring）；<b>不要直接用 Input</b>，否则容器认不出它' },
  { name: 'InputGroupTextarea', type: '—', desc: '组内多行输入框，默认 resize-none（要拖动就传 class="resize-y"）' },
  { name: 'InputGroupText', type: '—', desc: '纯文本前缀 / 后缀 / 单位（$、@example.com、kg）；里面的 svg 自动 16×16' },
  { name: 'InputGroupButton', type: '—', desc: '小按钮，默认 size="xs" variant="ghost"；另有 sm / icon-xs / icon-sm' },
]

const stateRows = [
  { name: '聚焦', how: '输入框 focus-visible', effect: '整个容器出现 ring（预设用 has-[[data-slot=input-group-control]:focus-visible] 实现）' },
  { name: '错误', how: '给组内控件加 aria-invalid="true"', effect: '容器边框 + ring 变红；加在容器上无效' },
  { name: '禁用', how: '给组内控件加 disabled', effect: '控件自身变灰；Addon 想一起变灰就加 group-data-[disabled=true]/input-group，或自己控制' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Input Group 输入框组</h1>
    <p class="mt-3 text-muted-foreground">
      把<b>输入框 + 图标 / 文本 / 按钮</b>拼成一个整体：外框、圆角、聚焦与错误态由容器统一负责，<br />
      组内输入框自己是「无边框、无 ring」的，所以不会出现双边框、双焦点框。<br />
      用法是 <code>InputGroup</code> 里放 <code>InputGroupAddon</code> +
      <code>InputGroupInput</code>。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法：图标 + 输入框</h2>
        <CardDescription>
          <code>InputGroupAddon</code> 默认靠左，点这块区域会<b>自动把焦点交给输入框</b>，所以点图标就能直接开打。
        </CardDescription>
      </CardHeader>
      <CardContent class="max-w-sm space-y-2">
        <Label for="ig-search">搜索</Label>
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput id="ig-search" v-model="q" placeholder="搜索组件…" />
        </InputGroup>
        <p class="text-sm text-muted-foreground">
          当前值：<code>{{ q || '（空）' }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 2. 前后缀文本 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">前缀 / 后缀：InputGroupText</h2>
        <CardDescription>
          金额、单位、域名这类「固定文案」用 <code>InputGroupText</code>，靠
          <code>align="inline-start" | "inline-end"</code> 换左右。
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-5 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="ig-amount">金额</Label>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput id="ig-amount" v-model="amount" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>.00</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div class="space-y-2">
          <Label for="ig-domain">域名</Label>
          <InputGroup>
            <InputGroupAddon>
              <Link />
            </InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
            <InputGroupInput id="ig-domain" v-model="domain" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>.com</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div class="space-y-2 sm:col-span-2">
          <Label for="ig-mail">邮箱（后缀 + 快捷键提示）</Label>
          <InputGroup>
            <InputGroupAddon>
              <AtSign />
            </InputGroupAddon>
            <InputGroupInput id="ig-mail" v-model="mail" placeholder="用户名" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>@example.com</InputGroupText>
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </InputGroupAddon>
          </InputGroup>
          <p class="text-muted-foreground text-xs">
            <code>kbd</code> 放在 addon 里会自动缩一点圆角，跟输入框对齐
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 按钮 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">按钮：InputGroupButton</h2>
        <CardDescription>
          默认 <code>size="xs"</code> <code>variant="ghost"</code>：高度贴合输入框。
          点按钮不会把焦点抢给输入框（<code>InputGroupAddon</code> 对 <code>button</code> 让路）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="max-w-md space-y-2">
          <Label for="ig-send">搜索 + 右侧按钮</Label>
          <InputGroup>
            <InputGroupInput id="ig-send" v-model="kw" placeholder="关键词…" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton variant="secondary">
                <Search />
                搜索
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <Separator />

        <div class="max-w-md space-y-2">
          <Label for="ig-clear">可清空（icon-xs）</Label>
          <InputGroup>
            <InputGroupAddon>
              <CreditCard />
            </InputGroupAddon>
            <InputGroupInput id="ig-clear" v-model="clearable" />
            <InputGroupAddon v-if="clearable" align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="清空" @click="clearable = ''">
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div class="max-w-md space-y-2">
          <Label for="ig-copy">复制 + 发送</Label>
          <InputGroup>
            <InputGroupInput id="ig-copy" v-model="url" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton aria-label="复制" @click="copy">
                <Copy />
                {{ copied ? '已复制' : '复制' }}
              </InputGroupButton>
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <InputGroupButton variant="default" size="icon-xs" aria-label="发送">
                <Send />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 块级 addon -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">上下整行：block-start / block-end</h2>
        <CardDescription>
          <code>align="block-*"</code> 会让容器变成<b>竖排</b>并把高度交给内容（不再固定
          <code>h-9</code>）——多行输入加标题 / 说明 / 字数统计就靠它。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-2">
        <Label for="ig-bio">个人简介</Label>
        <InputGroup>
          <InputGroupAddon align="block-start">
            <InputGroupText>自我介绍</InputGroupText>
          </InputGroupAddon>
          <InputGroupTextarea id="ig-bio" v-model="bio" rows="3" placeholder="写点什么…" />
          <InputGroupAddon align="block-end">
            <InputGroupText>{{ bioCount }} / 200</InputGroupText>
            <InputGroupButton class="ml-auto" variant="default">
              <Send />
              保存
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <p class="text-muted-foreground text-xs">
          注意容器高度：默认 <code>h-9</code>，有 block addon 或 textarea 时自动 <code>h-auto</code>
        </p>
      </CardContent>
    </Card>

    <!-- 5. 状态 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">状态：聚焦 / 错误 / 禁用</h2>
        <CardDescription>
          聚焦与错误都是<b>容器</b>的整体表现，由预设里的 <code>has-[...]</code> 规则驱动：
          <code>aria-invalid</code> 要加在<b>组内控件</b>上，加容器上没有效果。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="max-w-md space-y-2">
          <Label for="ig-invalid">错误（给组内控件加 aria-invalid）</Label>
          <InputGroup>
            <InputGroupAddon>
              <AtSign />
            </InputGroupAddon>
            <InputGroupInput
              id="ig-invalid"
              v-model="invalidValue"
              :aria-invalid="!invalidValue.includes('@')"
            />
          </InputGroup>
          <p class="text-destructive text-sm">
            {{ invalidValue.includes('@') ? '格式正确' : '请输入合法的邮箱地址' }}
          </p>
        </div>

        <Separator />

        <div class="max-w-md space-y-2">
          <Label for="ig-disabled">禁用</Label>
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput id="ig-disabled" disabled default-value="不可编辑" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>禁用态</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <p class="text-muted-foreground text-xs">
            用 <code>default-value</code> 给初值（<code>Input</code> 内部用 <code>v-model</code> 接管，
            直接写 <code>value="…"</code> 不生效）
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>一共 6 个组件：1 个容器 + 4 类配件。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">InputGroup</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in groupRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">InputGroupAddon</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in addonRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">其它配件</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in partRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">状态</th>
                <th class="py-2 pr-4 font-medium">怎么触发</th>
                <th class="py-2 font-medium">表现</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in stateRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 font-medium">{{ row.name }}</td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.how }}</td>
                <td class="py-2 text-muted-foreground">{{ row.effect }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
