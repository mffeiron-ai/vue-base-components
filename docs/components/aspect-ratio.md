# Aspect Ratio 宽高比

<script setup>
import { AspectRatio } from '../../src/components/ui/aspect-ratio'

const demo0 = `import { AspectRatio } from '@/components/ui/aspect-ratio'

  <AspectRatio :ratio="16 / 9">
    <img src="..." alt="Image" class="rounded-md object-cover">
  </AspectRatio>`
</script>

<Demo :code="demo0">
    <AspectRatio :ratio="16 / 9">
      <img src="..." alt="Image" class="rounded-md object-cover">
    </AspectRatio>
</Demo>

## Usage
