<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/* ── 演示状态 ── */
const tab = ref('overview')
const controlled = ref('a')
const vertical = ref('profile')
const iconTab = ref('inbox')
const lineTab = ref('preview')
const manualTab = ref('one')
const keptTab = ref('x')

/* ── API 表 ── */
const apiRows = [
  { name: 'Tabs', prop: 'v-model', type: 'string | number', def: '—', desc: '当前选中的标签。用 <code>default-value</code> 则变为非受控' },
  { name: 'Tabs', prop: 'orientation', type: "'horizontal' | 'vertical'", def: "'horizontal'", desc: '方向。会在根节点输出 <code>data-orientation</code>，预设的方向相关样式与键盘方向键都看它' },
  { name: 'Tabs', prop: 'activationMode', type: "'automatic' | 'manual'", def: "'automatic'", desc: '<b>automatic</b>：焦点移到哪个标签就切换（方向键即可换页）；<b>manual</b>：移动焦点不切换，要再按 Enter / Space' },
  { name: 'Tabs', prop: 'unmountOnHide', type: 'boolean', def: 'true', desc: '未选中时是否抹掉面板内部的 DOM。默认 <b>true</b>：<b>面板元素本身一直在 DOM 里</b>（靠 <code>hidden</code> 隐藏），但里面渲染的内容会被卸掉 → 表单状态 / 滚动位置会丢。传 <code>false</code> 则内容常驻' },
  { name: 'Tabs', prop: 'dir', type: "'ltr' | 'rtl'", def: '—', desc: '阅读方向（影响方向键映射）' },
  { name: 'TabsList', prop: 'variant', type: "'default' | 'line'", def: "'default'", desc: '<b>本库新增</b>的 prop：输出 <code>data-variant</code> 供预设选档位（<code>line</code> 是方角、无阴影的扁平样式）；同时容器带 <code>group/tabs-list</code>，触发器靠它读到该档位' },
  { name: 'TabsList', prop: 'loop', type: 'boolean', def: 'true', desc: '方向键走到头是否绕回另一端' },
  { name: 'TabsTrigger', prop: 'value', type: 'string | number', def: '—', desc: '<b>必填</b>，与 <code>TabsContent</code> 的 <code>value</code> 对应' },
  { name: 'TabsTrigger', prop: 'disabled', type: 'boolean', def: 'false', desc: '禁用该标签：不响应点击 / 方向键，同时输出 <code>data-disabled</code>' },
  { name: 'TabsContent', prop: 'value', type: 'string | number', def: '—', desc: '<b>必填</b>' },
  { name: 'TabsContent', prop: 'force-mount', type: 'boolean', def: 'false', desc: '让面板不受自动卸载 / 隐藏控制 —— 实测开了之后<b>即使未选中也不会加 <code>hidden</code></b>（会一直显示），所以它需要你自己按选中状态隐藏（见下文示例）' },
]

const dataAttrRows = [
  { el: 'Tabs（根）', attrs: 'data-slot="tabs" · data-orientation · group/tabs', desc: '预设的方向相关规则读的就是根上的 <code>group-data-horizontal/tabs</code> / <code>group-data-vertical/tabs</code>' },
  { el: 'TabsList', attrs: 'data-slot="tabs-list" · data-variant', desc: '同时带 <code>group/tabs-list</code>，供触发器读取档位' },
  { el: 'TabsTrigger', attrs: 'data-slot="tabs-trigger" · role="tab" · data-state="active|inactive" · <b>data-active</b> · data-disabled · data-orientation · aria-selected', desc: 'reka 只给 <code>data-state</code>，<code>data-active</code> 是本库补的 —— 预设（「经典 / 小巧」）按 <code>data-active</code> 写阴影规则' },
  { el: 'TabsContent', attrs: 'data-slot="tabs-content" · role="tabpanel" · data-state · data-orientation · hidden', desc: '<b>面板元素一直在 DOM 里</b>；未选中时带 <code>hidden</code>（<code>display: none</code>），里面渲染的内容则看 <code>unmountOnHide</code>' },
]

const presetRows = [
  { style: '经典', listH: '36px', radius: 'rounded-lg', triggerFont: 'text-sm', note: '激活项白底 + 阴影' },
  { style: '胶囊', listH: '36px', radius: 'rounded-full', triggerFont: 'text-sm', note: '整条胶囊形' },
  { style: '直角', listH: '32px', radius: 'rounded-none', triggerFont: 'text-xs', note: '直角系' },
  { style: '圆润', listH: '36px', radius: 'rounded-4xl', triggerFont: 'text-sm', note: '大圆角' },
  { style: '紧凑', listH: '32px', radius: 'rounded-lg', triggerFont: 'text-xs', note: '紧凑' },
  { style: '小巧', listH: '32px', radius: 'rounded-lg', triggerFont: 'text-sm', note: '激活项阴影随档位变化' },
  { style: '饱满', listH: '32px', radius: 'rounded-2xl', triggerFont: 'text-sm', note: '圆角 16px' },
  { style: '排版', listH: '40px', radius: '（组件默认）', triggerFont: 'text-xs + uppercase', note: '最高、大写字母 + 字距' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Tabs 标签页</h1>
    <p class="mt-3 text-muted-foreground">
      用一排标签切换同级内容，基于 reka-ui 的 <code>TabsRoot</code>。四个部件：
      <code>Tabs</code>（管选中值与方向）、<code>TabsList</code>（标签容器）、
      <code>TabsTrigger</code>（单个标签）、<code>TabsContent</code>（内容面板）。<br />
      选中关系靠 <code>value</code> 配对 —— 触发器和面板写同一个 <code>value</code> 即可，
      不需要手动判等。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>Tabs</code> 上绑 <code>v-model</code>，每个 <code>TabsTrigger</code> 与
          <code>TabsContent</code> 给同一个 <code>value</code>。
          标签容器默认是 <code>w-fit</code>（按内容收窄），要占满整行就传 <code>w-full</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Tabs v-model="tab">
          <TabsList>
            <TabsTrigger value="overview">
              概览
            </TabsTrigger>
            <TabsTrigger value="usage">
              用量
            </TabsTrigger>
            <TabsTrigger value="billing">
              账单
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <p class="text-sm text-muted-foreground">
              这里放「概览」的内容。切换标签时其他面板会被卸载（见下文的面板挂载行为）。
            </p>
          </TabsContent>
          <TabsContent value="usage">
            <p class="text-sm text-muted-foreground">
              这里放「用量」的内容。
            </p>
          </TabsContent>
          <TabsContent value="billing">
            <p class="text-sm text-muted-foreground">
              这里放「账单」的内容。
            </p>
          </TabsContent>
        </Tabs>

        <p class="text-xs text-muted-foreground">
          当前值：<code>{{ tab }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 2. 受控 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控：从外部切换</h2>
        <CardDescription>
          <code>v-model</code> 是双向的 —— 外部按钮改值同样能切换标签，
          而且不会触发「点击」相关的副作用（<code>activationMode</code> 只管键盘与点击）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="controlled = 'a'">
            切到 A
          </Button>
          <Button variant="outline" size="sm" @click="controlled = 'b'">
            切到 B
          </Button>
          <Button variant="outline" size="sm" @click="controlled = 'c'">
            切到 C
          </Button>
          <Badge variant="secondary">{{ controlled }}</Badge>
        </div>
        <Tabs v-model="controlled">
          <TabsList>
            <TabsTrigger value="a">
              A
            </TabsTrigger>
            <TabsTrigger value="b">
              B
            </TabsTrigger>
            <TabsTrigger value="c">
              C
            </TabsTrigger>
          </TabsList>
          <TabsContent value="a">
            <div class="rounded-lg border border-input p-4 text-sm">
              面板 A
            </div>
          </TabsContent>
          <TabsContent value="b">
            <div class="rounded-lg border border-input p-4 text-sm">
              面板 B
            </div>
          </TabsContent>
          <TabsContent value="c">
            <div class="rounded-lg border border-input p-4 text-sm">
              面板 C
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <!-- 3. 禁用 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁用某个标签</h2>
        <CardDescription>
          <code>disabled</code> 的标签点不动、方向键也会跳过它，并带上
          <code>data-disabled</code>（预设据此降低不透明度）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs default-value="one">
          <TabsList>
            <TabsTrigger value="one">
              可用
            </TabsTrigger>
            <TabsTrigger value="two" disabled>
              禁用
            </TabsTrigger>
            <TabsTrigger value="three">
              也可用
            </TabsTrigger>
          </TabsList>
          <TabsContent value="one">
            <p class="text-sm text-muted-foreground">
              试试用方向键在三个标签间走一圈 —— 禁用的那个会被跳过。
            </p>
          </TabsContent>
          <TabsContent value="two">
            <p class="text-sm text-muted-foreground">
              正常情况下看不到这个面板。
            </p>
          </TabsContent>
          <TabsContent value="three">
            <p class="text-sm text-muted-foreground">
              第三个面板。
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <!-- 4. 档位 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">档位：default / line</h2>
        <CardDescription>
          <code>TabsList</code> 的 <code>variant</code> 是<b>本库补的 prop</b>
          （预设按 <code>data-[variant=line]</code> 与
          <code>group-data-[variant=…]/tabs-list</code> 写规则，缺了它这些规则一条都不生效）。<br />
          各风格的 <code>line</code> 差异不大：列表去圆角、激活项去掉阴影，呈现更扁平的观感。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            variant="default"（默认）
          </p>
          <Tabs v-model="lineTab">
            <TabsList>
              <TabsTrigger value="preview">
                预览
              </TabsTrigger>
              <TabsTrigger value="code">
                代码
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <p class="text-sm text-muted-foreground">
                默认档：激活项有阴影、列表有圆角。
              </p>
            </TabsContent>
            <TabsContent value="code">
              <p class="text-sm text-muted-foreground">
                默认档的第二个面板。
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            variant="line"
          </p>
          <Tabs default-value="preview">
            <TabsList variant="line">
              <TabsTrigger value="preview">
                预览
              </TabsTrigger>
              <TabsTrigger value="code">
                代码
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <p class="text-sm text-muted-foreground">
                line 档：列表圆角被去掉、激活项没有阴影。
              </p>
            </TabsContent>
            <TabsContent value="code">
              <p class="text-sm text-muted-foreground">
                line 档的第二个面板。
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 纵向 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">纵向布局</h2>
        <CardDescription>
          <code>orientation="vertical"</code> 会让根节点输出
          <code>data-orientation="vertical"</code>，方向键随之变成上下。
          <b>布局由组件兜底</b>：根节点在纵向时改 <code>flex-row</code>、列表改 <code>flex-col</code>；
          预设里除「经典」外的 7 套还有额外的纵向内边距 / 圆角（也靠这个属性命中）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs v-model="vertical" orientation="vertical" class="gap-6">
          <TabsList>
            <TabsTrigger value="profile">
              个人资料
            </TabsTrigger>
            <TabsTrigger value="security">
              安全
            </TabsTrigger>
            <TabsTrigger value="notify">
              通知
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile" class="text-sm text-muted-foreground">
            个人资料面板：用 <kbd class="rounded border px-1">↑</kbd>
            <kbd class="rounded border px-1">↓</kbd> 切换标签。
          </TabsContent>
          <TabsContent value="security" class="text-sm text-muted-foreground">
            安全面板。
          </TabsContent>
          <TabsContent value="notify" class="text-sm text-muted-foreground">
            通知面板。
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <!-- 6. 图标与计数 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">图标与计数</h2>
        <CardDescription>
          触发器是 <code>inline-flex items-center</code>，直接放图标 / 徽标即可；
          图标默认被约束成 <code>size-4</code>（各风格可能是 <code>size-3.5</code>），
          想改大小就显式写 <code>size-*</code> 类。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs v-model="iconTab">
          <TabsList>
            <TabsTrigger value="inbox">
              收件箱
              <Badge>12</Badge>
            </TabsTrigger>
            <TabsTrigger value="drafts">
              草稿
              <Badge variant="secondary">3</Badge>
            </TabsTrigger>
            <TabsTrigger value="archive">
              归档
            </TabsTrigger>
          </TabsList>
          <TabsContent value="inbox" class="text-sm text-muted-foreground">
            收件箱：12 封未读。<code>Badge</code> 放进触发器后会跟着变小。
          </TabsContent>
          <TabsContent value="drafts" class="text-sm text-muted-foreground">
            草稿：3 封待发。
          </TabsContent>
          <TabsContent value="archive" class="text-sm text-muted-foreground">
            归档。
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <!-- 7. 面板挂载与键盘 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">面板挂载行为与键盘</h2>
        <CardDescription>
          这两个行为容易踩坑，都是 reka 的 prop：
          <code>unmountOnHide</code> 默认 <b>true</b>，<b>面板元素始终在 DOM 里（靠 <code>hidden</code> 隐藏），被卸掉的是面板内部的内容</b> ——
          所以里面的输入框会被销毁、值会丢；<code>activationMode</code> 默认 <b>automatic</b>（方向键 = 直接切换）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-3">
          <p class="text-xs font-medium text-muted-foreground">
            默认：切走就卸载。在下面输入点内容再切走再切回来试试
          </p>
          <Tabs default-value="form">
            <TabsList>
              <TabsTrigger value="form">
                表单
              </TabsTrigger>
              <TabsTrigger value="other">
                其它
              </TabsTrigger>
            </TabsList>
            <TabsContent value="form">
              <div class="max-w-xs space-y-2">
                <Label for="tabs-note">备注（切走会丢）</Label>
                <Input id="tabs-note" placeholder="输入点什么…" />
              </div>
            </TabsContent>
            <TabsContent value="other">
              <p class="text-sm text-muted-foreground">
                切回来时输入框是空的 —— 说明面板被重新创建了。
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-medium text-muted-foreground">
            <code>unmount-on-hide="false"</code>：面板留在 DOM 里，输入内容还在
          </p>
          <Tabs default-value="form" :unmount-on-hide="false">
            <TabsList>
              <TabsTrigger value="form">
                表单
              </TabsTrigger>
              <TabsTrigger value="other">
                其它
              </TabsTrigger>
            </TabsList>
            <TabsContent value="form">
              <div class="max-w-xs space-y-2">
                <Label for="tabs-note2">备注（切走保留）</Label>
                <Input id="tabs-note2" placeholder="输入点什么…" />
              </div>
            </TabsContent>
            <TabsContent value="other">
              <p class="text-sm text-muted-foreground">
                切回来内容还在。
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-medium text-muted-foreground">
            <code>activation-mode="manual"</code>：方向键只移动焦点，按 Enter / Space 才切换
          </p>
          <Tabs v-model="manualTab" activation-mode="manual">
            <TabsList>
              <TabsTrigger value="one">
                一
              </TabsTrigger>
              <TabsTrigger value="two">
                二
              </TabsTrigger>
              <TabsTrigger value="three">
                三
              </TabsTrigger>
            </TabsList>
            <TabsContent value="one" class="text-sm text-muted-foreground">
              面板一
            </TabsContent>
            <TabsContent value="two" class="text-sm text-muted-foreground">
              面板二
            </TabsContent>
            <TabsContent value="three" class="text-sm text-muted-foreground">
              面板三
            </TabsContent>
          </Tabs>
          <p class="text-xs text-muted-foreground">
            当前值：<code>{{ manualTab }}</code>
          </p>
        </div>

        <div class="space-y-3">
          <p class="text-xs font-medium text-muted-foreground">
            <code>force-mount</code>：面板常驻，但 <b>reka 这时不再自动隐藏它</b>，要自己按选中状态隐
          </p>
          <Tabs v-model="keptTab">
            <TabsList>
              <TabsTrigger value="x">
                X
              </TabsTrigger>
              <TabsTrigger value="y">
                Y
              </TabsTrigger>
            </TabsList>
            <TabsContent value="x" class="text-sm text-muted-foreground">
              面板 X
            </TabsContent>
            <TabsContent
              value="y"
              force-mount
              :class="keptTab === 'y' ? '' : 'hidden'"
              class="text-sm text-muted-foreground"
            >
              面板 Y（常驻 DOM，靠自己的 <code>hidden</code> 类隐藏）
            </TabsContent>
          </Tabs>
          <p class="text-xs text-muted-foreground">
            当前值：<code>{{ keptTab }}</code> —— 面板 Y 的元素始终在 DOM 里，
            与「用 <code>unmount-on-hide="false"</code> 保状态」相比，它多给了你一层“何时真正隐藏”的控制权。
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 8. 组合场景 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">组合场景：设置面板</h2>
        <CardDescription>
          标签页最常见的用法 —— 把一组设置按主题分页，每页里再放表单控件。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs default-value="general" :unmount-on-hide="false">
          <TabsList>
            <TabsTrigger value="general">
              常规
            </TabsTrigger>
            <TabsTrigger value="notify">
              通知
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <div class="space-y-3">
              <div class="flex items-center justify-between gap-4 rounded-lg border border-input p-3">
                <div class="space-y-1">
                  <p class="text-sm font-medium">
                    自动更新
                  </p>
                  <p class="text-xs text-muted-foreground">
                    在后台下载新版本，重启后生效
                  </p>
                </div>
                <Switch />
              </div>
              <div class="flex items-center justify-between gap-4 rounded-lg border border-input p-3">
                <div class="space-y-1">
                  <p class="text-sm font-medium">
                    启动时恢复上次会话
                  </p>
                  <p class="text-xs text-muted-foreground">
                    打开最近使用的项目
                  </p>
                </div>
                <Switch :default-value="true" />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="notify">
            <div class="flex items-center justify-between gap-4 rounded-lg border border-input p-3">
              <div class="space-y-1">
                <p class="text-sm font-medium">
                  桌面通知
                </p>
                <p class="text-xs text-muted-foreground">
                  有新消息时弹出提醒
                </p>
              </div>
              <Switch :default-value="true" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <!-- 9. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>四个部件的完整属性表。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  部件
                </th>
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
              <tr v-for="r in apiRows" :key="r.name + r.prop" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ r.name }}</code>
                </td>
                <td class="py-2 pr-4 align-top">
                  <code>{{ r.prop }}</code>
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
        <h2 class="text-xl font-semibold">渲染出的属性与样式钩子</h2>
        <CardDescription>
          预设按 <code>data-slot</code> 定位（写法统一是
          <code>:is(.cn-xxx, [data-slot="xxx"])</code>），共 4 个钩子：
          <code>tabs</code> / <code>tabs-list</code> / <code>tabs-trigger</code> / <code>tabs-content</code>。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  元素
                </th>
                <th class="py-2 pr-4 font-medium">
                  属性
                </th>
                <th class="py-2 font-medium">
                  说明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in dataAttrRows" :key="r.el" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top whitespace-nowrap">
                  {{ r.el }}
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  <code>{{ r.attrs }}</code>
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
        <h2 class="text-xl font-semibold">各风格的标签栏尺寸</h2>
        <CardDescription>
          列表高度由预设的 <code>group-data-horizontal/tabs:h-*</code> 决定，
          触发器的圆角与字号也随风格变化。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  设计系统
                </th>
                <th class="py-2 pr-4 font-medium">
                  横向列表高度
                </th>
                <th class="py-2 pr-4 font-medium">
                  列表圆角
                </th>
                <th class="py-2 pr-4 font-medium">
                  触发器字号
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
                <td class="py-2 pr-4 align-top">
                  <code>{{ r.listH }}</code>
                </td>
                <td class="py-2 pr-4 align-top">
                  <code>{{ r.radius }}</code>
                </td>
                <td class="py-2 pr-4 align-top">
                  <code>{{ r.triggerFont }}</code>
                </td>
                <td class="py-2 align-top text-muted-foreground">
                  {{ r.note }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
