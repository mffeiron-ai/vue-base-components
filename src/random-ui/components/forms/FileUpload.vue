<script setup lang="ts">
import IconPlaceholder from "@/components/IconPlaceholder.vue"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>文件上传</CardTitle>
      <CardDescription>拖拽或点击浏览</CardDescription>
    </CardHeader>
    <CardContent>
      <Empty class="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconPlaceholder
              lucide="UploadCloudIcon"
              tabler="IconCloudUpload"
              hugeicons="CloudUploadIcon"
              phosphor="CloudArrowUpIcon"
              remixicon="RiUploadCloudLine"
            />
          </EmptyMedia>
          <EmptyTitle>上传文件</EmptyTitle>
          <EmptyDescription>PNG、JPG、PDF 最大 10MB</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>浏览文件</Button>
        </EmptyContent>
      </Empty>
    </CardContent>
  </Card>
</template>
