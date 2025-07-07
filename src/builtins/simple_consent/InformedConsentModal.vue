<script setup>
import useAPI from '@/core/composables/useAPI'
import { Button } from '@/uikit/components/ui/button'
const api = useAPI()

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggleConsent'])
</script>

<template>
  <div class="absolute inset-0 z-50 flex items-center justify-center p-8" :class="{ hidden: !show }">
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('toggleConsent')"></div>
    <Button
      class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="close"
      @click="$emit('toggleConsent')"
    >
      <FAIcon icon="fa-solid fa-xmark" class="text-xl" />
    </Button>
    <div class="w-[90%] h-[90%] relative bg-white shadow-xl flex flex-col">
      <div class="flex-1 overflow-y-auto p-20 pt-10">
        <div class="select-none w-full">
          <div class="pt-5 text-foreground">
            <template v-if="api.getAppComponent">
              <component :is="api.getAppComponent('informed_consent_text')" />
            </template>
            <template v-else>
              <div class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                Error: Unable to load consent form text. Please contact the study administrator.
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="border-t bg-gray-50 px-5 py-4 flex justify-end">
        <Button @click="$emit('toggleConsent')"> Thanks, take me back to the study! </Button>
      </div>
    </div>
  </div>
</template>
