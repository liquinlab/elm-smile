<script setup>
import { computed } from 'vue'
import useSmileAPI from '@/core/composables/useSmileAPI'
const api = useSmileAPI()

import CircleProgress from '@/components/navbars/CircleProgress.vue'

const database_tooltip = computed(() => {
  var msg = 'Toggle data panel | '
  if (api.global.db_connected == true) {
    msg += 'Database connected | '
  } else {
    msg += 'Database not connected | '
  }
  if (api.global.db_changes == true) {
    msg += 'Unsynced data '
  } else {
    msg += 'Data in sync '
  }
  if (api.global.db_connected == true) {
    msg += '| '
    msg += Math.round((api.local.approx_data_size / 1048576) * 1000) / 1000 + '% data used'
  }
  return msg
})
</script>

<template>
  <button
    class="button devbar-button has-tooltip-arrow has-tooltip-bottom"
    :data-tooltip="database_tooltip"
    @click="api.dev.show_data_bar = !api.dev.show_data_bar"
  >
    <FAIcon icon="fa-solid fa-database" class="disconnected" :class="{ connected: api.global.db_connected == true }" />
    &nbsp;&nbsp;|&nbsp;&nbsp;
    <template v-if="!api.global.db_connected">
      <FAIcon icon="fa-solid fa-rotate" class="has-text-grey" />
    </template>
    <template v-else-if="api.global.db_changes && api.global.db_connected">
      <FAIcon icon="fa-solid fa-rotate" class="outofsync" />
    </template>
    <template v-else>
      <FAIcon icon="fa-solid fa-rotate" class="insync" />
    </template>
    <template v-if="!api.global.db_connected">
      &nbsp;&nbsp;|&nbsp;&nbsp;
      <CircleProgress
        :percentage="Math.round(api.local.approx_data_size / 1048576) * 100"
        :size="12"
        :strokeWidth="40"
        slicecolor="#aaa"
        basecolor="#aaa"
      />
    </template>
    <template v-else>
      &nbsp;&nbsp;|&nbsp;&nbsp;

      <CircleProgress
        :percentage="Math.round(api.local.approx_data_size / 1048576) * 100"
        :size="12"
        :strokeWidth="40"
        slicecolor="hsl(var(--bulma-button-h), var(--bulma-button-s), calc(var(--bulma-button-background-l) + var(--bulma-button-background-l-delta)))"
        basecolor="var(--status-green)"
      />
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
</style>
