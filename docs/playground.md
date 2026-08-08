---
layout: page
---

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import themesData from '../src/random-ui/config/themes.json'

const themes = ref((Array.isArray(themesData) ? themesData : (themesData as any).default || []))
const currentIndex = ref(0)
const isDark = ref(false)
const scopeRef = ref<HTMLElement | null>(null)

onMounted(() => applyTheme())

function applyTheme() {
  const el = scopeRef.value
  if (!el) return
  const t = themes.value[currentIndex.value]
  if (!t?.styles) return
  const styles = t.styles[isDark.value ? 'dark' : 'light']
  if (!styles) return
  Object.entries(styles).forEach(([key, value]) => {
    if (value !== undefined && value !== null) el.style.setProperty(`--${key}`, value as string)
  })
}

function selectTheme(i: number) { currentIndex.value = i; applyTheme() }
function toggleMode() { isDark.value = !isDark.value; applyTheme() }
</script>

# 🎨 主题预览

<div class="playground-container">
  <aside class="playground-sidebar">
    <h3>主题 ({{ themes.length }})</h3>
    <div class="theme-grid">
      <button v-for="(t, i) in themes" :key="i" @click="selectTheme(i)"
        :class="{ active: i === currentIndex }">{{ t.label_zh || t.label }}</button>
    </div>
    <button class="mode-toggle" @click="toggleMode">{{ isDark ? '🌙 暗色模式' : '☀️ 亮色模式' }}</button>
  </aside>

  <main ref="scopeRef" class="playground-preview">
    <p class="preview-label">{{ themes[currentIndex]?.label_zh || themes[currentIndex]?.label || '加载中...' }} · {{ isDark ? '暗色' : '亮色' }}</p>
    <p class="section-title">色彩系统</p>
    <div class="color-badges">
      <span class="badge badge-primary">Primary</span>
      <span class="badge badge-secondary">Secondary</span>
      <span class="badge badge-destructive">Destructive</span>
      <span class="badge badge-muted">Muted</span>
      <span class="badge badge-accent">Accent</span>
    </div>
    <div class="card-grid">
      <div class="demo-card card-style"><h4>Card 样式</h4><p>bg-card · border · shadow</p></div>
      <div class="demo-card popover-style"><h4>Popover 样式</h4><p>bg-popover · border · shadow</p></div>
    </div>
  </main>
</div>

<style>
.playground-container {
  display: flex; gap: 0; height: 80vh; border-radius: 0.75rem;
  border: 1px solid var(--vp-c-divider); overflow: hidden; margin-top: 1rem;
}
.playground-sidebar {
  width: 240px; flex-shrink: 0; border-right: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft); padding: 1rem; overflow-y: auto;
  display: flex; flex-direction: column; gap: 0.75rem;
}
.playground-sidebar h3 { font-size: 0.875rem; font-weight: 600; margin: 0; }
.theme-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem;
  max-height: calc(80vh - 120px); overflow-y: auto;
}
.theme-grid button {
  text-align: left; padding: 0.375rem 0.5rem; border-radius: 0.375rem;
  font-size: 0.75rem; border: 1px solid var(--vp-c-divider); cursor: pointer;
  background: transparent; color: var(--vp-c-text-1);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.theme-grid button.active {
  border-color: var(--vp-c-brand); background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
}
.mode-toggle {
  width: 100%; padding: 0.5rem; border-radius: 0.375rem; font-size: 0.875rem;
  border: 1px solid var(--vp-c-divider); cursor: pointer; background: transparent;
}
.playground-preview {
  flex: 1; padding: 2rem; overflow: auto;
}
.preview-label { font-size: 0.875rem; margin-bottom: 1.5rem; opacity: 0.6; }
.section-title { font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
.color-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
.badge {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 9999px; padding: 0.125rem 0.625rem;
  font-size: 0.75rem; font-weight: 600;
}
.badge-primary { background: var(--primary); color: var(--primary-foreground); }
.badge-secondary { background: var(--secondary); color: var(--secondary-foreground); }
.badge-destructive { background: var(--destructive); color: var(--destructive-foreground); }
.badge-muted { background: var(--muted); color: var(--muted-foreground); }
.badge-accent { background: var(--accent); color: var(--accent-foreground); }
.card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }
.demo-card {
  border-radius: 0.5rem; border: 1px solid var(--border, #e2e8f0);
  padding: 1rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.demo-card h4 { font-size: 0.875rem; font-weight: 500; margin: 0; }
.demo-card p { font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.6; }
.card-style { background: var(--card); color: var(--card-foreground); }
.popover-style { background: var(--popover); color: var(--popover-foreground); }
</style>

