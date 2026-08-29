# Hover Card 悬停卡片

<script setup>
import { HoverCard, HoverCardContent, HoverCardTrigger, } from '../../src/components/ui/hover-card'

const demo0 = `import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

  <HoverCard>
    <HoverCardTrigger>Hover</HoverCardTrigger>
    <HoverCardContent>
      The Vue Framework – created and maintained by Evan You.
    </HoverCardContent>
  </HoverCard>`
</script>

<Demo :code="demo0">
    <HoverCard>
      <HoverCardTrigger>Hover</HoverCardTrigger>
      <HoverCardContent>
        The Vue Framework – created and maintained by Evan You.
      </HoverCardContent>
    </HoverCard>
</Demo>

## Usage
