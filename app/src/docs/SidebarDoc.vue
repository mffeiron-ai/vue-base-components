<script setup lang="ts">
import { ref } from 'vue'
import {
  BarChart3,
  ChevronsUpDown,
  Folder,
  GalleryVerticalEnd,
  Home,
  LifeBuoy,
  MoreHorizontal,
  Plus,
  Send,
  Settings,
  Users,
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'

/* ── 演示数据 ── */
const nav = [
  { title: '总览', icon: Home, active: true },
  { title: '数据分析', icon: BarChart3, active: false },
  { title: '项目', icon: Folder, active: false },
  { title: '成员', icon: Users, active: false },
]
const nav2 = nav.map(n => ({ ...n, active: false }))
const nav3 = [
  { title: '总览', icon: Home, active: false },
  { title: '数据分析', icon: BarChart3, active: true },
  { title: '项目', icon: Folder, active: false },
]

/* ── 折叠模式 / 变体 / 方向 ── */
const collapsible = ref<'offcanvas' | 'icon' | 'none'>('offcanvas')
const variant = ref<'sidebar' | 'floating' | 'inset'>('sidebar')
const side = ref<'left' | 'right'>('left')

/* ── 受控开合 ── */
const controlledOpen = ref(true)

/* ── API 表 ── */
const providerRows = [
  { name: 'defaultOpen', type: 'boolean', def: '读 cookie', desc: '初始展开状态。默认读 cookie <code>sidebar_state</code>（不是 <code>false</code> 就展开），所以刷新后能记住上次的状态' },
  { name: 'v-model:open', type: 'boolean', def: '—', desc: '受控开合。不管受不受控，<b>每次切换都会写 cookie</b>（7 天有效），键名就是 <code>sidebar_state</code>' },
  { name: 'class', type: 'string', def: '—', desc: '外层包裹容器的 class。它自带 <code>flex min-h-svh w-full</code>，想在固定高度容器里用就得覆盖（见下面「嵌进卡片」的说明）' },
]

const sidebarRows = [
  { name: 'side', type: "'left' | 'right'", def: "'left'", desc: '面板贴哪一边。右侧时占位块的箭头方向会翻转（<code>group-data-[side=right]:rotate-180</code>）' },
  { name: 'variant', type: "'sidebar' | 'floating' | 'inset'", def: "'sidebar'", desc: '外观三档：<b>sidebar</b> 贴边、带一侧边框；<b>floating</b> 浮在背景上（圆角 + 外环 + 阴影）；<b>inset</b> 配合 <code>SidebarInset</code> 把主区嵌进去（主区四周留边距 + 圆角）' },
  { name: 'collapsible', type: "'offcanvas' | 'icon' | 'none'", def: "'offcanvas'", desc: '折叠方式：<b>offcanvas</b> 整个滑出画布（占位宽变 0）；<b>icon</b> 收成 3rem 的图标栏（组标题淡出、徽标/操作项隐藏、菜单按钮的 <code>tooltip</code> 生效）；<b>none</b> 不折叠，就是一块静态侧栏' },
  { name: 'class', type: 'string', def: '—', desc: '桌面形态下的面板 class，可覆盖 <code>fixed</code> / <code>h-svh</code> 等（合并用的是 tailwind-merge，同组属性后写者胜）' },
]

const partRows = [
  { name: 'SidebarProvider', slot: 'sidebar-wrapper', desc: '上下文 + 宽度变量（<code>--sidebar-width: 16rem</code>、<code>--sidebar-width-icon: 3rem</code>）。同时挂全局快捷键 <b>Ctrl/Cmd + B</b> 切换开合' },
  { name: 'SidebarTrigger', slot: 'sidebar-trigger', desc: '一行按钮（PanelLeft 图标，h-7 w-7），点了就 <code>toggleSidebar()</code>；移动端则控制 <code>openMobile</code>' },
  { name: 'SidebarRail', slot: 'sidebar-rail', desc: '贴面板内侧的一条 4px 细条（<code>sm</code> 以上显示、不可 Tab），点它也能折叠；鼠标会变成 resize 光标' },
  { name: 'SidebarInset', slot: 'sidebar-inset', desc: '主内容区（渲染 <code>main</code>）。<code>variant="inset"</code> 时它自动加外边距、圆角与阴影 —— 配合 <code>SidebarProvider</code> 的 <code>has-data-[variant=inset]:bg-sidebar</code> 做出「主区浮在侧栏底色上」的效果' },
  { name: 'SidebarHeader / Footer', slot: 'sidebar-header / footer', desc: '上下的容器（<code>flex flex-col gap-2 p-2</code>），放 Logo / 用户信息 / 设置入口' },
  { name: 'SidebarContent', slot: 'sidebar-content', desc: '中间滚动区（<code>min-h-0 flex-1 overflow-auto</code>）；折叠成 icon 时自动改成 <code>overflow-hidden</code>，避免出现横向滚动条' },
  { name: 'SidebarGroup / GroupLabel / GroupContent', slot: 'sidebar-group / -label / -content', desc: '分组三件套。<code>GroupLabel</code> 在 icon 折叠时会上移 <code>-mt-8</code> 并淡出（不占高度）' },
  { name: 'SidebarGroupAction', slot: 'sidebar-group-action', desc: '组标题右侧的小按钮（如「新建」），绝对定位在 <code>top-3.5 right-3</code>' },
  { name: 'SidebarMenu / MenuItem', slot: 'sidebar-menu / -item', desc: '菜单容器（<code>ul</code>）与项（<code>li.relative</code>）。<code>relative</code> 是给 Action / Badge 定位用的' },
  { name: 'SidebarMenuButton', slot: 'sidebar-menu-button', desc: '菜单按钮：<code>isActive</code>、<code>variant</code>（<code>default</code> / <code>outline</code>）、<code>size</code>（<code>sm</code>/<code>default</code>/<code>lg</code>）、<code>tooltip</code>（<b>只在折叠成 icon 且非移动端时显示</b>，方向 right）、<code>as-child</code>（套 <code>&lt;a&gt;</code> / <code>RouterLink</code>）' },
  { name: 'SidebarMenuAction', slot: 'sidebar-menu-action', desc: '按钮右侧的操作项（如「更多」）。<code>show-on-hover</code> 打开后默认透明、hover 或聚焦才显形；折叠成 icon 时隐藏' },
  { name: 'SidebarMenuBadge', slot: 'sidebar-menu-badge', desc: '右侧数字徽标（<code>tabular-nums</code>）；折叠成 icon 时隐藏' },
  { name: 'SidebarMenuSub / SubItem / SubButton', slot: 'sidebar-menu-sub / -sub-item / -sub-button', desc: '二级菜单：左边一条竖线缩进。<code>SubButton</code> 默认渲染成 <code>&lt;a&gt;</code>，支持 <code>size</code>（sm/md）与 <code>isActive</code>' },
  { name: 'SidebarMenuSkeleton', slot: 'sidebar-menu-skeleton', desc: '加载骨架：<code>show-icon</code> 决定要不要画图标位，文字条宽度随机 50%~90%' },
  { name: 'SidebarInput / Separator', slot: 'sidebar-input / -separator', desc: '侧栏里的搜索框（高度压到 <code>h-8</code>、去掉阴影）与分组分隔线（用 <code>bg-sidebar-border</code>，注意它带 <code>mx-2</code>，要贴满得写 <code>w-auto</code>）' },
]

const composableRows = [
  { name: 'state', type: "'expanded' | 'collapsed'", desc: '当前展开状态（就是面板上的 <code>data-state</code>）' },
  { name: 'open / setOpen', type: 'Ref<boolean> / (v) => void', desc: '桌面端的开合状态；<code>setOpen</code> 会顺带写 cookie' },
  { name: 'isMobile', type: 'Ref<boolean>', desc: '是否命中 <code>max-width: 768px</code>；为真时 <code>Sidebar</code> 会渲染成 Sheet' },
  { name: 'openMobile / setOpenMobile', type: 'Ref<boolean> / (v) => void', desc: '移动端抽屉的开合' },
  { name: 'toggleSidebar', type: '() => void', desc: '桌面端切 <code>open</code>、移动端切 <code>openMobile</code> —— <code>SidebarTrigger</code>、<code>SidebarRail</code>、Ctrl/Cmd+B 都走它' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Sidebar 侧边栏</h1>
    <p class="mt-3 text-muted-foreground">
      后台布局用的侧边栏：<code>SidebarProvider</code> 管状态（展开 / 折叠 / 移动端抽屉 + cookie 记忆 + <b>Ctrl/Cmd + B</b> 快捷键），
      <code>Sidebar</code> 是面板本体，<code>SidebarInset</code> 是右边那块的「主内容区」。<br />
      三档折叠方式（<code>offcanvas</code> 滑出画布 / <code>icon</code> 收成图标栏 / <code>none</code> 不折叠）
      × 三种外观（<code>sidebar</code> / <code>floating</code> / <code>inset</code>）× 左右两侧，组合出常见的后台骨架。
    </p>
    <p class="mt-3 text-sm text-muted-foreground">
      提示：桌面形态的面板是 <code>fixed inset-y-0 h-svh</code>（贴视口全高），所以下面都放在一个<b>固定高度的容器</b>里演示 ——
      用 <code>class="absolute h-full"</code> 把 <code>fixed</code>/<code>h-svh</code> 覆盖掉（同组属性，tailwind-merge 后写者胜）。
      自己项目里做整页布局时不用这层覆盖，直接让 <code>SidebarProvider</code> 铺满页面即可。
    </p>

    <!-- 1. 基础 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          标准三段结构：<code>SidebarProvider</code> → <code>Sidebar</code>（Header / Content / Footer + Rail）+
          <code>SidebarInset</code>（顶栏里放 <code>SidebarTrigger</code>）。<br />
          点左上角的按钮、右侧那条细边（Rail），或者按 <b>Ctrl / Cmd + B</b> 都能折叠；折叠状态会写进 cookie。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="relative h-[420px] overflow-hidden rounded-lg border border-input">
          <SidebarProvider class="h-full min-h-0">
            <Sidebar class="absolute h-full">
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg">
                      <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <GalleryVerticalEnd class="size-4" />
                      </span>
                      <span class="grid flex-1 text-left leading-tight">
                        <span class="truncate font-medium">RionStudio</span>
                        <span class="truncate text-xs">组件库</span>
                      </span>
                      <ChevronsUpDown class="ml-auto" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarHeader>

              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>平台</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem v-for="item in nav" :key="item.title">
                        <SidebarMenuButton :is-active="item.active" :tooltip="item.title">
                          <component :is="item.icon" />
                          <span>{{ item.title }}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="设置">
                      <Settings />
                      <span>设置</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>

              <SidebarRail />
            </Sidebar>

            <SidebarInset class="h-full overflow-y-auto">
              <header class="flex h-12 shrink-0 items-center gap-2 border-b border-input px-3">
                <SidebarTrigger />
                <span class="text-sm font-medium">总览</span>
              </header>
              <div class="space-y-3 p-4">
                <div class="grid gap-3 sm:grid-cols-3">
                  <div v-for="s in [{ k: '请求', v: '12.8k' }, { k: '成功率', v: '99.2%' }, { k: 'P99', v: '320ms' }]" :key="s.k" class="rounded-lg border border-input p-3">
                    <p class="text-xs text-muted-foreground">{{ s.k }}</p>
                    <p class="text-xl font-semibold">{{ s.v }}</p>
                  </div>
                </div>
                <p class="text-sm text-muted-foreground">
                  右边这块就是 <code>SidebarInset</code>（渲染成 <code>main</code>）。
                  折叠后主区会自动跟着变宽 —— 它和面板之间没有耦合，靠 flex 自适应。
                </p>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </CardContent>
    </Card>

    <!-- 2. collapsible -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">三档折叠方式（collapsible）</h2>
        <CardDescription>
          <b>offcanvas</b>：整块滑出画布，占位宽度收成 0，主区占满。<br />
          <b>icon</b>：收成 3rem 的图标栏 —— 组标题淡出上移、徽标与操作项隐藏，
          这时 <code>SidebarMenuButton</code> 的 <code>tooltip</code> 才会生效（鼠标移上去显示名称）。<br />
          <b>none</b>：不折叠，纯静态侧栏（适合嵌在卡片 / 局部区域里）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <Button
            v-for="c in (['offcanvas', 'icon', 'none'] as const)"
            :key="c"
            size="sm"
            :variant="collapsible === c ? 'default' : 'outline'"
            @click="collapsible = c"
          >
            {{ c }}
          </Button>
          <Badge variant="secondary">
            collapsible：{{ collapsible }}
          </Badge>
        </div>

        <div class="relative h-[380px] overflow-hidden rounded-lg border border-input">
          <SidebarProvider :default-open="true" class="h-full min-h-0">
            <Sidebar :collapsible="collapsible" class="absolute h-full">
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" tooltip="RionStudio">
                      <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <GalleryVerticalEnd class="size-4" />
                      </span>
                      <span class="grid flex-1 text-left leading-tight">
                        <span class="truncate font-medium">RionStudio</span>
                        <span class="truncate text-xs">组件库</span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarHeader>

              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>平台</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem v-for="item in nav2" :key="item.title">
                        <SidebarMenuButton :tooltip="item.title">
                          <component :is="item.icon" />
                          <span>{{ item.title }}</span>
                        </SidebarMenuButton>
                        <SidebarMenuBadge v-if="item.title === '成员'">
                          12
                        </SidebarMenuBadge>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="设置">
                      <Settings />
                      <span>设置</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>

              <SidebarRail />
            </Sidebar>

            <SidebarInset class="h-full overflow-y-auto">
              <header class="flex h-12 shrink-0 items-center gap-2 border-b border-input px-3">
                <SidebarTrigger />
                <span class="text-sm font-medium">当前：{{ collapsible }}</span>
              </header>
              <div class="p-4 text-sm text-muted-foreground">
                <p v-if="collapsible === 'offcanvas'">
                  折叠后面板整体向左移出 <code>calc(var(--sidebar-width) * -1)</code>，占位块宽度归零。
                </p>
                <p v-else-if="collapsible === 'icon'">
                  折叠后宽度变成 <code>3rem</code>，文字被 <code>truncate</code> 截掉。
                  把鼠标移到任意一个菜单按钮上，会弹出它的 <code>tooltip</code>。
                </p>
                <p v-else>
                  <code>collapsible="none"</code> 分支不渲染固定定位的面板，就是一块普通 <code>div</code>，因此也不会响应折叠。
                </p>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </CardContent>
    </Card>

    <!-- 3. variant + side -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">三种外观与左右两侧</h2>
        <CardDescription>
          <b>sidebar</b>：贴边（左侧面板带右边框）—— 最常见。<br />
          <b>floating</b>：面板浮起来（圆角 + 外环 + 阴影），和背景之间留出 <code>p-2</code>。<br />
          <b>inset</b>：把主区「嵌」进去 —— <code>SidebarInset</code> 自动获得外边距、圆角与阴影，
          外层因为 <code>has-data-[variant=inset]:bg-sidebar</code> 露出侧栏底色，看起来主区是浮在侧栏上的。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <Button
            v-for="v in (['sidebar', 'floating', 'inset'] as const)"
            :key="v"
            size="sm"
            :variant="variant === v ? 'default' : 'outline'"
            @click="variant = v"
          >
            {{ v }}
          </Button>
          <span class="mx-1 text-muted-foreground">|</span>
          <Button
            v-for="s in (['left', 'right'] as const)"
            :key="s"
            size="sm"
            :variant="side === s ? 'default' : 'outline'"
            @click="side = s"
          >
            {{ s }}
          </Button>
        </div>

        <div class="relative h-[380px] overflow-hidden rounded-lg border border-input bg-background">
          <SidebarProvider :default-open="true" class="h-full min-h-0">
            <Sidebar :variant="variant" :side="side" class="absolute h-full">
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" tooltip="工作区">
                      <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <GalleryVerticalEnd class="size-4" />
                      </span>
                      <span class="truncate font-medium">工作区</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarHeader>

              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>导航</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem v-for="item in nav3" :key="item.title">
                        <SidebarMenuButton :is-active="item.active" :tooltip="item.title">
                          <component :is="item.icon" />
                          <span>{{ item.title }}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarRail />
            </Sidebar>

            <SidebarInset class="h-full overflow-y-auto">
              <header class="flex h-12 shrink-0 items-center gap-2 border-b border-input px-3">
                <SidebarTrigger />
                <span class="text-sm font-medium">{{ variant }} · {{ side }}</span>
              </header>
              <div class="p-4 text-sm text-muted-foreground">
                <p v-if="variant === 'inset'">
                  <code>variant="inset"</code> 时主区有 <code>m-2</code>、<code>rounded-xl</code> 与阴影，
                  四周会露出侧栏的底色。
                </p>
                <p v-else>
                  切换上面的按钮看差异：<code>floating</code> 会给面板换成圆角 + 外环，<code>inset</code> 则改的是主区。
                </p>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 菜单结构 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">菜单结构：分组、二级菜单、徽标与操作</h2>
        <CardDescription>
          <code>SidebarGroup</code>（组）内放 <code>GroupLabel</code> + <code>GroupContent</code>；
          <code>SidebarMenu</code> 里每项是 <code>MenuItem</code>，里面通常是 <code>MenuButton</code>，
          右侧可以再挂 <code>MenuBadge</code>（数字）或 <code>MenuAction</code>（更多按钮）。<br />
          二级菜单用 <code>MenuSub</code> + <code>SubItem</code> + <code>SubButton</code>，会缩进并带一条竖线。
          这里用 <code>collapsible="none"</code> 让它保持静态，方便看清结构。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="relative h-[420px] overflow-hidden rounded-lg border border-input">
          <SidebarProvider class="h-full min-h-0">
            <Sidebar collapsible="none" class="h-full border-r border-input">
              <SidebarHeader>
                <SidebarInput placeholder="搜索…" />
              </SidebarHeader>

              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>工作区</SidebarGroupLabel>
                  <SidebarGroupAction title="新建">
                    <Plus />
                  </SidebarGroupAction>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton :is-active="true">
                          <Home />
                          <span>总览</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Folder />
                          <span>项目</span>
                        </SidebarMenuButton>
                        <SidebarMenuAction show-on-hover>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton :is-active="true">
                              <span>组件库</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton>
                              <span>文档站</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton>
                              <span>设计规范</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <Users />
                          <span>成员</span>
                        </SidebarMenuButton>
                        <SidebarMenuBadge>12</SidebarMenuBadge>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <BarChart3 />
                          <span>数据分析</span>
                        </SidebarMenuButton>
                        <SidebarMenuAction show-on-hover>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator class="w-auto!" />

                <SidebarGroup>
                  <SidebarGroupLabel>加载中</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem v-for="i in 3" :key="i">
                        <SidebarMenuSkeleton show-icon />
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <LifeBuoy />
                      <span>帮助</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Send />
                      <span>反馈</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>

            <SidebarInset class="h-full overflow-y-auto">
              <header class="flex h-12 shrink-0 items-center gap-2 border-b border-input px-3">
                <span class="text-sm font-medium">菜单结构</span>
              </header>
              <div class="space-y-2 p-4 text-sm text-muted-foreground">
                <p>· 组标题右侧的「+」是 <code>SidebarGroupAction</code>。</p>
                <p>· 「成员」右边的 12 是 <code>SidebarMenuBadge</code>（折叠成 icon 时会隐藏）。</p>
                <p>· 「项目 / 数据分析」右侧的「···」是带 <code>show-on-hover</code> 的 <code>SidebarMenuAction</code> —— 默认透明，悬停或键盘聚焦才显形。</p>
                <p>· 「项目」下面是二级菜单（<code>MenuSub</code>），带一条缩进竖线。</p>
                <p>· 最下面的灰条是 <code>SidebarMenuSkeleton</code>，宽度每次随机。</p>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </CardContent>
    </Card>

    <!-- 5. 受控与快捷键 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控开合、cookie 记忆与快捷键</h2>
        <CardDescription>
          <code>v-model:open</code> 可以外部控制开合；<b>不管受不受控</b>，每次切换都会写一个
          <code>sidebar_state</code> 的 cookie（7 天），所以刷新页面后还能记住上次是展开还是折叠。<br />
          全局快捷键是 <b>Ctrl / Cmd + B</b>（由 <code>SidebarProvider</code> 监听，与 <code>SidebarTrigger</code> 走同一个 <code>toggleSidebar()</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="outline" @click="controlledOpen = !controlledOpen">
            {{ controlledOpen ? '折叠' : '展开' }}
          </Button>
          <Badge variant="secondary">
            open：{{ controlledOpen }}
          </Badge>
          <span class="text-sm text-muted-foreground">试试按 Ctrl / Cmd + B</span>
        </div>

        <div class="relative h-[320px] overflow-hidden rounded-lg border border-input">
          <SidebarProvider :open="controlledOpen" class="h-full min-h-0" @update:open="(v: boolean) => controlledOpen = v">
            <Sidebar collapsible="icon" class="absolute h-full">
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" tooltip="受控工作区">
                      <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <GalleryVerticalEnd class="size-4" />
                      </span>
                      <span class="truncate font-medium">受控工作区</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem v-for="item in nav3" :key="item.title">
                        <SidebarMenuButton :is-active="item.active" :tooltip="item.title">
                          <component :is="item.icon" />
                          <span>{{ item.title }}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarRail />
            </Sidebar>

            <SidebarInset class="h-full">
              <header class="flex h-12 shrink-0 items-center gap-2 border-b border-input px-3">
                <SidebarTrigger />
                <span class="text-sm font-medium">受控示例</span>
              </header>
              <div class="p-4 text-sm text-muted-foreground">
                这里的 <code>open</code> 由外面那个按钮和 <code>SidebarTrigger</code> 共同控制；
                折叠到 icon 后把鼠标移到图标上会弹 tooltip。
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </CardContent>
    </Card>

    <!-- 6. 组合：MenuButton 变体 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">MenuButton 的变体、尺寸与链接</h2>
        <CardDescription>
          <code>isActive</code> 给当前项上底色；<code>variant="outline"</code> 带一圈描边（适合放「升级」这类次要入口）；
          <code>size</code> 有 <code>sm</code> / <code>default</code> / <code>lg</code>（lg 常用在 Header 的品牌位）。<br />
          配合 <code>as-child</code> 可以把按钮换成 <code>&lt;a&gt;</code> / <code>RouterLink</code>，样式与 hover 行为不变。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="relative h-[300px] overflow-hidden rounded-lg border border-input">
          <SidebarProvider class="h-full min-h-0">
            <Sidebar collapsible="none" class="h-full border-r border-input">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>变体</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton :is-active="true">
                          <Home />
                          <span>is-active</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton variant="outline">
                          <Plus />
                          <span>variant="outline"</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton size="sm">
                          <Settings />
                          <span>size="sm"</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton size="lg">
                          <Users />
                          <span>size="lg"</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton as-child>
                          <a href="#sidebar" @click.prevent>
                            <Folder />
                            <span>as-child 包 a 标签</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <SidebarInset class="h-full p-4">
              <p class="text-sm text-muted-foreground">
                五种形态放在一起对比：默认 / 激活 / outline / sm / lg / as-child。
                <code>as-child</code> 那一项在 DOM 里是 <code>&lt;a&gt;</code>，但外观和上面完全一致。
              </p>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </CardContent>
    </Card>

    <!-- 7. API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API / Props</h2>
        <CardDescription>
          <code>SidebarProvider</code>（状态与宽度变量）与 <code>Sidebar</code>（面板本体）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">SidebarProvider</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in providerRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 align-top text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 align-top text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 align-top" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">Sidebar</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 pr-4 font-medium">默认值</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sidebarRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 align-top text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 pr-4 align-top text-muted-foreground">{{ row.def }}</td>
                <td class="py-2 align-top" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">其余子部件（22 个）</h2>
        <CardDescription>全都只有 <code>class</code>（部分多一两个 prop），样式与定位由它们各自的 <code>data-slot</code> 约定。</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">部件</th>
                <th class="py-2 pr-4 font-medium">data-slot</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in partRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 align-top text-muted-foreground"><code>{{ row.slot }}</code></td>
                <td class="py-2 align-top" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">useSidebar()</h2>
        <CardDescription>
          在 <code>SidebarProvider</code> 内部的子组件里调用，拿到状态与操作。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left">
                <th class="py-2 pr-4 font-medium">字段</th>
                <th class="py-2 pr-4 font-medium">类型</th>
                <th class="py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in composableRows" :key="row.name" class="border-b last:border-0">
                <td class="py-2 pr-4 align-top"><code>{{ row.name }}</code></td>
                <td class="py-2 pr-4 align-top text-muted-foreground">{{ row.type }}</td>
                <td class="py-2 align-top" v-html="row.desc" />
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
