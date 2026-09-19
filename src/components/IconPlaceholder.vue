<script setup lang="ts">
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'
import { useDesignSystemSearchParams } from './useDesignSystemSearchParams'

/**
 * 动态图标渲染组件
 * 根据当前图标库选择渲染对应图标。
 * 图标库通过 URL 参数 (?iconLibrary=xxx) 联动，由 RandomUITest 控制。
 *
 * 渲染为 <svg>，这样父容器的 [&_svg]:size-* 规则会生效，
 * 图标尺寸由父容器控制（通常 16px）。
 */
interface Props {
  /** Lucide 图标名，如 "LockKeyholeIcon" */
  lucide?: string
  tabler?: string
  hugeicons?: string
  phosphor?: string
  remixicon?: string
  /** 当前激活的图标库（可选，默认从 URL 参数读取） */
  iconLibrary?: string
  class?: string
}

const props = defineProps<Props>()

// 从 URL 参数读取当前图标库（与 RandomUITest 联动）
const { iconLibrary: urlIconLibrary } = useDesignSystemSearchParams()

const activeIcon = computed(() => {
  const lib = props.iconLibrary ?? urlIconLibrary.value ?? 'lucide'
  switch (lib) {
    case 'lucide':
      return props.lucide
    case 'tabler':
      return props.tabler
    case 'hugeicons':
      return props.hugeicons
    case 'phosphor':
      return props.phosphor
    case 'remixicon':
      return props.remixicon
    default:
      return props.lucide
  }
})

const iconComponent = computed(() => {
  const name = activeIcon.value
  if (!name) return null
  return (LucideIcons as Record<string, unknown>)[name] ?? null
})
</script>

<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    :class="props.class"
    data-slot="icon-placeholder"
  />
</template>

