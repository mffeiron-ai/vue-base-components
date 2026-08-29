# Alert 警告提示

<script setup>
import { Alert, AlertDescription, AlertTitle } from '../../src/components/ui/alert'

const demo0 = `import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

  <Alert>
    <AlertTitle>Heads up!</AlertTitle>
    <AlertDescription>
      You can add components and dependencies to your app using the cli.
    </AlertDescription>
  </Alert>`
</script>

<Demo :code="demo0">
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components and dependencies to your app using the cli.
      </AlertDescription>
    </Alert>
</Demo>

## Usage
