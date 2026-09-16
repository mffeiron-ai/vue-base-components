<script setup lang="ts">
/**
 * DatePickerInput —— 「输入框 + 日历」的单日选择。
 *
 * 用法：
 *   const date = ref<CalendarDate | null>(null)
 *   <DatePickerInput v-model="date" />
 *
 * 为什么要有这个形态：表单场景里用户经常想直接敲日期（从别处复制一行 `2026-09-15` 最快），
 * 所以输入框和日历是**同一个值**的两种入口：
 *  - 框里手输 `2026-09-15`（也认 `2026/9/5`、`2026.9.5`），回车或失焦时解析成日期；
 *  - 解析失败不会清掉用户输入，只把框标红（`aria-invalid`，走 Input 自带的错误态样式）；
 *  - 右侧日历图标点开弹层，选中后回填输入框。
 *
 * 日历能力同样可从外面透传（`min-value` / `max-value` / `is-date-unavailable` / `layout` / `locale` …）。
 */
import type { DateValue } from "@internationalized/date"
import type { CalendarRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit, useVModel } from "@vueuse/core"
import { CalendarDays } from "lucide-vue-next"
import { ref, watch } from "vue"
import { cn } from "../../../lib/utils"
import { Button } from "../button"
import { Calendar } from "../calendar"
import { Input } from "../input"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"
import { formatDateISO, parseDateInput } from "./utils"

const props = withDefaults(defineProps<
  Omit<CalendarRootProps, "modelValue" | "defaultValue" | "placeholder" | "defaultPlaceholder"> & {
    modelValue?: DateValue | null
    open?: boolean
    class?: HTMLAttributes["class"]
    /** 框里的占位提示（默认就是可输入的格式示例） */
    inputPlaceholder?: string
    /** 弹层相对输入框右侧的对齐方式 */
    align?: "start" | "center" | "end"
    disabled?: boolean
  }
>(), {
  modelValue: null,
  open: undefined,
  inputPlaceholder: "yyyy-MM-dd",
  align: "end",
  disabled: false,
  locale: "zh-CN",
})

const emits = defineEmits<{
  (e: "update:modelValue", value: DateValue | null): void
  (e: "update:open", value: boolean): void
  (e: "change", value: DateValue | null): void
  /** 用户敲的内容解析不出来（便于外面弹提示 / 阻止提交） */
  (e: "invalid", text: string): void
}>()

const open = useVModel(props, "open", emits, { passive: true, defaultValue: false })

// 值也走 useVModel（同 DatePicker）：不传 v-model 时内部自己维护
const modelValue = useVModel(props, "modelValue", emits, { passive: true })

/** 输入框里的文本（独立于 modelValue：允许「正在输入的中间态」与已选值不一致） */
const text = ref(formatDateISO(modelValue.value))
/** 当前输入是否解析失败（解析失败才标红，一改就恢复） */
const invalid = ref(false)

// 外部改值（含初始化）就同步到输入框；解析失败期间不回写，免得把用户正在敲的内容冲掉
watch(modelValue, (value) => {
  if (invalid.value) return
  const next = formatDateISO(value)
  if (next !== text.value) text.value = next
})

const calendarProps = reactiveOmit(
  props,
  "class",
  "modelValue",
  "open",
  "inputPlaceholder",
  "align",
  "disabled",
)

function emitValue(value: DateValue | null) {
  modelValue.value = value
  emits("change", value)
}

/** 解析输入框内容：空 → 清空值；能解析 → 提交；解不了 → 标红并通知外部 */
function commit() {
  const raw = text.value.trim()
  if (!raw) {
    invalid.value = false
    if (modelValue.value) emitValue(null)
    return
  }
  const parsed = parseDateInput(raw)
  if (!parsed) {
    invalid.value = true
    emits("invalid", raw)
    return
  }
  invalid.value = false
  text.value = formatDateISO(parsed)
  if (formatDateISO(modelValue.value) !== text.value) emitValue(parsed)
}

function onSelect(value: any) {
  const next = (value ?? null) as DateValue | null
  invalid.value = false
  text.value = formatDateISO(next)
  emitValue(next)
  open.value = false
}
</script>

<template>
  <div :class="cn('relative w-[220px]', props.class)">
    <Input
      v-model="text"
      :placeholder="inputPlaceholder"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      class="pr-9"
      data-slot="date-picker-input"
      @keydown.enter.prevent="commit"
      @blur="commit"
      @input="invalid = false"
    />

    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          :disabled="disabled"
          class="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
          aria-label="打开日历"
        >
          <CalendarDays class="size-4 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent class="w-auto p-0" :align="align">
        <Calendar
          :model-value="modelValue ?? undefined"
          v-bind="calendarProps"
          @update:model-value="onSelect"
        />
      </PopoverContent>
    </Popover>
  </div>
</template>
