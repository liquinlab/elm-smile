<script setup>
import { Popover, PopoverContent, PopoverTrigger } from '@/uikit/components/ui/popover'
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import ConsoleDatabaseBrowsePanel from '@/dev/developer_mode/ConsoleDatabaseBrowsePanel.vue'
import ConsoleLogPanel from '@/dev/developer_mode/ConsoleLogPanel.vue'
import ConsoleConfigPanel from '@/dev/developer_mode/ConsoleConfigPanel.vue'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
</script>

<template>
  <div class="w-full h-full flex border-t border-border">
    <!-- Left sidebar - 36px wide -->
    <div class="w-9 h-full bg-muted border-dev-lines border-r flex flex-col items-center justify-start pt-1">
      <!-- Magnifying glass button - Browse tab -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              class="w-8 h-8"
              :class="{ 'bg-ring': api.store.dev.consoleBarTab === 'browse' }"
              @click="api.store.dev.consoleBarTab = 'browse'"
            >
              <i-tdesign-data-base-filled />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Data Explorer</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Book button - Log tab -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              class="w-8 h-8"
              :class="{ 'bg-gray-200': api.store.dev.consoleBarTab === 'log' }"
              @click="api.store.dev.consoleBarTab = 'log'"
            >
              <i-mdi-console-line class="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Narrative Log</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Config gear button - Config tab -->
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              class="w-8 h-8"
              :class="{ 'bg-gray-200': api.store.dev.consoleBarTab === 'config' }"
              @click="api.store.dev.consoleBarTab = 'config'"
            >
              <FAIcon icon="fa-solid fa-gear" class="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Configuration</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>

    <!-- Right column - remaining width -->
    <div class="flex-1 h-full flex flex-col">
      <!-- Panel content -->
      <div class="flex-1 overflow-hidden">
        <ConsoleDatabaseBrowsePanel v-if="api.store.dev.consoleBarTab === 'browse'" />
        <ConsoleLogPanel v-if="api.store.dev.consoleBarTab === 'log'" />
        <ConsoleConfigPanel v-if="api.store.dev.consoleBarTab === 'config'" />
      </div>
    </div>
  </div>
</template>
