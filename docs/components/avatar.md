# Avatar 头像

<script setup>
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar'

const demo0 = `import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

  <Avatar>
    <AvatarImage src="https://github.com/shadcn.png" />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>`
</script>

<Demo :code="demo0">
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
</Demo>

## Usage
