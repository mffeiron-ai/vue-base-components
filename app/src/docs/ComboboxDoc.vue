<script setup lang="ts">
import { ref } from 'vue'
import { Check, ChevronsUpDown, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxCancel,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxViewport,
} from '@/components/ui/combobox'
import { Separator } from '@/components/ui/separator'

// ---------- 1. 基础用法：单选 + 搜索 ----------
const frameworks = [
  { value: 'next', label: 'Next.js' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
]
const pickedFramework = ref<(typeof frameworks)[number]>()

// ---------- 2. 分组与分隔线 ----------
const stackGroups = [
  { heading: '前端框架', items: ['Vue', 'React', 'Svelte'] },
  { heading: '后端语言', items: ['Go', 'Rust', 'Java'] },
  { heading: '数据库', items: ['PostgreSQL', 'MySQL', 'SQLite'] },
]
const pickedStack = ref<{ group: string; name: string }>()

// ---------- 3. 多选（chips） ----------
const allTags = ['Vue', 'React', 'Svelte', 'Solid', 'Angular', 'Qwik', 'Preact', 'Astro']
const pickedTags = ref<{ label: string }[]>([])
function removeTag(label: string) {
  pickedTags.value = pickedTags.value.filter((t) => t.label !== label)
}

// ---------- 4. 空状态与禁用项 ----------
const roles = [
  { value: 'owner', label: '所有者（Owner）', desc: '全部权限' },
  { value: 'admin', label: '管理员（Admin）', desc: '可管理成员' },
  { value: 'member', label: '成员（Member）', desc: '暂不可选', disabled: true },
  { value: 'viewer', label: '只读（Viewer）', desc: '仅查看' },
]
const pickedRole = ref<(typeof roles)[number]>()

// ---------- 5. 受控展开 / 外部操作 ----------
const controlledOpen = ref(false)
const pickedEnv = ref<{ label: string }>()
const envs = ['开发', '预发', '生产'].map((label) => ({ label }))

// ---------- 6. 长列表 + 滚动视口 ----------
const cities = Array.from({ length: 30 }, (_, i) => ({
  value: `city-${i + 1}`,
  label: `城市 ${String(i + 1).padStart(2, '0')}`,
}))
const pickedCity = ref<(typeof cities)[number]>()

// ---------- API ----------
const rootRows = [
  { name: 'modelValue', type: 'any | any[]', def: '—', desc: '选中项的 value；multiple 时为数组，用 v-model 绑定' },
  { name: 'by', type: 'string | fn', def: '—', desc: 'value 是对象时声明比较 / 回显字段，如 by="label"' },
  { name: 'multiple', type: 'boolean', def: 'false', desc: '多选，modelValue 变成数组，点击已选项可取消' },
  { name: 'open', type: 'boolean', def: '—', desc: '受控展开状态，支持 v-model:open；defaultOpen 设初始值' },
  { name: 'disabled', type: 'boolean', def: 'false', desc: '整体禁用：触发器不可点也不可聚焦' },
  { name: 'resetSearchTermOnBlur', type: 'boolean', def: 'true', desc: '失焦时清空搜索词（想保留搜索内容可关掉）' },
  { name: 'resetSearchTermOnSelect', type: 'boolean', def: 'true', desc: '选中后清空搜索词（多选时可按需关掉）' },
  { name: 'openOnFocus / openOnClick', type: 'boolean', def: 'false', desc: '聚焦 / 点击时自动展开（默认只点触发器才展开）' },
  { name: 'ignoreFilter', type: 'boolean', def: 'false', desc: '关掉内置过滤（搜索框只做输入，不过滤选项）' },
  { name: 'resetModelValueOnClear', type: 'boolean', def: 'false', desc: '配合 ComboboxCancel：点清空时连选中值一起清掉' },
  { name: 'highlightOnHover', type: 'boolean', def: 'true', desc: '鼠标划过即高亮（键盘高亮与它共用同一状态）' },
  { name: 'dir / name / required', type: 'string | boolean', def: '—', desc: '书写方向、表单字段名、是否必填（配合表单提交）' },
]

const partRows = [
  { name: 'ComboboxAnchor', type: 'as-child', def: 'false', desc: '弹出层定位锚点，as-child 包住触发器后下拉框宽度 = 触发器宽度' },
  { name: 'ComboboxTrigger', type: 'as-child', def: 'false', desc: '开关下拉框；未套 as-child 时带 data-slot="combobox-trigger"，套了则主动让位给子元素，避免把 Button 的预设样式盖掉' },
  { name: 'ComboboxCancel', type: 'reka 原语', def: '—', desc: '清空搜索词的小按钮，样式自备（本库未定制）' },
  { name: 'ComboboxList', type: 'position / align / sideOffset', def: 'popper / center / 4', desc: 'Portal 弹出层，等于 ComboboxContent；宽度取锚点宽度，带 group/combobox-content' },
  { name: 'ComboboxInput', type: 'placeholder / v-model', def: '—', desc: '搜索框，reka 内部自动过滤 + 高亮命中；沿用 Command 的 data-slot 样式' },
  { name: 'ComboboxEmpty', type: 'class', def: '—', desc: '无匹配项时显示，靠 group-data-empty/combobox-content:flex 显隐' },
  { name: 'ComboboxGroup', type: 'heading', def: '—', desc: '分组，heading 会自动渲染 ComboboxLabel 小标题（本地便捷 prop）' },
  { name: 'ComboboxSeparator', type: 'class', def: '—', desc: '分组之间的 1px 分隔线' },
  { name: 'ComboboxItem', type: 'value / disabled', def: '—', desc: '单个选项，value 必填；长文本可省略号截断' },
  { name: 'ComboboxItemIndicator', type: 'class', def: '—', desc: '选中标记（只在选中时渲染），绝对定位在选项右侧' },
  { name: 'ComboboxViewport', type: 'class', def: '—', desc: '可选滚动视口：超出 max-h（默认 300px）滚动，或配合 ComboboxVirtualizer 做虚拟滚动；改高用 max-h-*，不用 h-*' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Combobox 组合框</h1>
    <p class="mt-3 text-muted-foreground">
      可搜索的下拉选择框，基于 <code>reka-ui</code> 的 <code>ComboboxRoot</code> 封装。
      搜索框输入的内容由 reka 自己维护并自动过滤选项，键盘、aria、受控状态都是现成的；
      打开后是 Portal 弹出层，宽度跟随触发器。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>Combobox</code>（选中值 + 展开状态）→ <code>ComboboxAnchor</code> /
          <code>ComboboxTrigger</code>（触发器）→ <code>ComboboxList</code>（弹出层，里面是搜索框和选项）。
          选项是对象时用 <code>by="label"</code> 告诉它拿哪个字段做比较与回显。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Combobox v-model="pickedFramework" by="label">
          <ComboboxAnchor as-child>
            <ComboboxTrigger as-child>
              <Button variant="outline" class="w-[220px] justify-between font-normal">
                {{ pickedFramework?.label ?? '选择一个框架…' }}
                <ChevronsUpDown class="opacity-50" />
              </Button>
            </ComboboxTrigger>
          </ComboboxAnchor>

          <ComboboxList>
            <ComboboxInput placeholder="搜索框架…" />
            <ComboboxEmpty>没有找到匹配的框架。</ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxItem
                v-for="f in frameworks"
                :key="f.value"
                :value="f"
              >
                <span class="flex flex-1 gap-2">{{ f.label }}</span>
                <ComboboxItemIndicator>
                  <Check />
                </ComboboxItemIndicator>
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>

        <p class="text-sm text-muted-foreground">
          当前选中：<code>{{ pickedFramework?.label ?? '（空）' }}</code>
          <template v-if="pickedFramework">（value 是对象，整条记录都在 modelValue 里）</template>
        </p>
      </CardContent>
    </Card>

    <!-- 2. 分组与分隔线 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">分组、小标题与分隔线</h2>
        <CardDescription>
          <code>ComboboxGroup</code> 传 <code>heading</code> 会自动渲染一个小标题（等价于手写
          <code>ComboboxLabel</code>）；组与组之间用 <code>ComboboxSeparator</code> 划线。
          搜索时没命中的分组会连标题一起收起，只留命中的那一组。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Combobox v-model="pickedStack" by="name">
          <ComboboxAnchor as-child>
            <ComboboxTrigger as-child>
              <Button variant="outline" class="w-[220px] justify-between font-normal">
                {{ pickedStack ? `${pickedStack.group} · ${pickedStack.name}` : '选择技术栈…' }}
                <ChevronsUpDown class="opacity-50" />
              </Button>
            </ComboboxTrigger>
          </ComboboxAnchor>

          <ComboboxList>
            <ComboboxInput placeholder="搜索技术栈…" />
            <ComboboxEmpty>没有找到匹配的技术栈。</ComboboxEmpty>
            <template v-for="(g, gi) in stackGroups" :key="g.heading">
              <ComboboxSeparator v-if="gi > 0" />
              <ComboboxGroup :heading="g.heading">
                <ComboboxItem
                  v-for="name in g.items"
                  :key="name"
                  :value="{ group: g.heading, name }"
                >
                  <span class="flex flex-1 gap-2">{{ name }}</span>
                  <ComboboxItemIndicator>
                    <Check />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              </ComboboxGroup>
            </template>
          </ComboboxList>
        </Combobox>

        <p class="text-sm text-muted-foreground">
          试试输入 <code>vue</code> 或 <code>sql</code>：跨组命中，并且标题不会跟着被过滤掉。
        </p>
      </CardContent>
    </Card>

    <!-- 3. 多选 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">多选与 chips</h2>
        <CardDescription>
          加 <code>multiple</code> 后 <code>v-model</code> 变成数组，再次点击已选项即取消。
          触发器这里换成 chips 容器（<code>cn-combobox-chips</code>，预设里就是给这种场景准备的钩子），
          每个 chip 自带删除按钮 —— 点击时记得 <code>.stop</code>，否则会顺带把下拉框开关一次。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Combobox v-model="pickedTags" by="label" multiple>
          <ComboboxAnchor as-child>
            <ComboboxTrigger as-child>
              <div class="cn-combobox-chips w-full max-w-[380px] cursor-pointer">
                <span
                  v-for="t in pickedTags"
                  :key="t.label"
                  class="cn-combobox-chip"
                >
                  {{ t.label }}
                  <button
                    type="button"
                    class="cn-combobox-chip-remove"
                    :aria-label="`移除 ${t.label}`"
                    @pointerdown.stop
                    @click.stop="removeTag(t.label)"
                  >
                    <X class="size-3" />
                  </button>
                </span>
                <span v-if="!pickedTags.length" class="px-1 text-muted-foreground">
                  选择技术栈（可多选）…
                </span>
              </div>
            </ComboboxTrigger>
          </ComboboxAnchor>

          <ComboboxList>
            <ComboboxInput placeholder="搜索标签…" />
            <ComboboxEmpty>没有匹配的标签。</ComboboxEmpty>
            <ComboboxItem
              v-for="t in allTags"
              :key="t"
              :value="{ label: t }"
            >
              <span class="flex flex-1 gap-2">{{ t }}</span>
              <ComboboxItemIndicator>
                <Check />
              </ComboboxItemIndicator>
            </ComboboxItem>
          </ComboboxList>
        </Combobox>

        <p class="text-sm text-muted-foreground">
          已选 <Badge variant="secondary">{{ pickedTags.length }}</Badge> 项：
          <code>{{ pickedTags.map((t) => t.label).join(', ') || '（空）' }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 4. 空状态与禁用项 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">空状态与禁用项</h2>
        <CardDescription>
          没有命中时 <code>ComboboxEmpty</code> 会出现（选项列表同时变成
          <code>data-empty</code>，内边距会自动收紧）；<code>ComboboxItem</code> 传
          <code>disabled</code> 就不可选（<code>data-disabled</code> + 半透明 + 屏蔽指针），
          键盘上下也会直接跳过它。打开后输入 <code>zzz</code> 试试。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Combobox v-model="pickedRole" by="label">
          <ComboboxAnchor as-child>
            <ComboboxTrigger as-child>
              <Button variant="outline" class="w-[220px] justify-between font-normal">
                {{ pickedRole?.label ?? '选择角色…' }}
                <ChevronsUpDown class="opacity-50" />
              </Button>
            </ComboboxTrigger>
          </ComboboxAnchor>

          <ComboboxList>
            <ComboboxInput placeholder="搜索角色…" />
            <ComboboxEmpty>没有这个角色，换个词试试。</ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxItem
                v-for="r in roles"
                :key="r.value"
                :value="r"
                :disabled="r.disabled"
              >
                <span class="flex flex-1 flex-col items-start">
                  <span>{{ r.label }}</span>
                  <span class="text-xs text-muted-foreground">{{ r.desc }}</span>
                </span>
                <ComboboxItemIndicator>
                  <Check />
                </ComboboxItemIndicator>
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>

        <p class="text-sm text-muted-foreground">
          搜索词由 reka 内部维护（失焦默认会被清空）；不要在挂载前从外部塞值，
          因为输入框挂载时会用内部状态覆写一次，注入的值会被抹掉。
        </p>

        <p class="text-sm text-muted-foreground">
          当前选中：<code>{{ pickedRole?.label ?? '（空）' }}</code>
        </p>
      </CardContent>
    </Card>

    <!-- 5. 受控展开 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控展开与外部操作</h2>
        <CardDescription>
          用 <code>v-model:open</code> 可以把展开状态交给自己管，外部按钮也能开关；
          列表顶部的 <code>ComboboxCancel</code> 负责清空搜索词（想让「清空」连选中值一起清掉，
          在 <code>Combobox</code> 上加 <code>reset-model-value-on-clear</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <Button size="sm" @click="controlledOpen = !controlledOpen">
            {{ controlledOpen ? '收起' : '展开' }}
          </Button>
          <span class="text-sm text-muted-foreground">
            状态：<Badge :variant="controlledOpen ? 'default' : 'secondary'">
              {{ controlledOpen ? '展开' : '收起' }}
            </Badge>
          </span>
        </div>

        <Combobox v-model="pickedEnv" v-model:open="controlledOpen" by="label">
          <ComboboxAnchor as-child>
            <ComboboxTrigger as-child>
              <Button variant="outline" class="w-[220px] justify-between font-normal">
                {{ pickedEnv?.label ?? '选择环境…' }}
                <ChevronsUpDown class="opacity-50" />
              </Button>
            </ComboboxTrigger>
          </ComboboxAnchor>

          <ComboboxList>
            <ComboboxInput placeholder="搜索环境…" />
            <div class="px-3 pb-2">
              <ComboboxCancel class="text-xs text-muted-foreground underline underline-offset-2">
                清空搜索词
              </ComboboxCancel>
            </div>
            <ComboboxEmpty>没有这个环境。</ComboboxEmpty>
            <ComboboxItem
              v-for="e in envs"
              :key="e.label"
              :value="e"
            >
              <span class="flex flex-1 gap-2">{{ e.label }}</span>
              <ComboboxItemIndicator>
                <Check />
              </ComboboxItemIndicator>
            </ComboboxItem>
          </ComboboxList>
        </Combobox>
      </CardContent>
    </Card>

    <!-- 6. 长列表 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">长列表与滚动视口</h2>
        <CardDescription>
          <code>ComboboxList</code> 自带最大高度与滚动，几十条直接用就行；
          想要固定高度的滚动区域、或者准备接 <code>ComboboxVirtualizer</code> 做虚拟滚动时，
          才需要显式套一层 <code>ComboboxViewport</code>（把搜索框留在视口外面）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Combobox v-model="pickedCity" by="label">
          <ComboboxAnchor as-child>
            <ComboboxTrigger as-child>
              <Button variant="outline" class="w-[220px] justify-between font-normal">
                {{ pickedCity?.label ?? '选择城市…' }}
                <ChevronsUpDown class="opacity-50" />
              </Button>
            </ComboboxTrigger>
          </ComboboxAnchor>

          <ComboboxList>
            <ComboboxInput placeholder="搜索城市…" />
            <ComboboxEmpty>没有找到城市。</ComboboxEmpty>
            <ComboboxViewport class="p-1">              <ComboboxItem
                v-for="c in cities"
                :key="c.value"
                :value="c"
              >
                <span class="flex flex-1 gap-2">{{ c.label }}</span>
                <ComboboxItemIndicator>
                  <Check />
                </ComboboxItemIndicator>
              </ComboboxItem>
            </ComboboxViewport>
          </ComboboxList>
        </Combobox>

        <Separator />

        <p class="text-sm text-muted-foreground">
          30 条数据：搜索框固定在顶部，滚动只发生在视口里。
          视口高度由 <code>max-h-*</code> 决定（组件默认 300px），想矮一点就传
          <code>max-h-40</code>；传 <code>h-*</code> 不会生效——它在内容层里是 flex
          子项，会被拉伸。
        </p>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription>
          所有组件都是 reka-ui 的薄封装，props 原样透传；本库额外补了
          <code>data-slot</code> 钩子、<code>ComboboxGroup</code> 的 <code>heading</code>
          便捷 prop，以及弹出层上的 <code>group/combobox-content</code>（空状态显隐靠它）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <p class="mb-2 text-sm font-medium">Combobox</p>
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
                <tr v-for="r in rootRows" :key="r.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ r.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ r.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-2 text-sm text-muted-foreground">
            事件：<code>update:modelValue</code>（选中值）、<code>update:open</code>（展开）；
            默认插槽透出 root 的状态，便于自绘触发器。
          </p>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">其余部件</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">组件</th>
                  <th class="px-4 py-2 font-medium">关键 prop</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in partRows" :key="r.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ r.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.type }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ r.def }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ r.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-2 text-sm text-muted-foreground">
            预设（style-*.css）里的钩子：<code>combobox-item</code>、
            <code>combobox-item-indicator</code>、<code>combobox-empty</code>、
            <code>combobox-list</code>、<code>combobox-separator</code>、
            <code>combobox-trigger</code>，以及 chips 用的 <code>cn-combobox-chips</code> /
            <code>cn-combobox-chip</code> / <code>cn-combobox-chip-remove</code>。
            另外搜索框沿用了 Command 的 <code>command-input-wrapper</code> /
            <code>command-input</code> 两个 data-slot 名，因为它们在一处定义、两个组件共用。
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
