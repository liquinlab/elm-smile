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

  return `https://console.firebase.google.com/u/0/project/${api.config.firebaseConfig.projectId}/firestore/data/~2F${mode}~2F${api.config.project_ref}~2Fdata~2F${api.local.docRef}`
})

function open_firebase_console(url) {
  window.open(url, '_new')
}

const sync_state = computed(() => {
  if (api.global.db_changes && api.global.db_connected) {
    return 'is-warning is-completed'
  } else if (!api.global.db_changes && api.global.db_connected) {
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
    //api.debug("updating timer", api.dev.show_data_bar)
    if (!api.global.db_connected) {
      last_write_time_string.value = `Never happened`
    } else {
      var time = ((Date.now() - api.local.lastWrite) / 1000).toFixed(1)
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
</script>
<template>
  <!-- content of panel here -->
  <div class="contentpanel info">
    <div class="steps">
      <div class="step-item" :class="{ 'is-success is-completed': api.local.knownUser }">
        <div class="step-marker" v-if="!api.local.knownUser">1</div>
        <div class="step-marker" v-else><FAIcon icon="fa-solid fa-check" /></div>
        <div class="step-details" :class="{ 'is-success is-completed': api.local.knownUser }">
          <p class="step-title is-size-6">
            <FAIcon icon="fa-solid fa-user-plus" v-if="api.local.knownUser" />
            <FAIcon icon="fa-solid fa-user-minus" v-else />
            &nbsp;&nbsp;User status
          </p>
          <p v-if="!api.local.knownUser">User has <b>not been seen before</b>.</p>
          <p v-else>User <b>has</b> been seen before.</p>
          <br />
          <table class="table is-hoverable is-striped is-fullwidth">
            <tr>
              <th width="55%"></th>
              <th></th>
            </tr>
            <tr>
              <td class="has-text-left"><b>Last route:</b></td>
              <td class="has-text-left is-family-code is-size-7">{{ '/' + api.local.lastRoute }}</td>
            </tr>
            <tr>
              <td class="has-text-left"><b>Is done:</b></td>
              <td class="has-text-left is-family-code is-size-7">{{ api.local.done }}</td>
            </tr>
            <tr>
              <td class="has-text-left"><b>Allow repeat:</b></td>
              <td class="has-text-left is-family-code is-size-7">{{ api.config.allow_repeats }}</td>
            </tr>
          </table>

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

      <div class="step-item" :class="{ 'is-success is-completed': api.global.db_connected }">
        <div class="step-marker" v-if="!api.global.db_connected">2</div>
        <div class="step-marker" v-else><FAIcon icon="fa-solid fa-check" /></div>

        <div class="step-details" :class="{ 'is-success is-completed': api.global.db_connected }">
          <p class="step-title is-size-6">
            <img src="/src/assets/dev/logo_lockup_firebase_vertical.svg" width="15" />&nbsp;&nbsp;Firestore
          </p>
          <p v-if="!api.global.db_connected">Database is <b>not</b> connected.</p>
          <p v-else>Database is connected.</p>
          <br />
          <table class="table is-hoverable is-striped is-fullwidth">
            <tr>
              <th width="40%"></th>
              <th></th>
            </tr>
            <tr>
              <td class="has-text-left"><b>Mode:</b></td>
              <td class="has-text-left is-family-code is-size-7">
                {{ api.config.mode == 'development' ? 'testing' : 'live' }}
              </td>
            </tr>
            <tr>
              <td class="has-text-left"><b>Project:</b></td>
              <td class="has-text-left is-family-code is-size-7">{{ api.config.firebaseConfig.projectId }}</td>
            </tr>
            <tr>
              <td class="has-text-left"><b>DocRef:</b></td>
              <td class="has-text-left is-family-code is-size-7">
                {{ api.local.docRef }}&nbsp;&nbsp;<a
                  v-if="api.local.docRef"
                  @click.prevent="open_firebase_console(firebase_url)"
                  ><FAIcon icon="fa-solid fa-square-up-right"
                /></a>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <div class="step-item" :class="sync_state">
        <div class="step-marker" v-if="!api.global.db_connected">3</div>
        <div class="step-marker" v-if="api.global.db_connected && api.global.db_changes">
          <FAIcon icon="fa-solid fa-xmark" />
        </div>
        <div class="step-marker" v-else><FAIcon icon="fa-solid fa-check" /></div>
        <div class="step-details">
          <p class="step-title is-size-6" :class="sync_state"><FAIcon icon="fa-solid fa-rotate" />&nbsp;&nbsp;Sync</p>
          <p v-if="!api.global.db_connected">Data never synced.</p>
          <p v-else-if="api.global.db_changes">Data out of sync.</p>
          <p v-else>Database is synced.</p>

          <br />
          <table class="table is-hoverable is-striped is-fullwidth">
            <tr>
              <th width="40%"></th>
              <th></th>
            </tr>
            <tr>
              <td class="has-text-left"><b>Writes:</b></td>
              <td class="has-text-left is-family-code is-size-7">
                {{ api.local.totalWrites }} out of {{ api.config.max_writes }} max
              </td>
            </tr>
            <tr>
              <td class="has-text-left"><b>Last write:</b></td>
              <td class="has-text-left is-family-code is-size-7">
                {{ last_write_time_string }}
              </td>
            </tr>
            <tr>
              <td class="has-text-left"><b>Auto save:</b></td>
              <td class="has-text-left is-family-code is-size-7">{{ api.config.auto_save }}</td>
            </tr>
            <tr>
              <td class="has-text-left"><b>Approx size:</b></td>
              <td class="has-text-left is-family-code is-size-7">
                {{ api.local.approx_data_size }} / 1,048,576 max<br />
                ({{ Math.round((api.local.approx_data_size / 1048576) * 1000) / 1000 }}%)
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-title {
  font-size: 0.9em;
  font-weight: bold;
}

.step-details {
  font-size: 0.85em;
  padding: 25px;
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
    padding: 25px;
    padding-left: 50px;
    padding-right: 50px;
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
