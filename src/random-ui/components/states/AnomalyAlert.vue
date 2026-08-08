<script setup lang="ts">
import { Button } from "@/random-ui/ui-dispatch/button"
import { Card, CardContent } from "@/random-ui/ui-dispatch/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/random-ui/ui-dispatch/empty"
</script>

<template>
  <Card>
    <CardContent>
      <Empty class="h-48">
        <EmptyHeader>
          <EmptyTitle>Get alerted for anomalies</EmptyTitle>
          <EmptyDescription>
            Automatically monitor your projects for anomalies and get notified.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>Upgrade to Observability Plus</Button>
        </EmptyContent>
      </Empty>
    </CardContent>
  </Card>
</template>
