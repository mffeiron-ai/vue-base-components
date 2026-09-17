<script setup lang="ts">
/**
 * MarkerContent —— 标记里的文字。
 *
 * - `min-w-0` + `wrap-break-word`：长文案能正常换行，不会把整行撑开
 * - `separator` 变体下自动 `flex-none` + 文字居中：两侧横线由 Marker 的
 *   `before/after` 伪元素画（它们 `flex-1` 撑开），文字只要「别长大」就行
 * - 里面放 `<a>` 会自动带下划线与 hover 变色
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

interface Props {
  class?: HTMLAttributes["class"]
}

const props = defineProps<Props>()
</script>

<template>
  <span
    data-slot="marker-content"
    :class="cn('group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:hover:text-foreground *:[a]:underline *:[a]:underline-offset-3 min-w-0 wrap-break-word', props.class)"
  >
    <slot />
  </span>
</template>
