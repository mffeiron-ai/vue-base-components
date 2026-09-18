<script setup lang="ts">
/**
 * 业务组件文档页 · BaseTable
 *
 * 中央内容分两个 Tab（业务组件跟原子组件不一样，单开一页）：
 *   1) 组件 —— 纯组件演示（BasetableDemo），真实跑在假数据 + 模拟服务端上；
 *   2) 文档 —— 快速开始 / 服务端协议 / API / 升级对照。
 */
import { ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BasetableDemo from './BasetableDemo.vue'

const tab = ref('component')

// ── 文档内容（表格数据）──
const propsRows = [
  ['columns', 'Column[]', '—', '列定义：label / field / sortable / filter / type / width / slot…'],
  ['data', 'any[]', '—', '当前页数据（只给这一页，分页交给服务端）'],
  ['idField', 'string', '—', '行主键字段，用于选中与 key'],
  ['page', 'number', '1', '当前页（1 起），配 <code>v-model:page</code>'],
  ['pageSize', 'number', '10', '每页条数，配 <code>v-model:page-size</code>'],
  ['total', 'number', '—', '匹配总行数（服务端返回）；<strong>传了才显示分页条</strong>，同时决定页数'],
  ['pageSizeOptions', 'number[]', '[10,20,50,100]', '每页条数下拉选项'],
  ['sortField / sortOrder', 'string / "asc"|"desc"|null', 'null', '受控排序；组件只发 <code>sort-change</code>，排序本身由服务端做'],
  ['sortFn', '(a,b)=>number', '—', '给了就地排当前 data（客户端模式）；不给则纯服务端'],
  ['loading', 'boolean', 'false', '显示骨架屏（含 minLoadingMs 最短展示，防闪烁）'],
  ['emptyText', 'string', '暂无数据', '空态文案（也可用 <code>#empty</code> 插槽）'],
  ['maxHeight', 'string', '72vh', '滚动容器高度，超出后表头固定、表体内部滚动'],
  ['cellMaxLines', 'number', '3', '单元格最多显示行数，超出裁切'],
  ['minColumnWidth', 'number', '60', '列宽拖拽下限（px）'],
  ['resizable', 'boolean', 'true', '是否显示列宽拖拽手柄'],
  ['columnSettings', 'boolean', 'true', '是否显示「显示/隐藏列」菜单（含列序拖拽）'],
  ['clickable', 'boolean', 'false', '首列可点并高亮，点击发 <code>row-click</code> / 开详情面板'],
  ['selectable', 'boolean', 'false', '显示行选择列（表头支持半选）'],
  ['selectAll', 'boolean', 'false', '表头勾选 = 跨页全选所有匹配（发 <code>__all__</code> 标记）'],
  ['selected', '(string|number)[]', '[]', '已选标记（配 <code>v-model:selected</code>），用 <code>resolveSelected()</code> 解码'],
  ['detailFields', '{label,field,type?}[]', '—', '提供后点击行弹右侧详情（type: image 走多图 + 大图预览）'],
  ['facetLoader', '(col, kw) => Promise', '—', '分面分组计数（Excel 式），打开筛选面板时懒加载'],
  ['persistKey', 'string', '—', '列宽 + 列序 + 列显隐持久化到 localStorage 的 key'],
]

const eventsRows = [
  ['update:page / page-change', 'number', '页码变化（页大小变化导致回第 1 页时也会发）'],
  ['update:pageSize / page-size-change', 'number', '每页条数变化（旧版本是 pageSizeChange，已规范化）'],
  ['sort-change', '{ field, order }', '表头点击循环：升序 → 降序 → 取消（field/order 为 null 表示取消）'],
  ['filter-change', 'Record<string, any>', '筛选参数，协议见上表；收到后请重新请求数据'],
  ['update:selected', '(string|number)[]', '选中标记数组，可能含 <code>__all__</code> / <code>__except__:&lt;id&gt;</code>'],
  ['row-click', 'row', '点击可点击行（clickable）时触发'],
]

const slotsRows = [
  ['search', '—', '工具栏最左侧（放关键词输入框）'],
  ['toolbar', '—', '工具栏自定义按钮区'],
  ['actions', '{ row, ...row }', '行尾操作列（提供后自动多一列）'],
  ['footer', '{ col, columns }', '表尾汇总行，按列渲染（每个 td 都会拿到自己的 col）'],
  ['empty', '—', '空态内容（默认用 emptyText）'],
  ['&lt;col.slot&gt;', 'row / _idx', '列定义里 <code>slot: "xx"</code> 对应的单元格插槽'],
]

const exposeRows = [
  ['openDetail(row)', '打开行详情面板（外部触发）'],
  ['setColumnFilter(field, value)', '外部设置某列筛选并重查（带参跳转场景）'],
  ['resetAllFilters()', '清空全部列筛选并重发 filter-change'],
  ['resolveSelected()', '选中语义解码 → { mode, ids, excluded }'],
  ['table', 'TanStack 实例（逃生舱：自定义列 / 直读状态）'],
]

const protocolRows = [
  ['数值区间', 'amount__gte / amount__lte', '列定义 <code>filter: { type: "number", scale: 100 }</code> 时前端按倍数换算后再发'],
  ['集合命中', 'status__in=[...]', '下拉多选、文本分面（勾选值）'],
  ['按天多选', "createdAt__date__in=['2026-08-01']", '日期列「按天分布」勾选'],
  ['日期区间', 'createdAt__date__gte / __lte', '日期列手动区间 / 昨天 / 当月快捷键'],
  ['文本模糊', 'productTitle=keyword', '配 <code>matchFields: ["orderNo","buyer"]</code> 时后端一起匹配这些字段'],
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">BaseTable 数据表格</h1>
    <p class="mt-3 text-muted-foreground">
      业务组件（分子组件）：把 <code>Table</code> / <code>Checkbox</code> / <code>Popover</code> /
      <code>DropdownMenu</code> / <code>Pagination</code> / <code>Sheet</code> 这些原子，
      按「后台列表页」这个场景组合 + 强化出来的成品。<br />
      状态机交给 <strong>TanStack Table</strong>（排序 / 分页 / 列宽 / 列序 / 列显隐），渲染走库内原子，
      所以 <strong>8 套风格预设直接生效</strong>。
    </p>

    <Tabs v-model="tab" class="mt-6">
      <TabsList variant="line">
        <TabsTrigger value="component">组件</TabsTrigger>
        <TabsTrigger value="docs">文档</TabsTrigger>
      </TabsList>

      <!-- Tab 1：纯组件 -->
      <TabsContent value="component" class="mt-6">
        <BasetableDemo />
      </TabsContent>

      <!-- Tab 2：相关文档 -->
      <TabsContent value="docs" class="mt-6">
        <Card>
          <CardHeader>
            <h2 class="text-xl font-semibold">快速开始</h2>
            <CardDescription>
              组件不自己发请求：只把「用户改了什么」发成事件，取数、分页、筛选都留在业务侧。
              上面的「组件」Tab 就是下面这段代码的真实运行。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre v-pre class="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed"><code>&lt;BaseTable
  id-field="id"
  v-model:page="page"
  v-model:page-size="pageSize"
  v-model:selected="selected"
  :columns="columns"
  :data="rows"
  :total="total"
  :loading="loading"
  :facet-loader="facetLoader"
  selectable
  select-all
  clickable
  @sort-change="(p) =&gt; { sortField = p.field; sortOrder = p.order }"
  @filter-change="(f) =&gt; { filters = f }"
/&gt;</code></pre>
            <p class="mt-3 text-sm text-muted-foreground">
              <code>columns</code> 里声明 <code>sortable</code> / <code>filter</code> 就会出现排序与筛选控件；
              <code>total</code> 决定分页条，<code>facetLoader</code> 决定筛选面板是否走「值 + 命中数」。
            </p>
          </CardContent>
        </Card>

        <Card class="mt-8">
          <CardHeader>
            <h2 class="text-xl font-semibold">服务端协议（<code>filter-change</code> 发什么）</h2>
            <CardDescription>
              组件只把界面上的筛选翻译成参数，参数本身与后端约定；下表在
              <code>app/src/business/mock-table-server.ts</code> 里有对应实现，可当接口说明看。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b">
                    <th class="py-2 pr-4 text-left font-medium">语义</th>
                    <th class="py-2 pr-4 text-left font-medium">参数</th>
                    <th class="py-2 text-left font-medium">说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in protocolRows" :key="r[1]" class="border-b last:border-0">
                    <td class="whitespace-nowrap py-2 pr-4">{{ r[0] }}</td>
                    <td class="py-2 pr-4"><code class="text-xs">{{ r[1] }}</code></td>
                    <td class="py-2 text-muted-foreground" v-html="r[2]"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card class="mt-8">
          <CardHeader>
            <h2 class="text-xl font-semibold">Props</h2>
          </CardHeader>
          <CardContent>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b">
                    <th class="py-2 pr-4 text-left font-medium">属性</th>
                    <th class="py-2 pr-4 text-left font-medium">类型</th>
                    <th class="py-2 pr-4 text-left font-medium">默认</th>
                    <th class="py-2 text-left font-medium">说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in propsRows" :key="r[0]" class="border-b last:border-0">
                    <td class="whitespace-nowrap py-2 pr-4"><code class="text-xs">{{ r[0] }}</code></td>
                    <td class="whitespace-nowrap py-2 pr-4 text-muted-foreground"><code class="text-xs">{{ r[1] }}</code></td>
                    <td class="whitespace-nowrap py-2 pr-4 text-muted-foreground">{{ r[2] }}</td>
                    <td class="py-2 text-muted-foreground" v-html="r[3]"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card class="mt-8">
          <CardHeader>
            <h2 class="text-xl font-semibold">事件 / 插槽 / 暴露方法</h2>
            <CardDescription>事件一律 kebab-case；选中语义用 <code>resolveSelected()</code> 解码。</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b">
                    <th class="py-2 pr-4 text-left font-medium">事件</th>
                    <th class="py-2 pr-4 text-left font-medium">参数</th>
                    <th class="py-2 text-left font-medium">说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in eventsRows" :key="r[0]" class="border-b last:border-0">
                    <td class="whitespace-nowrap py-2 pr-4"><code class="text-xs">{{ r[0] }}</code></td>
                    <td class="whitespace-nowrap py-2 pr-4 text-muted-foreground"><code class="text-xs">{{ r[1] }}</code></td>
                    <td class="py-2 text-muted-foreground" v-html="r[2]"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b">
                    <th class="py-2 pr-4 text-left font-medium">插槽</th>
                    <th class="py-2 pr-4 text-left font-medium">作用域</th>
                    <th class="py-2 text-left font-medium">说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in slotsRows" :key="r[0]" class="border-b last:border-0">
                    <td class="whitespace-nowrap py-2 pr-4"><code class="text-xs" v-html="r[0]"></code></td>
                    <td class="whitespace-nowrap py-2 pr-4 text-muted-foreground"><code class="text-xs">{{ r[1] }}</code></td>
                    <td class="py-2 text-muted-foreground" v-html="r[2]"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b">
                    <th class="py-2 pr-4 text-left font-medium">defineExpose</th>
                    <th class="py-2 text-left font-medium">说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in exposeRows" :key="r[0]" class="border-b last:border-0">
                    <td class="whitespace-nowrap py-2 pr-4"><code class="text-xs">{{ r[0] }}</code></td>
                    <td class="py-2 text-muted-foreground">{{ r[1] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card class="mt-8">
          <CardHeader>
            <h2 class="text-xl font-semibold">与 ui/data-table 的分工</h2>
            <CardDescription>
              <code>ui/data-table</code>（DataTable）是 headless 渲染层：列定义与能力全由使用方
              <code>useTable</code> 注册，适合虚拟滚动、复杂列定义；<br />
              BaseTable 是约定式开箱即用（columns 配置 + 服务端协议），适合后台列表页。
              两者共用同一套 Table 原子与命名（<code>#toolbar</code> / <code>#empty</code> /
              <code>#footer</code>、选中行 <code>data-state="selected"</code>），可以按场景互换。
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
