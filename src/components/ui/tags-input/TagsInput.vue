<script setup lang="ts">
import type { TagsInputRootEmits, TagsInputRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { TagsInputRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "../../../lib/utils"

const props = defineProps<TagsInputRootProps & { class?: HTMLAttributes["class"] }>()
const emits = defineEmits<TagsInputRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <TagsInputRoot
    v-slot="slotProps" v-bind="forwarded" :class="cn(
      'flex flex-wrap gap-2 items-center rounded-md border border-input bg-background px-2 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none',
      'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
      // data-invalid：reka 在「添加被拒」时会自己打上（实测重复项会，超上限只 emit invalid），
      // 所以这里用 data-invalid 变体让内置报错样式自动生效；aria-invalid 那两条留给手动传的情况。
      'data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40',
      'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
      props.class)"
  >
    <slot v-bind="slotProps" />
  </TagsInputRoot>
</template>
