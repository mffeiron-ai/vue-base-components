<script setup lang="ts">
import { ref } from "vue"
import IconPlaceholder from "@/components/IconPlaceholder.vue"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const label = ref("personal")
</script>

<template>
  <ButtonGroup>
    <ButtonGroup class="hidden sm:flex">
      <Button variant="outline" size="icon-sm" aria-label="Go Back">
        <IconPlaceholder
          lucide="ArrowLeftIcon"
          tabler="IconArrowLeft"
          hugeicons="ArrowLeft01Icon"
          phosphor="ArrowLeftIcon"
          remixicon="RiArrowLeftLine"
        />
      </Button>
    </ButtonGroup>
    <ButtonGroup>
      <Button variant="outline" size="sm">
        Archive
      </Button>
      <Button variant="outline" size="sm">
        Report
      </Button>
    </ButtonGroup>
    <ButtonGroup>
      <Button variant="outline" size="sm">
        Snooze
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger :as-child="true">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="More Options"
          >
            <IconPlaceholder
              lucide="ChevronDownIcon"
              tabler="IconChevronDown"
              hugeicons="ArrowDown01Icon"
              phosphor="CaretDownIcon"
              remixicon="RiArrowDownSLine"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <IconPlaceholder
                lucide="MailCheckIcon"
                tabler="IconMailCheck"
                hugeicons="MailValidation01Icon"
                phosphor="EnvelopeIcon"
                remixicon="RiMailLine"
              />
              Mark as Read
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconPlaceholder
                lucide="ArchiveIcon"
                tabler="IconArchive"
                hugeicons="ArchiveIcon"
                phosphor="ArchiveIcon"
                remixicon="RiArchiveLine"
              />
              Archive
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <IconPlaceholder
                lucide="ClockIcon"
                tabler="IconClock"
                hugeicons="ClockIcon"
                phosphor="ClockIcon"
                remixicon="RiTimeLine"
              />
              Snooze
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconPlaceholder
                lucide="CalendarPlusIcon"
                tabler="IconCalendarPlus"
                hugeicons="CalendarAdd01Icon"
                phosphor="CalendarPlusIcon"
                remixicon="RiCalendarEventLine"
              />
              Add to Calendar
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <IconPlaceholder
                  lucide="TagIcon"
                  tabler="IconTag"
                  hugeicons="TagIcon"
                  phosphor="TagIcon"
                  remixicon="RiPriceTagLine"
                />
                Label As...
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup v-model="label">
                  <DropdownMenuRadioItem value="personal">
                    Personal
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="work">
                    Work
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="other">
                    Other
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive">
              <IconPlaceholder
                lucide="Trash2Icon"
                tabler="IconTrash"
                hugeicons="Delete02Icon"
                phosphor="TrashIcon"
                remixicon="RiDeleteBinLine"
              />
              Trash
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
    <ButtonGroup class="hidden sm:flex">
      <Button variant="outline" size="icon-sm" aria-label="Previous">
        <IconPlaceholder
          lucide="ArrowLeftIcon"
          tabler="IconArrowLeft"
          hugeicons="ArrowLeft01Icon"
          phosphor="ArrowLeftIcon"
          remixicon="RiArrowLeftLine"
        />
      </Button>
      <Button variant="outline" size="icon-sm" aria-label="Next">
        <IconPlaceholder
          lucide="ArrowRightIcon"
          tabler="IconArrowRight"
          hugeicons="ArrowRight01Icon"
          phosphor="ArrowRightIcon"
          remixicon="RiArrowRightLine"
        />
      </Button>
    </ButtonGroup>
  </ButtonGroup>
</template>
