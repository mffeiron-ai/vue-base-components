<script setup lang="ts">
import { Donut } from '@unovis/ts'
import {
  VisArea,
  VisAxis,
  VisDonut,
  VisGroupedBar,
  VisLine,
  VisSingleContainer,
  VisStackedBar,
  VisXYContainer,
} from '@unovis/vue'
import type { ChartConfig } from '@/components/ui/chart'
import {
  ChartContainer,
  ChartCrosshair,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// 桌面 / 移动 两系列，六个月的访问量
const barData = [
  { month: '一月', desktop: 186, mobile: 80 },
  { month: '二月', desktop: 305, mobile: 200 },
  { month: '三月', desktop: 237, mobile: 120 },
  { month: '四月', desktop: 73, mobile: 190 },
  { month: '五月', desktop: 209, mobile: 130 },
  { month: '六月', desktop: 214, mobile: 140 },
]
type BarData = typeof barData[number]

const barConfig = {
  desktop: { label: '桌面端', color: 'var(--chart-1)' },
  mobile: { label: '移动端', color: 'var(--chart-2)' },
} satisfies ChartConfig

// 单系列（面积图 / 折线图）
const lineData = [
  { id: 1, month: '一月', value: 186 },
  { id: 2, month: '二月', value: 305 },
  { id: 3, month: '三月', value: 237 },
  { id: 4, month: '四月', value: 73 },
  { id: 5, month: '五月', value: 209 },
  { id: 6, month: '六月', value: 214 },
]
type LineData = typeof lineData[number]

const areaConfig = {
  value: { label: '访问量', color: 'var(--chart-1)' },
} satisfies ChartConfig

// 多系列折线
const multiConfig = {
  desktop: { label: '桌面端', color: 'var(--chart-1)' },
  mobile: { label: '移动端', color: 'var(--chart-3)' },
} satisfies ChartConfig

// 堆叠柱：把若干项叠成一根
const stackConfig = {
  deep: { label: '深睡', color: 'var(--chart-4)' },
  light: { label: '浅睡', color: 'var(--chart-1)' },
  rem: { label: '快速眼动', color: 'var(--chart-2)' },
} satisfies ChartConfig

const stackData = [
  { day: '一', deep: 92, light: 210, rem: 68 },
  { day: '二', deep: 78, light: 190, rem: 54 },
  { day: '三', deep: 110, light: 240, rem: 80 },
  { day: '四', deep: 64, light: 168, rem: 42 },
  { day: '五', deep: 96, light: 220, rem: 72 },
  { day: '六', deep: 120, light: 260, rem: 92 },
  { day: '日', deep: 88, light: 200, rem: 60 },
]
type StackData = typeof stackData[number]

// 环形图
const donutData = [
  { name: 'chrome', value: 275, color: 'var(--chart-1)' },
  { name: 'safari', value: 200, color: 'var(--chart-2)' },
  { name: 'firefox', value: 187, color: 'var(--chart-3)' },
  { name: 'edge', value: 173, color: 'var(--chart-4)' },
  { name: 'other', value: 90, color: 'var(--chart-5)' },
]
type DonutData = typeof donutData[number]

const donutConfig = {
  visitors: { label: '访问量' },
  chrome: { label: 'Chrome', color: 'var(--chart-1)' },
  safari: { label: 'Safari', color: 'var(--chart-2)' },
  firefox: { label: 'Firefox', color: 'var(--chart-3)' },
  edge: { label: 'Edge', color: 'var(--chart-4)' },
  other: { label: '其他', color: 'var(--chart-5)' },
} satisfies ChartConfig

const donutTotal = donutData.reduce((sum, d) => sum + d.value, 0)

const containerProps = [
  { name: 'config', type: 'ChartConfig', def: '—', desc: '必填。每个系列的 label / color（或 theme.light/dark），会生成 --color-<key> 变量供图表与提示框读取' },
  { name: 'cursor', type: 'boolean', def: 'false', desc: '是否显示十字准线（传 false 时十字线宽度为 0，仍保留 Tooltip）' },
  { name: 'id', type: 'string', def: '自动', desc: '用于生成 data-chart="chart-<id>"，主题色变量按它作用域化；同一页多图建议显式区分' },
  { name: 'class', type: 'string', def: '—', desc: '容器默认 aspect-video，常用 h-48 / max-h-[220px] 这类高度类控制尺寸' },
]

const tooltipProps = [
  { name: 'indicator', type: "'dot' | 'line' | 'dashed'", def: "'dot'", desc: '系列色块的形状：圆点 / 竖线 / 虚线' },
  { name: 'hideLabel', type: 'boolean', def: 'false', desc: '隐藏提示框顶部的那行标题（横轴标签）' },
  { name: 'hideIndicator', type: 'boolean', def: 'false', desc: '隐藏色块，只留文字（适合单系列）' },
  { name: 'labelKey', type: 'string', def: '—', desc: '标题取哪一列（如 monthLabel），不传则用横轴原始值 x' },
  { name: 'labelFormatter', type: '(x) => string', def: '—', desc: '自定义标题格式化，优先级高于 labelKey' },
  { name: 'nameKey', type: 'string', def: '—', desc: '按数据源里的某个键取系列名' },
]

const legendProps = [
  { name: 'hideIcon', type: 'boolean', def: 'false', desc: '不显示 config 里的 icon，只用色块' },
  { name: 'verticalAlign', type: "'top' | 'bottom'", def: "'bottom'", desc: '图例放在图表上方还是下方' },
  { name: 'nameKey', type: 'string', def: '—', desc: '图例文案取 config 的哪个键' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Chart 图表</h1>
    <p class="mt-3 text-muted-foreground">
      图表本身来自 <code>@unovis/vue</code>（VisXYContainer / VisLine / VisDonut …），
      这里提供的是<strong>主题与提示框</strong>这层包装：
      <code>ChartContainer</code> 把配置里的颜色写成 CSS 变量，
      <code>ChartTooltipContent</code> / <code>ChartLegendContent</code> 据此渲染出与主题一致的提示框和图例。
    </p>

    <!-- 基础柱状图 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法（分组柱状图）</h2>
        <CardDescription>
          三段：<code>ChartContainer</code>（配置 + 主题）→ Unovis 容器与图形 → <code>ChartTooltip</code> /
          <code>ChartCrosshair</code>（鼠标提示）。图例用 <code>ChartLegendContent</code>，它直接读 config 的
          <code>label</code> 与 <code>color</code>。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer :config="barConfig" class="h-64 w-full">
          <VisXYContainer :data="barData" :margin="{ left: 0, right: 0, top: 8, bottom: 0 }">
            <VisGroupedBar
              :x="(_d: BarData, i: number) => i"
              :y="[(d: BarData) => d.desktop, (d: BarData) => d.mobile]"
              :color="[barConfig.desktop.color, barConfig.mobile.color]"
              :rounded-corners="4"
            />
            <VisAxis
              type="x"
              :tick-line="false"
              :domain-line="false"
              :grid-line="false"
              :num-ticks="6"
              :tick-format="(_: number, i: number) => barData[i]?.month ?? ''"
            />
            <ChartTooltip />
            <ChartCrosshair
              :template="componentToString(barConfig, ChartTooltipContent, { indicator: 'dashed' })"
              :color="[barConfig.desktop.color, barConfig.mobile.color]"
            />
          </VisXYContainer>
          <ChartLegendContent />
        </ChartContainer>
      </CardContent>
    </Card>

    <!-- 面积 + 折线 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">面积图与折线图</h2>
        <CardDescription>
          面积就是 <code>VisArea</code> + 低透明度，叠一条 <code>VisLine</code> 做描边；
          提示框里想显示“一月”这类文字标签，就给 <code>ChartTooltipContent</code> 传
          <code>labelKey</code>（或 <code>labelFormatter</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer :config="areaConfig" class="h-56 w-full">
          <VisXYContainer :data="lineData" :margin="{ left: 0, right: 0, top: 8, bottom: 0 }">
            <VisArea
              :x="(d: LineData) => d.id"
              :y="(d: LineData) => d.value"
              :color="areaConfig.value.color"
              :opacity="0.15"
            />
            <VisLine
              :x="(d: LineData) => d.id"
              :y="(d: LineData) => d.value"
              :color="areaConfig.value.color"
              :line-width="2"
            />
            <VisAxis
              type="x"
              :tick-line="false"
              :domain-line="false"
              :grid-line="false"
              :num-ticks="6"
              :tick-format="(_: number, i: number) => lineData[i]?.month ?? ''"
            />
            <VisAxis type="y" :tick-line="false" :domain-line="false" :tick-format="() => ''" />
            <ChartTooltip />
            <ChartCrosshair
              :template="componentToString(areaConfig, ChartTooltipContent, { indicator: 'line', labelKey: 'month' })"
              :color="areaConfig.value.color"
            />
          </VisXYContainer>
        </ChartContainer>
      </CardContent>
    </Card>

    <!-- 多系列折线 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">多系列折线</h2>
        <CardDescription>
          每个系列放一个 <code>VisLine</code>（各自 <code>:color</code>），
          <code>ChartCrosshair</code> 的 <code>:color</code> 传数组就能显示多条准线。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer :config="multiConfig" class="h-56 w-full">
          <VisXYContainer :data="barData" :margin="{ left: 0, right: 0, top: 8, bottom: 0 }">
            <VisLine
              :x="(_d: BarData, i: number) => i"
              :y="(d: BarData) => d.desktop"
              :color="multiConfig.desktop.color"
              :line-width="2"
            />
            <VisLine
              :x="(_d: BarData, i: number) => i"
              :y="(d: BarData) => d.mobile"
              :color="multiConfig.mobile.color"
              :line-width="2"
            />
            <VisAxis
              type="x"
              :tick-line="false"
              :domain-line="false"
              :grid-line="false"
              :num-ticks="6"
              :tick-format="(_: number, i: number) => barData[i]?.month ?? ''"
            />
            <ChartTooltip />
            <ChartCrosshair
              :template="componentToString(multiConfig, ChartTooltipContent)"
              :color="[multiConfig.desktop.color, multiConfig.mobile.color]"
            />
          </VisXYContainer>
          <ChartLegendContent />
        </ChartContainer>
      </CardContent>
    </Card>

    <!-- 堆叠柱 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">堆叠柱状图</h2>
        <CardDescription>
          换成 <code>VisStackedBar</code>，<code>:y</code> 与 <code>:color</code> 都传数组即可把多项叠成一根；
          <code>bar-width</code> 控制柱宽。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer :config="stackConfig" class="h-56 w-full">
          <VisXYContainer :data="stackData" :margin="{ left: 0, right: 0, top: 8, bottom: 0 }">
            <VisStackedBar
              :x="(_d: StackData, i: number) => i"
              :y="[(d: StackData) => d.deep, (d: StackData) => d.light, (d: StackData) => d.rem]"
              :color="[stackConfig.deep.color, stackConfig.light.color, stackConfig.rem.color]"
              :bar-width="22"
              :bar-padding="0.3"
            />
            <VisAxis
              type="x"
              :tick-line="false"
              :domain-line="false"
              :grid-line="false"
              :num-ticks="7"
              :tick-format="(_: number, i: number) => stackData[i]?.day ?? ''"
            />
            <ChartTooltip />
            <ChartCrosshair
              :template="componentToString(stackConfig, ChartTooltipContent, { indicator: 'dashed' })"
              :color="[stackConfig.deep.color, stackConfig.light.color, stackConfig.rem.color]"
            />
          </VisXYContainer>
          <ChartLegendContent />
        </ChartContainer>
      </CardContent>
    </Card>

    <!-- 环形图 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">环形图（Donut）</h2>
        <CardDescription>
          环形 / 饼图用 <code>VisSingleContainer</code> + <code>VisDonut</code>。
          弧形段没有“横轴”，所以提示框要显式给 <code>ChartTooltip</code> 传
          <code>:triggers="{ [Donut.selectors.segment]: … }"</code>；
          中心文案用 <code>central-label</code> / <code>central-sub-label</code>，配色同样来自 config。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          :config="donutConfig"
          class="mx-auto aspect-square max-h-[280px]"
          :style="{
            '--vis-donut-central-label-font-size': 'var(--text-2xl)',
            '--vis-donut-central-label-font-weight': 'var(--font-weight-bold)',
            '--vis-donut-central-label-text-color': 'var(--foreground)',
            '--vis-donut-central-sub-label-text-color': 'var(--muted-foreground)',
          }"
        >
          <VisSingleContainer :data="donutData" :margin="{ top: 24, bottom: 24 }">
            <VisDonut
              :value="(d: DonutData) => d.value"
              :color="(d: DonutData) => d.color"
              :arc-width="28"
              central-label="812"
              central-sub-label="近 30 天访问量"
            />
            <ChartTooltip
              :triggers="{
                [Donut.selectors.segment]: componentToString(donutConfig, ChartTooltipContent, { hideLabel: true })!,
              }"
            />
          </VisSingleContainer>
        </ChartContainer>
        <div class="mt-4 flex flex-wrap justify-center gap-4">
          <div v-for="d in donutData" :key="d.name" class="flex items-center gap-1.5 text-sm">
            <span class="size-2 rounded-[2px]" :style="{ backgroundColor: d.color }" />
            <span class="text-muted-foreground">{{ donutConfig[d.name as keyof typeof donutConfig].label }}</span>
            <span class="font-mono tabular-nums">{{ d.value }}</span>
          </div>
        </div>
        <p class="mt-3 text-sm text-muted-foreground">
          单容器（环形/饼图）没有 <code>[data-vis-xy-container]</code>，所以 <code>ChartLegendContent</code> 不适用，
          这里改用配置里的 <code>color</code> 手写图例。总数：{{ donutTotal }}。
        </p>
      </CardContent>
    </Card>

    <!-- 配置详解 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">ChartConfig 怎么写</h2>
        <CardDescription>
          <code>config</code> 的键要和数据列名对上：图表从它生成
          <code>--color-&lt;key&gt;</code> 变量，提示框和图例也读同一份。
          颜色可以直接给 <code>color</code>，也可以给 <code>theme: { light, dark }</code> 让明暗模式用不同色。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <pre class="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed"><code>const chartConfig = {
  desktop: {
    label: '桌面端',            // 提示框 / 图例里显示的名字（也可以传组件，比如图标）
    color: 'var(--chart-1)',   // 主题色变量，切换主题时跟着变
  },
  mobile: {
    label: '移动端',
    theme: {                   // 也可以按明暗模式分别指定
      light: 'var(--chart-2)',
      dark: 'var(--chart-3)',
    },
  },
} satisfies ChartConfig</code></pre>
        <p class="text-sm text-muted-foreground">
          主题里内置了 <code>--chart-1</code> ~ <code>--chart-5</code> 五个序列色，
          也可以直接写任意 CSS 颜色值。
        </p>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription>
          除 <code>ChartContainer</code> 外，其余都是给 Unovis 当“渲染器”用的：通过
          <code>componentToString()</code> 把 Vue 组件变成 Unovis 需要的 HTML 模板串。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div>
          <p class="mb-2 text-sm font-medium">ChartContainer</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">属性</th>
                  <th class="px-4 py-2 font-medium">类型</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in containerProps" :key="r.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ r.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ r.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">ChartTooltipContent</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">属性</th>
                  <th class="px-4 py-2 font-medium">类型</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in tooltipProps" :key="r.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ r.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ r.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">ChartLegendContent</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">属性</th>
                  <th class="px-4 py-2 font-medium">类型</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in legendProps" :key="r.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ r.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ r.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">导出</p>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li>· <code>ChartContainer</code> / <code>ChartTooltipContent</code> / <code>ChartLegendContent</code>：主题包装层</li>
            <li>· <code>ChartTooltip</code> / <code>ChartCrosshair</code>：<code>@unovis/vue</code> 的 VisTooltip / VisCrosshair 直接转出</li>
            <li>· <code>componentToString(config, 组件, props?)</code>：把 Vue 组件渲染成 Unovis 的模板串（客户端才有返回值）</li>
            <li>· <code>ChartConfig</code>（类型）、<code>useChart()</code>（在 ChartContainer 子树里读 id / config）</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
