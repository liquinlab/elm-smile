<script setup>
import useAPI from '@/core/composables/useAPI'
import { Button } from '@/uikit/components/ui/button'
const api = useAPI()
//import InformedConsentText from '@/user/components/InformedConsentText.vue'
</script>

<template>
  <div class="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
    <div class="mb-4 border-b border-blue-200 pb-3">
      <h3 class="text-lg font-semibold text-blue-800">Informed Consent</h3>
    </div>
    <div class="space-y-4 text-left pr-7 pb-8">
      <template v-if="api.getAppComponent">
        <component :is="api.getAppComponent('informed_consent_text')" />
      </template>
      <template v-else>
        <div class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Error: Unable to load consent form text. Please contact the study administrator.
        </div>
      </template>
      <!-- load text of consent form -->
      <div class="flex justify-end pt-5">
        <Button variant="default" @click="$emit('toggleConsent')"> Thanks, take me back to the study! </Button>
      </div>
    </div>
  </div>
</template>
