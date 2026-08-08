<script setup lang="ts">
import IconPlaceholder from "@/components/IconPlaceholder.vue"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
</script>

<template>
  <TooltipProvider>
    <div class="flex w-full max-w-md flex-col gap-4">
    <InputGroup>
      <InputGroupAddon>
        <IconPlaceholder
          lucide="SearchIcon"
          tabler="IconSearch"
          hugeicons="SearchIcon"
          phosphor="MagnifyingGlassIcon"
          remixicon="RiSearchLine"
        />
      </InputGroupAddon>
      <InputGroupInput placeholder="搜索..." />
    </InputGroup>

    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="example.com" />
    </InputGroup>

    <InputGroup>
      <InputGroupInput placeholder="输入金额" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>USD</InputGroupText>
      </InputGroupAddon>
    </InputGroup>

    <InputGroup>
      <InputGroupTextarea placeholder="输入消息..." />
      <InputGroupAddon align="block-end">
        <Tooltip>
          <TooltipTrigger :as-child="true">
            <InputGroupButton variant="ghost" size="icon-sm">
              <IconPlaceholder
                lucide="PaperclipIcon"
                tabler="IconPaperclip"
                hugeicons="AttachmentIcon"
                phosphor="PaperclipIcon"
                remixicon="RiAttachmentLine"
              />
            </InputGroupButton>
          </TooltipTrigger>
          <TooltipContent>附加文件</TooltipContent>
        </Tooltip>
        <InputGroupButton variant="default" size="icon-sm" class="ml-auto">
          <IconPlaceholder
            lucide="SendIcon"
            tabler="IconSend"
            hugeicons="SentIcon"
            phosphor="PaperPlaneTiltIcon"
            remixicon="RiSendPlaneLine"
          />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
    </div>
  </TooltipProvider>
</template>
