<script setup>
import { computed, ref } from 'vue'
import useAPI from '@/core/composables/useAPI'
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/ui/button-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import RouteJumper from '@/dev/developer_mode/RouteJumper.vue'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/uikit/components/ui/dropdown-menu'

const api = useAPI()

const buttonstyle = computed(() => {
  let base = ''
  if (api.store.dev.pinnedRoute !== null) {
    return base + ' pinned'
  } else {
    return base
  }
})

const handleDropdownOpenChange = (open) => {
  if (api.store.dev.pinnedRoute == null) {
    api.store.dev.routePanelVisible = open
  }
}

const togglePin = () => {
  api.store.dev.pinnedRoute = api.store.dev.pinnedRoute === null ? api.currentRouteName() : null
  api.store.dev.routePanelVisible = false
}
</script>

<template>
  <TooltipProvider>
    <ButtonGroup variant="outline" size="menu">
      <Tooltip>
        <TooltipTrigger asChild>
          <ButtonGroupItem v-on:click="api.autofill()" :disabled="!api.hasAutofill()">
            <i-mdi-magic />
          </ButtonGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {{ api.hasAutofill() ? 'Autofill' : 'No autofill available' }}
        </TooltipContent>
      </Tooltip>

      <template v-if="api.hasPrevView()">
        <Tooltip>
          <TooltipTrigger asChild>
            <ButtonGroupItem v-on:click="api.goToView(api.route?.meta?.prev)">
              <i-meteor-icons-angles-left />
            </ButtonGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom"> Previous View </TooltipContent>
        </Tooltip>
      </template>
      <template v-else>
        <ButtonGroupItem disabled>
          <i-meteor-icons-angles-left />
        </ButtonGroupItem>
      </template>

      <template v-if="api.hasNextView()">
        <Tooltip>
          <TooltipTrigger asChild>
            <ButtonGroupItem v-on:click="api.goNextView()">
              <i-meteor-icons-angles-right />
            </ButtonGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom"> Next View </TooltipContent>
        </Tooltip>
      </template>
      <template v-else>
        <ButtonGroupItem disabled>
          <i-meteor-icons-angles-right />
        </ButtonGroupItem>
      </template>

      <template v-if="api.store.config.mode === 'development'">
        <Tooltip>
          <TooltipTrigger asChild>
            <ButtonGroupItem v-on:click="togglePin()" :class="{ pinned: api.store.dev.pinnedRoute !== null }">
              <i-ic-baseline-pin-off v-if="api.store.dev.pinnedRoute !== null" />
              <i-ic-baseline-push-pin v-else />
            </ButtonGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom"> Pin current route </TooltipContent>
        </Tooltip>
      </template>

      <DropdownMenu :open="api.store.dev.routePanelVisible" @update:open="handleDropdownOpenChange">
        <DropdownMenuTrigger as-child>
          <ButtonGroupItem :class="buttonstyle">
            <div class="font-mono text-[0.65rem] font-medium min-w-[100px]">/{{ api.currentRouteName() }}</div>
          </ButtonGroupItem>
        </DropdownMenuTrigger>
        <RouteJumper />
      </DropdownMenu>
    </ButtonGroup>
  </TooltipProvider>
</template>

<style scoped>
.pinned {
  background-color: var(--pinned-route);
  color: var(--dev-contrast-text);
}

.dropdown {
  margin-top: 0;
}

.route-info-button-group {
  font-size: 0.65rem;
  height: 2em;
}
</style>
