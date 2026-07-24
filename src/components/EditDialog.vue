<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import ComboboxField from './ComboboxField.vue'
import { RangeCalendar } from './ui/range-calendar'

/** 字段配置 */
export interface FieldConfig {
  label: string
  field: string
  type?: 'text' | 'number' | 'password' | 'combobox' | 'select' | 'textarea' | 'daterange' | 'slot'
  required?: boolean
  placeholder?: string
  disabled?: boolean
  /** combobox 选项 */
  options?: { label: string; value: any }[]
  /** 列跨度 1-12，默认 12 */
  span?: number
  /** 分组标题（非空时前面显示分割线） */
  section?: string
  /** 条件显示：form[field]===value 时才可见 */
  showWhen?: { field: string; value: any }
}

const props = defineProps<{
  open: boolean
  title: string
  fields: FieldConfig[]
  initialData?: Record<string, any>
  saving?: boolean
  size?: 'lg' | 'xl' | '2xl'
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [data: Record<string, any>]
  'fieldChange': [field: string, value: any]
}>()

const form = ref<Record<string, any>>({})
/** 上一次 form 快照，用于检测字段变更 */
const prevForm = ref<Record<string, any>>({})

/** 调试 + 字段变更事件（供父组件联动） */
watch(form, (val) => {
  console.log('[EditDialog] form changed:', JSON.stringify(val, null, 2))
  for (const key of Object.keys(val)) {
    if (val[key] !== prevForm.value[key]) {
      emit('fieldChange', key, val[key])
    }
  }
  prevForm.value = { ...val }
}, { deep: true })

/** 对话框打开时同步 initialData */
watch(() => props.open, (val) => {
  if (val) {
    form.value = { ...(props.initialData || {}) }
    prevForm.value = { ...form.value }
  }
})

function onSave() {
  console.log('[EditDialog] onSave form:', JSON.stringify(form.value, null, 2))
  emit('save', { ...form.value })
}

/** 检查是否为 @internationalized/date 的 CalendarDate（含 year/month/day） */
function isDate(v: any): v is { year: number; month: number; day: number } {
  return v && typeof v.year === 'number' && typeof v.month === 'number' && typeof v.day === 'number'
}

function formatDate(d: { year: number; month: number; day: number }): string {
  return `${d.year}.${d.month}.${d.day}`
}

function spanClass(s: number | undefined): string {
  const n = Math.min(s || 12, 12)
  return 'col-span-' + n
}

function isFieldVisible(f: FieldConfig): boolean {
  if (!f.showWhen) return true
  return form.value[f.showWhen.field] === f.showWhen.value
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent :class="size === '2xl' ? 'sm:max-w-2xl' : size === 'xl' ? 'sm:max-w-xl' : 'sm:max-w-lg'" class="max-h-[85vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{{ title }}</DialogTitle><DialogDescription class="hidden" /></DialogHeader>

      <div class="grid grid-cols-12 gap-3 py-2">
        <template v-for="f in fields" :key="f.field">
          <div v-if="f.section" class="col-span-12 pt-2 first:pt-0">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{{ f.section }}</span>
              <div class="flex-1 border-t border-border" />
            </div>
          </div>
          <div v-show="isFieldVisible(f)" :class="spanClass(f.span)">
            <Label>{{ f.label }}<span v-if="f.required" class="text-destructive ml-0.5">*</span></Label>

            <template v-if="!f.type || f.type === 'text'">
              <Input v-model="form[f.field]" :placeholder="f.placeholder" :disabled="f.disabled" class="mt-1.5" />
            </template>
            <template v-else-if="f.type === 'password'">
              <Input v-model="form[f.field]" type="password" :placeholder="f.placeholder" :disabled="f.disabled" class="mt-1.5" />
            </template>
            <template v-else-if="f.type === 'number'">
              <Input v-model.number="form[f.field]" type="number" :placeholder="f.placeholder" :disabled="f.disabled" class="mt-1.5" step="0.01" min="0" />
            </template>
            <template v-else-if="f.type === 'textarea'">
              <Textarea v-model="form[f.field]" :placeholder="f.placeholder" :disabled="f.disabled" class="mt-1.5 min-h-[80px]" />
            </template>
            <template v-else-if="f.type === 'select'">
              <Select v-model="form[f.field]" class="mt-1.5">
                <SelectTrigger class="w-full"><SelectValue :placeholder="f.placeholder || '请选择'" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="opt in (f.options || [])" :key="opt.value" :value="opt.value">
                    <span class="truncate">{{ opt.label }}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </template>
            <template v-else-if="f.type === 'combobox'">
              <ComboboxField
                v-model="form[f.field]"
                :placeholder="f.placeholder || '搜索或选择…'"
                :options="f.options || []"
                :strip-id-prefix="true"
                class="mt-1.5"
              />
            </template>
            <template v-else-if="f.type === 'daterange'">
              <RangeCalendar v-model="form[f.field]" :number-of-months="2" class="mt-1.5 rounded-md border" />
              <p class="text-sm text-muted-foreground mt-1" v-if="isDate(form[f.field]?.start) && isDate(form[f.field]?.end)">
                {{ formatDate(form[f.field].start) }} ~ {{ formatDate(form[f.field].end) }}
              </p>
            </template>
            <template v-else-if="f.type === 'slot'">
              <slot :name="f.field" />
            </template>
          </div>
        </template>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">取消</Button>
        <Button :disabled="saving" @click="onSave">{{ saving ? '保存中…' : '保存' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>