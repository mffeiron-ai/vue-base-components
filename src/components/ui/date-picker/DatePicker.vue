<script setup lang="ts">
/**
 * DatePicker —— 单日选择（Popover + Calendar）。
 *
 * 用法：
 *   const date = ref<CalendarDate | null>(null)
 *   <DatePicker v-model="date" />
 *
 * 几点约定：
 *  - v-model 的类型是 `CalendarDate`（reka 原生日期值，纯年月日、不受时区偏移影响），
 *    不要传字符串，避免「格式/时区」歧义；进出接口用 utils 里的 `formatDateISO` / `toCalendarDate`。
 *  - 日历的能力全部可以从外面透传过来：`min-value` / `max-value` / `is-date-unavailable`（禁用某些天）/
 *    `layout`（月+年 / 仅月 / 仅年下拉标题）/ `page-animation`（换月动画）/ `locale` / `weekday-format` …
 *  - `clearable` 时右侧给一个清空小按钮；`format` 可换成自己的展示文案（默认按 locale 出「2026年9月15日」）。
 *  - 选完自动收起弹层；想自己控制展开就用 `v-model:open`（不传则内部自管）。
 */
import type { DateValue } from "@internationalized/date"
import type { CalendarRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit, useVModel } from "@vueuse/core"
import { CalendarDays, X } from "lucide-vue-next"
import { computed } from "vue"
import { cn } from "../../../lib/utils"
import { Button } from "../button"
import { Calendar } from "../calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"
import { formatDateLabel } from "./utils"

const props = withDefaults(defineProps<
  // 先把 reka 日历的 props 继承下来（min/max/locale/layout/动画…），只剔除我们要自己接管的几个
  Omit<CalendarRootProps, "modelValue" | "defaultValue" | "placeholder" | "defaultPlaceholder"> & {
    /** 选中的日期；空值用 null / undefined */
    modelValue?: DateValue | null
    /** 弹层展开状态（受控用，不传则内部自管） */
    open?: boolean
    class?: HTMLAttributes["class"]
    /** 未选值时的占位文案 */
    placeholder?: string
    /** 弹层相对按钮的对齐方式 */
    align?: "start" | "center" | "end"
    /** 自定义展示格式；不传则按 locale 出「2026年9月15日」 */
    format?: (value: DateValue) => string
    /** 有值时是否显示清空按钮 */
    clearable?: boolean
    /** 禁用整个选择器 */
    disabled?: boolean
    /** 透传给触发按钮的视觉变体 / 尺寸 */
    variant?: any
    size?: any
  }
>(), {
  modelValue: null,
  open: undefined,
  placeholder: "选择日期",
  align: "start",
  clearable: false,
  disabled: false,
  locale: "zh-CN",
})

const emits = defineEmits<{
  (e: "update:modelValue", value: DateValue | null): void
  (e: "update:open", value: boolean): void
  /** 值真的变了才触发（选中 / 清空） */
  (e: "change", value: DateValue | null): void
}>()

// 展开状态：受控（外部传 open）与非受控（内部自管）走同一套写法
const open = useVModel(props, "open", emits, { passive: true, defaultValue: false })

// 值也一样走 useVModel：不传 v-model 时内部能自己维护，
// 否则 emit 出去没人接，选完日期按钮上的文案不会更新
const modelValue = useVModel(props, "modelValue", emits, { passive: true })

/** 当前选中值（统一成 null 方便模板判断） */
const selected = computed<DateValue | null>(() => modelValue.value ?? null)

/** 按钮上显示的文案 */
const display = computed(() =>
  selected.value
    ? (props.format ? props.format(selected.value) : formatDateLabel(selected.value, props.locale ?? "zh-CN"))
    : props.placeholder,
)

// 除自己接管的字段外，其余全部原样喂给 <Calendar>（这就是「日历全能力可透传」的落点）
const calendarProps = reactiveOmit(
  props,
  "class",
  "modelValue",
  "open",
  "placeholder",
  "align",
  "format",
  "clearable",
  "disabled",
  "variant",
  "size",
)

function onSelect(value: any) {
  const next = (value ?? null) as DateValue | null
  modelValue.value = next
  emits("change", next)
  // 选完就收起来：日期选择绝大多数场景就是要「点完即走」
  open.value = false
}

function clear(event: MouseEvent) {
  // 阻止冒泡，否则会顺手把弹层打开
  event.stopPropagation()
  modelValue.value = null
  emits("change", null)
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :size="size"
        :disabled="disabled"
        :class="cn('w-[240px] justify-start gap-2 font-normal', !selected && 'text-muted-foreground', props.class)"
        data-slot="date-picker-trigger"
      >
        <CalendarDays class="size-4 shrink-0 opacity-70" />
        <span class="truncate">{{ display }}</span>
        <X
          v-if="clearable && selected && !disabled"
          class="ml-auto size-4 shrink-0 opacity-60 hover:opacity-100"
          @click="clear"
        />
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-auto p-0" :align="align">
      <Calendar
        :model-value="selected"
        v-bind="calendarProps"
        @update:model-value="onSelect"
      />
    </PopoverContent>
  </Popover>
</template>
