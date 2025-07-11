<script setup>
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import { Moon, Sun } from 'lucide-vue-next'
import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'

// Add color mode functionality
const mode = useColorMode()

// Computed property to bind to the switch
const isDarkMode = computed({
  get: () => mode.value === 'dark',
  set: (value) => {
    mode.value = value ? 'dark' : 'light'
  },
})
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="menu" variant="outline" @click="isDarkMode = !isDarkMode">
          <Sun v-if="mode === 'dark'" />
          <Moon v-else />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom"> Toggle dark mode </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
