<script setup>
import { computed } from 'vue'
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperTitle,
  StepperDescription,
  StepperSeparator,
} from '@/uikit/components/ui/stepper'
import SmileAPI from '@/core/composables/useAPI'
import useSmileStore from '@/core/stores/smilestore'

const api = SmileAPI()
const smilestore = useSmileStore()

// Computed properties for step states
const step1Completed = computed(() => api.store.browserPersisted.knownUser)
const step2Completed = computed(() => api.store.browserEphemeral.dbConnected)
const step3Completed = computed(() => api.store.browserEphemeral.dbConnected && !api.store.browserEphemeral.dbChanges)
const step3Error = computed(() => api.store.browserEphemeral.dbConnected && api.store.browserEphemeral.dbChanges)

// Step status messages
const step1Status = computed(() => (api.store.browserPersisted.knownUser ? 'Known user' : 'Unknown user'))
const step2Status = computed(() => (api.store.browserEphemeral.dbConnected ? 'Connected' : 'Not connected'))
const step3Status = computed(() => {
  if (!api.store.browserEphemeral.dbConnected) {
    return 'Never synced'
  } else if (api.store.browserEphemeral.dbChanges) {
    return 'Out of sync'
  } else {
    return 'Synced'
  }
})
</script>

<template>
  <Stepper class="flex w-full items-start gap-2 my-0 pt-4 pb-2 border-t border-border">
    <StepperItem v-slot="{ state }" class="relative flex w-full flex-col items-center justify-center" :step="1">
      <StepperSeparator
        class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted"
        :class="[step1Completed ? 'bg-green-500' : 'bg-gray-300']"
      />

      <StepperTrigger as-child>
        <div class="z-10 rounded-full shrink-0 p-3" :class="[step1Completed ? 'bg-green-200' : 'bg-muted']">
          <i-heroicons-user-minus-16-solid :class="[step1Completed ? 'text-green-500' : 'text-red-500']" />
        </div>
      </StepperTrigger>

      <div class="flex flex-col items-center text-center">
        <StepperDescription
          :class="[step1Completed ? 'text-green-500' : 'text-gray-500']"
          class="text-[0.6rem] text-muted-foreground transition font-mono"
        >
          {{ step1Status }}
        </StepperDescription>
      </div>
    </StepperItem>

    <StepperItem v-slot="{ state }" class="relative flex w-full flex-col items-center justify-center" :step="2">
      <StepperSeparator
        class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted"
        :class="[step2Completed ? 'bg-green-500' : 'bg-gray-300']"
      />

      <StepperTrigger as-child>
        <div class="z-10 rounded-full shrink-0 p-3" :class="[step2Completed ? 'bg-green-200' : 'bg-muted']">
          <i-mdi-firebase :class="[step2Completed ? 'text-green-500' : 'text-yellow-500']" />
        </div>
      </StepperTrigger>

      <div class="flex flex-col items-center text-center">
        <StepperDescription
          :class="[step2Completed ? 'text-green-500' : 'text-gray-500']"
          class="text-[0.6rem] text-muted-foreground transition font-mono"
        >
          {{ step2Status }}
        </StepperDescription>
      </div>
    </StepperItem>

    <StepperItem v-slot="{ state }" class="relative flex w-full flex-col items-center justify-center" :step="3">
      <StepperTrigger as-child>
        <div class="z-10 rounded-full shrink-0 p-3" :class="[step3Completed ? 'bg-green-50' : 'bg-muted']">
          <i-fluent-cloud-sync-24-filled
            :class="[step3Completed ? 'text-green-500' : step3Error ? 'text-red-500' : 'text-gray-500']"
          />
        </div>
      </StepperTrigger>

      <div class="flex flex-col items-center text-center">
        <StepperDescription
          :class="[step3Completed ? 'text-green-500' : step3Error ? 'text-red-500' : 'text-gray-500']"
          class="text-[0.6rem] text-muted-foreground transition font-mono"
        >
          {{ step3Status }}
        </StepperDescription>
      </div>
    </StepperItem>
  </Stepper>
</template>
