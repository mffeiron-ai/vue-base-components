# Badge 徽标

<script setup>
import { Badge } from '../../src/components/ui/badge'

const demo0 = `import { Badge } from '@/components/ui/badge'

  <Badge variant="default | outline | secondary | destructive">
    Badge
  </Badge>`

const demo1 = `import { Badge } from '@/components/ui/badge'

  <Badge as-child>
    <a href="#">Badge</a>
  </Badge>`
</script>

<Demo :code="demo0">
    <Badge variant="default | outline | secondary | destructive">
      Badge
    </Badge>
</Demo>

## Usage

### Link

You can use the `as-child` prop to make another component look like a badge. Here's an example of a link that looks like a badge.
