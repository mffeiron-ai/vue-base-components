<script setup lang="ts">
/**
 * Empty —— 空状态容器（列表为空、搜索无结果、还没建数据 …）。
 *
 * 典型结构：`Empty` → `EmptyHeader`（`EmptyMedia` + `EmptyTitle` + `EmptyDescription`）
 * + `EmptyContent`（放操作按钮）。
 *
 * 几个要点：
 * - 自带 `min-w-0 flex-1`：放进卡片 / 表格单元里能撑满剩余空间并居中
 * - 只写了 `border-dashed`（虚线样式），**没有 border 宽度** —— 想要虚线框自己加 `class="border"`
 * - 宽度靠外层容器控制；里面那些 `max-w-sm` 是给标题/描述限制行长用的
 */

import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="empty"
    :class="cn(
      'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance rounded-lg border-dashed p-6 text-center md:p-12',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
