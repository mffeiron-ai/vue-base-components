# Tabs 选项卡

<script setup>
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../src/components/ui/tabs'

const demo0 = `import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

  <Tabs default-value="account">
    <TabsList>
      <TabsTrigger value="account">
        Account
      </TabsTrigger>
      <TabsTrigger value="password">
        Password
      </TabsTrigger>
    </TabsList>
    <TabsContent value="account">
      Make changes to your account here.
    </TabsContent>
    <TabsContent value="password">
      Change your password here.
    </TabsContent>
  </Tabs>`
</script>

<Demo :code="demo0">
    <Tabs default-value="account">
      <TabsList>
        <TabsTrigger value="account">
          Account
        </TabsTrigger>
        <TabsTrigger value="password">
          Password
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="password">
        Change your password here.
      </TabsContent>
    </Tabs>
</Demo>

## Usage
