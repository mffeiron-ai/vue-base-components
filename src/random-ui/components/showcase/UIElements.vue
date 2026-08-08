<script setup lang="ts">
import { ref } from "vue"
import IconPlaceholder from "@/components/IconPlaceholder.vue"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/random-ui/ui-dispatch/alert-dialog"
import { Badge } from "@/random-ui/ui-dispatch/badge"
import { Button } from "@/random-ui/ui-dispatch/button"
import { ButtonGroup } from "@/random-ui/ui-dispatch/button-group"
import { Card, CardContent } from "@/random-ui/ui-dispatch/card"
import { Checkbox } from "@/random-ui/ui-dispatch/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/random-ui/ui-dispatch/dropdown-menu"
import { Field, FieldGroup } from "@/random-ui/ui-dispatch/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/random-ui/ui-dispatch/input-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/random-ui/ui-dispatch/item"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/random-ui/ui-dispatch/radio-group"
import { Slider } from "@/random-ui/ui-dispatch/slider"
import { Switch } from "@/random-ui/ui-dispatch/switch"
import { Textarea } from "@/random-ui/ui-dispatch/textarea"

const sliderValue = ref<number[]>([500])
</script>

<template>
  <Card class="w-full">
    <CardContent class="flex flex-col gap-6">
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-2">
          <Button>Button</Button>
          <Button variant="secondary">
            Secondary
          </Button>
          <Button variant="outline">
            Outline
          </Button>
          <Button variant="ghost">
            Ghost
          </Button>
        </div>
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Two-factor authentication</ItemTitle>
            <ItemDescription class="text-pretty xl:hidden 2xl:block">
              Verify via email or phone number.
            </ItemDescription>
          </ItemContent>
          <ItemActions class="hidden md:flex">
            <Button size="sm" variant="secondary">
              Enable
            </Button>
          </ItemActions>
        </Item>
      </div>
      <Slider
        v-model="sliderValue"
        :max="1000"
        :min="0"
        :step="10"
        class="flex-1"
        aria-label="Slider"
      />
      <FieldGroup>
        <Field>
          <InputGroup>
            <InputGroupInput placeholder="Name" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                <IconPlaceholder
                  lucide="SearchIcon"
                  tabler="IconSearch"
                  hugeicons="Search01Icon"
                  phosphor="MagnifyingGlassIcon"
                  remixicon="RiSearchLine"
                />
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <Field class="flex-1">
          <Textarea placeholder="Message" class="resize-none" />
        </Field>
      </FieldGroup>
      <div class="flex items-center gap-2">
        <div class="flex gap-2">
          <Badge>Badge</Badge>
          <Badge variant="secondary">
            Secondary
          </Badge>
          <Badge variant="outline">
            Outline
          </Badge>
        </div>
        <RadioGroup default-value="apple" class="ml-auto flex w-fit gap-3">
          <RadioGroupItem value="apple" />
          <RadioGroupItem value="banana" />
        </RadioGroup>
        <div class="flex gap-3">
          <Checkbox :default-checked="true" />
          <Checkbox />
        </div>
      </div>
      <div class="flex items-center gap-4">
        <AlertDialog>
          <AlertDialogTrigger :as-child="true">
            <Button variant="outline">
              <span class="hidden md:block">Alert Dialog</span>
              <span class="block md:hidden">Dialog</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
              <AlertDialogDescription>
                Do you want to allow the USB accessory to connect to this
                device and your data?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Don't allow</AlertDialogCancel>
              <AlertDialogAction>Allow</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <ButtonGroup>
          <Button variant="outline">
            Button Group
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger :as-child="true">
              <Button variant="outline" size="icon">
                <IconPlaceholder
                  lucide="ChevronUpIcon"
                  tabler="IconChevronUp"
                  hugeicons="ArrowUp01Icon"
                  phosphor="CaretUpIcon"
                  remixicon="RiArrowUpSLine"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" class="w-40">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuItem>Mute Conversation</DropdownMenuItem>
                <DropdownMenuItem>Mark as Read</DropdownMenuItem>
                <DropdownMenuItem>Block User</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                <DropdownMenuItem>Share Conversation</DropdownMenuItem>
                <DropdownMenuItem>Copy Conversation</DropdownMenuItem>
                <DropdownMenuItem>Report Conversation</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive">
                  Delete Conversation
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
        <Switch :default-checked="true" class="ml-auto" />
      </div>
    </CardContent>
  </Card>
</template>
