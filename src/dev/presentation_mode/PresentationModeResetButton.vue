<script setup>
import useAPI from '@/core/composables/useAPI'
import { Home } from 'lucide-vue-next'
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'

const api = useAPI()
const props = defineProps(['icon'])
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button size="menu" variant="outline" @click="api.resetLocalState()">
          <Home />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Return to main page</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
