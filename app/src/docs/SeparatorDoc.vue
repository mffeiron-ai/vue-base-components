<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

const propRows = [
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    def: "'horizontal'",
    desc: '方向。<b>横向</b>是 1px 高、自动撑满可用宽度；<b>纵向</b>是 1px 宽、高度取 <code>h-full</code> —— 所以纵向时必须给父容器一个确定高度，否则它会缩成 0。',
  },
  {
    name: 'decorative',
    type: 'boolean',
    def: 'true',
    desc: '默认是<b>装饰性</b>的：渲染 <code>role="none"</code>，对屏幕阅读器完全隐形（纯视觉分割线都该用这个）。传 <code>false</code> 才变成<b>语义分隔</b>：渲染 <code>role="separator"</code>；<b>纵向时</b>额外带 <code>aria-orientation="vertical"</code>（横向不写，<code>horizontal</code> 本来就是 ARIA 的默认值）。',
  },
  {
    name: 'class',
    type: 'string',
    def: '—',
    desc: '常用 <code>flex-1</code>（放进 flex 行里自适应占位）、换颜色 <code>bg-primary/30</code>。',
  },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Separator 分隔线</h1>
    <p class="mt-3 text-muted-foreground">
      一条 1px 的分割线，横向或纵向。<code>orientation</code> 决定方向，
      <code>decorative</code> 决定它对屏幕阅读器是「隐形」还是「真的在分隔两块区域」。<br />
      底层是 reka 的 <code>Separator</code>，只渲染一个元素，没有任何多余包装。
    </p>

    <!-- 1. 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          横向是默认方向：<code>h-px</code> + <code>w-full</code>，宽度由父容器决定。<br />
          颜色取设计系统的 <code>--border</code>，8 套风格下会自动跟着变。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="max-w-md space-y-4">
          <div>
            <p class="text-sm font-medium">
              账户设置
            </p>
            <p class="text-sm text-muted-foreground">
              管理登录方式与安全选项。
            </p>
          </div>
          <Separator />
          <div>
            <p class="text-sm font-medium">
              通知偏好
            </p>
            <p class="text-sm text-muted-foreground">
              选择接收哪些邮件提醒。
            </p>
          </div>
          <Separator />
          <div>
            <p class="text-sm font-medium">
              数据导出
            </p>
            <p class="text-sm text-muted-foreground">
              下载账号下的全部数据。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 2. 纵向 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">纵向分隔</h2>
        <CardDescription>
          <code>orientation="vertical"</code>，常见于工具栏、面包屑、统计卡片之间。<br />
          <b>纵向时高度写的是 <code>h-full</code></b>（100%），所以<b>父容器必须有确定高度</b>：
          面包屑那种一行布局靠 <code>h-4</code> 撑住；如果父级高度是内容自己撑出来的（比如下面的统计条），
          就得显式给一个高度（这里是 <code>h-16</code>）—— 否则 <code>height: 100%</code> 解不出值，
          线会直接缩成 0（实测 <code>h: 0</code>，看不见但 DOM 里存在）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- 行内：面包屑 -->
        <nav class="flex h-4 items-center gap-3 text-sm">
          <span class="text-muted-foreground hover:text-foreground">首页</span>
          <Separator orientation="vertical" />
          <span class="text-muted-foreground hover:text-foreground">UI 组件</span>
          <Separator orientation="vertical" />
          <span class="font-medium">Separator</span>
        </nav>

        <!-- 统计条：父级给 h-16，纵向线才取得到 h-full -->
        <div class="flex h-16 items-center gap-6">
          <div class="flex-1">
            <p class="text-2xl font-semibold">
              1,204
            </p>
            <p class="text-xs text-muted-foreground">
              本周请求
            </p>
          </div>
          <Separator orientation="vertical" />
          <div class="flex-1">
            <p class="text-2xl font-semibold">
              98.7%
            </p>
            <p class="text-xs text-muted-foreground">
              成功率
            </p>
          </div>
          <Separator orientation="vertical" />
          <div class="flex-1">
            <p class="text-2xl font-semibold">
              1.2s
            </p>
            <p class="text-xs text-muted-foreground">
              平均耗时
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 带文字 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">中间带文字</h2>
        <CardDescription>
          把两条线放进同一个 flex 行，各给 <code>flex-1</code> 让它自适应占位，中间夹一段文字即可
          —— 分隔线本身没有「中间插槽」，靠布局拼出来更灵活。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="max-w-md space-y-5">
          <div class="flex items-center gap-3">
            <Separator class="flex-1" />
            <span class="text-xs text-muted-foreground">或</span>
            <Separator class="flex-1" />
          </div>

          <div class="flex items-center gap-3">
            <Separator class="flex-1 bg-primary/30" />
            <Badge variant="secondary">
              NEW
            </Badge>
            <Separator class="flex-1 bg-primary/30" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 粗细与颜色 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">改颜色与粗细</h2>
        <CardDescription>
          颜色直接覆盖就行（<code>bg-*</code>）；<b>改粗细必须带 <code>!</code></b> ——
          组件横向的 <code>h-px</code> 挂在 <code>data-[orientation=horizontal]:</code> 变体上，
          特异性比普通工具类高一层，不加 <code>!</code> 会被它压掉。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="max-w-md space-y-4">
          <div>
            <p class="mb-2 text-xs text-muted-foreground">
              默认（1px，--border）
            </p>
            <Separator />
          </div>
          <div>
            <p class="mb-2 text-xs text-muted-foreground">
              <code>bg-primary/40</code>
            </p>
            <Separator class="bg-primary/40" />
          </div>
          <div>
            <p class="mb-2 text-xs text-muted-foreground">
              <code>h-0.5!</code> + <code>bg-foreground/20</code>（2px）
            </p>
            <Separator class="h-0.5! bg-foreground/20" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 语义 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">装饰性 vs 语义分隔</h2>
        <CardDescription>
          默认 <code>decorative</code> 为 <code>true</code>，渲染的是 <code>role="none"</code> ——
          屏幕阅读器完全忽略它，这对纯视觉的分割线是正确做法。<br />
          只有当你确实在划分内容区域（比如「基本信息 / 联系方式」两个 fieldset）时，才传
          <code>:decorative="false"</code>，此时换成 <code>role="separator"</code>；
          纵向还会补上 <code>aria-orientation="vertical"</code>（横向不写 ——
          <code>horizontal</code> 是 ARIA 的默认值，本来就不用声明）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="max-w-md space-y-4">
          <div>
            <p class="mb-2 text-xs text-muted-foreground">
              decorative（默认）
            </p>
            <Separator />
          </div>
          <div>
            <p class="mb-2 text-xs text-muted-foreground">
              :decorative="false"（横向）
            </p>
            <Separator :decorative="false" />
          </div>

          <div>
            <p class="mb-2 text-xs text-muted-foreground">
              :decorative="false"（纵向）—— 多一个 aria-orientation
            </p>
            <div class="flex h-10 items-center gap-3 text-sm">
              <span class="text-muted-foreground">左侧</span>
              <Separator orientation="vertical" :decorative="false" />
              <span class="text-muted-foreground">右侧</span>
            </div>
          </div>
        </div>
        <p class="mt-4 text-xs text-muted-foreground">
          视觉上一模一样，差别只在 DOM 上的 <code>role</code> / <code>aria-orientation</code>
          —— 用浏览器元素面板对比一下最直观。
        </p>
      </CardContent>
    </Card>

    <!-- 6. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          组件只有一个根元素，带 <code>data-slot="separator"</code> 与
          <code>data-orientation</code> 标记（预设的钩子就靠它）。
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
              <tr v-for="row in propRows" :key="row.name" class="border-b last:border-0">
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
  </div>
</template>
