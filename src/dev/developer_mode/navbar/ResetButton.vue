<script setup>
import { Button } from '@/uikit/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="menu" variant="outline" @click="api.resetLocalState()">
          <i-f7-bolt-fill />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom"> Reset local state (Ctrl + R) </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
