<script setup lang="ts">
import { onMounted, ref } from 'vue'
import QRCode from "qrcode"
import { Button } from "@/random-ui/ui-dispatch/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/random-ui/ui-dispatch/card"

const svgData = ref("")

onMounted(async () => {
  svgData.value = await QRCode.toString("https://shadcn-vue.com", {
    type: "svg",
    margin: 0,
  })
})
</script>

<template>
  <Card>
    <CardContent class="flex justify-center pt-6">
      <div class="rounded-xl border bg-white p-4 dark:bg-black dark:invert">
        <div
          v-if="svgData"
          class="size-40 [&_svg]:size-full"
          v-html="svgData"
        />
        <div v-else class="size-40 animate-pulse rounded-sm bg-muted" />
      </div>
    </CardContent>
    <CardHeader class="text-center">
      <CardTitle>扫码连接移动设备</CardTitle>
      <CardDescription>
        打开 Ledger 移动应用并扫描此二维码以绑定设备。
      </CardDescription>
    </CardHeader>
    <CardFooter>
      <Button variant="secondary" class="w-full">
        我知道了
      </Button>
    </CardFooter>
  </Card>
</template>

