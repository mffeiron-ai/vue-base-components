<script setup lang="ts">
/**
 * CommandGroup —— 选项分组。
 *
 * - heading 是本库补的便捷 prop：传了就渲染一个 reka 的 ListboxGroupLabel
 *   （data-slot="command-group-heading"）。
 * - heading 是本地私有 prop，必须从要透传给 reka 的 props 里剔除，
 *   否则会作为无意义的 DOM 属性出现在分组元素上。
 * - 搜索时用 `hidden` 整组隐藏（只要组里还有一个命中就不隐藏），由 Command 的
 *   filterState.filtered.groups 决定；同时通过 provideCommandGroupContext 把自己的 id
 *   告诉组内 Item，Item 注册时就能归到这一组。
 * - 预设的标题样式挂在 `[data-slot="command-group-heading"]` 上（已从 cmdk 的
 *   `[cmdk-group-heading]` 选择器统一过来），比如字号 text-xs / 颜色 / 内边距；
 *   组件自带的类是没套预设时的兜底。
 */
import type { ListboxGroupProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ListboxGroup, ListboxGroupLabel, useId } from "reka-ui"
import { computed, onMounted, onUnmounted } from "vue"
import { cn } from "../../../lib/utils"
import { provideCommandGroupContext, useCommand } from "."

const props = defineProps<ListboxGroupProps & {
  class?: HTMLAttributes["class"]
  heading?: string
}>()

const delegatedProps = reactiveOmit(props, "class", "heading")

const { allGroups, filterState } = useCommand()
const id = useId()

const isRender = computed(() => !filterState.search ? true : filterState.filtered.groups.has(id))

provideCommandGroupContext({ id })
onMounted(() => {
  if (!allGroups.value.has(id))
    allGroups.value.set(id, new Set())
})
onUnmounted(() => {
  allGroups.value.delete(id)
})
</script>

<template>
  <ListboxGroup
    v-bind="delegatedProps"
    :id="id"
    data-slot="command-group"
    :class="cn('text-foreground overflow-hidden p-1', props.class)"
    :hidden="isRender ? undefined : true"
  >
    <ListboxGroupLabel v-if="heading" data-slot="command-group-heading" class="px-2 py-1.5 text-sm font-medium text-muted-foreground">
      {{ heading }}
    </ListboxGroupLabel>
    <slot />
  </ListboxGroup>
</template>
