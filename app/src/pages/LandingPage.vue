<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowRight, Sparkles, Boxes, Palette, Accessibility, Type, Rocket, Blocks } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// ── 特性数据 ────────────────────────────────────────
const features = [
  {
    icon: Boxes,
    title: '60+ UI 组件',
    desc: '基于 shadcn-vue，覆盖按钮、表单、对话框、表格等常用场景，源码完全可控。',
  },
  {
    icon: Palette,
    title: '41 套主题',
    desc: '设计令牌化，一键切换视觉风格，支持亮色/暗色双模式实时预览。',
  },
  {
    icon: Accessibility,
    title: '无障碍优先',
    desc: '底层基于 reka-ui，提供完整的 WAI-ARIA 支持和键盘导航。',
  },
  {
    icon: Type,
    title: '字体系统',
    desc: '正文/标题/等宽三套字体可配，与你的设计系统无缝融合。',
  },
  {
    icon: Rocket,
    title: '业务组件',
    desc: '表格、编辑表单、导入导出等业务组件，加速后台管理系统开发。',
  },
  {
    icon: Blocks,
    title: '随机 UI 生成器',
    desc: '8 大分类 76 个 Demo 场景，实时预览组件在不同主题下的效果。',
  },
]
</script>

<template>
  <div class="landing-page style-vega min-h-screen bg-background text-foreground">

    <!-- ═══════════ Hero ═══════════ -->
    <section class="hero relative overflow-hidden px-6 pt-32 pb-20 text-center">
      <!-- 背景网格 + 渐变 -->
      <div class="hero-bg pointer-events-none absolute inset-0 -z-10" />
      <div class="mx-auto max-w-3xl">
        <div class="hero-enter mb-6 flex justify-center">
          <Badge variant="outline" class="gap-2 border-primary/30 bg-primary/5 px-4 py-1.5 text-primary">
            <Sparkles class="size-3.5" />
            基于 reka-ui + Tailwind CSS v4
          </Badge>
        </div>

        <h1 class="hero-enter text-balance text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl" style="animation-delay: 0.1s">
          构建你的
          <span class="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Vue 3 组件库
          </span>
        </h1>

        <p class="hero-enter mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground" style="animation-delay: 0.2s">
          一套开箱即用的业务组件与 UI 组件。源码完全属于你，自由定制，自由扩展。
        </p>

        <div class="hero-enter mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" style="animation-delay: 0.3s">
          <RouterLink to="/playground">
            <Button size="lg" class="w-full sm:w-auto">
              体验随机 UI 生成器
              <ArrowRight class="size-4" />
            </Button>
          </RouterLink>
          <RouterLink to="/components/button">
            <Button size="lg" variant="outline" class="w-full sm:w-auto">
              浏览组件
            </Button>
          </RouterLink>
        </div>

        <!-- 组件展示卡片 -->
        <div class="hero-enter mt-16 overflow-hidden rounded-2xl border border-border bg-card/80 shadow-2xl shadow-black/10 backdrop-blur" style="animation-delay: 0.4s">
          <div class="border-b border-border px-6 py-3 text-left text-xs font-medium text-muted-foreground">
            Live Preview
          </div>
          <div class="flex flex-wrap items-center justify-center gap-3 p-8">
            <Button>主要按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="destructive">危险按钮</Button>
            <Button variant="outline">描边按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
            <Button variant="link">链接按钮</Button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ Features ═══════════ -->
    <section class="mx-auto max-w-6xl px-6 py-20">
      <div class="hero-enter mb-12 text-center" style="animation-delay: 0.5s">
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">为什么选择它</h2>
        <p class="mx-auto mt-4 max-w-xl text-muted-foreground">
          从基础组件到业务场景，一套完整的设计系统。
        </p>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card v-for="(f, idx) in features" :key="f.title" class="hero-enter group transition-all hover:-translate-y-1 hover:shadow-lg" :style="{ animationDelay: `${0.6 + idx * 0.1}s` }">
          <CardHeader>
            <span class="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <component :is="f.icon" class="size-5" />
            </span>
            <CardTitle class="text-base">{{ f.title }}</CardTitle>
            <CardDescription>{{ f.desc }}</CardDescription>
          </CardHeader>
          <CardContent class="pt-0" />
        </Card>
      </div>
    </section>

    <!-- ═══════════ CTA ═══════════ -->
    <section class="hero-enter px-6 pb-20" style="animation-delay: 1.2s">
      <div class="mx-auto max-w-4xl rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-12 text-center">
        <h2 class="text-3xl font-bold tracking-tight">准备好开始了吗？</h2>
        <p class="mx-auto mt-4 max-w-md text-muted-foreground">
          从主题预览开始，找到你喜欢的风格，然后浏览组件文档。
        </p>
        <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <RouterLink to="/playground">
            <Button size="lg">🎨 打开主题预览</Button>
          </RouterLink>
          <RouterLink to="/components/button">
            <Button size="lg" variant="outline">📚 查看组件文档</Button>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ═══════════ Footer ═══════════ -->
    <footer class="hero-enter border-t border-border px-6 py-8" style="animation-delay: 1.4s">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <p>© 2026 RionStudio · MIT License</p>
        <div class="flex items-center gap-6">
          <RouterLink to="/components/button" class="hover:text-foreground">组件</RouterLink>
          <RouterLink to="/playground" class="hover:text-foreground">主题预览</RouterLink>
          <a href="https://github.com/mffeiron-ai/vue-base-components" target="_blank" class="hover:text-foreground">GitHub</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Hero 背景：网格线 + 渐变光晕 */
.hero-bg {
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--color-primary) / 0.15), transparent),
    linear-gradient(to right, hsl(var(--color-border) / 0.4) 1px, transparent 1px),
    linear-gradient(to bottom, hsl(var(--color-border) / 0.4) 1px, transparent 1px);
  background-size: 100% 100%, 48px 48px, 48px 48px;
  mask-image: radial-gradient(ellipse 100% 80% at 50% 0%, black 30%, transparent 75%);
}

/* Hero 元素入场动画 */
@keyframes heroIn {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.hero-enter {
  opacity: 0;
  animation: heroIn 0.7s ease-out forwards;
}
</style>
