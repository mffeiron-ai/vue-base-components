<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  code: string
  title?: string
  expanded?: boolean
}>(), {
  title: 'vue',
  expanded: true,
})

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback
  }
}
</script>

<template>
  <div class="demo-wrapper my-6 rounded-lg border border-border overflow-hidden not-prose">
    <!-- Preview 区域 -->
    <div class="demo-preview flex items-center justify-center gap-3 flex-wrap p-6 min-h-[100px] bg-gradient-to-b from-muted/30 to-background">
      <slot />
    </div>
    <!-- Code 区域 -->
    <div class="demo-code relative bg-zinc-900 dark:bg-zinc-950 text-zinc-100">
      <div class="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-zinc-800/50">
        <span class="text-xs text-zinc-400 select-none">{{ props.title }}</span>
        <button
          class="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          @click="copy"
        >
          <svg v-if="copied" class="size-3.5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
          <svg v-else class="size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          {{ copied ? '已复制' : '复制' }}
        </button>
      </div>
      <pre class="p-4 overflow-x-auto text-sm leading-relaxed font-mono whitespace-pre"><code>{{ code }}</code></pre>
    </div>
  </div>
</template>
