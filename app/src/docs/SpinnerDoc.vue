<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

/* ── 按钮加载态演示 ── */
const submitting = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
function submit() {
  submitting.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    submitting.value = false
  }, 1600)
}
onBeforeUnmount(() => clearTimeout(timer))

/* ── API 表 ── */
const propRows = [
  { name: 'class', type: 'string', def: '—', desc: '唯一的 prop。默认是 <code>size-4 animate-spin</code>，改尺寸直接传 <code>size-6</code> 之类即可（tailwind-merge 会替换掉同组的 <code>size-4</code>，不用加 <code>!</code>）' },
  { name: 'aria-label（透传）', type: 'string', def: "'Loading'", desc: '组件里写死了 <code>role="status"</code> + <code>aria-label="Loading"</code>；想换成本地化文案直接传 <code>aria-label</code> 覆盖（其余 attrs 也都会落到根 <code>&lt;svg&gt;</code> 上）' },
]

const partRows = [
  { name: 'role="status"', desc: '告诉辅助技术「这是一块会变化的区域」，配合 <code>aria-label</code> 播报成「Loading」；同一页有多个 spinner 时最好各自给不同的 <code>aria-label</code>（如「保存中」「上传中」）' },
  { name: 'data-slot="spinner"', desc: '标记位。8 套预设的 Attachment 有这个钩子（纵向附件里把它放大到 <code>size-6</code>），另外自己写样式时也可以用它定位' },
  { name: 'animate-spin', desc: 'Tailwind 的 1s 匀速旋转（<code>linear infinite</code>）。关掉写 <code>animate-none</code>，不需要 <code>!</code>' },
  { name: 'SVG 默认尺寸', desc: 'lucide 图标本身是 24×24，靠 <code>size-4</code> 压缩显示。外层的 <code>[&amp;_svg:not([class*=\'size-\'])]</code> 那类兜底规则不会命中它 —— 因为我们的类名里本来就带 <code>size-</code>' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Spinner 加载指示器</h1>
    <p class="mt-3 text-muted-foreground">
      一个旋转的圈，只有两件事：<code>animate-spin</code> 转起来、<code>role="status"</code> 让屏幕阅读器知道有东西在加载。<br />
      它内部就是一个 lucide 的 <code>Loader2</code> 图标，没有额外包装 —— 所以尺寸、颜色、间距全都靠 <code>class</code> 调。
    </p>

    <!-- 1. 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          默认 <code>size-4</code>（16px）。改尺寸直接传 <code>class</code> —— 与默认的 <code>size-4</code> 同组，
          tailwind-merge 会自动替换，<b>不需要 <code>!</code></b>。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-end gap-8">
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              默认 size-4
            </p>
            <Spinner />
          </div>
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              size-5
            </p>
            <Spinner class="size-5" />
          </div>
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              size-6
            </p>
            <Spinner class="size-6" />
          </div>
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              size-8
            </p>
            <Spinner class="size-8" />
          </div>
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              size-10
            </p>
            <Spinner class="size-10" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 2. 配文字 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">配文字</h2>
        <CardDescription>
          最省的用法是 flex 一行：<code>flex items-center gap-2</code>。
          居中放的话建议同时给一句说明文字 —— 只有圈没有字时，用户不知道在等什么。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            行内
          </p>
          <div class="flex items-center gap-2">
            <Spinner />
            <span class="text-sm text-muted-foreground">正在加载数据…</span>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            块级居中
          </p>
          <div class="flex flex-col items-center justify-center gap-3 rounded-lg border border-input py-10">
            <Spinner class="size-8 text-primary" aria-label="正在同步记录" />
            <p class="text-sm text-muted-foreground">
              正在同步 1,204 条记录…
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 3. 按钮里 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">按钮里的加载态</h2>
        <CardDescription>
          最常见的用法：提交时把按钮禁用、文案换成进行中、左边插一个 spinner。<br />
          <b>禁用是必须的</b> —— 否则用户能连点好几次（spinner 只负责「看起来在忙」，不阻止重复提交）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <Button :disabled="submitting" @click="submit">
            <Spinner v-if="submitting" />
            {{ submitting ? '提交中…' : '提交表单' }}
          </Button>

          <Button variant="outline" :disabled="submitting" @click="submit">
            <Spinner v-if="submitting" class="size-3.5" />
            {{ submitting ? '保存中…' : '保存' }}
          </Button>

          <Button variant="secondary" size="sm" :disabled="submitting" @click="submit">
            {{ submitting ? '处理中…' : '处理' }}
            <Spinner v-if="submitting" class="size-3.5" />
          </Button>

          <Badge v-if="submitting" variant="secondary">
            请求进行中
          </Badge>
        </div>
        <p class="text-xs text-muted-foreground">
          点一下看效果：三个按钮共用同一个 <code>submitting</code> 状态，1.6 秒后恢复。
          <code>Button</code> 的 <code>[&amp;_svg]</code> 规则不会把 spinner 压成别的尺寸 —— 距离按钮内边距也是靠 Button 自己的 <code>gap</code> 控制。
        </p>
      </CardContent>
    </Card>

    <!-- 4. 整块遮罩 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">整块加载（遮罩）</h2>
        <CardDescription>
          已经渲染出来的内容要「暂时不可用」时，用一层半透明遮罩盖住、中间放 spinner：
          外层 <code>relative</code>，遮罩 <code>absolute inset-0</code> + <code>flex items-center justify-center</code>。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="relative overflow-hidden rounded-lg border border-input p-4">
          <div class="space-y-2">
            <p class="text-sm font-medium">
              季度报告
            </p>
            <p class="text-sm text-muted-foreground">
              下面这些内容在「刷新」时会先被遮罩盖住，避免用户点到还没更新的旧数据。
            </p>
            <div class="grid gap-2 pt-2 sm:grid-cols-3">
              <div v-for="k in ['收入', '成本', '利润']" :key="k" class="rounded-md border border-input p-3">
                <p class="text-xs text-muted-foreground">{{ k }}</p>
                <p class="text-lg font-semibold tabular-nums">—</p>
              </div>
            </div>
          </div>

          <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-xs">
            <Spinner class="size-6" />
            <p class="text-xs text-muted-foreground">
              刷新中…
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 颜色 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">颜色</h2>
        <CardDescription>
          图标用 <code>currentColor</code> 描边，所以<b>文字色就是它的颜色</b> ——
          传 <code>text-*</code> 即可；放进按钮里不传任何颜色时，它会自动跟按钮的文字色（含 hover / disabled 状态）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="flex flex-wrap items-center gap-8">
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              默认（currentColor）
            </p>
            <Spinner class="size-6" />
          </div>
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              text-primary
            </p>
            <Spinner class="size-6 text-primary" />
          </div>
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              text-muted-foreground
            </p>
            <Spinner class="size-6 text-muted-foreground" />
          </div>
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              text-emerald-500
            </p>
            <Spinner class="size-6 text-emerald-500" />
          </div>
        </div>
        <p class="text-xs text-muted-foreground">
          想关动画传 <code>animate-none</code> 就行 —— <b>不需要 <code>!</code></b>（它和组件自带的 <code>animate-spin</code> 同组，后写者胜）。
          不过正常页面里不该关，所以这里不放静止的圈了。
        </p>
      </CardContent>
    </Card>

    <!-- 6. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>只有一个 prop，其它都是无障碍与动画细节。</CardDescription>
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

        <div>
          <p class="mb-2 text-sm font-medium">
            无障碍与动画
          </p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b text-left">
                  <th class="py-2 pr-4 font-medium">
                  项
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
        </div>
      </CardContent>
    </Card>
  </div>
</template>
