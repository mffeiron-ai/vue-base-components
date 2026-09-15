<script setup lang="ts">
import { ref } from 'vue'
import {
  Calculator,
  Calendar as CalendarIcon,
  Copy,
  CreditCard,
  FileText,
  LogOut,
  Redo2,
  Scissors,
  Settings,
  Smile,
  Trash2,
  Undo2,
  User,
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Kbd } from '@/components/ui/kbd'

// ---------- 1. 基础用法 ----------
const lastRun = ref<string>('（还没执行过）')

// ---------- 2. 分组与快捷键 ----------
const fileCommands = [
  { label: '新建文件', shortcut: '⌘N', icon: FileText, run: () => run('新建文件') },
  { label: '打开文件', shortcut: '⌘O', icon: FileText, run: () => run('打开文件') },
  { label: '保存', shortcut: '⌘S', icon: FileText, run: () => run('保存') },
  { label: '另存为', shortcut: '⇧⌘S', icon: FileText, run: () => run('另存为') },
]
const editCommands = [
  { label: '撤销', shortcut: '⌘Z', icon: Undo2, run: () => run('撤销') },
  { label: '重做', shortcut: '⇧⌘Z', icon: Redo2, run: () => run('重做（示例里禁用）'), disabled: true },
  { label: '剪切', shortcut: '⌘X', icon: Scissors, run: () => run('剪切') },
  { label: '复制', shortcut: '⌘C', icon: Copy, run: () => run('复制') },
]
const viewCommands = [
  { label: '切换主题', shortcut: '', icon: Settings, run: () => run('切换主题') },
  { label: '退出登录', shortcut: '', icon: LogOut, run: () => run('退出登录') },
]

function run(label: string) {
  lastRun.value = label
}

// ---------- 3. 无分组 / 短列表 ----------
const plainCommands = [
  { label: '个人资料', icon: User, hint: '查看与编辑账户信息' },
  { label: '账单', icon: CreditCard, hint: '发票、订阅与支付方式' },
  { label: '设置', icon: Settings, hint: '偏好设置' },
  { label: '计算器', icon: Calculator, hint: '示例：打开计算器' },
]

// ---------- 4. 长列表滚动 ----------
const manyCommands = Array.from({ length: 30 }, (_, i) => `命令 ${String(i + 1).padStart(2, '0')}`)

// ---------- 5. 命令面板（弹窗） ----------
const paletteOpen = ref(false)
const greeting = ref('（未选择）')
const paletteCommands = [
  { label: '日历', icon: CalendarIcon, run: () => (greeting.value = '打开日历', paletteOpen.value = false) },
  { label: '表情', icon: Smile, run: () => (greeting.value = '打开表情', paletteOpen.value = false) },
  { label: '回收站', icon: Trash2, run: () => (greeting.value = '打开回收站', paletteOpen.value = false) },
  { label: '个人资料', icon: User, run: () => (greeting.value = '打开个人资料', paletteOpen.value = false) },
]

// ---------- API ----------
const rootRows = [
  { name: 'v-model(modelValue)', type: 'string', def: '""', desc: 'Listbox 的高亮项（键盘上下选中的那个），不是搜索词' },
  { name: 'orientation', type: "'vertical' | 'horizontal'", def: "'vertical'", desc: '透传 ListboxRoot，决定方向键如何移动高亮' },
  { name: 'dir / disabled', type: 'string | boolean', def: '—', desc: '书写方向 / 整体禁用（透传 ListboxRoot）' },
  { name: 'class', type: 'string', def: '—', desc: '面板外框：预设会给 [data-slot="command"] 补 bg-popover / p-1 / 圆角' },
]

const partRows = [
  { name: 'CommandDialog', type: 'open / title / description', def: '—', desc: '弹窗形态（内部已包含 Command）；title/description 默认 sr-only，建议传中文；圆角由预设的 .cn-command-dialog 控制' },
  { name: 'CommandInput', type: 'placeholder / auto-focus', def: 'true(聚焦)', desc: '搜索框，输入即触发过滤；搜索词由内部管理，不要外部 v-model 注入' },
  { name: 'CommandList', type: 'class', def: '—', desc: '选项容器，自带 max-h-[300px] 滚动（预设再加 max-h-72 + 隐藏滚动条）' },
  { name: 'CommandEmpty', type: 'class', def: '—', desc: '空结果提示，只在「有搜索词且命中 0」时渲染' },
  { name: 'CommandGroup', type: 'heading', def: '—', desc: '分组，heading 会渲染成小标题；组内无命中时整组隐藏' },
  { name: 'CommandItem', type: 'value / disabled / @select', def: '—', desc: '可执行项，过滤依据是它的文本；选中后自动清空搜索词' },
  { name: 'CommandSeparator', type: 'class', def: '—', desc: '分隔线' },
  { name: 'CommandShortcut', type: 'class', def: '—', desc: '右侧快捷键提示（纯展示，且会被计入搜索文本）' },
]
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Command 命令面板</h1>
    <p class="mt-3 text-muted-foreground">
      cmdk 风格的命令面板，底层是 <code>reka-ui</code> 的 <code>ListboxRoot</code>，
      但过滤逻辑由本库自己实现：每个选项挂载时把文本登记上来，输入搜索词后逐项打分，
      没命中的选项直接卸载、没命中的整组隐藏。键盘上下 + 回车、aria 语义复用 Listbox。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          <code>Command</code>（状态 + 过滤）→ <code>CommandList</code>（容器）里依次放
          <code>CommandInput</code> / <code>CommandGroup</code> / <code>CommandSeparator</code> /
          <code>CommandEmpty</code>。点一项试试：右上角会记录刚执行的命令，搜索框也会自动清空。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Command class="rounded-lg border border-input shadow-sm">
          <CommandInput placeholder="输入命令或搜索…" />
          <CommandList>
            <CommandEmpty>没有找到匹配的命令。</CommandEmpty>

            <CommandGroup heading="文件">
              <CommandItem
                v-for="c in fileCommands"
                :key="c.label"
                :value="c.label"
                @select="c.run()"
              >
                <component :is="c.icon" />
                <span>{{ c.label }}</span>
                <CommandShortcut>{{ c.shortcut }}</CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="编辑">
              <CommandItem
                v-for="c in editCommands"
                :key="c.label"
                :value="c.label"
                :disabled="c.disabled"
                @select="c.run()"
              >
                <component :is="c.icon" />
                <span>{{ c.label }}</span>
                <CommandShortcut>{{ c.shortcut }}</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>

        <p class="text-sm text-muted-foreground">
          最近执行：<Badge variant="secondary">{{ lastRun }}</Badge>
          <span class="ml-2">（「重做」是禁用项：不会高亮，回车会跳过）</span>
        </p>
      </CardContent>
    </Card>

    <!-- 2. 搜索与分组过滤 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">搜索时分组会整体收起</h2>
        <CardDescription>
          过滤依据是选项的文本（含快捷键提示文字），命中数会实时反映到空状态上。
          下面输入 <code>保存</code>：只剩「文件」组；输入 <code>⌘C</code>：只剩「复制」。
          不存在的词（如 <code>zzz</code>）会看到空状态。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <Command class="rounded-lg border border-input shadow-sm">
          <CommandInput placeholder="试试输入 保存 / ⇧Z / zzz…" />
          <CommandList>
            <CommandEmpty>没有匹配项，换个词试试。</CommandEmpty>

            <CommandGroup heading="文件">
              <CommandItem v-for="c in fileCommands" :key="c.label" :value="c.label">
                <component :is="c.icon" />
                <span>{{ c.label }}</span>
                <CommandShortcut>{{ c.shortcut }}</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="编辑">
              <CommandItem v-for="c in editCommands" :key="c.label" :value="c.label" :disabled="c.disabled">
                <component :is="c.icon" />
                <span>{{ c.label }}</span>
                <CommandShortcut>{{ c.shortcut }}</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="其他">
              <CommandItem v-for="c in viewCommands" :key="c.label" :value="c.label">
                <component :is="c.icon" />
                <span>{{ c.label }}</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CardContent>
    </Card>

    <!-- 3. 无分组 + 描述文字 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">不分组、带说明的列表</h2>
        <CardDescription>
          不套 <code>CommandGroup</code> 也能用，适合扁平的命令列表；选项里可以放图标、
          两行文字（用 <code>flex flex-col</code>）。<code>CommandEmpty</code> 仍然生效。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Command class="rounded-lg border border-input shadow-sm">
          <CommandInput placeholder="搜索设置项…" />
          <CommandList>
            <CommandEmpty>没有这个设置项。</CommandEmpty>
            <CommandGroup>
              <CommandItem
                v-for="c in plainCommands"
                :key="c.label"
                :value="c.label"
                @select="run(c.label)"
              >
                <component :is="c.icon" />
                <span class="flex flex-col">
                  <span>{{ c.label }}</span>
                  <span class="text-muted-foreground text-xs">{{ c.hint }}</span>
                </span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CardContent>
    </Card>

    <!-- 4. 长列表 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">长列表滚动</h2>
        <CardDescription>
          <code>CommandList</code> 自带最大高度（约 300px）与滚动，搜索框固定在上方，
          键盘上下会自动滚到高亮项。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Command class="rounded-lg border border-input shadow-sm">
          <CommandInput placeholder="搜索命令…" />
          <CommandList>
            <CommandEmpty>没有匹配的命令。</CommandEmpty>
            <CommandGroup>
              <CommandItem
                v-for="c in manyCommands"
                :key="c"
                :value="c"
                @select="run(c)"
              >
                <span>{{ c }}</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CardContent>
    </Card>

    <!-- 5. 命令面板 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">命令面板（弹窗形态）</h2>
        <CardDescription>
          用 <code>CommandDialog</code> 包一层即可，它内部已经放了 <code>Command</code>，
          所以插槽里只写 <code>CommandInput</code> + <code>CommandList</code>。
          打开时输入框会自动聚焦；Esc 关闭；标题/描述默认只给读屏，可传中文。
          内容层带 <code>cn-command-dialog</code> 类，圆角由预设统一控制。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <Button variant="outline" @click="paletteOpen = true">
            打开命令面板
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </Button>
          <span class="text-sm text-muted-foreground">
            结果：<code>{{ greeting }}</code>
          </span>
        </div>

        <CommandDialog v-model:open="paletteOpen" title="命令面板" description="输入命令或搜索内容">
          <CommandInput placeholder="输入命令或搜索…" />
          <CommandList>
            <CommandEmpty>没有找到匹配项。</CommandEmpty>
            <CommandGroup heading="建议">
              <CommandItem
                v-for="c in paletteCommands"
                :key="c.label"
                :value="c.label"
                @select="c.run()"
              >
                <component :is="c.icon" />
                <span>{{ c.label }}</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        <p class="text-sm text-muted-foreground">
          全局快捷键（如真正的 ⌘K）需要自己监听 <code>keydown</code> 再设置
          <code>open = true</code>，组件不内置。
        </p>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription>
          部件都是 reka-ui 的薄封装，props 透传；过滤相关的状态藏在内部上下文里，
          只有面板内部组件能拿到。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div>
          <p class="mb-2 text-sm font-medium">Command</p>
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
            过滤规则固定为「忽略大小写的包含匹配」，没有暴露自定义 filterFunction；
            搜索词是内部状态（<code>filterState.search</code>），面板内部可通过
            <code>useCommand()</code> 读写。
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
            预设（style-*.css）里的钩子：<code>command</code>、<code>command-list</code>、
            <code>command-input</code> / <code>command-input-wrapper</code> /
            <code>command-input-icon</code>、<code>command-item</code>、
            <code>command-group</code>、<code>command-empty</code>、
            <code>command-separator</code>、<code>command-shortcut</code>，
            以及 <code>command-dialog</code>（CommandDialog 内容层带上了这个类）。
            分组小标题的钩子是 <code>command-group-heading</code>（组件输出的 data-slot 名，
            预设已从 cmdk 的 <code>[cmdk-group-heading]</code> 统一过来）。
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
