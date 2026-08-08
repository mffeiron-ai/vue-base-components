<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <Badge>Default</Badge>
    <Badge variant="secondary">
      Secondary
    </Badge>
    <Badge variant="outline">
      Outline
    </Badge>
    <Badge variant="destructive">
      Destructive
    </Badge>
  </div>
</template>
