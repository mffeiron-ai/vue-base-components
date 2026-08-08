<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 直接内联 themeManager 逻辑，避免路径问题
import themesData from '../.vitepress/theme/themes.json'
import { useDefineThemeTheme } from '../.vitepress/theme/themeManager'

const { currentThemeIndex, isDark, themes, setTheme, toggleDark, reapplyTheme } = useDefineThemeTheme()
const scopeRef = ref<HTMLElement | null>(null)

onMounted(() => reapplyTheme())

function onThemeChange() {
  setTimeout(() => reapplyTheme(), 0)
}
</script>

<template>
  <div class="playground flex gap-0 h-[85vh] rounded-xl border overflow-hidden not-prose">
    <aside class="w-[240px] shrink-0 border-r bg-card p-3 overflow-y-auto space-y-3">
      <div>
        <h3 class="text-sm font-semibold mb-2">🎨 主题 ({{ themes.length }})</h3>
        <div class="grid grid-cols-2 gap-1.5 max-h-[400px] overflow-y-auto">
          <button
            v-for="(t, i) in themes"
            :key="i"
            class="text-left px-2.5 py-1.5 rounded text-xs border transition-colors cursor-pointer truncate"
            :class="i === currentThemeIndex.value ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:bg-muted'"
            @click="setTheme(i); onThemeChange()"
          >{{ t.label_zh || t.label }}</button>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold mb-2">🌓 模式</h3>
        <button class="w-full px-3 py-2 rounded-md text-sm border transition-colors cursor-pointer"
          :class="isDark.value ? 'border-primary bg-primary/10' : 'border-border'"
          @click="toggleDark(); onThemeChange()"
        >{{ isDark.value ? '🌙 暗色模式' : '☀️ 亮色模式' }}</button>
      </div>
    </aside>

    <main ref="scopeRef" class="backend-sidebar-theme-scope flex-1 p-8 overflow-auto"
      style="background: var(--background, #fff); color: var(--foreground, #111); font-family: var(--font-sans, sans-serif)">
      <div class="space-y-6 max-w-lg mx-auto">
        <div><h2 class="text-xl font-bold mb-1">主题预览</h2><p class="text-sm opacity-60">{{ themes[currentThemeIndex.value]?.label_zh || themes[currentThemeIndex.value]?.label }} · {{ isDark.value ? '暗色' : '亮色' }}</p></div>
        <div><p class="text-sm font-medium mb-2">色彩系统</p>
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style="background:var(--primary);color:var(--primary-foreground)">Primary</span>
            <span class="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style="background:var(--secondary);color:var(--secondary-foreground)">Secondary</span>
            <span class="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style="background:var(--destructive);color:var(--destructive-foreground)">Destructive</span>
            <span class="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style="background:var(--muted);color:var(--muted-foreground)">Muted</span>
            <span class="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style="background:var(--accent);color:var(--accent-foreground)">Accent</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-lg border p-4 shadow-sm" style="background:var(--card);color:var(--card-foreground);border-color:var(--border)"><h4 class="text-sm font-medium">Card</h4><p class="text-xs opacity-60 mt-1">bg-card</p></div>
          <div class="rounded-lg border p-4 shadow-sm" style="background:var(--popover);color:var(--popover-foreground);border-color:var(--border)"><h4 class="text-sm font-medium">Popover</h4><p class="text-xs opacity-60 mt-1">bg-popover</p></div>
        </div>
      </div>
    </main>
  </div>
</template>
