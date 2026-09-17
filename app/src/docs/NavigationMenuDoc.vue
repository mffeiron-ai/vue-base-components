<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen, FileText, Github, Layers, Sparkles } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

// ---------- 演示数据 ----------
const componentLinks = [
  { title: 'Button 按钮', desc: '6 种变体、6 种尺寸，支持图标与加载态。', icon: Layers, href: '#button' },
  { title: 'Card 卡片', desc: '标题 / 描述 / 正文 / 页脚的分区容器。', icon: Layers, href: '#card' },
  { title: 'Dialog 对话框', desc: '模态弹窗：锁焦点、Esc 关闭、长内容可滚。', icon: Layers, href: '#dialog' },
  { title: 'Tabs 标签页', desc: '同区域切换多组内容，自动管理键盘焦点。', icon: Layers, href: '#tabs' },
]

const docLinks = [
  { title: '快速开始', desc: '装依赖、引样式、跑起第一个组件。', icon: BookOpen, href: '#start' },
  { title: '主题与风格', desc: '41 套主题 + 8 套设计系统怎么切。', icon: Sparkles, href: '#theme' },
  { title: '组件索引', desc: '按分类浏览全部组件及其 API。', icon: FileText, href: '#registry' },
]

/** 受控演示：当前展开的菜单项 */
const openedMenu = ref<string | undefined>(undefined)

// ---------- API ----------
const rootRows = [
  { name: 'viewport', type: 'boolean', def: 'true', desc: '本项目新增的开关：<code>true</code> 时在根节点里渲染一个<b>共享视口</b>（面板宽高随当前项动画伸缩）；<code>false</code> 时每个 <code>NavigationMenuContent</code> 自己当卡片，贴在触发器下方' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", def: "'horizontal'", desc: '排列方向；<code>vertical</code> 时 List 要自己补 <code>flex-col</code>' },
  { name: 'delayDuration', type: 'number', def: '200', desc: '悬停多久才展开（reka 默认 200ms）；写成 <code>0</code> 就是移上去立刻开' },
  { name: 'skipDelayDuration', type: 'number', def: '300', desc: '刚关掉一个菜单后，多久内移去别的项可以「免等待」直接展开' },
  { name: 'v-model', type: 'string | undefined', def: '—', desc: '当前展开项的 value（受控）；配合 <code>@update:modelValue</code> 可以自己记账' },
]

const partRows = [
  { name: 'NavigationMenu', slot: 'navigation-menu', desc: '根容器（<code>max-w-max</code> 居中）：负责 hover 计时、键盘导航，以及（默认）挂载共享视口；带 <code>data-viewport</code> 供内容切换样式' },
  { name: 'NavigationMenuList', slot: 'navigation-menu-list', desc: '横向 <code>ul</code>：<code>flex gap-1</code>，竖排时自己加 <code>flex-col</code>' },
  { name: 'NavigationMenuItem', slot: 'navigation-menu-item', desc: '一项（<code>li.relative</code>）：里面可以放 Trigger + Content，也可以只放一个 Link' },
  { name: 'NavigationMenuTrigger', slot: 'navigation-menu-trigger', desc: '可展开的标题按钮：样式来自导出的 <code>navigationMenuTriggerStyle()</code>（h-9 / px-4 / hover:bg-accent）；自带右侧箭头，展开时旋转 180°' },
  { name: 'NavigationMenuContent', slot: 'navigation-menu-content', desc: '展开的内容面板：按 <code>data-motion</code>（from-start / from-end / to-start / to-end）做方向性滑入滑出；<code>viewport=false</code> 时自动切到「popover 卡片」样式（bg-popover + 边框 + 阴影 + 缩放淡入）' },
  { name: 'NavigationMenuLink', slot: 'navigation-menu-link', desc: '链接项：<code>flex flex-col gap-1 p-2</code>（所以能放「标题 + 描述」两行），hover / focus / 当前项都是 accent 底；带 <code>as-child</code>，包 <code>RouterLink</code> / <code>a</code> 都行' },
  { name: 'NavigationMenuViewport', slot: 'navigation-menu-viewport', desc: '共享视口：宽高 / 左边距读 reka 的三个 CSS 变量（<code>--reka-navigation-menu-viewport-{width,height,left}</code>），所以切换菜单时是「同一块面板」在伸缩；一般不用手写，<code>viewport</code> 打开时自动挂' },
  { name: 'NavigationMenuIndicator', slot: 'navigation-menu-indicator', desc: '触发器下方的小箭头：<code>data-state=visible / hidden</code> 淡入淡出，放在要跟踪的那个 Item 里' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Navigation Menu 导航菜单</h1>
    <p class="mt-3 text-muted-foreground">
      站点级<b>导航栏菜单</b>：横向一排标题，悬停 / 聚焦 / 方向键都能展开内容面板。<br />
      它和 <code>DropdownMenu</code>、<code>Menubar</code> 的分工是：<b>DropdownMenu</b> 是「点一下就开」的操作菜单，
      <b>Menubar</b> 是桌面应用那种常驻菜单栏，而 <b>NavigationMenu</b> 是「悬停即开、鼠标横移自动换项」的站内导航，
      面板还能共享同一块底（切换时整块面板伸缩，而不是一个个小卡片跳）。<br />
      结构：<code>NavigationMenu</code> → <code>NavigationMenuList</code> → <code>NavigationMenuItem</code>（里面放
      <code>NavigationMenuTrigger</code> + <code>NavigationMenuContent</code>，或者只放一个 <code>NavigationMenuLink</code>）。
    </p>
    <p class="mt-3 text-sm text-muted-foreground">
      提示：面板是普通 <code>absolute</code> 定位（不走 Portal），<b>会被父级的 <code>overflow: hidden</code> 裁掉</b>。
      而 <code>Card</code> 在样式预设里就带 <code>overflow-hidden</code>（同级源序会压掉 <code>overflow-visible</code>，必须写
      <code>overflow-visible!</code>），下面演示的卡片就是这么处理的 —— 自己项目里放进 Card / 表格单元 / 滚动容器时也要留出空间。
    </p>

    <!-- 1. 基础用法 -->
    <Card class="mt-8 overflow-visible!">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          三个标题里两个带内容面板（多列链接卡片），最后一个是直接跳转的 <code>NavigationMenuLink</code>（没有面板）。<br />
          悬停展开、鼠标横着移到旁边标题会自动换项；面板本身<b>共享同一块底</b>（宽高随内容过渡），这是默认
          <code>viewport</code> 的效果。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>组件</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="grid w-[420px] gap-1 p-2 md:w-[520px] md:grid-cols-2">
                  <li v-for="item in componentLinks" :key="item.title">
                    <NavigationMenuLink as-child>
                      <a href="#" class="flex flex-col gap-1" @click.prevent>
                        <div class="flex items-center gap-2 font-medium">
                          <component :is="item.icon" />
                          {{ item.title }}
                        </div>
                        <p class="text-xs text-muted-foreground">
                          {{ item.desc }}
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>文档</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="grid w-[320px] gap-1 p-2">
                  <li v-for="item in docLinks" :key="item.title">
                    <NavigationMenuLink as-child>
                      <a href="#" class="flex flex-col gap-1" @click.prevent>
                        <div class="flex items-center gap-2 font-medium">
                          <component :is="item.icon" />
                          {{ item.title }}
                        </div>
                        <p class="text-xs text-muted-foreground">
                          {{ item.desc }}
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink as-child>
                <a href="#" class="inline-flex h-9 items-center gap-1.5 px-4" @click.prevent>
                  <Github />
                  GitHub
                </a>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </CardContent>
    </Card>

    <!-- 2. Indicator -->
    <Card class="mt-8 overflow-visible!">
      <CardHeader>
        <h2 class="text-xl font-semibold">指示箭头（Indicator）</h2>
        <CardDescription>
          <code>NavigationMenuIndicator</code> 是触发器与面板之间、贴着面板上沿的小箭头；它<b>自动跟随当前展开项</b>
          —— reka 会算好 <code>--reka-navigation-menu-indicator-size / -position</code> 两个 CSS 变量并交给指示器，
          所以整个菜单里放<b>一个</b>就够，开合时淡入淡出。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>组件</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="grid w-[420px] gap-1 p-2 md:grid-cols-2">
                  <li v-for="item in componentLinks" :key="item.title">
                    <NavigationMenuLink as-child>
                      <a href="#" class="flex flex-col gap-1" @click.prevent>
                        <div class="flex items-center gap-2 font-medium">
                          <component :is="item.icon" />
                          {{ item.title }}
                        </div>
                        <p class="text-xs text-muted-foreground">
                          {{ item.desc }}
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>文档</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="grid w-[320px] gap-1 p-2">
                  <li v-for="item in docLinks" :key="item.title">
                    <NavigationMenuLink as-child>
                      <a href="#" class="flex flex-col gap-1" @click.prevent>
                        <div class="flex items-center gap-2 font-medium">
                          <component :is="item.icon" />
                          {{ item.title }}
                        </div>
                        <p class="text-xs text-muted-foreground">
                          {{ item.desc }}
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
        </NavigationMenu>
      </CardContent>
    </Card>

    <!-- 3. viewport=false -->
    <Card class="mt-8 overflow-visible!">
      <CardHeader>
        <h2 class="text-xl font-semibold">逐项卡片（viewport=false）</h2>
        <CardDescription>
          关掉共享视口后，每个面板变成独立的 popover 卡片（自己带边框 / 阴影 / 缩放淡入），贴着各自的触发器，宽度也由内容说了算。<br />
          适合「各菜单块差异很大」的导航；<code>viewport</code> 打开时则是整块底一起伸缩，观感更整。
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-start gap-16">
        <div class="space-y-2">
          <p class="text-xs text-muted-foreground">viewport（默认，共享底）</p>
          <NavigationMenu>
            <NavigationMenuList class="justify-start">
              <NavigationMenuItem>
                <NavigationMenuTrigger>组件</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul class="w-[260px] space-y-1 p-2">
                    <li v-for="item in componentLinks.slice(0, 3)" :key="item.title">
                      <NavigationMenuLink as-child>
                        <a href="#" @click.prevent>{{ item.title }}</a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>文档</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul class="w-[320px] space-y-1 p-2">
                    <li v-for="item in docLinks" :key="item.title">
                      <NavigationMenuLink as-child>
                        <a href="#" @click.prevent>{{ item.title }}</a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div class="space-y-2">
          <p class="text-xs text-muted-foreground">viewport=false（各自成卡）</p>
          <NavigationMenu :viewport="false">
            <NavigationMenuList class="justify-start">
              <NavigationMenuItem>
                <NavigationMenuTrigger>组件</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul class="w-[260px] space-y-1 p-2">
                    <li v-for="item in componentLinks.slice(0, 3)" :key="item.title">
                      <NavigationMenuLink as-child>
                        <a href="#" @click.prevent>{{ item.title }}</a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>文档</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul class="w-[320px] space-y-1 p-2">
                    <li v-for="item in docLinks" :key="item.title">
                      <NavigationMenuLink as-child>
                        <a href="#" @click.prevent>{{ item.title }}</a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </CardContent>
    </Card>

    <!-- 4. 受控 -->
    <Card class="mt-8 overflow-visible!">
      <CardHeader>
        <h2 class="text-xl font-semibold">受控开合与展开延迟</h2>
        <CardDescription>
          <code>v-model</code> 拿到当前展开项的 value（这里是 <code>undefined | 'releases' | 'help'</code>），
          <code>:delay-duration="0"</code> 让悬停立刻展开（默认 200ms）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <NavigationMenu v-model="openedMenu" :delay-duration="0">
          <NavigationMenuList>
            <NavigationMenuItem value="releases">
              <NavigationMenuTrigger>发布</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="w-[240px] space-y-1 p-2">
                  <li>
                    <NavigationMenuLink as-child>
                      <a href="#" @click.prevent>v1.0.0 · 首次发布</a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink as-child>
                      <a href="#" @click.prevent>v0.9.0 · 候选版</a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem value="help">
              <NavigationMenuTrigger>帮助</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="w-[200px] space-y-1 p-2">
                  <li>
                    <NavigationMenuLink as-child>
                      <a href="#" @click.prevent>常见问题</a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink as-child>
                      <a href="#" @click.prevent>提 Issue</a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <p class="text-sm text-muted-foreground">
          当前展开：<code class="rounded bg-muted px-1.5 py-0.5 font-mono">{{ openedMenu ?? '（无）' }}</code>
        </p>
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
          另外导出了 <code>navigationMenuTriggerStyle</code>（cva）：想用别的元素当触发器（比如包一层
          <code>RouterLink</code>）时，拿它拼同样的样式即可。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
