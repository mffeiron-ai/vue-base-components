<script setup lang="ts">
import type { AvatarImageProps } from "reka-ui"
/**
 * AvatarImageProps：
 * 继承 PrimitiveProps（as / asChild），外加：
 *   src: string 必填，图片地址
 *   referrerPolicy?: 图片请求的 referrer 策略
 *   crossOrigin?: 跨域属性
 * 它的全部作用 = 定义头像图片接收的 props。
 */
import { AvatarImage } from "reka-ui"
/**
 * AvatarImage：
 * 它的全部作用 = 渲染头像图片，并在加载完成后把 imageLoadingStatus 回写给 AvatarRoot；
 * 图片加载失败时会自动隐藏，由 AvatarFallback 顶上。
 * 事件：@loadingStatusChange 可拿到 'idle' | 'loading' | 'loaded' | 'error'。
 * 用法：
 * <AvatarImage src="..." alt="..." />
 */

const props = defineProps<AvatarImageProps>()
</script>

<template>
  <!-- AvatarImage: 头像图片
   data-slot="avatar-image" 标识插槽
   class 默认 aspect-square size-full：铺满圆形容器且不变形 -->
  <AvatarImage
    data-slot="avatar-image"
    v-bind="props"
    class="aspect-square size-full"
  >
    <slot />
  </AvatarImage>
</template>
