<script setup>
import useViewAPI from '@/core/composables/useViewAPI'
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/ui/button-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/uikit/components/ui/tooltip'
import { ChevronLeft, ChevronRight, CircleMinus } from 'lucide-vue-next'
const api = useViewAPI()
</script>

<template>
  <TooltipProvider>
    <ButtonGroup variant="outline" size="menu">
      <Tooltip>
        <TooltipTrigger asChild>
          <ButtonGroupItem
            @click="api.goPrevStep()"
            :disabled="!api.store.dev.viewProvidesStepper || !api.hasPrevStep()"
          >
            <ChevronLeft />
          </ButtonGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom"> Step back </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <ButtonGroupItem :disabled="!api.store.dev.viewProvidesStepper || !api.hasSteps()">
            <span class="counter" v-if="api.pathString">{{ api.pathString }}</span>
            <i-iconoir-remove-empty v-else />
          </ButtonGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom"> Current path </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <ButtonGroupItem
            @click="api.goNextStep()"
            :disabled="!api.store.dev.viewProvidesStepper || !api.hasNextStep()"
          >
            <ChevronRight />
          </ButtonGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom"> Step forward </TooltipContent>
      </Tooltip>
    </ButtonGroup>
  </TooltipProvider>
</template>

<style scoped>
.counter {
  font-size: 0.95em;
  font-family: monospace;
  font-weight: 500;
}
</style>
