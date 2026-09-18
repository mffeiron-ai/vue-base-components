<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { Loader2Icon } from "lucide-vue-next"
import { cn } from "../../../lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <!--
    data-slot="spinner" 不能省：8 套预设的 Attachment 规则里有
    `*:data-[slot=spinner]:size-6!`（纵向附件里把 spinner 放大到 size-6），
    少了它这条就永远命不中。
  -->
  <Loader2Icon
    data-slot="spinner"
    role="status"
    aria-label="Loading"
    :class="cn('size-4 animate-spin', props.class)"
  />
</template>
