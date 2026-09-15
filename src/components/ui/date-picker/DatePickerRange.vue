<script setup lang="ts">
/**
 * DatePickerRange —— 日期区间选择（Popover + RangeCalendar + 左侧快捷预设）。
 *
 * 用法：
 *   const range = ref<DateRange | null>(null)
 *   <DatePickerRange v-model="range" />
 *
 * 几点约定：
 *  - v-model 是 `{ start, end }`（两端都是 CalendarDate），空值用 null；
 *  - 左侧预设列默认给「今天 / 昨天 / 近 7 天 / 近 30 天 / 本月 / 上月」，
 *    换掉传 `:presets="[...]"`，不要这一列传 `show-presets="false"`；
 *    预设是「函数」不是固定值（`value: () => ({ start, end })`），所以页面开着跨天也不会用昨天的数据；
 *  - 日历能力（`min-value` / `max-value` / `is-date-unavailable` / `locale` / `number-of-months` …）同样可透传。
 */
import type { RangeCalendarRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit, useVModel } from "@vueuse/core"
import { CalendarRange, X } from "lucide-vue-next"
import { computed } from "vue"
import { cn } from "../../../lib/utils"
import { Button } from "../button"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"
import { RangeCalendar } from "../range-calendar"
import type { DateRange, DateRangePreset } from "./utils"
import { defaultRangePresets, formatRangeLabel } from "./utils"

const props = withDefaults(defineProps<
  Omit<RangeCalendarRootProps, "modelValue" | "defaultValue"> & {
    modelValue?: DateRange | null
    open?: boolean
    class?: HTMLAttributes["class"]
    placeholder?: string
    align?: "start" | "center" | "end"
    /** 左侧快捷预设；默认一组常用区间 */
    presets?: DateRangePreset[]
    /** 是否显示预设列 */
    showPresets?: boolean
    /** 自定义展示格式 */
    format?: (range: DateRange) => string
    clearable?: boolean
    disabled?: boolean
    variant?: any
    size?: any
  }
>(), {
  modelValue: null,
  open: undefined,
  placeholder: "选择日期区间",
  align: "start",
  presets: () => defaultRangePresets,
  showPresets: true,
  clearable: true,
  disabled: false,
  locale: "zh-CN",
})

const emits = defineEmits<{
  (e: "update:modelValue", value: DateRange | null): void
  (e: "update:open", value: boolean): void
  (e: "change", value: DateRange | null): void
}>()

const open = useVModel(props, "open", emits, { passive: true, defaultValue: false })

const selected = computed<DateRange | null>(() => props.modelValue ?? null)

/** 两端都选齐了才算「有值」，只点了一头仍然是空态文案 */
const display = computed(() => {
  const r = selected.value
  if (!r?.start || !r?.end) return props.placeholder
  return props.format ? props.format(r) : formatRangeLabel(r, props.locale ?? "zh-CN")
})

const calendarProps = reactiveOmit(
  props,
  "class",
  "modelValue",
  "defaultValue",
  "open",
  "placeholder",
  "align",
  "presets",
  "showPresets",
  "format",
  "clearable",
  "disabled",
  "variant",
  "size",
)

function emitValue(value: DateRange | null) {
  emits("update:modelValue", value)
  emits("change", value)
}

function onSelect(value: any) {
  // RangeCalendar 在「只点了开始日」时给的是 { start, end: null }，这里原样往上传，
  // 外面能据此知道「用户正在选第二头」，展示上仍按空态处理
  emitValue(value ?? null)
  if (value?.start && value?.end) open.value = false
}

function applyPreset(preset: DateRangePreset) {
  emitValue(preset.value())
  open.value = false
}

function clear(event: MouseEvent) {
  event.stopPropagation()
  emitValue(null)
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :size="size"
        :disabled="disabled"
        :class="cn('w-[300px] justify-start gap-2 font-normal', !(selected?.start && selected?.end) && 'text-muted-foreground', props.class)"
        data-slot="date-picker-range-trigger"
      >
        <CalendarRange class="size-4 shrink-0 opacity-70" />
        <span class="truncate">{{ display }}</span>
        <X
          v-if="clearable && selected?.start && !disabled"
          class="ml-auto size-4 shrink-0 opacity-60 hover:opacity-100"
          @click="clear"
        />
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-auto p-0" :align="align">
      <div class="flex">
        <!-- 快捷预设列：点一下直接落到区间并收起 -->
        <div
          v-if="showPresets && presets.length"
          class="flex w-32 flex-col gap-1 border-r border-input p-3"
        >
          <Button
            v-for="preset in presets"
            :key="preset.label"
            variant="ghost"
            size="sm"
            class="h-8 justify-start font-normal"
            :data-slot="`date-picker-preset-${preset.label}`"
            @click="applyPreset(preset)"
          >
            {{ preset.label }}
          </Button>
        </div>

        <RangeCalendar
          :model-value="selected ?? undefined"
          v-bind="calendarProps"
          @update:model-value="onSelect"
        />
      </div>
    </PopoverContent>
  </Popover>
</template>
