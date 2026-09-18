<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/* ── 1. 基础表格 ── */
const invoices = [
  { id: 'INV-001', status: '已支付', method: '信用卡', amount: 316 },
  { id: 'INV-002', status: '待处理', method: '微信支付', amount: 242 },
  { id: 'INV-003', status: '已支付', method: '对公转账', amount: 837 },
  { id: 'INV-004', status: '已取消', method: '信用卡', amount: 99 },
]
const invoicesTotal = computed(() => invoices.reduce((s, i) => s + i.amount, 0))

/* ── 2. 行状态 ── */
const selectedIds = ref<string[]>(['INV-002'])
function toggleRow(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter(x => x !== id)
    : [...selectedIds.value, id]
}

/* ── 3. 复选框列 ── */
const people = [
  { id: 'T-1001', name: '林舟', email: 'linzhou@example.com' },
  { id: 'T-1002', name: '陈见山', email: 'chenjs@example.com' },
  { id: 'T-1003', name: '苏晓', email: 'suxiao@example.com' },
]
const picked = ref<string[]>(['T-1002'])
const allPicked = computed(() => picked.value.length === people.length)
function toggleAll(v: boolean | 'indeterminate') {
  picked.value = v === true ? people.map(p => p.id) : []
}
function toggleOne(id: string, v: boolean | 'indeterminate') {
  picked.value = v === true ? [...picked.value, id] : picked.value.filter(x => x !== id)
}

/* ── 4. 空状态 ── */
const keyword = ref('')
const searchRows = [
  { name: '林舟', role: '前端工程师', team: '增长' },
  { name: '陈见山', role: '后端工程师', team: '交易' },
  { name: '苏晓', role: '设计师', team: '增长' },
]
const filtered = computed(() =>
  searchRows.filter(r => !keyword.value || r.name.includes(keyword.value) || r.role.includes(keyword.value)),
)

/* ── 5. 固定高度 ── */
const logs = Array.from({ length: 14 }, (_, i) => ({
  time: `09:${String(i + 1).padStart(2, '0')}:12`,
  level: i % 4 === 0 ? 'WARN' : 'INFO',
  message: `同步任务 #${1200 + i} 已完成，写入 ${(i + 1) * 37} 条记录`,
}))

/* ── 6. 长文本 ── */
const longText = '这是一段用来测试换行行为的很长文本。它本身没有业务含义，只是要足够长 —— 长到如果单元格不换行，整张表格就会被撑出横向滚动条，而不是把文字折成好几行显示出来。所以看到横向滚动条就说明当前是预设的 nowrap 行为；看到文字折成两行、滚动条消失，就是覆盖后的换行行为。'
const longRows = [
  { name: '商品描述', long: longText },
  { name: '售后说明', long: longText },
]

/* ── API 表 ── */
const partRows = [
  { name: 'Table', tag: 'div + table', slot: 'table-container / table', desc: '外层 div 是<b>滚动容器</b>（滚动发生在它身上，所以表头 sticky 要相对它生效），内层是 <code>&lt;table&gt;</code>' },
  { name: 'TableCaption', tag: 'caption', slot: 'table-caption', desc: '表格说明 / 数据来源。语义上属于表格标题，但默认 <code>caption-bottom</code> 渲染在底部' },
  { name: 'TableHeader', tag: 'thead', slot: 'table-header', desc: '表头；内部所有 <code>tr</code> 都带下边框（<code>[&_tr]:border-b</code>）' },
  { name: 'TableBody', tag: 'tbody', slot: 'table-body', desc: '表体；去掉最后一行的下边框，避免与容器边框叠成双线' },
  { name: 'TableFooter', tag: 'tfoot', slot: 'table-footer', desc: '页脚（合计行）：浅底 + 上边框 + 加粗' },
  { name: 'TableRow', tag: 'tr', slot: 'table-row', desc: '表格行：hover 浅底 + 下边框；<b>选中态靠 <code>data-state="selected"</code></b>，要自己接' },
  { name: 'TableHead', tag: 'th', slot: 'table-head', desc: '表头单元格：默认 40px 高、左对齐、medium、不换行' },
  { name: 'TableCell', tag: 'td', slot: 'table-cell', desc: '普通单元格：垂直居中；长文本默认<b>不换行</b>（见下节）' },
  { name: 'TableEmpty', tag: 'tr + td', slot: '—（没有自己的钩子）', desc: '空状态整行：内部直接渲染 <code>TableRow</code> + <code>TableCell</code>，<b>不要再套外层行</b>' },
]

const propRows = [
  { name: 'Table', prop: 'maxHeight', type: 'string', def: '—', desc: '容器最大高度（如 <code>"16rem"</code>）。<b>这一层才是滚动容器</b>，所以它是让表头能 sticky 的前提' },
  { name: 'TableEmpty', prop: 'colspan', type: 'number', def: '1', desc: '<b>必须传成表格列数</b>，否则空白只占第一列、右侧留白断裂' },
  { name: '其余 7 个', prop: '—', type: '—', desc: '只有 <code>class</code>；其余属性 / 事件 / 插槽全部透传到对应的原生标签上' },
]

const hookRows = [
  { slot: 'table-container', note: '根 div：<code>relative w-full overflow-x-auto</code>（各风格一致）' },
  { slot: 'table', note: '<code>w-full caption-bottom text-sm</code>（各风格一致）' },
  { slot: 'table-header / table-body / table-footer', note: '边框与页脚底色；页脚 <code>bg-muted/50 border-t border-input font-medium</code>（页脚的边框色同样由组件层补）' },
  { slot: 'table-row', note: '<code>hover:bg-muted/50 data-[state=selected]:bg-muted border-b</code>（各风格一致）。<b>预设只给了边框宽度、没给颜色</b> → 颜色由组件层补的 <code>border-input</code> 兜底（实测 <code>rgb(229,231,235)</code>）；不补的话 Tailwind v4 的默认边框色是 <code>currentColor</code>，行线会变成文字色（#333 近黑）' },
  { slot: 'table-head / table-cell', note: '<b>各风格差别最大</b>：vega 是 <code>h-10 px-2</code>，sera 是 <code>h-12 px-3 text-xs uppercase tracking-wider</code>；两者都给单元格加了 <code>whitespace-nowrap</code>' },
  { slot: 'table-caption', note: '<code>text-muted-foreground mt-4 text-sm</code>（各风格一致）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Table 表格</h1>
    <p class="mt-3 text-muted-foreground">
      表格标签族的样式包装（9 个部件），<b>不依赖任何 headless 库</b> —— 每个部件就是对应的原生标签
      （<code>table</code> / <code>thead</code> / <code>tr</code> / <code>th</code> / <code>td</code> …）
      加上一组 Tailwind 类与 <code>data-slot</code> 钩子。<br />
      排序、筛选、分页、行选择这些<b>实践</b>不在这一层，见
      <RouterLink class="text-primary underline underline-offset-4" to="/components/data-table">
        Data Table 数据表格
      </RouterLink>。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>Table &gt; TableHeader &gt; TableRow &gt; TableHead</code> 是表头，
          <code>TableBody &gt; TableRow &gt; TableCell</code> 是表体，
          <code>TableCaption</code> 放在末尾当说明（渲染在表格下方）。<br />
          金额列做了右对齐 —— <code>TableCell</code> 上写 <code>text-right</code> 即可，
          但 <b><code>TableHead</code> 必须写 <code>text-right!</code></b>：预设给表头写了 <code>text-left</code>，属于无层规则，
          会盖掉不加 <code>!</code> 的工具类（不改的话表头会左对齐、和数字对不上）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>2026 年 9 月的发票记录，共 {{ invoices.length }} 笔。</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>发票号</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>支付方式</TableHead>
              <TableHead class="text-right!">
                金额
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in invoices" :key="row.id">
              <TableCell class="font-medium">
                {{ row.id }}
              </TableCell>
              <TableCell>{{ row.status }}</TableCell>
              <TableCell>{{ row.method }}</TableCell>
              <TableCell class="text-right tabular-nums">
                ¥{{ row.amount.toFixed(2) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- 2. 页脚合计 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">页脚合计行</h2>
        <CardDescription>
          <code>TableFooter</code> 渲染成 <code>&lt;tfoot&gt;</code>：自带浅底 + 上边框 + 加粗，
          适合放合计 / 汇总。它在 <b>DOM 里写在表体之后</b>，浏览器渲染时依然会出现在表格底部。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>项目</TableHead>
              <TableHead class="text-right!">
                数量
              </TableHead>
              <TableHead class="text-right!">
                单价
              </TableHead>
              <TableHead class="text-right!">
                小计
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>企业版席位</TableCell>
              <TableCell class="text-right tabular-nums">
                12
              </TableCell>
              <TableCell class="text-right tabular-nums">
                ¥199.00
              </TableCell>
              <TableCell class="text-right tabular-nums">
                ¥2,388.00
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>培训服务</TableCell>
              <TableCell class="text-right tabular-nums">
                2
              </TableCell>
              <TableCell class="text-right tabular-nums">
                ¥1,200.00
              </TableCell>
              <TableCell class="text-right tabular-nums">
                ¥2,400.00
              </TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>合计</TableCell>
              <TableCell class="text-right tabular-nums">
                —
              </TableCell>
              <TableCell class="text-right tabular-nums">
                —
              </TableCell>
              <TableCell class="text-right tabular-nums">
                ¥4,788.00
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>

    <!-- 3. 行状态 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">行状态：hover 与选中</h2>
        <CardDescription>
          行有 hover 浅底。但<b>选中态组件不会自己判断</b> —— 它认的是 <code>data-state="selected"</code>，
          所以要由你把选中集合映射成这个属性：<code>:data-state="selected ? 'selected' : undefined"</code>。<br />
          注意写成 <code>:data-state="selected"</code> 会渲染出 <code>"false"</code> 字符串，
          而 CSS 的 <code>[data-state=selected]</code> 不会匹配，<b>未选中行也会被上底色</b>，所以要用三元返回 <code>undefined</code>。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Table>
          <TableBody>
            <TableRow
              v-for="row in invoices"
              :key="row.id"
              class="cursor-pointer"
              :data-state="selectedIds.includes(row.id) ? 'selected' : undefined"
              @click="toggleRow(row.id)"
            >
              <TableCell class="font-medium">
                {{ row.id }}
              </TableCell>
              <TableCell>{{ row.method }}</TableCell>
              <TableCell class="text-right tabular-nums">
                ¥{{ row.amount.toFixed(2) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <p class="text-xs text-muted-foreground">
          已选中：<code>{{ selectedIds.join(', ') || '（无）' }}</code> —— 点行切换。
        </p>
      </CardContent>
    </Card>

    <!-- 4. 复选框列 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">复选框列</h2>
        <CardDescription>
          <code>TableHead</code> / <code>TableCell</code> 内置了两条对齐规则，专门为「格子里只有复选框」这种情况：
          <code>[&:has([role=checkbox])]:pr-0</code>（收紧右侧内边距，让复选框贴边）
          与 <code>[&>[role=checkbox]]:translate-y-[2px]</code>（微调 2px 让复选框与文字视觉居中）。<br />
          本库的 <code>Checkbox</code> 自带 <code>role="checkbox"</code>，所以直接放进去就能吃到这两条，不用手写对齐。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-10">
                <Checkbox
                  :model-value="allPicked ? true : (picked.length ? 'indeterminate' : false)"
                  aria-label="全选"
                  @update:model-value="toggleAll"
                />
              </TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>邮箱</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="p in people"
              :key="p.id"
              :data-state="picked.includes(p.id) ? 'selected' : undefined"
            >
              <TableCell>
                <Checkbox
                  :model-value="picked.includes(p.id)"
                  :aria-label="`选择 ${p.name}`"
                  @update:model-value="v => toggleOne(p.id, v)"
                />
              </TableCell>
              <TableCell class="font-medium">
                {{ p.name }}
              </TableCell>
              <TableCell class="text-muted-foreground">
                {{ p.email }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div class="flex items-center gap-3">
          <Badge variant="secondary">已选 {{ picked.length }} / {{ people.length }}</Badge>
          <Button variant="outline" size="sm" :disabled="!picked.length" @click="picked = []">
            清空选择
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 空状态 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">空状态</h2>
        <CardDescription>
          <code>TableEmpty</code> 就是「一行一列」的占位：内部已经渲染了
          <code>TableRow</code> + <code>TableCell</code>，<b>外面不要再套行</b>。<br />
          它的 <code>colspan</code> <b>必须传成表格列数</b>（默认 1），否则只有第一列是空白的，
          下面两张表可以对比看差别。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <Input v-model="keyword" placeholder="搜索姓名或职位（试试输入“赵”）" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>职位</TableHead>
                <TableHead>团队</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="r in filtered" :key="r.name">
                <TableCell class="font-medium">
                  {{ r.name }}
                </TableCell>
                <TableCell>{{ r.role }}</TableCell>
                <TableCell>{{ r.team }}</TableCell>
              </TableRow>
              <TableEmpty v-if="!filtered.length" :colspan="3">
                <span class="text-muted-foreground">没有匹配「{{ keyword }}」的成员</span>
              </TableEmpty>
            </TableBody>
          </Table>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            对比：<code>colspan</code> 保持默认 1（三列表格）—— 空白只占第一列，右侧两列还是白的
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>列 A</TableHead>
                <TableHead>列 B</TableHead>
                <TableHead>列 C</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableEmpty>colspan 没传，所以只有第一列被占</TableEmpty>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 6. 固定高度 + 粘性表头 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">固定高度滚动 + 粘性表头</h2>
        <CardDescription>
          给 <code>Table</code> 传 <code>max-height</code>，内容超出时<b>只在这个容器里滚动</b>。
          因为滚动容器是外面那层 div，所以想让表头钉住，只要给
          <code>TableHeader</code> 加 <code>sticky top-0 z-10 bg-background</code> 即可
          （<code>bg-background</code> 不能省，否则下面的行会从表头底下透出来）。<br />
          滚动容器那一层预设是 <code>overflow-x-auto</code>；按 CSS 规则，一轴非 visible 时另一轴的 visible 会计算成
          <code>auto</code>，所以纵向照样能滚。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table max-height="16rem">
          <TableHeader class="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead class="w-24">
                时间
              </TableHead>
              <TableHead class="w-20">
                级别
              </TableHead>
              <TableHead>消息</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="l in logs" :key="l.time">
              <TableCell class="text-muted-foreground tabular-nums">
                {{ l.time }}
              </TableCell>
              <TableCell>
                <span :class="l.level === 'WARN' ? 'text-amber-500' : 'text-muted-foreground'">
                  {{ l.level }}
                </span>
              </TableCell>
              <TableCell>{{ l.message }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <p class="mt-2 text-xs text-muted-foreground">
          共 {{ logs.length }} 条，容器高 16rem —— 往下滚，表头应保持不动。
        </p>
      </CardContent>
    </Card>

    <!-- 7. 长文本与列宽 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">长文本与列宽</h2>
        <CardDescription>
          <b>这是个容易踩的点</b>：本库 <code>TableCell</code> 源码里写的是
          <code>whitespace-normal break-words</code>（本意是长文本换行、不撑爆表格），
          但 <b>8 套预设都给了 <code>whitespace-nowrap</code></b> —— 预设是无层规则，
          会盖掉组件自带的类，所以<b>实际表现是「不换行」</b>：长文本会把表格撑宽并出现横向滚动条。<br />
          想要换行就自己覆盖，并且<b>必须带 <code>!</code></b>：<code>whitespace-normal!</code>。
          列宽用 <code>w-*</code> 也同理（预设没定义宽度，所以不用 <code>!</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            默认（预设的 nowrap）：两段长文本都挤在一行，表格被撑宽 → 出现横向滚动条
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-32">
                  字段
                </TableHead>
                <TableHead>值</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="r in longRows" :key="r.name">
                <TableCell class="font-medium">
                  {{ r.name }}
                </TableCell>
                <TableCell>{{ r.long }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            加上 <code>whitespace-normal!</code>：文字在单元格里折行，不再横向溢出
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-32">
                  字段
                </TableHead>
                <TableHead>值</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="r in longRows" :key="r.name">
                <TableCell class="font-medium">
                  {{ r.name }}
                </TableCell>
                <TableCell class="whitespace-normal!">
                  {{ r.long }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div class="rounded-lg border border-input p-3 text-xs text-muted-foreground">
          <p class="mb-1 font-medium text-foreground">
            覆盖样式的通用规则
          </p>
          <p>
            预设里的表格规则都是无层（unlayered）的，<b>优先级高于所有 Tailwind 工具类</b>。
            所以凡是预设已经写过的属性（内边距、高度、字号、对齐、nowrap、边框、底色），
            你要改都得加 <code>!</code>（如 <code>px-4!</code>、<code>text-right!</code>、<code>h-8!</code>）；
            预设没写过的属性（列宽 <code>w-*</code>、文字颜色 <code>text-*</code>、<code>tabular-nums</code>）直接写就生效。
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 8. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / 九个部件</h2>
        <CardDescription>
          全部是原生标签的样式包装。除下表的两个 prop 外都只有 <code>class</code>，
          其余属性 / 事件 / 插槽一律透传到对应标签。
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
                <th class="py-2 pr-4 font-medium">
                  渲染成
                </th>
                <th class="py-2 pr-4 font-medium">
                  data-slot
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
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  <code>{{ r.tag }}</code>
                </td>
                <td class="py-2 pr-4 align-top text-muted-foreground">
                  <code>{{ r.slot }}</code>
                </td>
                <td class="py-2 align-top" v-html="r.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  组件
                </th>
                <th class="py-2 pr-4 font-medium">
                  prop
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
        <h2 class="text-xl font-semibold">预设的样式钩子</h2>
        <CardDescription>
          8 套设计系统都实现了这 9 个 <code>data-slot</code>，写法统一是
          <code>:is(.cn-xxx, [data-slot="xxx"])</code>，所以按 <code>data-slot</code> 定位即可。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">
                  data-slot
                </th>
                <th class="py-2 font-medium">
                  预设写入的样式
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in hookRows" :key="r.slot" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top">
                  <code>{{ r.slot }}</code>
                </td>
                <td class="py-2 align-top" v-html="r.note" />
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-muted-foreground">
          <code>TableEmpty</code> 没有自己的钩子（它复用 <code>table-row</code> / <code>table-cell</code>），
          所以它的 <code>p-4</code> 会被预设的 <code>table-cell</code> 内边距盖掉。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
