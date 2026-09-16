<script setup lang="ts">
/**
 * InputGroupInput —— InputGroup 里的输入框。
 *
 * 就是 `Input` 去掉边框 / 圆角 / 阴影 / ring（外框和聚焦态交给 InputGroup 容器），
 * 并打上 `data-slot="input-group-control"` 给容器识别。
 * 除样式外的用法与 `Input` 完全一致：`v-model` / `type` / `placeholder` /
 * `aria-invalid` / `disabled` 等属性全部透传。
 *
 * 注意：内部用了 `useVModel`，所以直接写 `value="xxx"` **不会**生效
 *（会被 v-model 接管成空），要给初始值请用 `default-value`。
 */
import type { HTMLAttributes } from "vue"
import { cn } from "../../../lib/utils"
import { Input } from "../input"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <Input
    data-slot="input-group-control"
    :class="cn(
      'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent',
      props.class,
    )"
  />
</template>
