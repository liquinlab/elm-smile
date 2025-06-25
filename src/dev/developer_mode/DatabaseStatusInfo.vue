<script setup>
//import { useTimeAgo } from '@vueuse/core'
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Button } from '@/uikit/components/ui/button'
import SmileAPI from '@/core/composables/useAPI'
const api = SmileAPI()

import useSmileStore from '@/core/stores/smilestore'
const smilestore = useSmileStore()

var timer = ref(null)

const firebase_url = computed(() => {
  const mode = api.config.mode == 'development' ? 'testing' : 'real'

  return `https://console.firebase.google.com/u/0/project/${api.config.firebaseConfig.projectId}/firestore/data/~2F${mode}~2F${api.config.projectRef}~2Fdata~2F${api.store.browserPersisted.docRef}`
})

function open_firebase_console(url) {
  window.open(url, '_new')
}

const sync_state = computed(() => {
  if (api.store.browserEphemeral.dbChanges && api.store.browserEphemeral.dbConnected) {
    return 'is-warning is-completed'
  } else if (!api.store.browserEphemeral.dbChanges && api.store.browserEphemeral.dbConnected) {
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
    if (!api.store.browserEphemeral.dbConnected) {
      last_write_time_string.value = `Never happened`
    } else {
      var time = ((Date.now() - api.store.browserPersisted.lastWrite) / 1000).toFixed(1)
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
  <table class="w-full text-sm table-border-top">
    <tbody>
      <tr class="table-row-base table-row-even hidden sm:table-row">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Last route:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ '/' + api.store.browserPersisted.lastRoute }}
        </td>
      </tr>
      <tr class="table-row-base table-row-odd hidden sm:table-row">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Mode:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ api.config.mode }}
        </td>
      </tr>
      <tr class="table-row-base table-row-even hidden sm:table-row">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Project:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ api.config.firebaseConfig.projectId }}
        </td>
      </tr>
      <tr class="table-row-base table-row-odd">
        <td class="table-cell-base table-cell-left table-cell-small"><b>DocRef:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ api.store.browserPersisted.docRef }}&nbsp;&nbsp;<a
            v-if="api.store.browserPersisted.docRef"
            @click.prevent="open_firebase_console(firebase_url)"
            ><FAIcon icon="fa-solid fa-square-up-right"
          /></a>
        </td>
      </tr>
      <tr class="table-row-base table-row-even hidden sm:table-row">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Writes:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ api.store.browserPersisted.totalWrites }} out of {{ api.config.maxWrites }} max
        </td>
      </tr>
      <tr class="table-row-base table-row-odd hidden sm:table-row">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Last write:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ last_write_time_string }}
        </td>
      </tr>
      <tr class="table-row-base table-row-even hidden sm:table-row">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Auto save:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ api.config.autoSave }}
        </td>
      </tr>
      <tr class="table-row-base table-row-odd hidden sm:table-row table-border-bottom">
        <td class="table-cell-base table-cell-left table-cell-small"><b>Size:</b></td>
        <td class="table-cell-base table-cell-left table-cell-mono table-cell-small">
          {{ api.store.browserPersisted.approxDataSize }} / 1,048,576 max ({{
            Math.round((api.store.browserPersisted.approxDataSize / 1048576) * 1000) / 1000
          }}%)
        </td>
      </tr>
    </tbody>
  </table>

  <div class="flex justify-end mt-4 mr-4">
    <Button @click="open_firebase_console(firebase_url)" variant="outline" size="sm"> Browse in Firebase </Button>
  </div>
</template>
