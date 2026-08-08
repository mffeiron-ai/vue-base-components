<script setup lang="ts">
import IconPlaceholder from "@/components/IconPlaceholder.vue"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
</script>

<template>
  <Card class="w-full max-w-md">
    <CardContent class="p-0">
      <Item>
        <ItemMedia>
          <Avatar>
            <AvatarImage src="/avatars/01.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>John Doe</ItemTitle>
          <ItemDescription>john@example.com</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon-sm">
            <IconPlaceholder
              lucide="MoreHorizontalIcon"
              tabler="IconDots"
              hugeicons="MoreHorizontalCircle01Icon"
              phosphor="DotsThreeOutlineIcon"
              remixicon="RiMoreLine"
            />
          </Button>
        </ItemActions>
      </Item>
      <Separator />
      <Item>
        <ItemMedia variant="icon">
          <IconPlaceholder
            lucide="SettingsIcon"
            tabler="IconSettings"
            hugeicons="Settings01Icon"
            phosphor="GearIcon"
            remixicon="RiSettingsLine"
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Settings</ItemTitle>
          <ItemDescription>Manage your preferences</ItemDescription>
        </ItemContent>
        <ItemActions>
          <IconPlaceholder
            lucide="ChevronRightIcon"
            tabler="IconChevronRight"
            hugeicons="ArrowRight01Icon"
            phosphor="CaretRightIcon"
            remixicon="RiArrowRightSLine"
            class="text-muted-foreground size-5"
          />
        </ItemActions>
      </Item>
      <Separator />
      <Item>
        <ItemMedia variant="icon">
          <IconPlaceholder
            lucide="BellIcon"
            tabler="IconBell"
            hugeicons="Notification01Icon"
            phosphor="BellIcon"
            remixicon="RiNotification3Line"
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Notifications</ItemTitle>
          <ItemDescription>Configure notifications</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Switch />
        </ItemActions>
      </Item>
    </CardContent>
  </Card>
</template>
