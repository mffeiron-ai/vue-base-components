<script setup lang="ts">
import { computed } from 'vue'
import {
  getRandomUiPreviewCategory,
  type RandomUiPreviewCategoryKey,
} from './config/config'

const props = withDefaults(defineProps<{
  activeCategory?: RandomUiPreviewCategoryKey
}>(), {
  activeCategory: 'navigation',
})

const activeCategory = computed(() => getRandomUiPreviewCategory(props.activeCategory))
const previewWidthClass = computed(() => {
  if (activeCategory.value.key === 'charts') {
    return 'max-w-none'
  }

  return activeCategory.value.width === 'wide' ? 'max-w-[1400px]' : 'max-w-[920px]'
})
</script>

<template>
  <div class="overflow-x-hidden overflow-y-auto bg-muted contain-[paint] [--gap:--spacing(4)] 3xl:[--gap:--spacing(12)] md:[--gap:--spacing(10)] dark:bg-background style-lyra:md:[--gap:--spacing(6)] style-mira:md:[--gap:--spacing(6)]">
    <div class="mx-auto w-full" data-slot="capture-target">
      <div :class="['mx-auto flex w-full flex-col gap-(--gap) bg-muted p-(--gap) dark:bg-background', previewWidthClass]">
        <component :is="activeCategory.component" :key="activeCategory.key" />
      </div>
    </div>
  </div>
</template>
