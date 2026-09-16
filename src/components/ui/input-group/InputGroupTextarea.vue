<script setup lang="ts">
/**
 * InputGroupTextarea —— InputGroup 里的多行输入框。
 *
 * 与 `InputGroupInput` 同理：外层边框 / 聚焦态由容器负责，自己只留内容与内边距，
 * 并默认 `resize-none`（想允许拖动改变大小就传 `class="resize-y"`）。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"
import { Textarea } from "../textarea"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <Textarea
    data-slot="input-group-control"
    :class="cn(
      'flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent',
      props.class,
    )"
  />
</template>
