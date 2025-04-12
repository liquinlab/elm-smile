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
  <div class="infobar" role="navigation" aria-label="main navigation">
    <div class="infobar-brand">
      <a class="infobar-logo" :href="appconfig.labURL" target="_new" v-if="!appconfig.anonymousMode">
        <img :src="api.getStaticUrl(appconfig.brandLogoFn)" width="90" />
      </a>
      <div class="infobar-item">
        <p class="is-size-7 studyinfo pt-2">
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
    <div id="infobar" class="infobar-menu is-active">
      <div class="infobar-end">
        <div class="infobar-item" v-if="!appconfig.anonymousMode">
          <div class="buttons">
            <button class="button is-info is-small is-light" v-if="api.store.local.consented" @click="toggleConsent()">
              <FAIcon icon="magnifying-glass" />&nbsp;&nbsp;View consent
            </button>
            <button
              class="button is-danger is-small is-light"
              v-if="api.store.local.consented && !api.store.local.withdrawn"
              @click="toggleWithdraw()"
            >
              <FAIcon icon="circle-xmark" />&nbsp;&nbsp;Withdraw
            </button>
            <button class="button is-warning is-small is-light" @click="toggleReport()" v-if="false">
              <FAIcon icon="hand" />&nbsp;&nbsp;Report issue
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- modal for viewing consent form -->
  <div class="modal" :class="{ 'is-active': showconsentmodal }">
    <div class="modal-background" @click="toggleConsent()"></div>
    <div class="modal-content">
      <div class="modaltext">
        <InformedConsentModal @toggle-consent="toggleConsent()" />
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="toggleConsent()"></button>
  </div>

  <!-- modal for withdrawing from study -->
  <div class="modal" :class="{ 'is-active': showwithdrawmodal }">
    <div class="modal-background" @click="toggleWithdraw()"></div>
    <div class="modal-content">
      <div class="modaltext">
        <WithdrawFormModal
          :prefill-email="email"
          ref="withdrawform"
          @toggle-withdraw="toggleWithdraw()"
          @submit-withdraw="submitWithdraw()"
        />
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="toggleWithdraw()"></button>
  </div>

  <!-- modal for reporting issues -->
  <div class="modal" :class="{ 'is-active': showreportissuemodal }">
    <div class="modal-background" @click="toggleReport()"></div>
    <div class="modal-content">
      <div class="modaltext">
        <ReportIssueModal @toggle-report="toggleReport()" />
      </div>
    </div>
    <button class="modal-close is-large" aria-label="close" @click="toggleReport()"></button>
  </div>
</template>

<style scoped>
.infobar {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  position: relative;
}

.infobar-brand {
  align-items: stretch;
  display: flex;
  flex-shrink: 0;
  min-height: var(--bulma-navbar-height);
}

.infobar {
  padding-left: 20px;
  padding-right: 20px;
}

.infobar-logo {
  align-items: center;
  padding-top: 12px;
}

.infobar-item {
  align-items: center;
  display: flex;
  padding-top: 3px;
}

.infobar-end {
  justify-content: flex-end;
  margin-inline-start: auto;
  display: flex;
  align-items: stretch;
}

.infobar-menu {
  flex-grow: 1;
  flex-shrink: 0;
  align-items: stretch;
  display: flex;
  z-index: 999;
}

/* scoped css for this component */
.modaltext {
  background-color: #fff;
  padding: 30px;
}

.navbar {
  z-index: 10;
  background-color: var(--status-bar-bg-color);
  color: var(--status-bar-text-color);
}

.modal-content {
  width: 80%;
}

.studyinfo {
  text-align: left;
  padding-left: 10px;
  color: var(--status-bar-text-color);
}

.navbar-start {
  margin-right: 10px;
}

.navbar-end {
  margin-left: auto;
}

@media screen and (max-width: 560px) {
  .studyinfo {
    display: none;
  }
}
</style>
