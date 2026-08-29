# Slider 滑块

<script setup>
import { Slider } from '../../src/components/ui/slider'

const demo0 = `import { Slider } from '@/components/ui/slider'

  <Slider :default-value="[33]" :max="100" :step="1" />`
</script>

<Demo :code="demo0">
    <Slider :default-value="[33]" :max="100" :step="1" />
</Demo>

## Usage
