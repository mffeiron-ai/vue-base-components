<script setup lang="ts">
import type { AvatarFallbackProps } from "reka-ui"
/**
 * AvatarFallbackProps：
 * 继承 PrimitiveProps（as / asChild），外加：
 *   delayMs?: number 延迟多少毫秒再显示兜底内容（避免慢网下闪一下）
 * 它的全部作用 = 定义头像兜底内容接收的 props。
 */
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { AvatarFallback } from "reka-ui"
/**
 * AvatarFallback：
 * 它的全部作用 = 在图片未加载完成（且超过 delayMs）或加载失败时，显示兜底内容（文字 / 图标）。
 * 用法：
 * <AvatarFallback>CN</AvatarFallback>
 */
import { cn } from "../../../lib/utils"

const props = defineProps<AvatarFallbackProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <!-- AvatarFallback: 图片未就绪 / 加载失败时的兜底
   data-slot="avatar-fallback" 标识插槽
   v-bind="delegatedProps" 透传 delayMs / as / asChild
   class 默认：muted 底色 + 居中铺满 + 圆形 -->
  <AvatarFallback
    data-slot="avatar-fallback"
    v-bind="delegatedProps"
    :class="cn('bg-muted flex size-full items-center justify-center rounded-full', props.class)"
  >
    <slot />
  </AvatarFallback>
</template>
