<template>
  <span class="inline-flex items-center justify-center rounded-md bg-muted text-muted-foreground" :style="sizeStyle">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: string | number
}>(), {
  size: 40,
})

const sizeStyle = computed(() => ({
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
}))
</script>
