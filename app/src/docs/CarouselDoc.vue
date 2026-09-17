<script setup lang="ts">
import { ref } from 'vue'
import Autoplay from 'embla-carousel-autoplay'
import type { CarouselApi } from '@/components/ui/carousel'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// 演示用的 5 张“幻灯片”（用渐变块代替图片，文档站不依赖外部资源）
const slides = [
  { n: 1, title: '第一屏', desc: '拖动、点按钮、按方向键都能翻', tone: 'from-sky-500/25 to-sky-500/5' },
  { n: 2, title: '第二屏', desc: '默认不循环，到两头按钮自动禁用', tone: 'from-violet-500/25 to-violet-500/5' },
  { n: 3, title: '第三屏', desc: '一屏一个，宽度由 basis 决定', tone: 'from-emerald-500/25 to-emerald-500/5' },
  { n: 4, title: '第四屏', desc: '可以一屏放多个', tone: 'from-amber-500/25 to-amber-500/5' },
  { n: 5, title: '第五屏', desc: '也可以纵向滚动', tone: 'from-rose-500/25 to-rose-500/5' },
]

const cards = [
  { title: '周报自动汇总', desc: '每周一早上把上周的提交整理成摘要' },
  { title: '异常自动告警', desc: '错误率超过阈值时推送到群里' },
  { title: '文档同步', desc: '组件变更后自动更新文档站' },
  { title: '依赖巡检', desc: '每周检查过期依赖并开 issue' },
  { title: '预览环境', desc: '每个 PR 自动部署一套预览' },
]

// 自动播放插件：放在 setup 里只创建一次（每次渲染新建插件会反复重播）
const autoplay = [Autoplay({ delay: 2500, stopOnInteraction: false })]

// 圆点指示器：用 init-api 拿实例，监听 select 同步当前页
const dotsApi = ref<CarouselApi | null>(null)
const dotsCurrent = ref(0)
const dotsCount = ref(0)
function onDotsReady(api: CarouselApi) {
  dotsApi.value = api
  dotsCount.value = api.scrollSnapList().length
  dotsCurrent.value = api.selectedScrollSnap()
  api.on('select', () => {
    dotsCurrent.value = api.selectedScrollSnap()
  })
}

const rows = [
  { name: 'opts', type: 'embla 配置对象', def: '—', desc: '透传给 embla，常用：loop 循环、align 对齐（start/center/end）、slidesToScroll 一次翻几屏、dragFree 惯性滚动' },
  { name: 'plugins', type: 'embla 插件数组', def: '—', desc: '如 [Autoplay({ delay: 3000, stopOnInteraction: false })]、[WheelGestures()]' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", def: "'horizontal'", desc: '滚动方向；vertical 会自动切成纵向轨道并把翻页按钮挪到上下' },
  { name: 'init-api', type: '(api) => void', def: '—', desc: '实例就绪时抛出，用来做缩略图 / 圆点指示 / 进度条等定制' },
  { name: 'ref 暴露', type: 'scrollNext / scrollPrev / carouselApi / canScrollNext …', def: '—', desc: '给 <Carousel> 加 ref 后可直接调用，适合在外层放自定义按钮' },
  { name: 'class', type: 'string', def: '—', desc: '根容器是 relative，可用它控制宽度与留白' },
]

const parts = [
  { name: 'Carousel', slot: 'carousel', desc: '根容器：提供 embla 实例、接方向键翻页；role="region" + aria-roledescription="carousel"' },
  { name: 'CarouselContent', slot: 'carousel-content', desc: '可滑动轨道：外层视口 overflow-hidden，内层 flex 轨道；class 会落到内层轨道上' },
  { name: 'CarouselItem', slot: 'carousel-item', desc: '一屏内容，默认 basis-full（一屏一个）；改 basis 就能一屏多个' },
  { name: 'CarouselPrevious', slot: 'carousel-previous', desc: '上一屏按钮：复用 Button（variant/size 可透传），默认贴左侧外侧，到头禁用' },
  { name: 'CarouselNext', slot: 'carousel-next', desc: '下一屏按钮：默认贴右侧外侧，纵向时自动挪到下方' },
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight">Carousel 轮播</h1>
    <p class="mt-3 text-muted-foreground">
      基于 <code>embla-carousel</code> 的无头滚动引擎（支持拖拽、惯性、循环、自动播放），
      组件只负责结构与样式。默认横向、一屏一个、不循环。
    </p>

    <!-- 基础用法 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">基础用法</h2>
        <CardDescription>
          四个组件即可：<code>Carousel</code> +
          <code>CarouselContent</code> +
          <code>CarouselItem</code> ×N +
          翻页按钮。翻页按钮默认在轨道<strong>外侧</strong>，所以外面要留出空间（这里用
          <code>px-12</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="px-12">
          <Carousel class="w-full">
            <CarouselContent>
              <CarouselItem v-for="s in slides" :key="s.n">
                <div class="flex h-40 flex-col justify-end rounded-xl bg-gradient-to-br p-5" :class="s.tone">
                  <p class="text-2xl font-semibold">{{ s.n }}</p>
                  <p class="text-sm font-medium">{{ s.title }}</p>
                  <p class="text-xs text-muted-foreground">{{ s.desc }}</p>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </CardContent>
    </Card>

    <!-- 一屏多个 + 循环 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">一屏多个与循环</h2>
        <CardDescription>
          覆盖 <code>CarouselItem</code> 的
          <code>basis</code> 就能一屏放多个（如
          <code>basis-1/2 md:basis-1/3</code>）；
          默认<strong>不循环</strong>，传 <code>:opts="{ loop: true }"</code> 才会首尾相接。
          注意看下面两种情况下按钮的禁用状态。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-8">
        <div>
          <p class="mb-3 text-sm font-medium">默认：不循环（到头禁用）</p>
          <div class="px-12">
            <Carousel class="w-full">
              <CarouselContent>
                <CarouselItem v-for="c in cards" :key="c.title" class="basis-1/2 md:basis-1/3">
                  <Card class="h-full" size="sm">
                    <CardHeader>
                      <CardTitle>{{ c.title }}</CardTitle>
                      <CardDescription>{{ c.desc }}</CardDescription>
                    </CardHeader>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>

        <div>
          <p class="mb-3 text-sm font-medium">loop: true（首尾相接，按钮不会禁用）</p>
          <div class="px-12">
            <Carousel class="w-full" :opts="{ loop: true }">
              <CarouselContent>
                <CarouselItem v-for="c in cards" :key="c.title" class="basis-1/2 md:basis-1/3">
                  <Card class="h-full" size="sm">
                    <CardHeader>
                      <CardTitle>{{ c.title }}</CardTitle>
                      <CardDescription>{{ c.desc }}</CardDescription>
                    </CardHeader>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 对齐 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">对齐方式（opts.align）</h2>
        <CardDescription>
          <code>align</code> 控制每屏贴哪一边：
          <code>start</code>（默认）/ <code>center</code> /
          <code>end</code>。一屏多个、宽度不是整分时差别最明显。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-8">
        <div>
          <p class="mb-3 text-sm font-medium">align: 'center'</p>
          <div class="px-12">
            <Carousel class="w-full" :opts="{ align: 'center' }">
              <CarouselContent>
                <CarouselItem v-for="s in slides" :key="s.n" class="basis-2/3 md:basis-1/2">
                  <div class="flex h-32 items-center justify-center rounded-xl bg-gradient-to-br text-2xl font-semibold" :class="s.tone">
                    {{ s.n }}
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 垂直 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">纵向滚动</h2>
        <CardDescription>
          传 <code>orientation="vertical"</code>：轨道变
          <code>flex-col</code>，翻页按钮自动挪到上方 / 下方并旋转 90°。
          纵向需要<strong>固定高度</strong>（这里给 CarouselContent 加 <code>h-64</code>）。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex justify-center py-14">
          <Carousel orientation="vertical" class="w-full max-w-xs">
            <CarouselContent class="h-64">
              <CarouselItem v-for="s in slides" :key="s.n" class="basis-1/2">
                <div class="flex h-full items-center justify-center rounded-xl bg-gradient-to-br text-xl font-semibold" :class="s.tone">
                  {{ s.n }} · {{ s.title }}
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </CardContent>
    </Card>

    <!-- 自动播放 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">自动播放（plugins）</h2>
        <CardDescription>
          自动播放是 embla 的官方插件：<code>import Autoplay from 'embla-carousel-autoplay'</code>，
          再通过 <code>:plugins="[Autoplay({ delay: 2500 })]"</code> 传入。
          插件数组要在 setup 里只创建一次，否则每次渲染都会重建插件、从头计时。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="px-12">
          <Carousel class="w-full" :opts="{ loop: true }" :plugins="autoplay">
            <CarouselContent>
              <CarouselItem v-for="s in slides" :key="s.n">
                <div class="flex h-40 flex-col justify-end rounded-xl bg-gradient-to-br p-5" :class="s.tone">
                  <p class="text-2xl font-semibold">{{ s.n }}</p>
                  <p class="text-xs text-muted-foreground">每 2.5 秒自动翻一屏（鼠标移入会暂停）</p>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </CardContent>
    </Card>

    <!-- 指示器 -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">圆点指示器（init-api）</h2>
        <CardDescription>
          需要“当前第几屏”这类信息时，用 <code>@init-api</code> 拿到实例：
          <code>scrollSnapList().length</code> 是总屏数，
          <code>selectedScrollSnap()</code> 是当前屏，监听
          <code>select</code> 事件保持同步；点击圆点用
          <code>api.scrollTo(i)</code> 跳转。此时按钮可以藏掉。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Carousel class="w-full" @init-api="onDotsReady">
          <CarouselContent>
            <CarouselItem v-for="s in slides" :key="s.n">
              <div class="flex h-36 items-center justify-center rounded-xl bg-gradient-to-br text-3xl font-semibold" :class="s.tone">
                {{ s.n }}
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
        <div class="flex items-center justify-center gap-2">
          <button
            v-for="i in dotsCount"
            :key="i"
            type="button"
            class="size-2.5 rounded-full transition-colors"
            :class="dotsCurrent === i - 1 ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'"
            :aria-label="`跳到第 ${i} 屏`"
            @click="dotsApi?.scrollTo(i - 1)"
          />
        </div>
      </CardContent>
    </Card>

    <!-- API -->
    <Card class="mt-8">
      <CardHeader>
        <h2 class="text-xl font-semibold">API</h2>
        <CardDescription>
          <code>Carousel</code> 的 props 基本是 embla 的能力透传，
          其余子组件只有 <code>class</code>（翻页按钮额外支持
          <code>variant</code> / <code>size</code>，因为内部就是 Button）。
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div>
          <p class="mb-2 text-sm font-medium">Props / Emits / 暴露</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">名称</th>
                  <th class="px-4 py-2 font-medium">类型</th>
                  <th class="px-4 py-2 font-medium">默认</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in rows" :key="r.name" class="border-b border-border last:border-0">
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
          <p class="mb-2 text-sm font-medium">子组件</p>
          <div class="overflow-x-auto rounded-lg">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/40 text-left">
                  <th class="px-4 py-2 font-medium">组件</th>
                  <th class="px-4 py-2 font-medium">data-slot</th>
                  <th class="px-4 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in parts" :key="p.name" class="border-b border-border last:border-0">
                  <td class="px-4 py-2 font-mono text-foreground">{{ p.name }}</td>
                  <td class="px-4 py-2 font-mono text-xs text-muted-foreground">{{ p.slot }}</td>
                  <td class="px-4 py-2 text-muted-foreground">{{ p.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          想在自定义子组件里读轮播状态（比如自己封装一个页码），可以引入
          <code>useCarousel()</code> —— 在 <code>&lt;Carousel&gt;</code>
          内部使用才有效，放外面会直接报错提示。
        </p>
      </CardContent>
    </Card>
  </div>
</template>
