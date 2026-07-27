<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from './ui/button'
import {
  Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput,
  ComboboxItem, ComboboxList, ComboboxTrigger,
} from './ui/combobox'
import { ChevronsUpDown } from 'lucide-vue-next'

export interface ComboboxOption {
  label: string
  value: any
}

const props = withDefaults(defineProps<{
  modelValue: any
  placeholder?: string
  options: ComboboxOption[]
  disabled?: boolean
  /** 默认显示条数，不输入搜索词时只显示前 N 条 */
  defaultLimit?: number
  /** 搜索时是否去掉 "#id " 前缀 */
  stripIdPrefix?: boolean
}>(), {
  placeholder: '搜索或选择…',
  defaultLimit: 10,
  stripIdPrefix: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'change': [value: any]
}>()

const search = ref('')
const internalValue = ref<any>(props.modelValue)

// 外部 modelValue 变化时同步
watch(() => props.modelValue, (val) => {
  internalValue.value = val
  search.value = ''  // 外部变更时清空搜索
})

const filteredOptions = computed(() => {
  const kw = search.value.trim().toLowerCase()
  const opts = props.options || []
  if (!kw) return opts.slice(0, props.defaultLimit)
  return opts.filter(o => {
    const text = props.stripIdPrefix ? o.label.replace(/^#\d+\s+/, '') : o.label
    return text.toLowerCase().includes(kw)
  })
})

const selectedLabel = computed(() =>
  props.options.find(o => o.value === props.modelValue)?.label
)

// 售后金额	¥1721.35
// 预存金额	¥0.00
// 售后单数	16
// 售后金余额	¥-1.00

function onInput(v: string) {
  search.value = v
  // 用户开始搜索时清空内部选中，避免输入框回填旧值
  if (v) {
    internalValue.value = undefined
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !search.value.trim()) {
    // 空白回车 → 清空选中值
    internalValue.value = undefined
    emit('update:modelValue', undefined)
    emit('change', undefined)
  }
}

function onSelect(value: any) {
  internalValue.value = value
  search.value = ''
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <Combobox :model-value="internalValue" @update:model-value="onSelect">
    <ComboboxAnchor as-child>
      <ComboboxTrigger as-child>
        <Button variant="outline" class="w-full justify-between font-normal" :disabled="disabled">
          <span class="truncate">{{ selectedLabel || placeholder }}</span>
          <ChevronsUpDown class="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxList>
      <ComboboxInput :placeholder="placeholder" @update:model-value="onInput" @keydown="onKeydown" />
      <ComboboxEmpty>无匹配项</ComboboxEmpty>
      <ComboboxGroup>
        <ComboboxItem v-for="opt in filteredOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </ComboboxItem>
      </ComboboxGroup>
    </ComboboxList>
  </Combobox>
</template>
