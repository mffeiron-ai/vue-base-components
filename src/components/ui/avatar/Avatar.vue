<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { AvatarRoot } from "reka-ui"
/**
 * AvatarRoot：
 * reka-ui 的头像根组件，提供 avatar 上下文（记录图片加载状态 imageLoadingStatus），
 * 让内部的 AvatarImage / AvatarFallback 据此决定谁显示。
 * props：仅继承 PrimitiveProps（as / asChild）。
 * 用法：
 * <AvatarRoot>
 *   <AvatarImage />
 *   <AvatarFallback />
 * </AvatarRoot>
 */
import { cn } from "../../../lib/utils"

/** 尺寸档位：样式预设按 data-size 取值（sm=size-6 / default=size-8 / lg=size-10） */
type AvatarSize = "sm" | "default" | "lg"

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"]
    size?: AvatarSize
  }>(),
  {
    size: "default",
  },
)
</script>

<template>
  <!-- AvatarRoot: 头像根容器
   data-slot="avatar" 标识插槽，便于样式按 data-slot 定位
   data-size 供样式预设切换尺寸档位
   class 默认：相对定位 + 固定尺寸（size-8）+ 圆形裁切 -->
  <AvatarRoot
    data-slot="avatar"
    :data-size="size"
    :class="cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', props.class)"
  >
    <!-- 默认插槽：放 AvatarImage / AvatarFallback -->
    <slot />
  </AvatarRoot>
</template>
