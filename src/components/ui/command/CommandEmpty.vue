<script setup lang="ts">
/**
 * CommandEmpty —— 空结果提示。
 *
 * 只在「已经输入了搜索词、且命中数为 0」时渲染（搜索词为空时不显示，同上游行为）。
 * 判定用的就是 Command 提供的 filterState，不需要自己算。
 * 这里用 Primitive 包裹，是为了让 as-child 能把它换成自定义元素。
 */
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Primitive } from "reka-ui"
import { computed } from "vue"
import { cn } from "../../../lib/utils"
import { useCommand } from "."

const props = defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const { filterState } = useCommand()
const isRender = computed(() => !!filterState.search && filterState.filtered.count === 0)
</script>

<template>
  <Primitive
    v-if="isRender"
    data-slot="command-empty"
    v-bind="delegatedProps"
    :class="cn('py-6 text-center text-sm', props.class)"
  >
    <slot />
  </Primitive>
</template>
