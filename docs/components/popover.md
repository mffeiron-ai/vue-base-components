# Popover 弹出层

<script setup>
import { Popover, PopoverContent, PopoverTrigger, } from '../../src/components/ui/popover'

const demo0 = `import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

  <Popover>
    <PopoverTrigger>Open</PopoverTrigger>
    <PopoverContent>Place content for the popover here.</PopoverContent>
  </Popover>`
</script>

<Demo :code="demo0">
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>Place content for the popover here.</PopoverContent>
    </Popover>
</Demo>

## Usage
