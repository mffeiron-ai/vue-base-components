# Scroll Area 滚动区域

<script setup>
import { ScrollArea } from '../../src/components/ui/scroll-area'

const demo0 = `import { ScrollArea } from '@/components/ui/scroll-area'

  <ScrollArea class="h-[200px] w-[350px] rounded-md border p-4">
    Jokester began sneaking into the castle in the middle of the night and leaving
    jokes all over the place: under the king's pillow, in his soup, even in the
    royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
    then one day, the king tripped over one of Jokester's whoopee cushions and
    fell into the moat. He was so embarrassed that he decided to make Jokester the
    official court jester.
  </ScrollArea>`
</script>

<Demo :code="demo0">
    <ScrollArea class="h-[200px] w-[350px] rounded-md border p-4">
      Jokester began sneaking into the castle in the middle of the night and leaving
      jokes all over the place: under the king's pillow, in his soup, even in the
      royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
      then one day, the king tripped over one of Jokester's whoopee cushions and
      fell into the moat. He was so embarrassed that he decided to make Jokester the
      official court jester.
    </ScrollArea>
</Demo>

## Usage
