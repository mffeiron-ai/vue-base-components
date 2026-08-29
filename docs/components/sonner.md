# Sonner Toast 通知

<script setup>
import { toast } from 'vue-sonner'
import { Button } from '../../src/components/ui/button'

const demo0 = `import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'

  <Button @click="() => toast('My first toast')">
    Give me a toast
  </Button>`
</script>

<Demo :code="demo0">
    <Button @click="() => toast('My first toast')">
      Give me a toast
    </Button>
</Demo>

## Usage

## Examples

### Types

<Demo :code="demo0">
    <Button @click="() => toast('My first toast')">
      Give me a toast
    </Button>
</Demo>

### With Dialog

<Demo :code="demo0">
    <Button @click="() => toast('My first toast')">
      Give me a toast
    </Button>
</Demo>
