<script setup lang="ts">
/**
 * RichTable · 单元格内容
 *
 * 4 种形态：markdown（异步加载 md-editor-v3，不给列表页背体积）/ 图片 / 枚举（走 options 映射）/
 * 默认文本（多行裁切）。自定义渲染仍由消费方的具名插槽负责，这里只当兜底。
 */
import type { CSSProperties } from 'vue'
import { computed, defineAsyncComponent } from 'vue'
import type { Column } from './types'

/** markdown 单元格：只有真出现 md 列时才异步拉 md-editor-v3（含样式），不给列表页背体积 */
const MdPreview = defineAsyncComponent(async () => {
  await import('md-editor-v3/lib/style.css')
  const mod = await import('md-editor-v3')
  return mod.MdPreview
})

const props = withDefaults(defineProps<{
  col: Column
  row: Record<string, unknown>
  /** 多行裁切样式（由父组件按 `cellMaxLines` 算好，保证与旧版逐像素一致） */
  clampStyle?: CSSProperties
  /** markdown 单元格最多显示行数 */
  maxLines?: number
  /** 图片地址归一化（业务可传 CDN 前缀） */
  resolveImageUrl?: (url: string) => string
}>(), {
  maxLines: 3,
  clampStyle: () => ({ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: '3', overflow: 'hidden' }),
})

const imgUrl = (url: string) => (props.resolveImageUrl ? props.resolveImageUrl(url) : url)

/**
 * 当前单元格的原始值。
 * `col.field` 统一 `String()` 成字符串键再去索引：`Column` 的泛型默认是 `any`，
 * `keyof any` 含 `number | symbol`，直接拿来索引 `Record<string, unknown>` 会报
 * 「类型"symbol"不能作为索引类型使用」。
 */
const value = computed(() => props.row[String(props.col.field)])

/** 枚举列的显示文案（优先 options 映射） */
const optionLabel = computed(() => {
  const opts = props.col.options
  if (!opts) return value.value
  return opts.find(opt => opt.value === value.value)?.label ?? value.value
})
</script>

<template>
  <template v-if="col.type === 'markdown'">
    <div class="overflow-hidden break-words" :style="{ maxHeight: `${(maxLines ?? 3) * 1.5}em` }">
      <MdPreview :model-value="String(value ?? '')" />
    </div>
  </template>
  <template v-else-if="col.type === 'image'">
    <img :src="imgUrl(String(value ?? ''))" alt="" class="max-h-24 max-w-28 object-contain" />
  </template>
  <template v-else-if="col.type === 'select' && col.options">
    <div class="break-words" :style="clampStyle">{{ optionLabel }}</div>
  </template>
  <template v-else>
    <slot>
      <div class="break-words" :style="clampStyle">{{ value }}</div>
    </slot>
  </template>
</template>
