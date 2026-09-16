<script setup lang="ts">
/**
 * Input —— 单行文本输入框（原生 `<input>` 的样式封装，没有额外抽象层）。
 *
 * - 值：`v-model` 双向绑定（`string | number`）；只想给个初始值、不想在外面维护状态时用 `defaultValue`
 * - 除 `defaultValue` / `modelValue` / `class` 之外的属性（`type`、`placeholder`、`disabled`、
 *   `readonly`、`required`、`name`、`id`、`autocomplete`…）都会原样透传到 `<input>` 上
 * - 错误态：加 `aria-invalid="true"` 即变红边 + 红 ring（含暗色适配），配合 Field / FieldError 使用
 * - 尺寸、内边距、圆角由样式预设写死（`h-9` / `px-2.5` / `rounded-md`），
 *   想改这些要带 `!`（如 `h-12!`、`rounded-full!`、`pl-9!`）——包括 `padding-left`，
 *   预设的 `px-2.5` 会把它一起锁住，否则会被预设压掉
 * - **`ref` 拿到的是组件实例，不是 `<input>` DOM**（没有 `defineExpose`）：
 *   要操作 DOM 用 `refEl.$el`，或直接按 `id` 取
 * - 需要「输入框 + 前后缀图标 / 按钮 / 单位」请用 InputGroup，不要在这里堆绝对定位
 */
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes["class"]
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      props.class,
    )"
  >
</template>
