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

import { Popover, PopoverContent, PopoverTrigger } from '@/uikit/components/ui/popover'
import ConfigDevPanel from '@/dev/developer_mode/ConfigDevPanel.vue'
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

import useAPI from '@/core/composables/useAPI'
const api = useAPI()
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
                :isActive="api.store.dev.mainView === 'devmode'"
                tooltip="Developer Mode"
                @click="api.store.dev.mainView = 'devmode'"
              >
                <i-lucide-bug-play class="!size-5" :class="{ 'text-chart-1': api.store.dev.mainView === 'devmode' }" />
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Analyze -->
            <SidebarMenuItem>
              <SidebarMenuButton
                class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
                tooltip="Analyze Data"
                :isActive="api.store.dev.mainView === 'dashboard'"
                @click="api.store.dev.mainView = 'dashboard'"
              >
                <i-ix-analyze class="!size-5" :class="{ 'text-chart-1': api.store.dev.mainView === 'dashboard' }" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <!-- Recruit 
            <SidebarMenuItem>
              <SidebarMenuButton
                class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
                tooltip="Recruit Participants"
                :isActive="api.store.dev.mainView === 'recruit'"
                @click="api.store.dev.mainView = 'recruit'"
              >
                <i-bxs-megaphone class="!size-5" :class="{ 'text-chart-1': api.store.dev.mainView === 'recruit' }" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            -->

            <!-- Docs -->
            <SidebarMenuItem>
              <SidebarMenuButton
                class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
                tooltip="Documentation"
                :isActive="api.store.dev.mainView === 'docs'"
                @click="api.store.dev.mainView = 'docs'"
              >
                <i-lucide-book-marked class="!size-5" :class="{ 'text-chart-1': api.store.dev.mainView === 'docs' }" />
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
          <SidebarMenuButton
            class="px-[0.05rem] group-data-[collapsible=icon]:!p-1.5 my-1"
            asChild
            tooltip="Configuration"
          >
            <i-lucide-settings class="!size-5" />
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent side="right" align="end">
          <ConfigDevPanel />
        </PopoverContent>
      </Popover>
    </SidebarFooter>
  </Sidebar>
</template>
