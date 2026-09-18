<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

/* ── 四个方向 ── */
const side = ref<'top' | 'right' | 'bottom' | 'left'>('right')
const sideOpen = ref(false)
function openSide(s: 'top' | 'right' | 'bottom' | 'left') {
  side.value = s
  sideOpen.value = true
}

/* ── 受控与关闭途径 ── */
const controlled = ref(false)
const closeLog = ref('还没关过')
function onOpenChange(v: boolean) {
  controlled.value = v
  closeLog.value = v ? '打开了' : '关闭了（Esc / 遮罩 / × / Footer 里的取消都会走到这里）'
}

/* ── 表单 ── */
const profileOpen = ref(false)
const profileName = ref('张小明')
const saved = ref('')
function onSaveProfile() {
  saved.value = `已保存：${profileName.value}`
  profileOpen.value = false
}

/* ── 宽度 ── */
const wideOpen = ref(false)
const formOpen = ref(false)

const rootRows = [
  { name: 'v-model:open', type: 'boolean', def: '—', desc: '受控开合。<code>@update:open</code> 在 Esc / 点遮罩 / 点 × / 点 <code>SheetClose</code> 时都会触发（不管是不是受控）' },
  { name: 'defaultOpen', type: 'boolean', def: 'false', desc: '非受控时的初始状态' },
  { name: 'modal', type: 'boolean', def: 'true', desc: '模态：锁住页面滚动、点遮罩关闭、焦点锁在面板里。传 <code>false</code> 就变成非模态浮层' },
]

const contentRows = [
  { name: 'side', type: "'top' | 'right' | 'bottom' | 'left'", def: "'right'", desc: '从哪一边滑出来。左右是整列（<code>w-3/4</code> + <code>sm:max-w-sm</code>）、上下是整行（<code>h-auto</code>，高度由内容决定）' },
  { name: 'class', type: 'string', def: '—', desc: '改宽度写这里。<b>要带 <code>!</code></b>：预设把 <code>sm:max-w-sm</code> 写进了无层规则，不加 <code>!</code> 压不过去（实测 <code>sm:max-w-md!</code> → 448px）' },
  { name: '默认插槽', type: 'slot', def: '—', desc: '面板内容。<b>右上角那个 × 组件已经内置</b>，不用自己写（<code>data-slot="sheet-close-button"</code>）' },
  { name: 'onOpenAutoFocus / onCloseAutoFocus', type: 'function', def: '—', desc: '打开/关闭时的焦点接管；默认打开时焦点进面板、关闭后还给触发器' },
]

const partRows = [
  { name: 'SheetTrigger', desc: '打开面板的触发器（<code>as-child</code> 可套在 Button 上）' },
  { name: 'SheetClose', desc: '关闭按钮，<b>可以放在任意位置</b>（Footer 里的「取消」就是它）；已用专属 <code>data-slot="sheet-close"</code>，不会被预设拽到右上角' },
  { name: 'SheetHeader / Footer', desc: '上下两个容器（<code>flex flex-col</code> + <code>p-4</code>）；Footer 自带 <code>mt-auto</code>，会自动被顶到底部' },
  { name: 'SheetTitle / Description', desc: '标题与说明。Description 会挂到内容面板的 <code>aria-describedby</code> 上，不想要就传 <code>aria-describedby=undefined</code>' },
  { name: 'SheetOverlay', desc: '遮罩，由 <code>SheetContent</code> 自动渲染，一般不用手写。颜色取预设（如「经典」风格是 <code>bg-black/10</code> + 背景模糊）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Sheet 侧边抽屉</h1>
    <p class="mt-3 text-muted-foreground">
      从屏幕某一边滑出来的面板，四个方向可选。<code>Sheet</code> 给开合状态，
      <code>SheetTrigger</code> 打开它，<code>SheetContent</code> 是面板本体
      （<code>side</code> 决定方向，内置右上角关闭按钮）。<br />
      底层就是 Dialog，所以模态行为、焦点管理、Esc / 点遮罩关闭都和 Dialog 一致。
    </p>

    <!-- 1. 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          右侧滑出的完整结构：<code>Header</code>（标题 + 说明）→ 内容 → <code>Footer</code>（按钮）。<br />
          Footer 自带 <code>mt-auto</code>，内容少的时候它会自动贴到底部；右上角那个 × 是组件内置的。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline">
              打开抽屉
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>编辑个人资料</SheetTitle>
              <SheetDescription>
                改完记得保存，右侧抽屉里也能直接关。
              </SheetDescription>
            </SheetHeader>

            <div class="space-y-4 px-4">
              <div class="space-y-2">
                <Label for="sheet-basic-name">昵称</Label>
                <Input id="sheet-basic-name" model-value="张小明" />
              </div>
              <div class="space-y-2">
                <Label for="sheet-basic-bio">一句话简介</Label>
                <Input id="sheet-basic-bio" model-value="前端开发 / 喜欢折腾组件库" />
              </div>
            </div>

            <SheetFooter>
              <SheetClose as-child>
                <Button variant="outline">
                  取消
                </Button>
              </SheetClose>
              <Button>保存</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>

    <!-- 2. 四个方向 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">四个方向</h2>
        <CardDescription>
          <code>side</code> = <code>top</code> / <code>right</code> / <code>bottom</code> / <code>left</code>，
          对应四个滑入方向与贴边位置。<br />
          左右是<b>整列</b>（<code>inset-y-0</code> + <code>h-full</code> + <code>w-3/4</code>），
          上下是<b>整行</b>（<code>inset-x-0</code> + <code>h-auto</code>，高度由内容撑）。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-2">
        <Button
          v-for="s in (['top', 'right', 'bottom', 'left'] as const)"
          :key="s"
          variant="outline"
          size="sm"
          @click="openSide(s)"
        >
          {{ s }}
        </Button>
        <Badge variant="secondary">
          当前：{{ side }}
        </Badge>

        <Sheet v-model:open="sideOpen">
          <SheetContent :side="side">
            <SheetHeader>
              <SheetTitle>side = "{{ side }}"</SheetTitle>
              <SheetDescription>
                这个面板是按当前按钮的方向滑出来的，换一个按钮再点一次即可对比。
              </SheetDescription>
            </SheetHeader>
            <div class="px-4 text-sm text-muted-foreground">
              面板容器的 <code>data-side</code> 属性就是 <code>{{ side }}</code>，
              所有定位与滑入动画都挂在它上面。
            </div>
            <SheetFooter>
              <SheetClose as-child>
                <Button variant="outline">
                  关闭
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>

    <!-- 3. 宽度 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">改宽度</h2>
        <CardDescription>
          默认宽度是 <code>w-3/4</code>，并且 <code>sm</code> 以上被限制成 <code>sm:max-w-sm</code>（384px）。<br />
          <b>覆盖宽度必须带 <code>!</code></b> —— 那条 <code>sm:max-w-sm</code> 写在预设的无层规则里，
          普通工具类压不过它（和 Dialog 的 <code>sm:max-w-md</code> 是同一个坑）。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap gap-2">
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline" size="sm">
              默认（max-w-sm）
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>默认宽度</SheetTitle>
              <SheetDescription>
                <code>w-3/4</code> 且 <code>sm</code> 以上最多 384px。
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Sheet v-model:open="wideOpen">
          <SheetTrigger as-child>
            <Button variant="outline" size="sm">
              sm:max-w-md!
            </Button>
          </SheetTrigger>
          <SheetContent class="sm:max-w-md!">
            <SheetHeader>
              <SheetTitle>更宽的抽屉</SheetTitle>
              <SheetDescription>
                <code>class="sm:max-w-md!"</code> → 448px（实测）。
              </SheetDescription>
            </SheetHeader>
            <div class="px-4">
              <p class="text-sm text-muted-foreground">
                带上 <code>!</code> 才会生效；去掉它就还是 384px。
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>

    <!-- 4. 受控与关闭途径 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控开合与各种关闭方式</h2>
        <CardDescription>
          用 <code>v-model:open</code> 控制面板。四条关闭途径（Esc、点遮罩、右上角 ×、Footer 里的
          <code>SheetClose</code>）都会触发 <code>@update:open(false)</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" @click="controlled = true">
            外部打开（v-model）
          </Button>
          <Badge variant="secondary">
            open：{{ controlled }}
          </Badge>
          <span class="text-sm text-muted-foreground">{{ closeLog }}</span>
        </div>

        <Sheet :open="controlled" @update:open="onOpenChange">
          <SheetContent>
            <SheetHeader>
              <SheetTitle>受控面板</SheetTitle>
              <SheetDescription>
                试试用 Esc、点遮罩、点右上角 ×，或者点下面的「取消」—— 都会回到
                <code>open: false</code>。
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose as-child>
                <Button variant="outline">
                  取消
                </Button>
              </SheetClose>
              <Button @click="controlled = false">
                确认
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>

    <!-- 5. 表单 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">表单场景</h2>
        <CardDescription>
          抽屉里放表单是很常见的用法：Header 说明、中间滚动区、Footer 固定放按钮。<br />
          <b>关闭要显式写</b> —— 提交成功后手动 <code>profileOpen = false</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" @click="profileOpen = true">
          编辑资料
        </Button>
        <span v-if="saved" class="text-sm text-muted-foreground">{{ saved }}</span>

        <Sheet v-model:open="profileOpen">
          <SheetContent class="sm:max-w-md!">
            <SheetHeader>
              <SheetTitle>编辑资料</SheetTitle>
              <SheetDescription>
                改完点保存，面板会自动收起。
              </SheetDescription>
            </SheetHeader>
            <div class="space-y-4 px-4">
              <div class="space-y-2">
                <Label for="sheet-form-name">姓名</Label>
                <Input id="sheet-form-name" v-model="profileName" />
              </div>
              <div class="space-y-2">
                <Label for="sheet-form-mail">邮箱</Label>
                <Input id="sheet-form-mail" placeholder="you@example.com" />
              </div>
            </div>
            <SheetFooter>
              <SheetClose as-child>
                <Button variant="outline">
                  取消
                </Button>
              </SheetClose>
              <Button @click="onSaveProfile">
                保存
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>

    <!-- 6. 长内容 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">长内容滚动</h2>
        <CardDescription>
          面板本身是 <code>flex flex-col</code> + <code>h-full</code>，<b>不会自动出滚动条</b> ——
          内容多了会直接顶出可视区（看不见也滚不到）。<br />
          正确做法是给中间那块加 <code>min-h-0 flex-1 overflow-y-auto</code>：<code>min-h-0</code>
          必须写，否则 flex 子项的默认 <code>min-height: auto</code> 会把它撑开、<code>overflow</code> 就失效了。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Sheet v-model:open="formOpen">
          <SheetTrigger as-child>
            <Button variant="outline" size="sm">
              打开长列表抽屉（40 条）
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>操作日志</SheetTitle>
              <SheetDescription>
                Header 与 Footer 固定，中间区域自己滚。
              </SheetDescription>
            </SheetHeader>

            <div class="min-h-0 flex-1 space-y-2 overflow-y-auto px-4">
              <div
                v-for="i in 40"
                :key="i"
                class="rounded-md border border-input px-3 py-2 text-sm"
              >
                第 {{ i }} 条记录 · 由 admin 于 09:{{ String(i).padStart(2, '0') }} 触发
              </div>
            </div>

            <SheetFooter>
              <SheetClose as-child>
                <Button variant="outline">
                  关闭
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>

    <!-- 7. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          <code>Sheet</code>（根）透传给 reka 的 <code>DialogRoot</code>。
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
        <h2 class="text-xl font-semibold">SheetContent</h2>
        <CardDescription>面板本体，最常改的就是它。</CardDescription>
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
              <tr v-for="row in contentRows" :key="row.name" class="border-b last:border-0">
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
        <h2 class="text-xl font-semibold">其余子部件</h2>
        <CardDescription>组合起来用就行，都没有额外必填项。</CardDescription>
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
