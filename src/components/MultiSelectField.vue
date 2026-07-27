<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { X, ChevronsUpDown, Search } from 'lucide-vue-next'

export interface ComboboxOption {
  label: string
  value: any
}

const props = withDefaults(defineProps<{
  modelValue: any[]
  placeholder?: string
  options: ComboboxOption[]
  disabled?: boolean
}>(), {
  placeholder: '搜索或选择…',
})

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
  'change': [value: any[]]
}>()

const open = ref(false)
const search = ref('')

const filteredOptions = computed(() => {
  const kw = search.value.trim().toLowerCase()
  if (!kw) return props.options
  return props.options.filter(o => o.label.toLowerCase().includes(kw))
})

const selectedLabels = computed(() =>
  props.options.filter(o => props.modelValue.includes(o.value)).map(o => o.label)
)

function toggle(value: any) {
  const current = [...props.modelValue]
  const idx = current.indexOf(value)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    current.push(value)
  }
  emit('update:modelValue', current)
  emit('change', current)
}

function remove(value: any) {
  const current = props.modelValue.filter(v => v !== value)
  emit('update:modelValue', current)
  emit('change', current)
}

function clearAll() {
  emit('update:modelValue', [])
  emit('change', [])
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" class="w-full justify-between h-auto min-h-10 font-normal py-2 px-3" :disabled="disabled">
        <div class="flex flex-wrap gap-1.5 items-center flex-1 min-w-0">
          <template v-if="selectedLabels.length">
            <Badge v-for="(label, i) in selectedLabels.slice(0, 5)" :key="i" variant="secondary" class="text-xs gap-1 pr-1 py-0.5">
              {{ label }}
              <button class="ml-0.5 rounded-full hover:bg-muted-foreground/20" @click.stop="remove(props.modelValue[i])">
                <X class="h-3 w-3" />
              </button>
            </Badge>
            <span v-if="selectedLabels.length > 3" class="text-xs text-muted-foreground">+{{ selectedLabels.length - 3 }}</span>
          </template>
          <span v-else class="text-muted-foreground text-sm">{{ placeholder }}</span>
        </div>
        <div class="flex items-center gap-1 shrink-0 ml-1">
          <button v-if="selectedLabels.length" class="hover:text-destructive" @click.stop="clearAll">
            <X class="h-4 w-4" />
          </button>
          <ChevronsUpDown class="h-4 w-4 opacity-50" />
        </div>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[--radix-popover-trigger-width] p-0" align="start">
      <div class="flex items-center border-b px-3 py-2">
        <Search class="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
        <input
          v-model="search"
          placeholder="搜索…"
          class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div class="max-h-60 overflow-y-auto p-1">
        <div v-for="opt in filteredOptions" :key="opt.value"
          class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-accent text-sm"
          @click="toggle(opt.value)"
        >
          <Checkbox :model-value="props.modelValue.includes(opt.value)" class="pointer-events-none" />
          {{ opt.label }}
        </div>
        <div v-if="!filteredOptions.length" class="text-sm text-muted-foreground p-2 text-center">无匹配项</div>
      </div>
    </PopoverContent>
  </Popover>
</template>
