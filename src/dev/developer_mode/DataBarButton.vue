<script setup>
import { computed } from 'vue'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

import CircleProgress from '@/dev/developer_mode/CircleProgress.vue'

import { useKeyModifier } from '@vueuse/core'
const altKeyState = useKeyModifier('Alt')

// if in dev mode (which should always be true on this page), set known
// if not a known user

function connectDB() {
  if (!api.store.local.knownUser) api.setKnown()
}

const database_tooltip = computed(() => {
  var msg = 'Toggle data panel | '
  if (api.store.global.db_connected == true) {
    msg += 'Database connected | '
  } else {
    msg += 'Database not connected | '
  }
  if (api.store.global.db_changes == true) {
    msg += 'Unsynced data '
  } else {
    msg += 'Data in sync '
  }
  if (api.store.global.db_connected == true) {
    msg += '| '
    msg += Math.round((api.store.local.approx_data_size / 1048576) * 1000) / 1000 + '% data used'
  }
  return msg
})

const alt_tooltip = computed(() => {
  return 'Create connection to Firestore database'
})
</script>

<template>
  <div v-if="altKeyState && api.store.global.db_connected == false">
    <button
      class="button devbar-button has-tooltip-arrow has-tooltip-bottom"
      :data-tooltip="alt_tooltip"
      @click="connectDB"
    >
      <FAIcon
        icon="fa-solid fa-cloud-arrow-up"
        class="notconnected"
        :class="{ connected: api.store.global.db_connected == true }"
      />
    </button>
  </div>
  <div v-else>
    <button
      class="button devbar-button has-tooltip-arrow has-tooltip-bottom"
      :data-tooltip="database_tooltip"
      @click="api.store.dev.show_console_bar = !api.store.dev.show_console_bar"
    >
      <FAIcon
        icon="fa-solid fa-database"
        class="disconnected"
        :class="{ connected: api.store.global.db_connected == true }"
      />
      &nbsp;&nbsp;|&nbsp;&nbsp;
      <template v-if="!api.store.global.db_connected">
        <FAIcon icon="fa-solid fa-rotate" class="has-text-grey" />
      </template>
      <template v-else-if="api.store.global.db_changes && api.store.global.db_connected">
        <FAIcon icon="fa-solid fa-rotate" class="outofsync" />
      </template>
      <template v-else>
        <FAIcon icon="fa-solid fa-rotate" class="insync" />
      </template>
      <template v-if="!api.store.global.db_connected">
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <CircleProgress
          :percentage="Math.round(api.store.local.approx_data_size / 1048576) * 100"
          :size="12"
          :strokeWidth="40"
          slicecolor="#aaa"
          basecolor="#aaa"
        />
      </template>
      <template v-else>
        &nbsp;&nbsp;|&nbsp;&nbsp;

        <CircleProgress
          :percentage="Math.round(api.store.local.approx_data_size / 1048576) * 100"
          :size="12"
          :strokeWidth="40"
          slicecolor="hsl(var(--bulma-button-h), var(--bulma-button-s), calc(var(--bulma-button-background-l) + var(--bulma-button-background-l-delta)))"
          basecolor="var(--status-green)"
        />
      </template>
    </button>
  </div>
</template>

<style scoped>
.disconnected {
  color: var(--status-red);
}
.connected {
  color: var(--status-green);
}
.outofsync {
  color: var(--status-yellow);
}
.insync {
  color: var(--status-green);
}
.notconnected {
  color: var(--darker-grey);
}
</style>
