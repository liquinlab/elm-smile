<script setup>
import { computed } from 'vue'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

import CircleProgress from '@/dev/developer_mode/CircleProgress.vue'

// if in dev mode (which should always be true on this page), set known
// if not a known user

const database_tooltip = computed(() => {
  var msg = ''
  if (api.store.global.dbConnected == true) {
    msg += 'Database connected | '
  } else {
    msg += 'Database not connected | '
  }
  if (api.store.global.dbChanges == true) {
    msg += 'Unsynced data '
  } else {
    msg += 'Data in sync '
  }
  if (api.store.global.dbConnected == true) {
    msg += '| '
    msg += Math.round((api.store.local.approxDataSize / 1048576) * 1000) / 1000 + '% data used'
  }
  return msg
})
</script>

<template>
  <button class="button devbar-button has-tooltip-arrow has-tooltip-bottom" :data-tooltip="database_tooltip">
    <FAIcon
      icon="fa-solid fa-database"
      class="disconnected"
      :class="{ connected: api.store.global.dbConnected == true }"
    />
    &nbsp;&nbsp;|&nbsp;&nbsp;
    <template v-if="!api.store.global.dbConnected">
      <FAIcon icon="fa-solid fa-rotate" class="has-text-grey" />
    </template>
    <template v-else-if="api.store.global.dbChanges && api.store.global.dbConnected">
      <FAIcon icon="fa-solid fa-rotate" class="outofsync" />
    </template>
    <template v-else>
      <FAIcon icon="fa-solid fa-rotate" class="insync" />
    </template>
    <template v-if="!api.store.global.dbConnected">
      &nbsp;&nbsp;|&nbsp;&nbsp;
      <div class="mt-1">
        <CircleProgress
          :percentage="Math.round(api.store.local.approxDataSize / 1048576) * 100"
          :size="12"
          :strokeWidth="40"
          slicecolor="#aaa"
          basecolor="#aaa"
        />
      </div>
    </template>
    <template v-else>
      &nbsp;&nbsp;|&nbsp;&nbsp;
      <div class="mt-1">
        <CircleProgress
          :percentage="Math.round(api.store.local.approxDataSize / 1048576) * 100"
          :size="12"
          :strokeWidth="40"
          slicecolor="hsl(var(--bulma-button-h), var(--bulma-button-s), calc(var(--bulma-button-background-l) + var(--bulma-button-background-l-delta)))"
          basecolor="var(--status-green)"
        />
      </div>
    </template>
  </button>
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
