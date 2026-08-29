# Resizable 可调整大小

<script setup>
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from '../../src/components/ui/resizable'

const demo0 = `import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

  <ResizablePanelGroup direction="horizontal">
    <ResizablePanel>One</ResizablePanel>
    <ResizableHandle />
    <ResizablePanel>Two</ResizablePanel>
  </ResizablePanelGroup>`
</script>

<Demo :code="demo0">
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>One</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>Two</ResizablePanel>
    </ResizablePanelGroup>
</Demo>

## Usage
