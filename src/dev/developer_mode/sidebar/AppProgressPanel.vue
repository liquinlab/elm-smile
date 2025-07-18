<script setup>
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
</script>

<template>
  <Stepper class="flex w-full items-start gap-2 my-0 pt-4 pb-2 border-t border-border">
    <StepperItem class="relative flex w-full flex-col items-center justify-center" :step="1">
      <StepperSeparator
        class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted"
        :class="[api.store.browserPersisted.knownUser ? 'bg-green-500' : 'bg-gray-300']"
      />

      <StepperTrigger as-child>
        <div
          class="z-10 rounded-full shrink-0 p-3"
          :class="[api.store.browserPersisted.knownUser ? 'bg-green-200' : 'bg-muted']"
        >
          <i-heroicons-user-minus-16-solid
            :class="[api.store.browserPersisted.knownUser ? 'text-green-500' : 'text-gray-500']"
          />
        </div>
      </StepperTrigger>

      <div class="flex flex-col items-center text-center">
        <StepperDescription
          :class="[api.store.browserPersisted.knownUser ? 'text-green-500' : 'text-gray-500']"
          class="text-[0.6rem] text-muted-foreground transition font-mono"
        >
          {{ api.store.browserPersisted.knownUser ? 'Known user' : 'Unknown user' }}
        </StepperDescription>
      </div>
    </StepperItem>

    <StepperItem class="relative flex w-full flex-col items-center justify-center" :step="2">
      <StepperSeparator
        class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted"
        :class="[
          api.store.browserEphemeral.dbConnected && !api.store.browserEphemeral.dbChanges
            ? 'bg-green-500'
            : api.store.browserEphemeral.dbConnected && api.store.browserEphemeral.dbChanges
              ? 'bg-yellow-500'
              : 'bg-gray-300',
        ]"
      />

      <StepperTrigger as-child>
        <div
          class="z-10 rounded-full shrink-0 p-3 cursor-pointer"
          :class="[api.store.browserEphemeral.dbConnected ? 'bg-green-200' : 'bg-muted']"
          @click="api.connectDB()"
        >
          <i-mdi-firebase :class="[api.store.browserEphemeral.dbConnected ? 'text-green-500' : 'text-gray-500']" />
        </div>
      </StepperTrigger>

      <div class="flex flex-col items-center text-center">
        <StepperDescription
          :class="[api.store.browserEphemeral.dbConnected ? 'text-green-500' : 'text-gray-500']"
          class="text-[0.6rem] text-muted-foreground transition font-mono"
        >
          {{ api.store.browserEphemeral.dbConnected ? 'Connected' : 'Not connected' }}
        </StepperDescription>
      </div>
    </StepperItem>

    <StepperItem class="relative flex w-full flex-col items-center justify-center" :step="3">
      <StepperTrigger as-child>
        <div
          class="z-10 rounded-full shrink-0 p-3"
          :class="[
            api.store.browserEphemeral.dbConnected && !api.store.browserEphemeral.dbChanges
              ? 'bg-green-200'
              : api.store.browserEphemeral.dbConnected && api.store.browserEphemeral.dbChanges
                ? 'bg-amber-100'
                : 'bg-muted',
          ]"
        >
          <i-fluent-cloud-sync-24-filled
            :class="[
              api.store.browserEphemeral.dbConnected && !api.store.browserEphemeral.dbChanges
                ? 'text-green-500'
                : api.store.browserEphemeral.dbConnected && api.store.browserEphemeral.dbChanges
                  ? 'text-yellow-500'
                  : 'text-gray-500',
            ]"
          />
        </div>
      </StepperTrigger>

      <div class="flex flex-col items-center text-center">
        <StepperDescription
          :class="[
            api.store.browserEphemeral.dbConnected && !api.store.browserEphemeral.dbChanges
              ? 'text-green-500'
              : api.store.browserEphemeral.dbConnected && api.store.browserEphemeral.dbChanges
                ? 'text-red-500'
                : 'text-gray-500',
          ]"
          class="text-[0.6rem] text-muted-foreground transition font-mono"
        >
          {{
            !api.store.browserEphemeral.dbConnected
              ? 'Never synced'
              : api.store.browserEphemeral.dbChanges
                ? 'Out of sync'
                : 'Synced'
          }}
        </StepperDescription>
      </div>
    </StepperItem>
  </Stepper>
</template>
