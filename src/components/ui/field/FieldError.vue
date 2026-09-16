<script setup lang="ts">
/**
 * FieldError —— 字段的错误提示（红色小字，`role="alert"`）。
 *
 * - `errors` 既接受字符串数组，也接受 vee-validate 那种 `{ message }` 数组；
 *   会自动去重：只有一条时输出字符串，多条则逐个列出
 * - 两条都不传 / 没有内容时整个不渲染（不占位）
 * - 想手写文案直接用默认插槽，插槽优先于 `errors`
 */
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
  errors?: Array<string | { message: string | undefined } | undefined>
}>()

const content = computed(() => {
  if (!props.errors || props.errors.length === 0)
    return null

  const uniqueErrors = [
    ...new Map(
      props.errors
        .filter(Boolean)
        .map((error) => {
          const message = typeof error === "string" ? error : error?.message
          return [message, error]
        }),
    ).values(),
  ]

  if (uniqueErrors.length === 1 && uniqueErrors[0]) {
    return typeof uniqueErrors[0] === "string" ? uniqueErrors[0] : uniqueErrors[0].message
  }

  return uniqueErrors.map(error => typeof error === "string" ? error : error?.message)
})
</script>

<template>
  <div
    v-if="$slots.default || content"
    role="alert"
    data-slot="field-error"
    :class="cn('text-destructive text-sm font-normal', props.class)"
  >
    <slot v-if="$slots.default" />

    <template v-else-if="typeof content === 'string'">
      {{ content }}
    </template>

    <ul v-else-if="Array.isArray(content)" class="ml-4 flex list-disc flex-col gap-1">
      <li v-for="(error, index) in content" :key="index">
        {{ error }}
      </li>
    </ul>
  </div>
</template>
