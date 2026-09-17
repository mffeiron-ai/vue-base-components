<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Kbd } from '@/components/ui/kbd'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar'
import {
  Check,
  Copy,
  Download,
  FileText,
  FolderOpen,
  Save,
  Scissors,
  Settings,
  Trash2,
  Undo2,
  User,
} from 'lucide-vue-next'

// ---------- 演示状态 ----------
/** 最近执行的动作 */
const lastAction = ref('（还没选过）')
/** 勾选项 */
const showSidebar = ref(true)
const showMinimap = ref(false)
/** 单选组 */
const theme = ref('system')
/** 最近打开的文件（子菜单 + setTimeout 演示） */
const recents = ['组件文档.md', 'Button.vue', 'registry.ts']

function run(label: string) {
  lastAction.value = label
}

// ---------- API ----------
const rootRows = [
  { name: 'v-model', type: "'' | 'menu'", def: '—', desc: '整体展开状态（可受控）；一般不传' },
  { name: 'loop / dir', type: 'boolean / string', def: 'false / —', desc: '方向键到两端是否循环；书写方向' },
  { name: 'class', type: 'string', def: '—', desc: '容器类名；高度 / 圆角由预设的 <code>[data-slot="menubar"]</code> 管着，要改需带 <code>!</code>' },
]

const partRows = [
  { name: 'MenubarMenu', slot: 'menubar-menu', desc: '一个菜单（Trigger + Content 的容器），<b>只提供上下文不渲染节点</b>；两者必须放同一个 Menu 里' },
  { name: 'MenubarTrigger', slot: 'menubar-trigger', desc: '栏上的标题；聚焦 / 展开时底色变 accent' },
  { name: 'MenubarContent', slot: 'menubar-content', desc: '下拉面板（Portal）；默认 align=start、alignOffset=-4、sideOffset=8、min-w-[12rem]' },
  { name: 'MenubarItem', slot: 'menubar-item', desc: '菜单项：<code>inset</code> 左缩进、<code>variant="destructive"</code> 危险色、<code>@select</code> / <code>@select.prevent</code>' },
  { name: 'MenubarCheckboxItem', slot: 'menubar-checkbox-item', desc: '可勾选项（<code>v-model</code>）；标记固定在左侧左 2，可用 <code>#indicator-icon</code> 换图标' },
  { name: 'MenubarRadioGroup / RadioItem', slot: 'menubar-radio-group / -radio-item', desc: '单选组与单选项；RadioItem 必须放在 RadioGroup 内' },
  { name: 'MenubarSub / SubTrigger / SubContent', slot: 'menubar-sub / -sub-trigger / -sub-content', desc: '二级菜单；SubTrigger 自带右侧箭头，SubContent 更窄（min-w-[8rem]）阴影更重' },
  { name: 'MenubarGroup / Label / Separator / Shortcut', slot: '对应 -group / -label / -separator / -shortcut', desc: '分组 / 小标题（<code>inset</code> 对齐）/ 分隔线 / 右侧快捷键提示（纯展示，不注册快捷键）' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Menubar 菜单栏</h1>
    <p class="mt-3 text-muted-foreground">
      桌面应用风格的<b>横向菜单栏</b>：一排 <code>MenubarMenu</code>，每个里放
      <code>MenubarTrigger</code>（栏上标题）+ <code>MenubarContent</code>（下拉面板）。<br />
      面板里的部件与 <code>DropdownMenu</code> <b>一一对应</b>（Item / CheckboxItem /
      RadioItem / SubTrigger / Separator / Shortcut / Label），用法完全一致。<br />
      特点是「菜单栏手感」：同一时刻只展开一个菜单，面板开着时把指针移到相邻标题上会自动切换。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          点击任一标题展开；展开状态下把鼠标横着移到旁边标题，会自动切过去。
          下面所有项点完都会记到「最近执行」。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>文件</MenubarTrigger>
            <MenubarContent>
              <MenubarItem @select="run('新建文件')">
                <FileText />
                新建文件
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem @select="run('打开…')">
                <FolderOpen />
                打开…
                <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>最近打开</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem v-for="f in recents" :key="f" @select="run(`打开 ${f}`)">
                    {{ f }}
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem @select="run('保存')">
                <Save />
                保存
                <MenubarShortcut>⌘S</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>编辑</MenubarTrigger>
            <MenubarContent>
              <MenubarItem @select="run('撤销')">
                <Undo2 />
                撤销
                <MenubarShortcut>⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled @select="run('重做（本该禁用）')">
                重做
                <MenubarShortcut>⇧⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem @select="run('剪切')">
                <Scissors />
                剪切
                <MenubarShortcut>⌘X</MenubarShortcut>
              </MenubarItem>
              <MenubarItem @select="run('复制')">
                <Copy />
                复制
                <MenubarShortcut>⌘C</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem variant="destructive" @select="run('删除')">
                <Trash2 />
                删除
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>视图</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem v-model="showSidebar">
                显示侧边栏
              </MenubarCheckboxItem>
              <MenubarCheckboxItem v-model="showMinimap">
                显示缩略图
              </MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarRadioGroup v-model="theme">
                <MenubarLabel>主题</MenubarLabel>
                <MenubarRadioItem value="light" @select="run('主题：浅色')">浅色</MenubarRadioItem>
                <MenubarRadioItem value="dark" @select="run('主题：深色')">深色</MenubarRadioItem>
                <MenubarRadioItem value="system" @select="run('主题：跟随系统')">跟随系统</MenubarRadioItem>              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>帮助</MenubarTrigger>
            <MenubarContent>
              <MenubarItem @select="run('文档')">文档</MenubarItem>
              <MenubarItem @select="run('快捷键一览')">
                快捷键一览
                <MenubarShortcut>⌘/</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <p class="text-sm text-muted-foreground">
          最近执行：<Badge variant="secondary">{{ lastAction }}</Badge>
        </p>
      </CardContent>
    </Card>

    <!-- 2. 勾选与单选 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">勾选项与单选组</h2>
        <CardDescription>
          <code>MenubarCheckboxItem</code> 用 <code>v-model</code>（可多选）；
          <code>MenubarRadioItem</code> 必须包在 <code>MenubarRadioGroup</code> 里（互斥）。<br />
          标记固定在<b>左侧</b>（项带 <code>pl-8</code> 留位），可用
          <code>#indicator-icon</code> 插槽换图标。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-3 text-sm">
          <span class="text-muted-foreground">当前状态：</span>
          <code>侧边栏={{ showSidebar }}</code>
          <code>缩略图={{ showMinimap }}</code>
          <code>主题={{ theme }}</code>
        </div>
        <Menubar class="w-fit">
          <MenubarMenu>
            <MenubarTrigger>视图</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem v-model="showSidebar">
                显示侧边栏
              </MenubarCheckboxItem>
              <MenubarCheckboxItem v-model="showMinimap">
                显示缩略图
              </MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarRadioGroup v-model="theme">
                <MenubarLabel>主题</MenubarLabel>
                <MenubarRadioItem value="light">浅色</MenubarRadioItem>
                <MenubarRadioItem value="dark">深色</MenubarRadioItem>
                <MenubarRadioItem value="system">跟随系统</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </CardContent>
    </Card>

    <!-- 3. inset 对齐 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">inset：和带标记的项对齐</h2>
        <CardDescription>
          没标记的项（普通 Item / Label）加上 <code>inset</code> 后会左缩进 <code>pl-8</code>，
          与勾选项的文字起点对齐 —— 不写的话会明显错开一截。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap gap-8">
        <div class="space-y-2">
          <p class="text-sm font-medium">不加 inset（错位）</p>
          <Menubar class="w-fit">
            <MenubarMenu>
              <MenubarTrigger>编辑</MenubarTrigger>
              <MenubarContent>
                <MenubarCheckboxItem :model-value="true">自动换行</MenubarCheckboxItem>
                <MenubarItem>查找替换</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
        <div class="space-y-2">
          <p class="text-sm font-medium">加 inset（对齐）</p>
          <Menubar class="w-fit">
            <MenubarMenu>
              <MenubarTrigger>编辑</MenubarTrigger>
              <MenubarContent>
                <MenubarCheckboxItem :model-value="true">自动换行</MenubarCheckboxItem>
                <MenubarItem inset>查找替换</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 分组 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">分组：Group / Label / Separator</h2>
        <CardDescription>
          <code>MenubarGroup</code> 只管语义（读屏会念出分组），视觉上的分隔靠
          <code>MenubarSeparator</code>；<code>MenubarLabel</code> 是组标题，它也支持
          <code>inset</code>。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Menubar class="w-fit">
          <MenubarMenu>
            <MenubarTrigger>账户</MenubarTrigger>
            <MenubarContent class="w-56">
              <MenubarLabel>陈可</MenubarLabel>
              <MenubarLabel class="text-muted-foreground text-xs font-normal">
                chenke@example.com
              </MenubarLabel>
              <MenubarSeparator />
              <MenubarGroup>
                <MenubarItem @select="run('个人资料')">
                  <User />
                  个人资料
                </MenubarItem>
                <MenubarItem @select="run('偏好设置')">
                  <Settings />
                  偏好设置
                </MenubarItem>
              </MenubarGroup>
              <MenubarSeparator />
              <MenubarItem inset variant="destructive" @select="run('退出登录')">
                退出登录
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </CardContent>
    </Card>

    <!-- 5. 键盘 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">键盘操作</h2>
        <CardDescription>菜单栏自带完整键盘支持，不用自己写。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-2 text-sm text-muted-foreground">
        <p>· <Kbd>Alt</Kbd> 或 <Kbd>F10</Kbd>：聚焦菜单栏，再按左右键在标题间移动</p>
        <p>· 面板打开时 <Kbd>←</Kbd> / <Kbd>→</Kbd>：直接切到相邻菜单（不用先关）</p>
        <p>· <Kbd>↑</Kbd> / <Kbd>↓</Kbd>：在面板内移动高亮，<Kbd>→</Kbd> 展开子菜单</p>
        <p>· <Kbd>Enter</Kbd> / <Kbd>Space</Kbd> 选中，<Kbd>Esc</Kbd> 关闭并回到标题</p>
        <p class="pt-2">
          注意：<code>MenubarShortcut</code> 只是<b>显示</b>快捷键，不会注册；
          真正的全局快捷键要自己监听 <code>keydown</code>。
        </p>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>15 个组件，都是 reka-ui 的薄封装，props 基本原样透传。</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">Menubar</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rootRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">子组件</th>
                <th class="py-2 pr-4 font-medium">data-slot</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in partRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 align-top text-muted-foreground"><code>{{ row.slot }}</code></td>
                <td class="py-2 text-muted-foreground" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
