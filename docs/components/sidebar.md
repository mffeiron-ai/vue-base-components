# Sidebar 侧边栏

<script setup>
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger, } from '../../src/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar.vue'
import { Calendar, Home, Inbox, Search, Settings } from 'lucide-vue-next'
import { ref } from 'vue'
import { useSidebar } from '../../src/components/ui/sidebar'

const demo0 = `import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'

  <SidebarProvider>
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Acme Inc</span>
                <span class="truncate text-xs">Enterprise</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton as-child>
                  <a href="#">
                    <Home />
                    <span>Home</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div class="grid auto-rows-min gap-4 md:grid-cols-3">
          <div class="aspect-video rounded-xl bg-muted/50" />
          <div class="aspect-video rounded-xl bg-muted/50" />
          <div class="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </SidebarInset>
  </SidebarProvider>`

const demo1 = `  import AppSidebar from '@/components/AppSidebar.vue'
  import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        <slot />
      </main>
    </SidebarProvider>
  `

const demo2 = `  import { Sidebar, SidebarContent } from '@/components/ui/sidebar'

    <Sidebar>
      <SidebarContent />
    </Sidebar>
  `

const demo3 = `  import { Calendar, Home, Inbox, Search, Settings } from '@lucide/vue'
  import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from '@/components/ui/sidebar'

  // Menu items.
  const items = [
    {
      title: 'Home',
      url: '#',
      icon: Home,
    },
    {
      title: 'Inbox',
      url: '#',
      icon: Inbox,
    },
    {
      title: 'Calendar',
      url: '#',
      icon: Calendar,
    },
    {
      title: 'Search',
      url: '#',
      icon: Search,
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings,
    },
  ]

    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in items" :key="item.title">
                <SidebarMenuButton as-child>
                  <a :href="item.url">
                    <component :is="item.icon" />
                    <span>{{ item.title }}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  `

const demo4 = `import { ref } from 'vue'

const open = ref(false)

  <SidebarProvider :open="open" @update:open="open = $event">
    <!-- ... -->
  </SidebarProvider>`

const demo5 = `<SidebarProvider>
  <!-- ... -->
</SidebarProvider>`

const demo6 = `<SidebarProvider storage-key="sidebar">
  <!-- ... -->
</SidebarProvider>`

const demo7 = `<SidebarProvider
  :default-open="false"
  storage-key="sidebar"
  class="flex min-h-screen"
>
  <!-- ... -->
</SidebarProvider>`

const demo8 = `<Sidebar>
  <SidebarHeader />
  <SidebarContent />
  <SidebarFooter />
</Sidebar>`

const demo9 = `<Sidebar side="left">
  <!-- ... -->
</Sidebar>`

const demo10 = `<!-- Default variant -->
<Sidebar variant="sidebar">
  <!-- ... -->
</Sidebar>`

const demo11 = `<!-- Floating variant -->
<Sidebar variant="floating">
  <!-- ... -->
</Sidebar>`

const demo12 = `<!-- Inset variant -->
<Sidebar variant="inset">
  <!-- ... -->
</Sidebar>`

const demo13 = `<Sidebar collapsible="icon">
  <!-- ... -->
</Sidebar>`

const demo14 = `<Sidebar collapsible="offcanvas">
  <!-- ... -->
</Sidebar>`

const demo15 = `import { useSidebar } from '@/components/ui/sidebar'

const {
  state,
  open,
  setOpen,
  openMobile,
  setOpenMobile,
  isMobile,
  toggleSidebar,
} = useSidebar()`

const demo16 = `<Sidebar>
  <SidebarHeader>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEnd class="size-4" />
          </div>
          <div class="flex flex-col gap-0.5 leading-none">
            <span class="font-semibold">Documentation</span>
            <span class="">v1.0.0</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>
</Sidebar>`

const demo17 = `<Sidebar>
  <SidebarFooter>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuButton>
              <User2 /> Username
              <ChevronUp class="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            class="w-(--reka-popper-anchor-width)"
          >
            <DropdownMenuItem>
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarFooter>
</Sidebar>`

const demo18 = `<Sidebar>
  <SidebarContent>
    <SidebarGroup />
    <SidebarGroup />
  </SidebarContent>
</Sidebar>`

const demo19 = `<SidebarContent>
  <SidebarGroup>
    <SidebarGroupLabel>Application</SidebarGroupLabel>
    <SidebarGroupContent>
      <!-- SidebarMenu -->
    </SidebarGroupContent>
  </SidebarGroup>
</SidebarContent>`

const demo20 = `<SidebarGroup as-child>
  <Collapsible default-open class="group/collapsible">
    <SidebarGroupLabel as-child>
      <CollapsibleTrigger class="group/label w-full text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&[data-state=open]>svg]:rotate-90">
        Help
        <ChevronRight class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
      </CollapsibleTrigger>
    </SidebarGroupLabel>
    <CollapsibleContent>
      <SidebarGroupContent>
        <SidebarMenu>
          <!-- Menu items -->
        </SidebarMenu>
      </SidebarGroupContent>
    </CollapsibleContent>
  </Collapsible>
</SidebarGroup>`

const demo21 = `<SidebarGroup>
  <SidebarGroupLabel>
    Projects
    <SidebarGroupAction>
      <Plus /> <span class="sr-only">Add Project</span>
    </SidebarGroupAction>
  </SidebarGroupLabel>
  <SidebarGroupContent></SidebarGroupContent>
</SidebarGroup>`

const demo22 = `<SidebarGroupContent>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton as-child>
        <a href="#">
          <Home />
          <span>Home</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton as-child>
        <a href="#">
          <Inbox />
          <span>Inbox</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarGroupContent>`

const demo23 = `<SidebarMenuButton as-child>
  <a href="#">
    <Home />
    <span>Home</span>
  </a>
</SidebarMenuButton>`

const demo24 = `<SidebarMenuButton>
  <Home />
  <span>Home</span>
</SidebarMenuButton>`

const demo25 = `<SidebarMenuButton :is-active="true">
  <Home />
  <span>Home</span>
</SidebarMenuButton>`

const demo26 = `<SidebarMenuItem>
  <SidebarMenuButton>
    <Home />
    <span>Home</span>
  </SidebarMenuButton>
  <SidebarMenuAction>
    <MoreHorizontal />
  </SidebarMenuAction>
</SidebarMenuItem>`

const demo27 = `<SidebarMenuItem>
  <SidebarMenuButton>
    <Home />
    <span>Home</span>
  </SidebarMenuButton>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <SidebarMenuAction>
        <MoreHorizontal />
      </SidebarMenuAction>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="right" align="start">
      <DropdownMenuItem>
        <span>Edit Project</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <span>Delete Project</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</SidebarMenuItem>`

const demo28 = `<SidebarMenuItem>
  <SidebarMenuButton>
    <Home />
    <span>Home</span>
  </SidebarMenuButton>
  <SidebarMenuSub>
    <SidebarMenuItem>
      <SidebarMenuButton>
        <span>History</span>
      </SidebarMenuButton>
    </SidebarMenuItem>

    <SidebarMenuItem>
      <SidebarMenuButton>
        <span>Starred</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenuSub>
</SidebarMenuItem>`

const demo29 = `<SidebarMenuItem>
  <Collapsible default-open class="group/collapsible">
    <CollapsibleTrigger as-child>
      <SidebarMenuButton>
        <Home />
        <span>Home</span>
        <ChevronRight class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
      </SidebarMenuButton>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <SidebarMenuSub>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <span>History</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton>
            <span>Starred</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenuSub>
    </CollapsibleContent>
  </Collapsible>
</SidebarMenuItem>`

const demo30 = `<SidebarMenuButton>
  <Home />
  <span>Home</span>
  <SidebarMenuBadge>24</SidebarMenuBadge>
</SidebarMenuButton>`

const demo31 = `<SidebarMenu>
  <SidebarMenuItem v-for="item in Array.from({ length: 5 })" :key="item">
    <SidebarMenuSkeleton />
  </SidebarMenuItem>
</SidebarMenu>`

const demo32 = `<SidebarContent>
  <SidebarGroup />
  <SidebarSeparator />
  <SidebarGroup />
</SidebarContent>`

const demo33 = `<SidebarTrigger />`

const demo34 = `import { useSidebar } from '@/components/ui/sidebar'

const { toggleSidebar } = useSidebar()

  <Button @click="toggleSidebar">
    Toggle Sidebar
  </Button>`

const demo35 = `<Sidebar collapsible="icon">
  <SidebarHeader />
  <SidebarContent />
  <SidebarFooter />
  <SidebarRail />
</Sidebar>`

const demo36 = `import { ref } from 'vue'

const open = ref(false)

  <SidebarProvider :open="open" @update:open="open = $event">
    <Sidebar />
  </SidebarProvider>`
</script>

<!-- TODO: add all component preview -->

<Demo :code="demo0">
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd class="size-4" />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">Acme Inc</span>
                  <span class="truncate text-xs">Enterprise</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton as-child>
                    <a href="#">
                      <Home />
                      <span>Home</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div class="flex items-center gap-2 px-4">
            <SidebarTrigger class="-ml-1" />
          </div>
        </header>
        <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div class="grid auto-rows-min gap-4 md:grid-cols-3">
            <div class="aspect-video rounded-xl bg-muted/50" />
            <div class="aspect-video rounded-xl bg-muted/50" />
            <div class="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
</Demo>

Sidebars are one of the most complex components to build. They are central
to any application and often contain a lot of moving parts.

I don't like building sidebars. So I built 30+ of them. All kinds of
configurations. Then I extracted the core components into `Sidebar*.vue`.

We now have a solid foundation to build on top of. Composable. Themeable.
Customizable.

[Browse the Blocks Library](/blocks).

## Structure

A `Sidebar` component is composed of the following parts:

- `SidebarProvider` - Handles collapsible state.
- `Sidebar` - The sidebar container.
- `SidebarHeader` and SidebarFooter - Sticky at the top and bottom of the sidebar
- `SidebarContent` - Scrollable content.
- `SidebarGroup` - Section within the SidebarContent.
- `SidebarTrigger` - Trigger for the Sidebar

<img
  src="/images/sidebar-structure.png"
  width="716"
  height="420"
  alt="Sidebar Structure"
  class="border dark:hidden rounded-lg overflow-hidden mt-6 w-full"
/>
<img
  src="/images/sidebar-structure-dark.png"
  width="716"
  height="420"
  alt="Sidebar Structure"
  class="border hidden dark:block rounded-lg overflow-hidden mt-6 w-full"
/>

## Usage

## Your First Sidebar

Let's start with the most basic sidebar A collapsible sidebar with a menu.

  ::step
  Add a `SidebarProvider` and `SidebarTrigger` at the root of your application

  ::step
  Create a new sidebar component at `@/components/AppSidebar.vue`

  ::step
  Now, let's add a `SidebarMenu` to the sidebar

  We'll use the `SidebarMenu` component in a `SidebarGroup`.

  

  ::step
  You've created your first sidebar.

  You should see something like this:

<figure class="flex flex-col gap-4">

  ::component-preview
  ---
  title: Sidebar
  name: sidebar-demo
  description: Your first sidebar.
  class: 'w-full'
  type: block
  ---

  <figcaption class="text-center text-sm text-gray-500">
    Your first sidebar
  </figcaption>
</figure>

:::

## Components

The components in the `Sidebar*.vue` files are built to be composable i.e you build your sidebar by putting the provided components together. They also compose well with other shadcn-vue components such as `DropdownMenu`, `Collapsible`, `Dialog`, etc.

**If you need to change the code in the `Sidebar*.vue` files, you are encourage to do so. The code is yours. Use the provided components as a starting point to build your own**

## SidebarProvider

The `SidebarProvider` component is used to provide the sidebar context to all its children.

### Props

The `SidebarProvider` component accepts the following props:

### Width

Use the `defaultOpen`, `open`, and `onOpenChange` props to control the open state of the sidebar.

### Keyboard Shortcut

The `SidebarProvider` component supports keyboard shortcuts to toggle the sidebar. The default shortcut is `cmd+b` or `ctrl+b`.

### Persisted State

To persist the sidebar state, you can use the `storageKey` prop on the `SidebarProvider` component.

## Sidebar

The main sidebar component.

### Props

The `Sidebar` component accepts the following props:

### side

Use the `side` prop to set the side of the sidebar.

### variant

Use the `variant` prop to set the variant of the sidebar.

### collapsible

Use the `collapsible` prop to make the sidebar collapsible.

## useSidebar

The `useSidebar` hook is used to control the sidebar.

## SidebarHeader

Used to render the sidebar header.

## SidebarFooter

Used to render the sidebar footer.

## SidebarContent

The scrollable content area of the sidebar.

## SidebarGroup

Used to group sidebar menu items.

## Collapsible SidebarGroup

To make a `SidebarGroup` collapsible, wrap it in a `Collapsible` component.

## SidebarGroupAction

The `SidebarGroupAction` component is used to render an action button in the sidebar group header.

## SidebarMenu

The `SidebarMenu` component is used to render a menu in the sidebar.

## SidebarMenuButton

The `SidebarMenuButton` component is used to render a menu button in the sidebar.

### Link or Anchor

Use the `as-child` prop to render the `SidebarMenuButton` as a link or anchor.

### Icon and Label

You can render an icon and label in the `SidebarMenuButton` component.

### isActive

Use the `isActive` prop to mark a menu button as active.

## SidebarMenuAction

The `SidebarMenuAction` component is used to render a menu action in the sidebar.

### DropdownMenu

You can use the `SidebarMenuAction` component with a `DropdownMenu` component.

## SidebarMenuSub

The `SidebarMenuSub` component is used to render a submenu in the sidebar.

## Collapsible SidebarMenu

To make a `SidebarMenu` collapsible, wrap it in a `Collapsible` component.

## SidebarMenuBadge

The `SidebarMenuBadge` component is used to render a badge in the sidebar menu.

## SidebarMenuSkeleton

You can use the `SidebarMenuSkeleton` component to render a skeleton loader in the sidebar menu.

## SidebarSeparator

The `SidebarSeparator` component is used to render a separator in the sidebar.

## SidebarTrigger

The `SidebarTrigger` component is used to render a trigger button for the sidebar.

## Custom Trigger

You can create a custom trigger using the `useSidebar` hook.

## SidebarRail

The `SidebarRail` component is used to render a rail in the sidebar. This is usually used to toggle the sidebar on hover when the sidebar is collapsed.

## Controlled Sidebar

Use the `open` and `onOpenChange` props to control the sidebar.

## Theming

You can theme the sidebar using CSS variables.

```css
@layer base {
  :root {
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}
```

## Styling

Here are some tips for styling the sidebar:

- Use the `data-sidebar` and `data-state` attributes to style the sidebar.
- The sidebar automatically sets the `--sidebar-width` CSS variable. You can use this to adjust the layout of your main content.
