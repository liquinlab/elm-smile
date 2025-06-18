<script setup>
import { h, ref } from 'vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/uikit/components/ui/sidebar'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/uikit/components/ui/popover'

import Toggle from '@/uikit/components/ui/toggle/Toggle.vue'
import { Sun, Moon } from 'lucide-vue-next'
import { useColorMode } from '@vueuse/core'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

const props = defineProps({
  side: { type: String, required: false },
  variant: { type: String, required: false },
  collapsible: { type: String, required: false, default: 'icon' },
  class: { type: null, required: false },
})

const mode = useColorMode()
const activeItem = ref('DevMode')
const { setOpen } = useSidebar()
</script>

<template>
  <!-- This is the first sidebar -->
  <!-- We disable collapsible and adjust width to icon. -->
  <!-- This will make the sidebar appear as icons. -->
  <Sidebar class="w-[calc(var(--sidebar-width-icon)+1px)]! border-r" v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child class="md:h-8 md:p-0">
            <a href="#">
              <div
                class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
              >
                <i-lucide-smile />
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent class="px-1.5 md:px-0">
          <SidebarMenu>
            <!-- Developer Mode -->
            <SidebarMenuItem>
              <SidebarMenuButton
                class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
                asChild
                isActive
                tooltip="Developer Mode"
              >
                <i-lucide-bug-play class="!size-9" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <!-- Firebase -->
            <SidebarMenuItem>
              <SidebarMenuButton
                class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
                asChild
                tooltip="Firebase"
              >
                <i-mdi-firebase class="w-9 h-9" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <!-- Analyze -->
            <SidebarMenuItem>
              <SidebarMenuButton
                class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
                asChild
                tooltip="Analyze Data"
              >
                <i-ix-analyze class="w-9 h-9" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <!-- Recruit -->
            <SidebarMenuItem>
              <SidebarMenuButton
                class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
                asChild
                tooltip="Recruit Participants"
              >
                <i-bxs-megaphone class="w-9 h-9" />
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Docs -->
            <SidebarMenuItem>
              <SidebarMenuButton
                class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
                asChild
                tooltip="Documentation"
              >
                <i-lucide-book-marked class="w-9 h-9" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <!-- Developer Mode Configuration -->
       <Popover>
        <PopoverTrigger>
          <SidebarMenuButton class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1" asChild tooltip="Configuration">
            <i-lucide-settings class="w-9 h-9" />
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent side="right" align="end">
          Some popover content
        </PopoverContent>
      </Popover>
      <!-- Toggle Dark Mode for Developer Mode-->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle aria-label="Toggle dark mode" @click="mode = mode === 'dark' ? 'light' : 'dark'">
              <Moon v-if="mode === 'light'" class="h-4 w-4" />
              <Sun v-else class="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{{ mode === 'dark' ? 'Light Mode (Dev)' : 'Dark Mode (Dev)' }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SidebarFooter>
  </Sidebar>
</template>
