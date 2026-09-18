<script setup lang="ts">
import type { TabsListProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { TabsList } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = withDefaults(
  defineProps<TabsListProps & {
    class?: HTMLAttributes["class"]
    /**
     * 档位。预设里用 `data-[variant=line]` 选列表样式，
     * 触发器再用 `group-data-[variant=default|line]/tabs-list:` 读到它 ——
     * 所以既要输出 `data-variant`，也要给 `group/tabs-list`，
     * 且**必须给默认值**（不传时 Vue 不渲染 data-variant，那些规则会全部失效）。
     */
    variant?: "default" | "line"
  }>(),
  {
    variant: "default",
  },
)

const delegatedProps = reactiveOmit(props, "class", "variant")
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    :data-variant="variant"
    v-bind="delegatedProps"
    :class="cn(
      // 高度只给横向：data-orientation 在根节点上，所以要用 group-data-horizontal/tabs（本组件已给根加 group/tabs）；
      // 纵向时不能留固定高度，否则 flex-1 的触发器会被压扁。预设的 group-data-horizontal/tabs:h-* 会覆盖这里的 h-9。
      // data-vertical:* 是纵向布局的兜底（列表竖排、子项撑满宽度）
      'group/tabs-list bg-muted text-muted-foreground inline-flex w-fit items-center justify-center rounded-lg p-[3px] group-data-horizontal/tabs:h-9 data-vertical:flex-col data-vertical:items-stretch',
      props.class,
    )"
  >
    <slot />
  </TabsList>
</template>
