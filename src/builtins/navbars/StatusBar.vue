<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useSmileStore from '@/core/stores/smilestore'
import appconfig from '@/core/config'
import useAPI from '@/core/composables/useAPI'
// load sub-components used in this compomnents
import WithdrawFormModal from '@/builtins/withdraw/WithdrawFormModal.vue'
import InformedConsentModal from '@/builtins/simple_consent/InformedConsentModal.vue'
import ReportIssueModal from '@/builtins/report_issue/ReportIssueModal.vue'
import { Button } from '@/uikit/components/ui/button'

const router = useRouter()
const smilestore = useSmileStore() // get the global store
const api = useAPI() // get the api
const withdrawform = ref(null) // this uses the ref="withdrawform" in the template
const email = ref('')

// IF OTHER SERVICES PROVIDE EASY EMAIL ADDRESSES, ADD THEM HERE
function prefill_email() {
  let emailval = ''
  if (smilestore.data.recruitmentService === 'prolific') {
    emailval = `${smilestore.private.recruitmentInfo.prolific_id}@email.prolific.co`
  }
  return emailval
}
email.value = prefill_email()

/* these just toggle interface elements so are state local to the component */
const showconsentmodal = ref(false) // reactive
function toggleConsent() {
  showconsentmodal.value = !showconsentmodal.value // have to use .value in <script> when using ref()
}

const showwithdrawmodal = ref(false) // reactive
function toggleWithdraw() {
  showwithdrawmodal.value = !showwithdrawmodal.value // have to use .value in <script> when using ref()
  email.value = prefill_email() // update the value
}

const showreportissuemodal = ref(false) // reactive
function toggleReport() {
  showreportissuemodal.value = !showreportissuemodal.value // have to use .value in <script> when using ref()
}

function submitWithdraw() {
  // submit the withdraw form and jump to the thanks
  toggleWithdraw()
  router.push('withdraw') // should use
}
</script>

<template>
  <div class="flex flex-row items-stretch relative px-5" role="navigation" aria-label="main navigation">
    <div class="flex items-stretch flex-shrink-0 min-h-[3.25rem]">
      <a class="flex items-center pt-3" :href="appconfig.labURL" target="_new" v-if="!appconfig.anonymousMode">
        <img :src="api.getStaticUrl(appconfig.brandLogoFn)" width="90" />
      </a>
      <div class="flex items-center pt-1">
        <p class="text-xs text-left pl-2.5 text-foreground pt-2 sm:block hidden font-mono">
          Study: {{ smilestore.config.codeName }}<br />Version: {{ smilestore.config.github.lastCommitHash
          }}{{
            appconfig.mode === 'testing' || appconfig.mode === 'development' || appconfig.mode === 'presentation'
              ? '-' + appconfig.mode
              : ''
          }}<br />
          <template v-if="smilestore.getShortId != 'N/A'"> User ID: {{ smilestore.getShortId }} </template>
        </p>
      </div>
    </div>
    <div id="infobar" class="flex-grow flex-shrink-0 flex items-stretch z-10">
      <div class="flex justify-end ml-auto items-stretch">
        <div class="flex items-center pt-1" v-if="!appconfig.anonymousMode">
          <div class="flex gap-2">
            <Button variant="outline" size="xs" v-if="api.store.browserPersisted.consented" @click="toggleConsent()">
              <FAIcon icon="magnifying-glass" />
              View consent
            </Button>
            <Button
              variant="destructive"
              size="xs"
              v-if="api.store.browserPersisted.consented && !api.store.browserPersisted.withdrawn"
              @click="toggleWithdraw()"
            >
              <FAIcon icon="circle-xmark" />
              Withdraw
            </Button>
            <Button variant="secondary" size="xs" @click="toggleReport()" v-if="false">
              <FAIcon icon="hand" />
              Report issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- modal for viewing consent form -->
  <div class="absolute inset-0 z-50 flex items-center justify-center p-8" :class="{ hidden: !showconsentmodal }">
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="toggleConsent()"></div>
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div class="p-8">
        <InformedConsentModal @toggle-consent="toggleConsent()" />
      </div>
    </div>
    <button
      class="absolute top-8 right-8 text-gray-400 hover:text-gray-600 text-2xl z-10"
      aria-label="close"
      @click="toggleConsent()"
    >
      ×
    </button>
  </div>

  <!-- modal for withdrawing from study -->
  <div class="absolute inset-0 z-50 flex items-center justify-center p-8" :class="{ hidden: !showwithdrawmodal }">
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="toggleWithdraw()"></div>
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div class="p-8">
        <WithdrawFormModal
          :prefill-email="email"
          ref="withdrawform"
          @toggle-withdraw="toggleWithdraw()"
          @submit-withdraw="submitWithdraw()"
        />
      </div>
    </div>
    <button
      class="absolute top-8 right-8 text-gray-400 hover:text-gray-600 text-2xl z-10"
      aria-label="close"
      @click="toggleWithdraw()"
    >
      ×
    </button>
  </div>

  <!-- modal for reporting issues -->
  <div class="absolute inset-0 z-50 flex items-center justify-center p-8" :class="{ hidden: !showreportissuemodal }">
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="toggleReport()"></div>
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div class="p-8">
        <ReportIssueModal @toggle-report="toggleReport()" />
      </div>
    </div>
    <button
      class="absolute top-8 right-8 text-gray-400 hover:text-gray-600 text-2xl z-10"
      aria-label="close"
      @click="toggleReport()"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
/* All styling has been converted to Tailwind classes */
</style>
