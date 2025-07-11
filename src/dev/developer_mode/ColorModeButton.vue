<script setup>
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
const toggleColorMode = () => {
  api.config.colorMode = api.config.colorMode === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="menu" variant="outline" @click="toggleColorMode()">
          <i-lucide-moon v-if="api.config.colorMode === 'light'" />
          <i-lucide-sun v-else />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p v-if="api.config.colorMode === 'light'">Dark Mode</p>
        <p v-else>Light Mode</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
