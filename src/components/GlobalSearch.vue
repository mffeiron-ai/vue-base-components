<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import request from '@/api/request'

interface SearchResult {
  cat: string
  title: string
  id?: string | number
  sub: string
  page: string
}

const router = useRouter()
const open = ref(false)
const query = ref('')
const results = ref<SearchResult[]>([])
const loading = ref(false)
const selectedIdx = ref(-1)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function groupedResults() {
  const map: Record<string, SearchResult[]> = {}
  for (const r of results.value) {
    if (!map[r.cat]) map[r.cat] = []
    map[r.cat].push(r)
  }
  return map
}

async function doSearch() {
  const q = query.value.trim()
  if (!q) { results.value = []; return }
  loading.value = true
  try {
    const res = await request<{ code: number; data: { results: SearchResult[] } }>({
      url: '/search', method: 'GET', params: { q },
    })
    if (res.data.code === 200) {
      results.value = res.data.data?.results || []
    }
  } catch { results.value = [] }
  finally { loading.value = false }
}

watch(query, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(doSearch, 250)
  selectedIdx.value = -1
  if (query.value.trim()) open.value = true
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { open.value = false; query.value = '' }
  else if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIdx.value = Math.min(selectedIdx.value + 1, results.value.length - 1)
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIdx.value = Math.max(selectedIdx.value - 1, -1)
  }
  else if (e.key === 'Enter') {
    const idx = selectedIdx.value >= 0 ? selectedIdx.value : 0
    if (results.value[idx]) goTo(results.value[idx])
  }
}

function goTo(item: SearchResult) {
  open.value = false
  query.value = ''
  const highlightTypes: Record<string, string> = {
    '工单': '/after-sales',
    '商品': '/products',
    '招商': '/merchants',
    '商品机制': '/product-mechanisms',
  }
  const target = highlightTypes[item.cat]
  if (target && item.id != null) {
    router.push({ path: target, query: { highlight: String(item.id) } })
  } else {
    router.push(`/${item.page}`)
  }
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <div class="relative flex items-center gap-2 bg-muted/60 border border-transparent rounded-md px-3 py-1.5 w-56 text-sm text-muted-foreground focus-within:border-primary focus-within:bg-background transition-colors cursor-text">
        <Search class="h-3.5 w-3.5 shrink-0" />
        <input
          ref="inputRef"
          v-model="query"
          placeholder="搜索工单/商品/招商�?
          class="flex-1 bg-transparent outline-none text-foreground text-sm placeholder:text-muted-foreground"
          @keydown="onKeydown"
          @focus="open = !!query.trim()"
        />
      </div>
    </PopoverTrigger>
    <PopoverContent class="w-[420px] p-1 max-h-[62vh] overflow-auto" align="start" side="bottom" :side-offset="8" @open-auto-focus.prevent>
      <div v-if="loading" class="py-6 text-center text-sm text-muted-foreground">搜索中�?/div>
      <template v-else-if="!results.length && query.trim()">
        <div class="py-6 text-center text-sm text-muted-foreground">未找到与「{{ query }}」相关的结果</div>
      </template>
      <template v-else>
        <div v-for="(items, cat) in groupedResults()" :key="cat">
          <div class="text-sm text-muted-foreground px-3 py-2 font-medium">{{ cat }} · {{ items.length }}</div>
          <div
            v-for="(item, idx) in items"
            :key="idx"
            class="flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer hover:bg-accent"
            :class="{ 'bg-accent': selectedIdx === results.indexOf(item) }"
            @click="goTo(item)"
          >
            <span class="text-sm bg-primary text-primary-foreground rounded px-1.5 py-0.5 shrink-0">{{ item.cat }}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">{{ item.title }}</div>
              <div class="text-sm text-muted-foreground truncate">{{ item.sub }}</div>
            </div>
          </div>
        </div>
      </template>
    </PopoverContent>
  </Popover>
</template>
