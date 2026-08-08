<script setup lang="ts">
import { Button } from "@/random-ui/ui-dispatch/button"
import { Card, CardContent } from "@/random-ui/ui-dispatch/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/random-ui/ui-dispatch/empty"
import { Spinner } from "@/random-ui/ui-dispatch/spinner"
</script>

<template>
  <Card>
    <CardContent class="p-0">
      <Empty class="p-4">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>Syncing your accounts</EmptyTitle>
          <EmptyDescription>
            We're pulling in your latest transactions. This usually takes
            a few seconds.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline">
            Cancel
          </Button>
        </EmptyContent>
      </Empty>
    </CardContent>
  </Card>
</template>

