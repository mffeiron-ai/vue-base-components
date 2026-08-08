<script setup lang="ts">
import IconPlaceholder from "@/components/IconPlaceholder.vue"
import { Button } from "@/random-ui/ui-dispatch/button"
import { Card, CardContent } from "@/random-ui/ui-dispatch/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/random-ui/ui-dispatch/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/random-ui/ui-dispatch/input-group"
import { Kbd } from "@/random-ui/ui-dispatch/kbd"
</script>

<template>
  <Card>
    <CardContent>
      <Empty class="h-72">
        <EmptyHeader>
          <EmptyTitle>404 - Not Found</EmptyTitle>
          <EmptyDescription>
            The page you're looking for doesn't exist. Try searching
            for what you need below.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <InputGroup class="w-3/4">
            <InputGroupInput placeholder="Try searching for pages..." />
            <InputGroupAddon>
              <IconPlaceholder
                lucide="SearchIcon"
                tabler="IconSearch"
                hugeicons="Search01Icon"
                phosphor="MagnifyingGlassIcon"
                remixicon="RiSearchLine"
              />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Kbd>/</Kbd>
            </InputGroupAddon>
          </InputGroup>
          <Button variant="link">
            Go to homepage
          </Button>
        </EmptyContent>
      </Empty>
    </CardContent>
  </Card>
</template>
