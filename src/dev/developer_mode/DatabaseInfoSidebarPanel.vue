<script setup>
//import { useTimeAgo } from '@vueuse/core'
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'

import SmileAPI from '@/core/composables/useAPI'
const api = SmileAPI()

import useSmileStore from '@/core/stores/smilestore'
const smilestore = useSmileStore()

var timer = ref(null)

const firebase_url = computed(() => {
  const mode = api.config.mode == 'development' ? 'testing' : 'real'

  return `https://console.firebase.google.com/u/0/project/${api.config.firebaseConfig.projectId}/firestore/data/~2F${mode}~2F${api.config.projectRef}~2Fdata~2F${api.store.local.docRef}`
})

function open_firebase_console(url) {
  window.open(url, '_new')
}

const sync_state = computed(() => {
  if (api.store.global.dbChanges && api.store.global.dbConnected) {
    return 'is-warning is-completed'
  } else if (!api.store.global.dbChanges && api.store.global.dbConnected) {
    return 'is-success is-completed'
  } else {
    return ''
  }
})

const stopTimer = () => {
  clearInterval(timer.value)
  timer.value = null
}

const startTimer = () => {
  timer.value = setInterval(() => {
    //api.debug("updating timer", api.store.dev.showConsoleBar)
    if (!api.store.global.dbConnected) {
      last_write_time_string.value = `Never happened`
    } else {
      var time = ((Date.now() - api.store.local.lastWrite) / 1000).toFixed(1)
      if (time < 60) {
        last_write_time_string.value = `${time} secs ago`
      } else if (time < 180) {
        time = (time / 60).toFixed(2)
        last_write_time_string.value = `${time} mins ago`
      } else if (time < 60 * 10) {
        // say, 10 mins
        last_write_time_string.value = `a few mins ago`
      } else {
        last_write_time_string.value = `a long time ago`
      }
    }
  }, 500)
}
const last_write_time_string = ref('') // default

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  stopTimer()
})

const showServiceSelect = ref(false)
</script>
<template>
  <!-- content of panel here -->
  <div class="database-info-sidebar-panel">
    <div class="steps is-hidden-small">
      <div class="step-item" :class="{ 'is-success is-completed': api.store.local.knownUser }">
        <div class="step-marker" v-if="!api.store.local.knownUser">1</div>
        <div class="step-marker" v-else><FAIcon icon="fa-solid fa-check" /></div>
        <div class="step-details" :class="{ 'is-success is-completed': api.store.local.knownUser }">
          <p class="step-title is-size-7">
            <FAIcon icon="fa-solid fa-user-plus" v-if="api.store.local.knownUser" />
            <FAIcon icon="fa-solid fa-user-minus" v-else />
          </p>
          <p v-if="!api.store.local.knownUser">Unknown user.</p>
          <p v-else>Known user.</p>

          <!--
            <p class="pl-10 pr-10 mb-10 is-size-7">
              User unknown means that the users does not have any localStorage data set indicating they have started the
              task before. localStorage is used to restart when the user left off when they reload the browser.
              Typically the user becomes known when the agree to the consent form (prior to that we treat them as just
              anonymously viewing the recruitment pages before deciding to participate).)
            </p>
            -->
        </div>
      </div>

      <div
        class="step-item"
        :class="{ 'is-success is-completed': api.store.global.dbConnected }"
        @click="api.connectDB()"
      >
        <div class="step-marker" v-if="!api.store.global.dbConnected">2</div>
        <div class="step-marker" v-else><FAIcon icon="fa-solid fa-check" /></div>
        <div class="step-details" :class="{ 'is-success is-completed': api.store.global.dbConnected }">
          <p class="step-title is-size-7">
            <img src="/src/assets/dev/logo_lockup_firebase_vertical.svg" width="15" />
          </p>
          <p v-if="!api.store.global.dbConnected">Not connected.</p>
          <p v-else>Connected.</p>
          <br />
        </div>
      </div>
      <div class="step-item" :class="sync_state">
        <div class="step-marker" v-if="!api.store.global.dbConnected">3</div>
        <div class="step-marker" v-if="api.store.global.dbConnected && api.store.global.dbChanges">
          <FAIcon icon="fa-solid fa-xmark" />
        </div>
        <div class="step-marker" v-else><FAIcon icon="fa-solid fa-check" /></div>
        <div class="step-details">
          <p class="step-title is-size-7" :class="sync_state"><FAIcon icon="fa-solid fa-rotate" /></p>
          <p v-if="!api.store.global.dbConnected">Data never synced.</p>
          <p v-else-if="api.store.global.dbChanges">Data out of sync.</p>
          <p v-else>Database is synced.</p>
        </div>
      </div>
    </div>
    <table class="table is-hoverable is-striped is-fullwidth">
      <tbody>
        <tr>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
        </tr>
        <tr>
          <td class="has-text-center">
            <b>Consent:</b><br />
            <div class="field">
              <input
                id="switchRoundedDefault1"
                type="checkbox"
                name="switchRoundedDefault1"
                class="switch is-rounded is-rtl is-small"
                v-model="smilestore.local.consented"
              />
              <label for="switchRoundedDefault1"></label>
            </div>
          </td>
          <td class="has-text-center">
            <b>Known:</b><br />
            <div class="field">
              <input
                id="switchRoundedDefault2"
                type="checkbox"
                name="switchRoundedDefault2"
                class="switch is-rounded is-rtl is-small"
                v-model="smilestore.local.knownUser"
              />
              <label for="switchRoundedDefault2"></label>
            </div>
          </td>
          <td class="has-text-center">
            <b>Done:</b><br />
            <div class="field">
              <input
                id="switchRoundedDefault3"
                type="checkbox"
                name="switchRoundedDefault3"
                class="switch is-rounded is-rtl is-small"
                v-model="smilestore.local.done"
              />
              <label for="switchRoundedDefault3"></label>
            </div>
          </td>
          <td class="has-text-center">
            <b>Withdrew:</b><br />
            <div class="field">
              <input
                id="switchRoundedDefault4"
                type="checkbox"
                name="switchRoundedDefault4"
                class="switch is-rounded is-rtl is-small"
                v-model="smilestore.local.withdrawn"
              />
              <label for="switchRoundedDefault4"></label>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <table class="table is-hoverable is-striped is-fullwidth">
      <tbody>
        <tr>
          <th width="30%"></th>
          <th></th>
        </tr>
        <tr>
          <td class="has-text-left" colspan="1"><b>Service:</b></td>
          <td class="has-text-left is-family-code" colspan="3">
            <div class="is-flex is-align-items-center">
              <template v-if="!showServiceSelect">
                <span class="mr-2">{{ smilestore.data.recruitmentService }}</span>

                <FAIcon icon="fa-solid fa-pen-to-square" @click="showServiceSelect = true" />
              </template>
              <div v-else class="control select is-small">
                <select
                  id="recruitment"
                  v-model="smilestore.data.recruitmentService"
                  class="select is-small"
                  @change="showServiceSelect = false"
                  @blur="showServiceSelect = false"
                >
                  <option v-for="(cond, key) in smilestore.global.urls" :key="cond">
                    {{ key }}
                  </option>
                </select>
              </div>
            </div>
          </td>
        </tr>
        <tr class="is-hidden-small">
          <td class="has-text-left"><b>Last route:</b></td>
          <td class="has-text-left is-family-code">{{ '/' + api.store.local.lastRoute }}</td>
        </tr>
        <tr class="is-hidden-small">
          <td class="has-text-left"><b>Mode:</b></td>
          <td class="has-text-left is-family-code">
            {{ api.config.mode }}
          </td>
        </tr>
        <tr class="is-hidden-small">
          <td class="has-text-left"><b>Project:</b></td>
          <td class="has-text-left is-family-code">
            {{ api.config.firebaseConfig.projectId }}
          </td>
        </tr>
        <tr>
          <td class="has-text-left"><b>DocRef:</b></td>
          <td class="has-text-left is-family-code">
            {{ api.store.local.docRef }}&nbsp;&nbsp;<a
              v-if="api.store.local.docRef"
              @click.prevent="open_firebase_console(firebase_url)"
              ><FAIcon icon="fa-solid fa-square-up-right"
            /></a>
          </td>
        </tr>
        <tr class="is-hidden-small">
          <td class="has-text-left"><b>Writes:</b></td>
          <td class="has-text-left is-family-code">
            {{ api.store.local.totalWrites }} out of {{ api.config.maxWrites }} max
          </td>
        </tr>
        <tr class="is-hidden-small">
          <td class="has-text-left"><b>Last write:</b></td>
          <td class="has-text-left is-family-code">
            {{ last_write_time_string }}
          </td>
        </tr>
        <tr class="is-hidden-small">
          <td class="has-text-left"><b>Auto save:</b></td>
          <td class="has-text-left is-family-code">
            {{ api.config.autoSave }}
          </td>
        </tr>
        <tr class="is-hidden-small">
          <td class="has-text-left"><b>Size:</b></td>
          <td class="has-text-left is-family-code">
            {{ api.store.local.approxDataSize }} / 1,048,576 max ({{
              Math.round((api.store.local.approxDataSize / 1048576) * 1000) / 1000
            }}%)
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table td {
  padding: 1 0 1 1;
  font-size: 0.6em;
}
.table th {
  padding: 0;
  margin: 0;
}

.is-hidden-small {
  @media screen and (max-height: 900px) {
    display: none !important;
  }
}

.table {
  margin-bottom: 0px;
  padding-bottom: 0px;
  border-top: none;
  padding-top: 0px;
}
.database-info-sidebar-panel {
  height: fit-content;
  padding-top: 0px;
  padding-bottom: 0px;
  padding-right: 0px;
  padding-left: 0px;
  margin: 0px;
  background-color: #fff;
}
.step-title {
  font-size: 0.8em;
  font-weight: bold;
}

.steps {
  padding-top: 10px;
}
.step-details {
  font-size: 0.65em;
  padding: 0px;
}

@media screen and (max-width: 1024px) {
  .step-details {
    padding: 0px;
  }
}

.info {
  margin: 20px;
}
.statusinfo {
  padding: 10px;
  font-size: 2em;
  border: 1px solid #d5d5d5;
  border-radius: 0.8em;
  background-color: #f7f7f7;
}

.connected {
  color: #00c42e;
}
.warning {
  color: #d5d808;
}
.outofsync {
  color: red;
}
.insync {
  color: rgb(13, 206, 13);
}
.disconnected {
  color: #f60909;
}
.connected {
  color: #00d1b2;
}
.divider {
  border: 0.1px solid;
  margin: 10px 0;
}
.bignumber {
  font-size: 5em;
  padding: 0;
}
.contentpanel {
  padding-left: 0px;
  height: 100%;
}
.isdark {
  background: #414141;
  color: #fff;
}
.islight {
  background: #828282;
  color: #fff;
}
.islighter {
  background: #b0adad;
  color: #fff;
}
.colcontent {
  height: 100%;
  user-select: none;
}
.edge {
  border-right: 1px solid #e9e9e9;
  margin: 0px;
}

@media screen and (max-width: 599px) {
  .steps .step-item::before {
    display: none;
  }

  .steps {
    display: flex;
    flex-direction: row;
  }
  .step-details {
    width: 100%;
    padding: 0px;
    padding-left: 0px;
    padding-right: 0px;
    margin-left: auto;
    margin-right: auto;
  }

  .info {
    overflow-y: scroll;
    height: 100%;
    margin: 0px;
    padding-top: 20px;
  }
}
</style>
