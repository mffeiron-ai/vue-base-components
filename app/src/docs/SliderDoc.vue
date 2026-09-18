<script setup lang="ts">
import { computed, ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

/**
 * 自定义外观用的任意值类必须写在 script 里：
 * Vue 模板里的 `&` 要写成 `&amp;`，而 Tailwind 扫描的是源码文本，看到 `&amp;_[…]` 会把整条候选类丢掉。
 * 属性选择器的值也要带引号（`[data-slot='x']`）。
 */
const tallTrack = "[&_[data-slot='slider-track']]:h-3!"
const bigThumb = "[&_[data-slot='slider-thumb']]:size-6!"
const emeraldRange = "[&_[data-slot='slider-range']]:bg-emerald-500!"

/* ── 基础 ── */
const basic = ref<number[]>([40])

/* ── 范围与步长 ── */
const percent = ref<number[]>([65])
const price = ref<number[]>([2.5])
const temp = ref<number[]>([22])

/* ── 区间（多滑块）── */
const range = ref<number[]>([20, 70])
const rangeGap = ref<number[]>([30, 45])
const rangeText = computed(() => `${range.value[0]} – ${range.value[1]}`)

/* ── 纵向 ── */
const vertical = ref<number[]>([60])
const verticalInv = ref<number[]>([30])

/* ── 禁用 / 反转 / 表单 ── */
const disabledVal = ref<number[]>([50])
const inverted = ref<number[]>([25])
const formVal = ref<number[]>([70])
const submitted = ref('')
function onSubmit(e: Event) {
  const data = new FormData(e.target as HTMLFormElement)
  submitted.value = [...data.entries()].map(([k, v]) => `${k}=${v}`).join(' & ') || '(空)'
}

/* ── API 表 ── */
const propRows = [
  { name: 'v-model', type: 'number[]', def: '—', desc: '<b>值是一个数组</b>，元素个数决定有几个滑块：单值要写 <code>[50]</code>，区间写 <code>[20, 70]</code>。数组长度在运行中不要变' },
  { name: 'defaultValue', type: 'number[]', def: '[min]', desc: '非受控时的初始值，同样必须是数组' },
  { name: 'min / max', type: 'number', def: '0 / 100', desc: '取值范围' },
  { name: 'step', type: 'number', def: '1', desc: '步长。拖动与方向键都按它吸附（<code>0.1</code> 这类小数步长也可以）' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", def: "'horizontal'", desc: '方向。纵向时组件会切成 <code>flex-col</code>，并自带 <code>min-h-44</code>（176px）保证有高度' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '禁用：整块变半透明、不可拖动也不可聚焦' },
  { name: 'inverted', type: 'boolean', def: 'false', desc: '反转方向（横向时最大值在左边）' },
  { name: 'minStepsBetweenThumbs', type: 'number', def: '0', desc: '多滑块时两个把手之间至少隔几个 step —— 防止它们叠在一起' },
  { name: 'name', type: 'string', def: '—', desc: '给每个把手渲染一个隐藏的原生 <code>input</code>：<b>name 会带上下标</b>（单值是 <code>volume[0]</code>，区间则是 <code>volume[0]</code> / <code>volume[1]</code>），提交后从 <code>FormData</code> 直接取（实测 <code>volume[0]=70</code>）' },
  { name: 'class', type: 'string', def: '—', desc: '挂在根节点。改轨道 / 填充 / 把手的样式用后代选择器，见下面「自定义外观」' },
]

const partRows = [
  { name: 'SliderTrack', slot: 'slider-track', desc: '底轨：<code>bg-muted</code> + <code>rounded-full</code>，横向 <code>h-1.5</code>、纵向 <code>w-1.5</code>' },
  { name: 'SliderRange', slot: 'slider-range', desc: '已选区间的高亮条（<code>bg-primary</code>）；多滑块时它只画在两个把手之间' },
  { name: 'SliderThumb', slot: 'slider-thumb', desc: '把手：<code>size-4</code> 白底圆 + 主色描边；hover / 聚焦时外扩一圈 <code>ring-4</code>（ring 色取 <code>--ring</code> 的 50%）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Slider 滑块</h1>
    <p class="mt-3 text-muted-foreground">
      拖动把手在区间里选数值。<code>Slider</code> 只有一个组件（轨道、填充、把手都在它内部渲染），
      值是<b>数组</b> —— 数组里有几个数就有几个把手，所以「单值」和「区间」是同一个组件的两种用法。<br />
      键盘、触摸、表单提交都由 reka 处理：<code>←</code> <code>→</code>（纵向是 <code>↑</code> <code>↓</code>）微调、
      <code>Home</code> / <code>End</code> 到两端、<code>PageUp</code> / <code>PageDown</code> 跳 10 个 step。
    </p>

    <!-- 1. 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <b>注意值是数组</b>：单值也得写 <code>v-model="[40]"</code>（这里是 <code>ref([40])</code>）。<br />
          默认范围 0–100、步长 1。把鼠标移到把手上会外扩一圈光环，拖动、点轨道、键盘都能改值。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Slider v-model="basic" />
        <div class="flex items-center gap-2 text-sm">
          <span class="text-muted-foreground">当前值：</span>
          <Badge variant="secondary">
            {{ basic[0] }}
          </Badge>
          <code class="text-xs text-muted-foreground">v-model = [{{ basic.join(', ') }}]</code>
        </div>
      </CardContent>
    </Card>

    <!-- 2. 范围与步长 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">范围与步长</h2>
        <CardDescription>
          <code>min</code> / <code>max</code> 定区间，<code>step</code> 定吸附粒度。
          拖动与方向键都按 <code>step</code> 走，所以小数步长（<code>0.1</code>）也能用。
        </CardDescription>
      </CardHeader>
      <CardContent class="max-w-lg space-y-6">
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">0 – 100，step 1</span>
            <Badge variant="secondary">
              {{ percent[0] }}%
            </Badge>
          </div>
          <Slider v-model="percent" :min="0" :max="100" :step="1" />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">1 – 5 星，step 0.5</span>
            <Badge variant="secondary">
              {{ price[0].toFixed(1) }}
            </Badge>
          </div>
          <Slider v-model="price" :min="1" :max="5" :step="0.5" />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">-10 – 40 ℃，step 1</span>
            <Badge variant="secondary">
              {{ temp[0] }} ℃
            </Badge>
          </div>
          <Slider v-model="temp" :min="-10" :max="40" :step="1" />
        </div>
      </CardContent>
    </Card>

    <!-- 3. 多滑块 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">区间（多滑块）</h2>
        <CardDescription>
          值数组里放两个数就是区间选择器 —— 不用换组件，只是多一个把手。
          高亮条会自动画在两个把手之间。<br />
          用 <code>min-steps-between-thumbs</code> 还能限制两个把手的最小间距，避免它们叠在一起。
        </CardDescription>
      </CardHeader>
      <CardContent class="max-w-lg space-y-6">
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">价格区间</span>
            <Badge variant="secondary">
              {{ rangeText }}
            </Badge>
          </div>
          <Slider v-model="range" :min="0" :max="100" :step="1" />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">最小间距 5（<code>min-steps-between-thumbs="5"</code>）</span>
            <Badge variant="secondary">
              {{ rangeGap[0] }} – {{ rangeGap[1] }}
            </Badge>
          </div>
          <Slider v-model="rangeGap" :min="0" :max="100" :step="1" :min-steps-between-thumbs="5" />
          <p class="text-xs text-muted-foreground">
            试试把右边的把手往左拖到贴住左边 —— 它会停在距离左边 5 个 step 的位置。
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 纵向 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">纵向</h2>
        <CardDescription>
          <code>orientation="vertical"</code>：组件自己会切成 <code>flex-col</code>，并带上 <code>min-h-44</code>（176px）——
          所以就算父级没给高度也不会塌成 0。<br />
          不过要控制实际高度还是得给父级一个 <code>h-*</code>（纵向时 <code>h-full</code> 需要父级有确定高度）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-end gap-12">
          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              默认
            </p>
            <div class="flex h-52 justify-center">
              <Slider v-model="vertical" orientation="vertical" />
            </div>
            <Badge variant="secondary">
              {{ vertical[0] }}
            </Badge>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              <code>inverted</code>（最大值在下方）
            </p>
            <div class="flex h-52 justify-center">
              <Slider v-model="verticalInv" orientation="vertical" inverted />
            </div>
            <Badge variant="secondary">
              {{ verticalInv[0] }}
            </Badge>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium text-muted-foreground">
              纵向区间
            </p>
            <div class="flex h-52 justify-center">
              <Slider v-model="range" orientation="vertical" />
            </div>
            <Badge variant="secondary">
              {{ rangeText }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 禁用 / 反转 / 表单 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">禁用、反转与表单提交</h2>
        <CardDescription>
          带 <code>name</code> 时组件会为每个把手渲染一个隐藏的原生 <code>input</code>，
          <b>名字会带上下标</b> —— 这里提交出来就是 <code>volume[0]</code>（区间则同时出现 <code>[0]</code> / <code>[1]</code>），
          可以直接被 <code>FormData</code> 读到。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="max-w-lg space-y-6">
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">禁用（disabled）</span>
              <Badge variant="secondary">
                {{ disabledVal[0] }}
              </Badge>
            </div>
            <Slider v-model="disabledVal" disabled />
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">反转（inverted，最大值在左）</span>
              <Badge variant="secondary">
                {{ inverted[0] }}
              </Badge>
            </div>
            <Slider v-model="inverted" inverted />
          </div>
        </div>

        <form class="max-w-lg space-y-3" @submit.prevent="onSubmit">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">音量（<code>name="volume"</code>）</span>
            <Badge variant="secondary">
              {{ formVal[0] }}
            </Badge>
          </div>
          <Slider v-model="formVal" name="volume" :max="100" />
          <button type="submit" class="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent">
            提交
          </button>
        </form>
        <p class="text-sm text-muted-foreground">
          FormData：<code>{{ submitted || '—' }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 6. 自定义 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">自定义外观</h2>
        <CardDescription>
          轨道 / 填充条 / 把手都是组件内部渲染的，样式写在根节点的 <code>class</code> 上用后代选择器覆盖。<br />
          <b>这些都要带 <code>!</code></b>：预设把三者的尺寸与颜色写成了无层规则，普通工具类压不过去。
        </CardDescription>
      </CardHeader>
      <CardContent class="max-w-lg space-y-6">
        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            默认（轨道 h-1.5、把手 size-4）
          </p>
          <Slider v-model="basic" />
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            加粗轨道 + 放大把手
          </p>
          <Slider v-model="basic" :class="[tallTrack, bigThumb]" />
        </div>

        <div class="space-y-2">
          <p class="text-xs font-medium text-muted-foreground">
            换个填充色（<code>bg-emerald-500!</code>）
          </p>
          <Slider v-model="basic" :class="emeraldRange" />
        </div>

        <p class="text-xs text-muted-foreground">
          提示：<code>Slider</code> 的根节点默认是 <code>w-full</code>，要控制宽度给父级加 <code>max-w-*</code> 或直接给
          <code>class="w-[320px]"</code>。
        </p>
      </CardContent>
    </Card>

    <!-- 7. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          <code>Slider</code> 会把这些 props 透传给 reka 的 <code>SliderRoot</code>。
        </CardDescription>
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
            内部部件（不用手写，但改样式时会用到这些 data-slot）
          </p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b text-left">
                  <th class="py-2 pr-4 font-medium">
                  部件
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
                <tr v-for="row in partRows" :key="row.name" class="border-b last:border-0">
                  <td class="py-2 pr-4 align-top">
                    <code>{{ row.name }}</code>
                  </td>
                  <td class="py-2 pr-4 align-top text-muted-foreground">
                    <code>{{ row.slot }}</code>
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
