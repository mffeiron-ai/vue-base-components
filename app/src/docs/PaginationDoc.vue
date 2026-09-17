<script setup lang="ts">
import { computed, ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

// ---------- 演示状态 ----------
/** 基础：100 条 / 每页 10 条 = 10 页 */
const basicPage = ref(1)
/** 省略号：1000 条 = 100 页 */
const manyPage = ref(47)
/** 首末页 + 省略号 */
const edgePage = ref(5)
/** 每页条数对比 */
const pageSize = ref(10)
/** 链接版 */
const linkPage = ref(3)

const basicTotal = 100
const basicPerPage = 10
const basicPageCount = computed(() => Math.ceil(basicTotal / basicPerPage))
const sizeTotal = 100
const sizePageCount = computed(() => Math.ceil(sizeTotal / pageSize.value))

// ---------- API ----------
const rootRows = [
  { name: 'v-model:page', type: 'number', def: '1（defaultPage）', desc: '当前页（受控）；不传就是非受控，内部自己记' },
  { name: 'total', type: 'number', def: '0', desc: '总条数（不是总页数）；页数 = <code>ceil(total / itemsPerPage)</code>，至少 1 页' },
  { name: 'itemsPerPage', type: 'number', def: '10', desc: '每页条数，只影响页数计算' },
  { name: 'siblingCount', type: 'number', def: '2', desc: '当前页左右各保留几个页码（其余折成省略号）；想让省略号出现得早一点就调小' },
  { name: 'showEdges', type: 'boolean', def: 'false', desc: '是否始终显示第 1 页 / 最后一页（默认只在靠近两端时显示）' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '整体禁用：所有页码与前后翻页按钮都不可点' },
]

const partRows = [
  { name: 'Pagination', slot: 'pagination', desc: '根容器（<code>mx-auto flex w-full justify-center</code>）：只提供状态与上下文，默认插槽暴露 <code>{ page }</code>' },
  { name: 'PaginationContent', slot: 'pagination-content', desc: '横向排列的列表（<code>flex items-center gap-1</code>）；插槽参数 <code>{ items }</code> —— 由 reka 按 <code>page / pageCount / siblingCount / showEdges</code> 算好的数组，元素形如 <code>{ type: \'page\', value }</code> 或 <code>{ type: \'ellipsis\' }</code>' },
  { name: 'PaginationItem', slot: 'pagination-item', desc: '页码：<b><code>value</code> 必填（Number）</b>，渲染成 <code>&lt;button&gt;</code>（<code>aria-label="Page N"</code>），<b>点一下就会切页</b>；<code>is-active</code> 只控制视觉（outline / ghost），选中态的 aria 由 reka 自己判断，不用手写' },
  { name: 'PaginationLink', slot: 'pagination-link', desc: '<code>&lt;a&gt;</code> 版页码：<code>href</code> + <code>is-active</code>。需要真实 URL（SEO、分享链接、新标签页打开）时用它，点击行为要自己接（不切内部页码）' },
  { name: 'PaginationPrevious / Next', slot: 'pagination-previous / -next', desc: '前后翻一页的 <code>&lt;button&gt;</code>：默认文案 Previous / Next（<code>hidden sm:block</code>，窄屏只留图标）；<b>到第一页 / 最后一页会自动 disabled</b>' },
  { name: 'PaginationFirst / Last', slot: 'pagination-first / -last', desc: '跳到第一页 / 最后一页；一般配 <code>show-edges</code> 一起用' },
  { name: 'PaginationEllipsis', slot: 'pagination-ellipsis', desc: '省略号（<code>MoreHorizontal</code> + 仅屏幕阅读器可见的 "More pages"）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Pagination 分页</h1>
    <p class="mt-3 text-muted-foreground">
      列表 / 表格的分页导航：<b>页码数组由 reka 按「当前页 + 总页数 + 左右保留数 + 是否显示首末页」算好</b>，
      你只需要把 <code>items</code> 渲染出来。<br />
      结构：<code>Pagination</code>（状态）→ <code>PaginationContent</code>（列表，插槽给 <code>items</code>）→
      <code>PaginationItem</code>（页码，<b>点一下即切页</b>）/ <code>PaginationEllipsis</code>（省略号），
      两侧再放 <code>PaginationPrevious</code> / <code>PaginationNext</code>（可选 <code>First</code> / <code>Last</code>）。<br />
      注意 <code>total</code> 传的是<b>总条数</b>而不是总页数：页数 = <code>ceil(total / items-per-page)</code>。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>:total="100" :items-per-page="10"</code> → 10 页；<code>v-model:page</code> 拿当前页。
          页码点一下就切（<code>PaginationItem</code> 自带点击），Next / Previous 到两端会自动禁用。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Pagination v-model:page="basicPage" :total="basicTotal" :items-per-page="basicPerPage" :sibling-count="1">
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious />
            <template v-for="(item, index) in items">
              <PaginationItem
                v-if="item.type === 'page'"
                :key="item.value"
                :value="item.value"
                :is-active="item.value === basicPage"
              >
                {{ item.value }}
              </PaginationItem>
              <PaginationEllipsis v-else :key="`ellipsis-${index}`" />
            </template>
            <PaginationNext />
          </PaginationContent>
        </Pagination>

        <p class="text-center text-sm text-muted-foreground">
          第 <code class="rounded bg-muted px-1.5 py-0.5 font-mono">{{ basicPage }}</code> 页 / 共
          <code class="rounded bg-muted px-1.5 py-0.5 font-mono">{{ basicPageCount }}</code> 页
        </p>
      </CardContent>
    </Card>

    <!-- 2. 省略号与 siblingCount -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">省略号与 sibling-count</h2>
        <CardDescription>
          1000 条 = 100 页，中间会自动折成省略号。<code>sibling-count</code> 决定当前页左右各留几个页码：
          下面三个分别是 <code>0</code> / <code>1</code> / <code>2</code>（默认 2）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div v-for="sibling in [0, 1, 2]" :key="sibling" class="space-y-2">
          <p class="text-xs text-muted-foreground">sibling-count = {{ sibling }}</p>
          <Pagination :total="1000" :items-per-page="10" :sibling-count="sibling" :default-page="47">
            <PaginationContent v-slot="{ items }">
              <PaginationPrevious />
              <template v-for="(item, index) in items">
                <PaginationItem
                  v-if="item.type === 'page'"
                  :key="item.value"
                  :value="item.value"
                  :is-active="item.value === 47"
                >
                  {{ item.value }}
                </PaginationItem>
                <PaginationEllipsis v-else :key="`ellipsis-${sibling}-${index}`" />
              </template>
              <PaginationNext />
            </PaginationContent>
          </Pagination>
        </div>
        <p class="text-sm text-muted-foreground">
          上面三组都是<b>非受控</b>（只给了 <code>default-page</code>），点页码只影响自己那一组。
        </p>
      </CardContent>
    </Card>

    <!-- 3. show-edges + First/Last -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">显示首末页 + 跳首尾</h2>
        <CardDescription>
          <code>show-edges</code> 让第 1 页与最后一页始终出现（否则只有靠近两端时才有），
          再配上 <code>PaginationFirst</code> / <code>PaginationLast</code> 就能一步跳到头尾。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Pagination v-model:page="edgePage" :total="1000" :items-per-page="10" :sibling-count="1" show-edges>
          <PaginationContent v-slot="{ items }">
            <PaginationFirst />
            <PaginationPrevious />
            <template v-for="(item, index) in items">
              <PaginationItem
                v-if="item.type === 'page'"
                :key="item.value"
                :value="item.value"
                :is-active="item.value === edgePage"
              >
                {{ item.value }}
              </PaginationItem>
              <PaginationEllipsis v-else :key="`ellipsis-${index}`" />
            </template>
            <PaginationNext />
            <PaginationLast />
          </PaginationContent>
        </Pagination>

        <p class="text-center text-sm text-muted-foreground">
          第 <code class="rounded bg-muted px-1.5 py-0.5 font-mono">{{ edgePage }}</code> 页
        </p>
      </CardContent>
    </Card>

    <!-- 4. 每页条数 + 链接版 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">每页条数与链接式页码</h2>
        <CardDescription>
          左边同一个 <code>total=100</code>，<code>items-per-page</code> 从 10 改成 25，页数就从 10 页变成 4 页。<br />
          右边用 <code>PaginationLink</code>（<code>&lt;a&gt;</code>）代替 <code>PaginationItem</code>：
          适合「每一页都有自己的 URL」的场景（SEO、可分享、可新标签打开），<code>is-active</code> 控制高亮。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-8">
        <div class="flex flex-wrap gap-8">
          <label class="space-y-2 text-sm">
            <span class="text-muted-foreground">items-per-page</span>
            <select v-model.number="pageSize" class="block h-9 rounded-md border border-input bg-transparent px-3">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </label>
          <div class="min-w-0 flex-1 space-y-2">
            <p class="text-xs text-muted-foreground">共 {{ sizePageCount }} 页</p>
            <Pagination v-model:page="basicPage" :total="sizeTotal" :items-per-page="pageSize" :sibling-count="1">
              <PaginationContent v-slot="{ items }">
                <PaginationPrevious />
                <template v-for="(item, index) in items">
                  <PaginationItem
                    v-if="item.type === 'page'"
                    :key="item.value"
                    :value="item.value"
                    :is-active="item.value === basicPage"
                  >
                    {{ item.value }}
                  </PaginationItem>
                  <PaginationEllipsis v-else :key="`ellipsis-${index}`" />
                </template>
                <PaginationNext />
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        <div class="space-y-2">
          <Pagination v-model:page="linkPage" :total="100" :items-per-page="10" :sibling-count="1">
            <PaginationContent v-slot="{ items }">
              <PaginationPrevious />
              <template v-for="(item, index) in items">
                <PaginationItem
                  v-if="item.type === 'page' && item.value === linkPage"
                  :key="item.value"
                  :value="item.value"
                  is-active
                >
                  {{ item.value }}
                </PaginationItem>
                <PaginationLink
                  v-else-if="item.type === 'page'"
                  :key="item.value"
                  :href="`#page-${item.value}`"
                  :is-active="false"
                  @click.prevent="linkPage = item.value"
                >
                  {{ item.value }}
                </PaginationLink>
                <PaginationEllipsis v-else :key="`ellipsis-${index}`" />
              </template>
              <PaginationNext />
            </PaginationContent>
          </Pagination>
          <p class="text-center text-xs text-muted-foreground">
            链接式演示：当前 <code>#page-{{ linkPage }}</code>（点击会改 <code>v-model:page</code> 并高亮）
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>根组件的 props（其余部件都只透传 <code>class</code> 与 reka 的原生 props）。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">Props</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rootRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 font-mono text-xs text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">组件</th>
                <th class="py-2 pr-4 font-medium">data-slot</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in partRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground"><code>{{ row.slot }}</code></td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-sm text-muted-foreground">
          页码与省略号都由 reka 算好（<code>items</code>），不用自己写「首尾页 + 省略号」的逻辑；
          只想改样式的话，给 <code>PaginationItem</code> 传 <code>size</code>（默认 <code>icon</code>）或用
          <code>buttonVariants</code> 拼一套自己的类即可。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
